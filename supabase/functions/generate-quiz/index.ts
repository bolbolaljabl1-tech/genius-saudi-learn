import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lessonTitle, subject, stage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isElementary = stage === "elementary";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `أنت معلم سعودي خبير في المناهج السعودية. أنشئ 10 أسئلة اختيار من متعدد باللغة العربية عن الدرس المطلوب.

قواعد صارمة:
- لا تستخدم أي كلمات تحدد الجنس أو العمر (مثل: يا بطل، يا ابنتي).
${isElementary ? "- الطالب في المرحلة الابتدائية: اجعل الأسئلة بسيطة جداً بكلمات سهلة." : "- اجعل الأسئلة مناسبة لمستوى الطالب."}
- كل سؤال يحتوي على: نص السؤال، 4 خيارات، رقم الإجابة الصحيحة (0-3)، شرح مختصر.
- اختم شرح كل سؤال بـ: "تصميم الأستاذ جابر العبدلي - 2026"`
          },
          {
            role: "user",
            content: `أنشئ 10 أسئلة اختيار من متعدد عن درس "${lessonTitle}" في مادة "${subject}".`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_quiz",
              description: "Return 10 multiple-choice questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string", description: "نص السؤال" },
                        options: { type: "array", items: { type: "string" }, description: "4 خيارات للإجابة" },
                        correctIndex: { type: "number", description: "رقم الإجابة الصحيحة (0-3)" },
                        explanation: { type: "string", description: "شرح مختصر للإجابة الصحيحة" }
                      },
                      required: ["question", "options", "correctIndex", "explanation"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["questions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_quiz" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول لاحقاً" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للمنصة" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");
    const quizData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(quizData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
