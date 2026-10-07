// Server-side admin authentication for leaderboard moderation.
// Subscription and payment actions were removed when the platform became free.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const encoder = new TextEncoder();
const ADMIN_PASSPHRASE = Deno.env.get("ADMIN_PASSPHRASE") ?? "";
const ADMIN_SESSION_SECRET = Deno.env.get("ADMIN_SESSION_SECRET") ?? "";
const PREVIEW_ACCESS_CODE = Deno.env.get("PREVIEW_ACCESS_CODE") ?? "";
const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 4;
const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64urlDecode = (value: string) => {
  let normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) normalized += "=";
  return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
};
const hmac = async (secret: string, value: string) => {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
};
const timingSafeEqual = (first: Uint8Array, second: Uint8Array) => {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1) difference |= first[index] ^ second[index];
  return difference === 0;
};
const json = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function issueAdminToken() {
  const payload = b64url(encoder.encode(JSON.stringify({ role: "admin", exp: Math.floor(Date.now() / 1000) + ADMIN_TOKEN_TTL_SECONDS })));
  return `${payload}.${b64url(await hmac(ADMIN_SESSION_SECRET, payload))}`;
}

async function verifyAdminToken(token: string) {
  if (!token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  if (!timingSafeEqual(await hmac(ADMIN_SESSION_SECRET, payload), b64urlDecode(signature))) return false;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    return parsed.role === "admin" && typeof parsed.exp === "number" && Math.floor(Date.now() / 1000) < parsed.exp;
  } catch {
    return false;
  }
}

async function handle(request: Request) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: "invalid_json" }, 400); }

  if (body.action === "preview_gate") {
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!PREVIEW_ACCESS_CODE) return json({ error: "server_misconfigured" }, 500);
    const valid = timingSafeEqual(await hmac(ADMIN_SESSION_SECRET, `g:${code}`), await hmac(ADMIN_SESSION_SECRET, `g:${PREVIEW_ACCESS_CODE}`));
    return valid ? json({ ok: true }) : json({ ok: false }, 401);
  }

  if (body.action === "admin_login") {
    const passphrase = typeof body.passphrase === "string" ? body.passphrase : "";
    if (!ADMIN_PASSPHRASE || !ADMIN_SESSION_SECRET) return json({ error: "server_misconfigured" }, 500);
    const valid = timingSafeEqual(await hmac(ADMIN_SESSION_SECRET, `p:${passphrase}`), await hmac(ADMIN_SESSION_SECRET, `p:${ADMIN_PASSPHRASE}`));
    return valid ? json({ ok: true, token: await issueAdminToken(), expiresIn: ADMIN_TOKEN_TTL_SECONDS }) : json({ ok: false }, 401);
  }

  const token = typeof body.adminToken === "string" ? body.adminToken : "";
  if (!(await verifyAdminToken(token))) return json({ error: "unauthorized" }, 401);

  if (body.action === "list_leaderboard") {
    const { data, error } = await admin.from("leaderboard").select("id,student_name,xp,badges,updated_at").order("xp", { ascending: false }).limit(300);
    return error ? json({ error: "db_error" }, 500) : json({ ok: true, entries: data ?? [] });
  }

  if (body.action === "delete_leaderboard_entry") {
    const id = typeof body.id === "string" ? body.id : "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "invalid_input" }, 400);
    const { error } = await admin.from("leaderboard").delete().eq("id", id);
    return error ? json({ error: "db_error" }, 500) : json({ ok: true });
  }

  return json({ error: "unknown_action" }, 400);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try { return await handle(request); } catch (error) { console.error("activation error", error); return json({ error: "internal_error" }, 500); }
});