import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { abuseCheck } from "../_shared/abuse-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const blocked = abuseCheck(req, { limit: 15, windowMs: 60_000, requireOrigin: true, corsHeaders });
  if (blocked) return blocked;


  try {
    // Cap request body to ~8MB (base64 image + small hint)
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > 8_000_000) {
      return new Response(JSON.stringify({ error: "Image too large (max ~8MB)" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageBase64, hint } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== "string") throw new Error("No image provided");
    if (imageBase64.length > 10_000_000) {
      return new Response(JSON.stringify({ error: "Image too large" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (hint && (typeof hint !== "string" || hint.length > 500)) {
      return new Response(JSON.stringify({ error: "Hint too long (max 500 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            content: `أنت معلم سعودي خبير في جميع المناهج السعودية. عند تحليل صورة سؤال:

قواعد صارمة:
- ابدأ بـ "أهلاً بك" فقط. لا تستخدم أي كلمات تحدد الجنس أو العمر (مثل: يا بطل، يا ابنتي).
- ادخل في صلب الحل مباشرة بأسلوب مختصر وبسيط.
- حدد المادة والموضوع، اقرأ السؤال، قدم الحل خطوة بخطوة.
- استخدم كلمات بسيطة وواضحة.
- اختم دائماً بسطر جديد: "منصة الطالب العبقري - 2026"`
          },
          {
            role: "user",
            content: [
              { type: "text", text: `حلل هذا السؤال وقدم الحل بشكل مختصر ومباشر.${hint ? `\nتوضيح من الطالب: ${hint}` : ""}` },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
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
    const answer = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
