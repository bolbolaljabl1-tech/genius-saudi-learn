import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > 4_000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = await req.json();
    const grade = String(body?.grade ?? "").slice(0, 60);
    const subject = String(body?.subject ?? "").slice(0, 60);
    const count = Math.max(3, Math.min(20, Number(body?.count) || 10));
    const types: string[] = Array.isArray(body?.types) ? body.types.slice(0, 5) : ["mcq"];

    if (!grade || !subject) {
      return new Response(JSON.stringify({ error: "grade & subject required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isArabic = subject.includes("لغتي") || subject.includes("العربية");
    const isEnglish = subject.includes("الإنجليزية") || subject.toLowerCase().includes("english");

    const formatRules = (isArabic || isEnglish)
      ? `اعتمد التنسيق التالي بالترتيب إن أمكن:
1) فهم المقروء: نص قصير (reading_passage) يليه 2-3 أسئلة اختيار من متعدد مرتبطة به (type=mcq, passageRef=1).
2) ضع علامة ✓ أو ✗ (type=tf) — العبارة فقط بدون ✓/✗ في نص السؤال.
3) اختيار من متعدد (type=mcq) 4 خيارات أ ب ج د.
${isArabic ? "4) الرسم الكتابي (type=calligraphy): عبارة وطنية فخمة بخط الرقعة يكتبها الطالب." : ""}`
      : `استخدم نوع السؤال المناسب من: ${types.join(", ")}. التزم باختيار من متعدد ما أمكن.`;

    const systemPrompt = `أنت خبير تعليمي ملم بأنظمة هيئة تقويم التعليم والتدريب السعودية.
أنشئ اختباراً يقيس الفهم والاستيعاب والتحليل (لا الحفظ).
وزع المستويات لتناسب جميع الطلاب (سهل/متوسط/تحليلي).
قواعد صارمة:
- ممنوع منعاً باتاً وضع أي إيموجي أو رموز تزيينية أو ملصقات داخل أي نص (سؤال/خيار/شرح/نص قراءة). نص نقي فقط.
- لا كلمات تحدد جنس أو عمر.
- التزم بحذف ألف ما الاستفهامية: مِمَّ، عَمَّ، فِيمَ، إلامَ، علامَ، بِمَ.
- اللغة العربية الفصيحة الصحيحة.
${formatRules}
الصف: ${grade}. المادة: ${subject}. عدد الأسئلة المطلوب: ${count}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `أنشئ ${count} أسئلة لمادة ${subject} للصف ${grade}.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_test",
            description: "Return a structured self-test",
            parameters: {
              type: "object",
              properties: {
                reading_passage: { type: "string", description: "نص فهم المقروء إن وجد" },
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["mcq", "tf", "calligraphy"] },
                      question: { type: "string", description: "نص السؤال نقي بلا رموز" },
                      options: { type: "array", items: { type: "string" } },
                      correctIndex: { type: "number", description: "للـ mcq 0-3" },
                      correctBool: { type: "boolean", description: "للـ tf" },
                      explanation: { type: "string" },
                      points: { type: "number" },
                      usesPassage: { type: "boolean" },
                    },
                    required: ["type", "question", "explanation"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["questions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_test" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول لاحقاً" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للمنصة" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");
    const parsed = JSON.parse(toolCall.function.arguments);

    // Strip any emojis/decorative chars from text fields
    const stripDecor = (s: string) => (s || "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}✓✗]/gu, "").replace(/\s+/g, " ").trim();
    if (parsed.reading_passage) parsed.reading_passage = stripDecor(parsed.reading_passage);
    parsed.questions = (parsed.questions || []).map((q: any) => ({
      ...q,
      question: stripDecor(q.question),
      options: Array.isArray(q.options) ? q.options.map(stripDecor) : q.options,
      explanation: stripDecor(q.explanation),
    }));

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-self-test error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
