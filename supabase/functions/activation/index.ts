// Server-side admin auth + activation code generation/verification.
// Secrets (ADMIN_PASSPHRASE, ACTIVATION_SALT, ADMIN_SESSION_SECRET) never
// leave the edge runtime, so the client cannot self-mint codes or bypass
// the admin gate by editing bundled JS.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const enc = new TextEncoder();

const ADMIN_PASSPHRASE = Deno.env.get("ADMIN_PASSPHRASE") ?? "";
const ACTIVATION_SALT = Deno.env.get("ACTIVATION_SALT") ?? "";
const ADMIN_SESSION_SECRET = Deno.env.get("ADMIN_SESSION_SECRET") ?? "";
const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 4; // 4h

function b64url(bytes: Uint8Array): string {
  let s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(secret: string, msg: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return new Uint8Array(sig);
}

async function sha256Hex(msg: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(msg));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function issueAdminToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_TOKEN_TTL_SECONDS;
  const payload = b64url(enc.encode(JSON.stringify({ role: "admin", exp })));
  const sig = await hmac(ADMIN_SESSION_SECRET, payload);
  return `${payload}.${b64url(sig)}`;
}

async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [payload, sigPart] = token.split(".");
  const expected = await hmac(ADMIN_SESSION_SECRET, payload);
  const given = b64urlDecode(sigPart);
  if (!timingSafeEqual(expected, given)) return false;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    if (parsed.role !== "admin") return false;
    if (typeof parsed.exp !== "number") return false;
    if (Math.floor(Date.now() / 1000) >= parsed.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

async function computeCode(
  studentName: string,
  plan: "semester" | "yearly",
): Promise<string> {
  const payload = `${normalizeName(studentName)}|${plan}|${ACTIVATION_SALT}`;
  const hex = await sha256Hex(payload);
  const prefix = plan === "yearly" ? "YR" : "SM";
  return `${prefix}-${hex.slice(0, 10).toUpperCase()}`;
}

function isPlan(v: unknown): v is "semester" | "yearly" {
  return v === "semester" || v === "yearly";
}

async function handle(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const action = body.action;

  if (action === "admin_login") {
    const passphrase = typeof body.passphrase === "string" ? body.passphrase : "";
    if (!ADMIN_PASSPHRASE) return json({ error: "server_misconfigured" }, 500);
    // Compare using HMAC digests so short-circuits on length don't leak.
    const a = await hmac(ADMIN_SESSION_SECRET, `p:${passphrase}`);
    const b = await hmac(ADMIN_SESSION_SECRET, `p:${ADMIN_PASSPHRASE}`);
    if (!timingSafeEqual(a, b)) return json({ ok: false }, 401);
    const token = await issueAdminToken();
    return json({ ok: true, token, expiresIn: ADMIN_TOKEN_TTL_SECONDS });
  }

  if (action === "generate_code") {
    const token = typeof body.adminToken === "string" ? body.adminToken : "";
    if (!(await verifyAdminToken(token))) return json({ error: "unauthorized" }, 401);
    const name = typeof body.studentName === "string" ? body.studentName : "";
    const plan = body.plan;
    if (!name.trim() || !isPlan(plan)) return json({ error: "invalid_input" }, 400);
    const code = await computeCode(name, plan);
    return json({ ok: true, code });
  }

  if (action === "verify_code") {
    const name = typeof body.studentName === "string" ? body.studentName : "";
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const hinted = body.plan;
    if (!name.trim() || !code) return json({ error: "invalid_input" }, 400);
    const candidates: Array<"semester" | "yearly"> = code.startsWith("YR-")
      ? ["yearly"]
      : code.startsWith("SM-")
        ? ["semester"]
        : isPlan(hinted)
          ? [hinted]
          : ["yearly", "semester"];
    for (const plan of candidates) {
      const expected = await computeCode(name, plan);
      if (timingSafeEqual(enc.encode(expected), enc.encode(code))) {
        return json({ ok: true, plan });
      }
    }
    return json({ ok: false }, 200);
  }

  return json({ error: "unknown_action" }, 400);
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    return await handle(req);
  } catch (err) {
    console.error("activation error", err);
    return json({ error: "internal_error" }, 500);
  }
});
