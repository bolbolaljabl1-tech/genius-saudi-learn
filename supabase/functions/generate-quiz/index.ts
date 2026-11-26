import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { abuseCheck } from "../_shared/abuse-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function tashkeelDensity(texts: string[]): number {
  const joined = texts.filter(Boolean).join(" ");
  const letters = joined.match(/[\u0621-\u064A]/g);
  if (!letters || letters.length === 0) return 1;
  const marks = joined.match(/[\u064B-\u0652\u0670]/g);
  return (marks ? marks.length : 0) / letters.length;
}

async function enforceQuizTashkeel(quizData: any, key: string): Promise<any> {
  try {
    const samples: string[] = [];
    for (const q of quizData.questions || []) {
      if (q.question) samples.push(q.question);
      if (Array.isArray(q.options)) samples.push(...q.options);
      if (q.explanation) samples.push(q.explanation);
    }
    if (tashkeelDensity(samples) >= 0.58) return quizData;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `أنت مُدَقِّقٌ لُغَوِيٌّ وَخَبِيرٌ فِي الضَّبْطِ بِالشَّكْلِ التَّامِّ لِلْمَرْحَلَةِ الِابْتِدَائِيَّةِ.
أَعِدْ إِخْرَاجَ كَائِنِ JSON الْمُرْسَلِ بَعْدَ وَضْعِ التَّشْكِيلِ الْكَامِلِ الدَّقِيقِ (الْفَتْحَةُ، الضَّمَّةُ، الْكَسْرَةُ، السُّكُونُ، الشَّدَّةُ، وَالتَّنْوِينُ) عَلَى كُلِّ حَرْفٍ وَكُلِّ كَلِمَةٍ عَرَبِيَّةٍ فِي (question, options, explanation) مَعَ الْحِفَاظِ التَّامِّ عَلَى correctIndex وَعَدَدِ الْأَسْئِلَةِ وَالْخِيَارَاتِ دُونَ أَيِّ تَغْيِيرٍ.`,
          },
          { role: "user", content: JSON.stringify(quizData) },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return quizData;
    const vData = await res.json();
    const raw = vData.choices?.[0]?.message?.content;
    if (typeof raw === "string") {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length === quizData.questions.length) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error("enforceQuizTashkeel fallback:", err);
  }
  return quizData;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const blocked = abuseCheck(req, { limit: 10, windowMs: 60_000, requireOrigin: true, corsHeaders });
  if (blocked) return blocked;

  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > 4_000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = await req.json();
    const lessonTitle = typeof body?.lessonTitle === "string" ? body.lessonTitle.trim() : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const stage = typeof body?.stage === "string" ? body.stage : "";
    if (!lessonTitle || lessonTitle.length > 200 || !subject || subject.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid lessonTitle or subject" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isElementary = stage === "elementary";
    const isEnglish = subject.includes("الإنجليزية") || subject.toLowerCase().includes("english");

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
${isElementary ? "- قَاعِدَةٌ إِلْزَامِيَّةٌ لِلْمَرْحَلَةِ الِابْتِدَائِيَّةِ: اجْعَلِ الْأَسْئِلَةَ بَسِيطَةً بِكَلِمَاتٍ سَهْلَةٍ، وَالْتَزِمْ بِتَشْكِيلِ جَمِيعِ النُّصُوصِ الْعَرَبِيَّةِ بِالْكَامِلِ (الْفَتْحَةُ، الضَّمَّةُ، الْكَسْرَةُ، السُّكُونُ، الشَّدَّةُ، وَالتَّنْوِينُ) عَلَى كُلِّ كَلِمَةٍ وَكُلِّ حَرْفٍ فِي نَصِّ السُّؤَالِ، وَجَمِيعِ الْخِيَارَاتِ الْأَرْبَعَةِ، وَشَرْحِ الْإِجَابَةِ دُونَ اسْتِثْنَاءٍ." : "- اجعل الأسئلة مناسبة لمستوى الطالب."}
- كل سؤال يحتوي على: نص السؤال، 4 خيارات، رقم الإجابة الصحيحة (0-3)، شرح مختصر.
- اختم شرح كل سؤال بـ: "${isElementary ? "مِنَصَّةُ الطَّالِبِ الْعَبْقَرِيِّ - 2026" : "منصة الطالب العبقري - 2026"}"`
          },
          {
            role: "user",
            content: isElementary
              ? `أَنْشِئْ 10 أَسْئِلَةِ اخْتِيَارٍ مِنْ مُتَعَدِّدٍ عَنْ دَرْسِ "${lessonTitle}" فِي مَادَّةِ "${subject}" مَعَ التَّشْكِيلِ الْكَامِلِ لِجَمِيعِ الْكَلِمَاتِ وَالْحُرُوفِ.`
              : `أنشئ 10 أسئلة اختيار من متعدد عن درس "${lessonTitle}" في مادة "${subject}".`
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
    let quizData = JSON.parse(toolCall.function.arguments);

    if (isElementary && !isEnglish) {
      quizData = await enforceQuizTashkeel(quizData, LOVABLE_API_KEY);
    }

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
