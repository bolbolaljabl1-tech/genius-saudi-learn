import { useEffect, useState, useCallback } from "react";

const TRIAL_START_KEY = "genius_trial_start";
const SUBSCRIBED_KEY = "genius_subscribed";
const TRIAL_DAYS = 7;
const DAY_MS = 86400000;

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

  const subscribe = useCallback(() => {
    localStorage.setItem(SUBSCRIBED_KEY, "1");
    setSubscribed(true);
  }, []);

  return { daysLeft, expired, active, subscribed, subscribe, startedAt, setStartedAt };
}
