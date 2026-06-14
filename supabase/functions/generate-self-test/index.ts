import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGateway(payload: unknown, key: string, attempts = 3): Promise<Response> {
  let last: Response | null = null;
  for (let i = 0; i < attempts; i++) {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (r.ok) return r;
    last = r;
    // Retry only on transient errors
    if (r.status === 503 || r.status === 502 || r.status === 504 || r.status === 500) {
      await sleep(700 * (i + 1));
      continue;
    }
    return r;
  }
  return last!;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > 6_000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = await req.json();
    const grade = String(body?.grade ?? "").slice(0, 60);
    const subject = String(body?.subject ?? "").slice(0, 60);
    const count = Math.max(3, Math.min(20, Number(body?.count) || 10));
    const types: string[] = Array.isArray(body?.types) ? body.types.slice(0, 5) : ["mcq"];
    const lessons = String(body?.lessons ?? "").slice(0, 400).trim();

    if (!grade || !subject) {
      return new Response(JSON.stringify({ error: "grade & subject required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isArabic = subject.includes("لغتي") || subject.includes("العربية");
    const isEnglish = subject.includes("الإنجليزية") || subject.toLowerCase().includes("english");

    const wantsMatching = types.includes("matching");
    const wantsFill = types.includes("fill");
    const explicitSpecial = wantsMatching || wantsFill;

    const formatRules = explicitSpecial
      ? `التزم حصرياً بإنتاج أسئلة من الأنواع المطلوبة: ${types.join(", ")} فقط. لا تُدرج أنواعاً أخرى.`
      : (isArabic || isEnglish)
      ? `اعتمد التنسيق التالي بالترتيب إن أمكن:
1) فهم المقروء: نص قصير (reading_passage) يليه 2-3 أسئلة اختيار من متعدد مرتبطة به (type=mcq, usesPassage=true).
2) ضع علامة صح أو خطأ (type=tf) — العبارة فقط بدون رموز في النص.
3) اختيار من متعدد (type=mcq) 4 خيارات أ ب ج د.
${isArabic ? "4) الرسم الكتابي (type=calligraphy): عبارة وطنية فخمة بخط الرقعة يكتبها الطالب." : ""}`
      : `استخدم نوع السؤال المناسب من: ${types.join(", ")}. التزم باختيار من متعدد ما أمكن.`;

    const extraTypes = `
يمكنك إضافة هذه الأنواع عند الطلب:
- matching: عمودان (left, right) متساويا الطول 4-6 عناصر، وحقل pairs يربط فهرس عنصر اليمين بالصحيح من اليسار.
- fill: نص فيه فراغات على شكل ____ ومصفوفة blanks بالكلمات الصحيحة بنفس الترتيب.`;


    const systemPrompt = `أنت خبير تعليمي ملم بأنظمة هيئة تقويم التعليم والتدريب السعودية.
أنشئ اختباراً يقيس الفهم والاستيعاب والتحليل (لا الحفظ).
وزع المستويات لتناسب جميع الطلاب (سهل/متوسط/تحليلي).
قواعد صارمة:
- ممنوع منعاً باتاً وضع أي إيموجي أو رموز تزيينية أو ملصقات داخل أي نص. نص نقي فقط.
- لا كلمات تحدد جنس أو عمر.
- التزم بحذف ألف ما الاستفهامية: مِمَّ، عَمَّ، فِيمَ، إلامَ، علامَ، بِمَ.
- اللغة العربية الفصيحة الصحيحة.
${formatRules}
${(wantsMatching || wantsFill) ? extraTypes : ""}
الصف: ${grade}. المادة: ${subject}. عدد الأسئلة المطلوب: ${count}.
${lessons ? `قيد إلزامي: اقصر جميع الأسئلة حصرياً على هذه الدروس/المواضيع المحددة من الطالب ولا تخرج عنها مطلقاً: «${lessons}». لا تُدرج أي محتوى خارج هذا النطاق.` : ""}`;

    const payload = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `أنشئ ${count} أسئلة لمادة ${subject} للصف ${grade}${lessons ? ` ضمن الدروس: ${lessons}` : ""}.` },
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_test",
          description: "Return a structured self-test",
          parameters: {
            type: "object",
            properties: {
              reading_passage: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["mcq", "tf", "calligraphy", "matching", "fill"] },
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correctIndex: { type: "number" },
                    correctBool: { type: "boolean" },
                    left: { type: "array", items: { type: "string" } },
                    right: { type: "array", items: { type: "string" } },
                    pairs: { type: "array", items: { type: "number" }, description: "for matching: for each right[i] the index of correct left" },
                    blanks: { type: "array", items: { type: "string" }, description: "for fill: correct words in order of ____" },
                    acceptedBlanks: {
                      type: "array",
                      description: "for fill: per-blank array of ALL acceptable alternative answers (synonyms, valid classifications, numeric equivalents). Index matches blanks[].",
                      items: { type: "array", items: { type: "string" } },
                    },
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
    };

    const response = await callGateway(payload, LOVABLE_API_KEY);

    if (!response.ok) {
      const t = await response.text().catch(() => "");
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول لاحقاً" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للمنصة" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 503 || response.status === 502 || response.status === 504) {
        return new Response(JSON.stringify({ error: "خدمة الذكاء الاصطناعي مشغولة حالياً، يرجى المحاولة بعد قليل" }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "تعذر إنشاء الاختبار، حاول مرة أخرى" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: any = null;
    if (toolCall?.function?.arguments) {
      try { parsed = JSON.parse(toolCall.function.arguments); }
      catch (e) { console.error("JSON parse failed:", e); }
    }
    if (!parsed) {
      // Fallback: try to parse from message content
      const content = data.choices?.[0]?.message?.content;
      if (typeof content === "string") {
        const m = content.match(/[\{\[][\s\S]*[\}\]]/);
        if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
      }
    }
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return new Response(JSON.stringify({ error: "تعذر قراءة الاستجابة، حاول مرة أخرى" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripDecor = (s: string) => (s || "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}✓✗]/gu, "").replace(/\s+/g, " ").trim();
    if (parsed.reading_passage) parsed.reading_passage = stripDecor(parsed.reading_passage);
    parsed.questions = parsed.questions.map((q: any) => ({
      ...q,
      question: stripDecor(q.question || ""),
      options: Array.isArray(q.options) ? q.options.map(stripDecor) : q.options,
      left: Array.isArray(q.left) ? q.left.map(stripDecor) : q.left,
      right: Array.isArray(q.right) ? q.right.map(stripDecor) : q.right,
      blanks: Array.isArray(q.blanks) ? q.blanks.map((b: string) => (b || "").trim()) : q.blanks,
      explanation: stripDecor(q.explanation || ""),
    }));

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-self-test error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
