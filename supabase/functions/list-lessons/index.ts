import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { abuseCheck } from "../_shared/abuse-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const blocked = abuseCheck(req, { limit: 20, windowMs: 60_000, requireOrigin: true, corsHeaders });
  if (blocked) return blocked;

  try {
    const body = await req.json();
    const grade = String(body?.grade ?? "").trim();
    const subject = String(body?.subject ?? "").trim();
    const semester = String(body?.semester ?? "").trim();
    const stage = String(body?.stage ?? "").trim();
    if (!grade || !subject || !semester || grade.length > 60 || subject.length > 60 || semester.length > 60) {
      return json({ error: "بيانات غير صالحة" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "أنت خبير في المناهج الدراسية السعودية المعتمدة من وزارة التعليم. مهمتك استخراج عناوين الدروس المقررة فعلياً. القواعد: اللغة العربية الفصحى فقط، ممنوع استخدام الرموز التعبيرية، ممنوع الشرح أو المقدمات. أعد النتيجة بصيغة JSON فقط على الشكل: {\"lessons\":[\"عنوان الدرس\"]} بحد أقصى 25 عنواناً وبالترتيب الوارد في الكتاب.",
          },
          {
            role: "user",
            content: `استخرج عناوين دروس مادة ${subject} لصف ${grade} في ${stage} للفصل الدراسي ${semester} وفق المنهج السعودي الحديث.`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) return json({ error: "تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً" }, 429);
    if (res.status === 402) return json({ error: "يرجى إضافة رصيد للمنصة" }, 402);
    if (!res.ok) {
      console.error("AI gateway error:", res.status, await res.text());
      throw new Error("AI gateway error");
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let lessons: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.lessons)) lessons = parsed.lessons;
    } catch {
      lessons = String(raw)
        .split("\n")
        .map((l: string) => l.replace(/^[-*\d.\s]+/, "").trim())
        .filter(Boolean);
    }

    lessons = lessons
      .map((l) => String(l).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim())
      .filter((l) => l.length > 1)
      .slice(0, 25);

    return json({ lessons });
  } catch (e) {
    console.error("list-lessons error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
