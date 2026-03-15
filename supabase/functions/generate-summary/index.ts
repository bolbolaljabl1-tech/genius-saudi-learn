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
            content: `أنت معلم سعودي خبير في المناهج الدراسية السعودية. مهمتك كتابة ملخص تعليمي باللغة العربية الفصحى.

قواعد صارمة:
- ابدأ دائماً بـ "أهلاً بك" فقط. لا تستخدم أي كلمات تحدد الجنس أو العمر (مثل: يا بطل، يا ابنتي، يا صديقي).
- ادخل في صلب الشرح مباشرة بدون مقدمات طويلة.
${isElementary ? "- الطالب في المرحلة الابتدائية: استخدم كلمات في غاية البساطة وجمل قصيرة جداً." : "- استخدم لغة واضحة ومناسبة لمستوى الطالب."}
- اكتب ملخصاً مختصراً من 3 فقرات قصيرة:
  1. تعريف المفهوم
  2. شرح مع أمثلة بسيطة
  3. نصائح وتطبيقات
- اختم دائماً بسطر جديد يحتوي فقط: "تصميم الأستاذ جابر العبدلي - 2026"`
          },
          {
            role: "user",
            content: `اكتب ملخصاً تعليمياً لدرس "${lessonTitle}" في مادة "${subject}".`
          }
        ],
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
    const summary = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
