import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { abuseCheck } from "../_shared/abuse-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const blocked = abuseCheck(req, { limit: 10, windowMs: 60_000, requireOrigin: true, corsHeaders });
  if (blocked) return blocked;

  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > 12_000) {
      return new Response(JSON.stringify({ error: "حجم المحتوى كبير جداً" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const topic = String(body?.topic ?? "").slice(0, 200).trim();
    const content = String(body?.content ?? "").slice(0, 6000).trim();
    const stage = String(body?.stage ?? "").slice(0, 40).trim();
    if (!topic && !content) {
      return new Response(JSON.stringify({ error: "يرجى إدخال الموضوع أو المحتوى الدراسي" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `أنت معلم سعودي خبير في المناهج الدراسية، وتصمم ألعاباً تعليمية تفاعلية باللغة العربية الفصحى.

قواعد صارمة:
- اللغة العربية الفصحى الصحيحة فقط، ويمنع منعاً باتاً استخدام الرموز التعبيرية.
- لا تستخدم أي عبارات تحدد الجنس أو العمر.
- الأسئلة دقيقة علمياً ومرتبطة مباشرة بالموضوع أو المحتوى المرسل.
- اجعل الصياغة قصيرة وواضحة تناسب العرض على شاشة الجوال.
${stage === "elementary" ? "- الطالب في المرحلة الابتدائية: استخدم كلمات سهلة وجملاً قصيرة." : ""}`,
          },
          {
            role: "user",
            content: `صمم حزمة ألعاب تعليمية متكاملة عن: "${topic || "المحتوى المرفق"}".
${content ? `المحتوى الدراسي المرجعي:\n${content}` : ""}

المطلوب أربع صيغ:
1. ثمانية أسئلة اختيار من متعدد بأربعة خيارات.
2. ستة أزواج للمطابقة (مصطلح ومعناه).
3. قائمة ترتيب من خمسة عناصر بترتيبها الصحيح مع نص التعليمات.
4. ثمانية أسئلة سريعة صح أو خطأ.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_game_pack",
              description: "Return a full interactive game pack",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "عنوان الحزمة" },
                  mcq: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: { type: "array", items: { type: "string" } },
                        correctIndex: { type: "number" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correctIndex", "explanation"],
                      additionalProperties: false,
                    },
                  },
                  matching: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { left: { type: "string" }, right: { type: "string" } },
                      required: ["left", "right"],
                      additionalProperties: false,
                    },
                  },
                  sequencing: {
                    type: "object",
                    properties: {
                      instruction: { type: "string" },
                      items: { type: "array", items: { type: "string" }, description: "العناصر بالترتيب الصحيح" },
                    },
                    required: ["instruction", "items"],
                    additionalProperties: false,
                  },
                  speed: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        statement: { type: "string" },
                        isTrue: { type: "boolean" },
                      },
                      required: ["statement", "isTrue"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "mcq", "matching", "sequencing", "speed"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_game_pack" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للمنصة" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status, await response.text());
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");
    const pack = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(pack), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-game error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير متوقع" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
