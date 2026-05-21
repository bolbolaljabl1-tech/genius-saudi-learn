import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * يراقب لوحة الشرف كل دقيقة، ويطلق إشعاراً + Toast محفّز
 * عندما يتجاوز طالبٌ آخر الطالبَ الحالي في الترتيب.
 */
export function useOvertakeNotify(studentName: string | null | undefined, pollSeconds = 60) {
  const lastRank = useRef<number | null>(null);
  const lastOverTaker = useRef<string | null>(null);

  useEffect(() => {
    if (!studentName) return;

    let cancelled = false;

    const check = async () => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("student_name, xp")
        .order("xp", { ascending: false })
        .limit(50);

      if (cancelled || error || !data) return;

      const idx = data.findIndex((r) => r.student_name === studentName);
      if (idx === -1) return;
      const currentRank = idx + 1;

      if (lastRank.current !== null && currentRank > lastRank.current) {
        // someone passed us — find the closest new entry above
        const newcomer = data[currentRank - 2]?.student_name;
        if (newcomer && newcomer !== lastOverTaker.current) {
          lastOverTaker.current = newcomer;
          toast(`⚡ تجاوزك ${newcomer} في الترتيب!`, {
            description: "ارجع للتحدّي واستعد مكانك يا عبقري 🏆",
            duration: 6000,
          });
          if ("Notification" in window && Notification.permission === "granted" && document.visibilityState !== "visible") {
            try {
              new Notification("منصة الطالب العبقري 🏆", {
                body: `تجاوزك ${newcomer} في لوحة الشرف! استعد مكانك الآن ⚡`,
                tag: "genius-overtake",
                icon: "/favicon.ico",
              });
            } catch { /* ignore */ }
          }
        }
      }
      lastRank.current = currentRank;
    };

    check();
    const id = window.setInterval(check, pollSeconds * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [studentName, pollSeconds]);
}
