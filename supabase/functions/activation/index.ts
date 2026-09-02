// Server-side admin auth + subscription request lifecycle.
// Secrets never leave the edge runtime; the client can only submit a
// subscription request or poll the current status of its own name.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const enc = new TextEncoder();

const ADMIN_PASSPHRASE = Deno.env.get("ADMIN_PASSPHRASE") ?? "";
const ACTIVATION_SALT = Deno.env.get("ACTIVATION_SALT") ?? "";
const ADMIN_SESSION_SECRET = Deno.env.get("ADMIN_SESSION_SECRET") ?? "";
const PREVIEW_ACCESS_CODE = Deno.env.get("PREVIEW_ACCESS_CODE") ?? "";
const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 4; // 4h

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normName(v: string): string {
  return v.trim().replace(/\s+/g, " ");
}

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

  if (action === "preview_gate") {
    // Verifies the non-production preview access code entirely server-side so
    // the code never ships in the client bundle.
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!PREVIEW_ACCESS_CODE) return json({ error: "server_misconfigured" }, 500);
    const a = await hmac(ADMIN_SESSION_SECRET, `g:${code}`);
    const b = await hmac(ADMIN_SESSION_SECRET, `g:${PREVIEW_ACCESS_CODE}`);
    if (!timingSafeEqual(a, b)) return json({ ok: false }, 401);
    return json({ ok: true });
  }

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

  if (action === "request_subscription") {
    const name = typeof body.studentName === "string" ? normName(body.studentName) : "";
    const plan = body.plan;
    if (!name || !isPlan(plan)) return json({ error: "invalid_input" }, 400);
    if (name.length > 80) return json({ error: "invalid_input" }, 400);
    // Reuse the outstanding token if the same name already has a pending/active
    // request for this plan — prevents stacking and lets the same browser keep
    // its token across accidental resubmits (the token stays in localStorage).
    // Escape LIKE wildcards in the caller-supplied name so a request like
    // `studentName: "%"` cannot match another student's row and leak their
    // private request_token. `\`, `%`, and `_` are all special to ILIKE.
    const escapedName = name.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
    const { data: existing } = await admin
      .from("subscription_requests")
      .select("id,status,request_token")
      .ilike("student_name", escapedName)
      .eq("plan", plan)
      .in("status", ["pending", "active"])
      .limit(1);
    if (existing && existing.length > 0) {
      return json({
        ok: true,
        duplicate: true,
        status: existing[0].status,
        token: existing[0].request_token,
      });
    }
    const token = b64url(crypto.getRandomValues(new Uint8Array(24)));
    const { error } = await admin.from("subscription_requests").insert({
      student_name: name,
      plan,
      status: "pending",
      request_token: token,
    });
    if (error) return json({ error: "db_error" }, 500);
    return json({ ok: true, token });
  }

  if (action === "check_status") {
    const name = typeof body.studentName === "string" ? normName(body.studentName) : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!name || !token) return json({ error: "invalid_input" }, 400);
    // Status is bound to the private request token, NOT the free-text name.
    // Copying another student's public display name is not enough to unlock.
    const { data } = await admin
      .from("subscription_requests")
      .select("plan,status,activated_at,student_name")
      .eq("request_token", token)
      .maybeSingle();
    if (!data) return json({ ok: true, status: "none" });
    if (normName(data.student_name).toLowerCase() !== name.toLowerCase()) {
      return json({ ok: true, status: "none" });
    }
    if (data.status === "active") {
      return json({ ok: true, status: "active", plan: data.plan, activated_at: data.activated_at });
    }
    if (data.status === "pending") {
      return json({ ok: true, status: "pending", plan: data.plan });
    }
    return json({ ok: true, status: "none" });
  }


  if (action === "list_requests") {
    const token = typeof body.adminToken === "string" ? body.adminToken : "";
    if (!(await verifyAdminToken(token))) return json({ error: "unauthorized" }, 401);
    const { data, error } = await admin
      .from("subscription_requests")
      .select("id,student_name,plan,status,requested_at,activated_at")
      .order("status", { ascending: true })
      .order("requested_at", { ascending: false })
      .limit(200);
    if (error) return json({ error: "db_error" }, 500);
    return json({ ok: true, requests: data ?? [] });
  }

  if (action === "activate_request") {
    const token = typeof body.adminToken === "string" ? body.adminToken : "";
    if (!(await verifyAdminToken(token))) return json({ error: "unauthorized" }, 401);
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return json({ error: "invalid_input" }, 400);
    const { data, error } = await admin
      .from("subscription_requests")
      .update({ status: "active", activated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id,student_name,plan,status,activated_at")
      .maybeSingle();
    if (error || !data) return json({ error: "db_error" }, 500);
    return json({ ok: true, request: data });
  }

  // ===== إدارة لوحة الشرف: عرض وحذف الأسماء غير اللائقة أو التجريبية =====
  if (action === "list_leaderboard") {
    const token = typeof body.adminToken === "string" ? body.adminToken : "";
    if (!(await verifyAdminToken(token))) return json({ error: "unauthorized" }, 401);
    const { data, error } = await admin
      .from("leaderboard")
      .select("id,student_name,xp,badges,updated_at")
      .order("xp", { ascending: false })
      .limit(300);
    if (error) return json({ error: "db_error" }, 500);
    return json({ ok: true, entries: data ?? [] });
  }

  if (action === "delete_leaderboard_entry") {
    const token = typeof body.adminToken === "string" ? body.adminToken : "";
    if (!(await verifyAdminToken(token))) return json({ error: "unauthorized" }, 401);
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return json({ error: "invalid_input" }, 400);
    const { error } = await admin.from("leaderboard").delete().eq("id", id);
    if (error) return json({ error: "db_error" }, 500);
    return json({ ok: true });
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
