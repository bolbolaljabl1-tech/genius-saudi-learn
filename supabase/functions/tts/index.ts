// Streams TTS audio from Lovable AI Gateway (openai/gpt-4o-mini-tts)
// with a deep, confident Arabic teacher tone. Returns SSE PCM chunks.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { abuseCheck } from "../_shared/abuse-guard.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";

const TEACHER_INSTRUCTIONS =
  "You are speaking Modern Standard Arabic (الفصحى) as a bright, cheerful, high-energy upbeat youth voice — like an excited young mentor welcoming a star student. " +
  "Deliver every phrase with a joyful, sparkling, fast-paced rhythm full of genuine excitement, smiles, and warmth. " +
  "Honor full Arabic tashkeel and correct مخارج الحروف, especially ح خ ع غ ق ض ظ ص, while keeping articulation crisp at speed. " +
  "No robotic monotone, no gloom, no slow dragging. Sound genuinely thrilled, playful, and celebratory — pure joy and motivation.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Paid AI Gateway usage: allowlist origins and throttle per IP.
  const blocked = abuseCheck(req, {
    limit: 12,
    windowMs: 60_000,
    requireOrigin: true,
    corsHeaders,
  });
  if (blocked) return blocked;

  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "server_misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 1200) {
    return new Response(JSON.stringify({ error: "invalid_input" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        // "onyx" = deep, resonant male voice; closest match to the requested
        // "صوت جهوري قوي ممتزج ببحة طبيعية" teacher tone.
        voice: "onyx",
        instructions: TEACHER_INSTRUCTIONS,
        stream_format: "sse",
        response_format: "pcm",
        speed: 1.18,
      }),
      signal: req.signal,
    });

    if (!upstream.ok) {
      const msg = await upstream.text().catch(() => "");
      return new Response(JSON.stringify({ error: "tts_failed", status: upstream.status, msg }), {
        status: upstream.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") {
      return new Response(null, { status: 499, headers: corsHeaders });
    }
    console.error("tts error", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
