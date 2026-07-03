import { useCallback, useEffect, useState } from "react";

const TRIAL_START_KEY = "genius_trial_start";
const SUB_TOKEN_KEY = "genius_sub_token";
// Legacy client-only entitlement keys (bypassable). We proactively clear them
// on load so an attacker cannot flip them in DevTools to unlock paid content.
const LEGACY_SUBSCRIBED_KEY = "genius_subscribed";
const LEGACY_PLAN_KEY = "genius_plan";
const LEGACY_SUB_START_KEY = "genius_sub_start";
const TRIAL_DAYS = 3;
const DAY_MS = 86400000;

export type PlanType = "trial" | "semester" | "yearly";
export type ServerStatus = "unknown" | "none" | "pending" | "active";

if (typeof window !== "undefined") {
  // Purge legacy localStorage flags so old bypasses can't confer access anymore.
  try {
    window.localStorage.removeItem(LEGACY_SUBSCRIBED_KEY);
    window.localStorage.removeItem(LEGACY_PLAN_KEY);
    window.localStorage.removeItem(LEGACY_SUB_START_KEY);
  } catch {
    /* ignore */
  }
}

export function useTrial() {
  const [startedAt] = useState<number>(() => {
    const saved = localStorage.getItem(TRIAL_START_KEY);
    if (saved) return parseInt(saved, 10);
    const now = Date.now();
    localStorage.setItem(TRIAL_START_KEY, String(now));
    return now;
  });

  const [subToken, setSubToken] = useState<string>(
    () => localStorage.getItem(SUB_TOKEN_KEY) || "",
  );
  // Entitlement is derived from the server, never from a mutable client flag.
  const [serverStatus, setServerStatus] = useState<ServerStatus>("unknown");
  const [plan, setPlan] = useState<PlanType>("trial");
  const [subStartedAt, setSubStartedAt] = useState<number>(0);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const elapsedMs = now - startedAt;
  const remainingMs = Math.max(0, TRIAL_DAYS * DAY_MS - elapsedMs);
  const daysLeft = Math.ceil(remainingMs / DAY_MS);
  const subscribed = serverStatus === "active";
  const expired = !subscribed && remainingMs <= 0;
  const active = subscribed || !expired;

  const planDurationDays = plan === "yearly" ? 365 : plan === "semester" ? 120 : 0;
  const subEndAt = subStartedAt && planDurationDays
    ? subStartedAt + planDurationDays * DAY_MS
    : 0;

  const saveSubToken = useCallback((token: string) => {
    if (!token) return;
    localStorage.setItem(SUB_TOKEN_KEY, token);
    setSubToken(token);
  }, []);

  const applyServerStatus = useCallback(
    (status: ServerStatus, nextPlan?: PlanType | null, activatedAt?: string | null) => {
      setServerStatus(status);
      if (nextPlan === "semester" || nextPlan === "yearly") {
        setPlan(nextPlan);
      }
      if (status !== "active") {
        setSubStartedAt(0);
      } else if (activatedAt) {
        const ts = Date.parse(activatedAt);
        if (!Number.isNaN(ts)) setSubStartedAt(ts);
        else if (!subStartedAt) setSubStartedAt(Date.now());
      } else if (!subStartedAt) {
        setSubStartedAt(Date.now());
      }
    },
    [subStartedAt],
  );

  const clearSubscription = useCallback(() => {
    localStorage.removeItem(SUB_TOKEN_KEY);
    setSubToken("");
    setServerStatus("none");
    setPlan("trial");
    setSubStartedAt(0);
  }, []);

  return {
    daysLeft,
    expired,
    active,
    subscribed,
    plan,
    subToken,
    serverStatus,
    subStartedAt,
    subEndAt,
    trialStartedAt: startedAt,
    trialEndAt: startedAt + TRIAL_DAYS * DAY_MS,
    saveSubToken,
    applyServerStatus,
    clearSubscription,
    // Kept for backwards-compat with SubscriptionSettings API surface.
    cancelSubscription: clearSubscription,
  };
}
