import { abuseCheck } from "../_shared/abuse-guard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Escape Telegram MarkdownV1 special characters in user-supplied content
function escapeMarkdown(input: string): string {
  return input.replace(/([_*`\[\]])/g, '\\$1');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Strict: telegram spam prevention — 3 msgs / minute / IP, origin required
  const blocked = abuseCheck(req, { limit: 3, windowMs: 60_000, requireOrigin: true, corsHeaders });
  if (blocked) return blocked;

  const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!BOT_TOKEN) {
    return new Response(JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!CHAT_ID) {
    return new Response(JSON.stringify({ error: 'TELEGRAM_CHAT_ID not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    // Reject oversized request bodies (defensive cap before parsing JSON)
    const contentLength = Number(req.headers.get('content-length') ?? '0');
    if (contentLength > 8_000) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const rawName = typeof body?.student_name === 'string' ? body.student_name.trim() : '';
    const rawMessage = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!rawName || rawName.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid student_name (1-100 chars required)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!rawMessage || rawMessage.length > 1000) {
      return new Response(JSON.stringify({ error: 'Invalid message (1-1000 chars required)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const student_name = escapeMarkdown(rawName);
    const message = escapeMarkdown(rawMessage);

    const text = `
💌 *همسة عبقرية جديدة!*
━━━━━━━━━━━━━━
👤 *المرسل:* ${student_name}
📝 *الرسالة:* "${message}"
━━━━━━━━━━━━━━
✨ *منصة الطالب العبقري - 2026*
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Telegram API error', response.status, data);
      return new Response(JSON.stringify({ error: 'Failed to send message' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('send-telegram error:', error);
    return new Response(JSON.stringify({ error: 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
