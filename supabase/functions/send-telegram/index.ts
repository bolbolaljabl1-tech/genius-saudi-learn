const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!BOT_TOKEN) {
    return new Response(JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!CHAT_ID) {
    return new Response(JSON.stringify({ error: 'TELEGRAM_CHAT_ID not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { student_name, message } = await req.json();

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
      throw new Error(`Telegram API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
