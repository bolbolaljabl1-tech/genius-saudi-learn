// Lightweight in-memory per-IP rate limiter + origin allowlist.
// Note: in-memory state is per-isolate; it's a best-effort throttle,
// not a strong limit. Combined with origin check it stops casual abuse.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("cf-connecting-ip")
    || req.headers.get("x-real-ip")
    || "unknown";
}

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

const ALLOWED_HOST_SUFFIXES = [
  ".lovable.app",
  ".lovableproject.com",
  ".lovable.dev",
  "localhost",
  "127.0.0.1",
];

export function originAllowed(req: Request): boolean {
  const origin = req.headers.get("origin") || req.headers.get("referer");
  if (!origin) return false;
  try {
    const u = new URL(origin);
    const host = u.hostname;
    return ALLOWED_HOST_SUFFIXES.some((s) =>
      host === s.replace(/^\./, "") || host.endsWith(s)
    );
  } catch {
    return false;
  }
}

export function abuseCheck(
  req: Request,
  opts: { limit: number; windowMs: number; requireOrigin?: boolean; corsHeaders?: Record<string, string> },
): Response | null {
  const headers = { ...(opts.corsHeaders ?? {}), "Content-Type": "application/json" };
  if (opts.requireOrigin && !originAllowed(req)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers });
  }
  const ip = clientIp(req);
  if (!rateLimit(ip, opts.limit, opts.windowMs)) {
    return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول لاحقاً" }), { status: 429, headers });
  }
  return null;
}

