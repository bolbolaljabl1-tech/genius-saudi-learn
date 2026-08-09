// السبورة التفاعلية الذكية: تحليل كتابة الطالب أو رسمه ومقارنته بالإجابة النموذجية.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { abuseCheck } from "../_shared/abuse-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUBJECTS: Record<string, string> = {
  arabic: "اللغة العربية",
  english: "اللغة الإنجليزية",
  math: "الرياضيات",
  science: "العلوم",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const blocked = abuseCheck(req, { limit: 15, windowMs: 60_000, requireOrigin: true, corsHeaders });
  if (blocked) return blocked;

  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > 8_000_000) {
      return new Response(JSON.stringify({ error: "الصورة كبيرة جداً" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageBase64, subject, skill, task } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== "string") throw new Error("لا توجد صورة");
    if (imageBase64.length > 10_000_000) {
      return new Response(JSON.stringify({ error: "الصورة كبيرة جداً" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const subjectLabel = SUBJECTS[String(subject)] ?? "المواد الأساسية";
    const skillText = typeof skill === "string" ? skill.slice(0, 200) : "";
    const taskText = typeof task === "string" ? task.slice(0, 300) : "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY غير مهيأ");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `أنت معلم سعودي خبير في مواد الاختبارات الوطنية. تراجع محاولة مكتوبة أو مرسومة على سبورة رقمية.
قواعد صارمة:
- ابدأ بـ "أهلاً بك" ولا تستخدم ألفاظاً تحدد الجنس أو العمر.
- اللغة العربية الفصحى فقط، ويمنع منعاً باتاً استخدام الرموز التعبيرية.
- اقرأ ما كتبه الطالب بدقة، ثم قارنه بالإجابة النموذجية الصحيحة.
- التزم بهذا الترتيب في الرد:
  التقدير: (ممتاز أو جيد جداً أو جيد أو يحتاج تحسين) مع نسبة مئوية تقريبية.
  ما قرأته من محاولتك: سطر واحد.
  الإجابة النموذجية: سطر أو سطران.
  الملاحظات: نقطتان أو ثلاث نقاط قصيرة للتصحيح.
  توجيه تشجيعي: جملة تربوية محفزة.
- إذا كانت السبورة فارغة أو غير مفهومة، اذكر ذلك بلطف واطلب إعادة المحاولة.
- اختم بسطر جديد: "منصة الطالب العبقري - 2026"`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `المادة: ${subjectLabel}\nالمهارة المستهدفة: ${skillText || "مهارة تأسيسية عامة"}${taskText ? `\nالمطلوب من الطالب: ${taskText}` : ""}\nحلل محاولة الطالب في الصورة المرفقة.`,
              },
              { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للمنصة" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      throw new Error(t.slice(0, 200));
    }

    const data = await response.json();
    const feedback = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
