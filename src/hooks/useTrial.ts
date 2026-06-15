import { useEffect, useState, useCallback } from "react";

const TRIAL_START_KEY = "genius_trial_start";
const SUBSCRIBED_KEY = "genius_subscribed";
const PLAN_KEY = "genius_plan";
const SUB_START_KEY = "genius_sub_start";
const TRIAL_DAYS = 7;
const DAY_MS = 86400000;

export type PlanType = "trial" | "monthly" | "yearly";

export function useTrial() {
  const [startedAt, setStartedAt] = useState<number>(() => {
    const saved = localStorage.getItem(TRIAL_START_KEY);
    if (saved) return parseInt(saved, 10);
    const now = Date.now();
    localStorage.setItem(TRIAL_START_KEY, String(now));
    return now;
  });
  const [subscribed, setSubscribed] = useState<boolean>(
    () => localStorage.getItem(SUBSCRIBED_KEY) === "1"
  );
  const [plan, setPlan] = useState<PlanType>(() => {
    const p = localStorage.getItem(PLAN_KEY) as PlanType | null;
    return p ?? "trial";
  });
  const [subStartedAt, setSubStartedAt] = useState<number>(() => {
    const s = localStorage.getItem(SUB_START_KEY);
    return s ? parseInt(s, 10) : 0;
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const elapsedMs = now - startedAt;
  const remainingMs = Math.max(0, TRIAL_DAYS * DAY_MS - elapsedMs);
  const daysLeft = Math.ceil(remainingMs / DAY_MS);
  const expired = !subscribed && remainingMs <= 0;
  const active = subscribed || !expired;

  const planDurationDays = plan === "yearly" ? 365 : plan === "monthly" ? 30 : 0;
  const subEndAt = subStartedAt && planDurationDays
    ? subStartedAt + planDurationDays * DAY_MS
    : 0;

  const subscribe = useCallback((newPlan: Exclude<PlanType, "trial"> = "yearly") => {
    const nowMs = Date.now();
    localStorage.setItem(SUBSCRIBED_KEY, "1");
    localStorage.setItem(PLAN_KEY, newPlan);
    localStorage.setItem(SUB_START_KEY, String(nowMs));
    setSubscribed(true);
    setPlan(newPlan);
    setSubStartedAt(nowMs);
  }, []);

  const cancelSubscription = useCallback(() => {
    localStorage.removeItem(SUBSCRIBED_KEY);
    localStorage.removeItem(PLAN_KEY);
    localStorage.removeItem(SUB_START_KEY);
    setSubscribed(false);
    setPlan("trial");
    setSubStartedAt(0);
  }, []);

  return {
    daysLeft,
    expired,
    active,
    subscribed,
    plan,
    subStartedAt,
    subEndAt,
    trialStartedAt: startedAt,
    trialEndAt: startedAt + TRIAL_DAYS * DAY_MS,
    subscribe,
    cancelSubscription,
    setStartedAt,
  };
}
