import { useEffect, useRef } from "react";

/**
 * محرّك الاستبقاء — يُطلق إشعاراً ودوداً عند خمول الطالب لفترة طويلة.
 * يستخدم Web Notifications API ويطلب الإذن مرة واحدة بعد أول تفاعل.
 */
export function useIdleNotify(idleMinutes = 4) {
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const requestPerm = () => {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
      window.removeEventListener("pointerdown", requestPerm);
    };
    window.addEventListener("pointerdown", requestPerm, { once: true });

    const fire = () => {
      if (Notification.permission !== "granted" || document.visibilityState === "visible") return;
      try {
        new Notification("منصة الطالب العبقري 🎓", {
          body: "اشتقنا إليك! عُد لإكمال تحدّيك قبل أن يتجاوزك منافسوك ⚡",
          tag: "genius-idle",
          icon: "/favicon.ico",
        });
      } catch { /* ignore */ }
    };

    const reset = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(fire, idleMinutes * 60 * 1000);
    };
    const events = ["mousemove", "keydown", "touchstart", "pointerdown", "scroll"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      events.forEach(e => window.removeEventListener(e, reset));
      window.removeEventListener("pointerdown", requestPerm);
    };
  }, [idleMinutes]);
}
