import { useCallback, useEffect, useRef } from "react";

// Delayed feedback must never complete an activity after its screen unmounts.
export function useActivityDelay() {
  const timers = useRef<Set<number>>(new Set());
  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);
  return useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);
}