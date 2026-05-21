import { useState, useEffect, useCallback } from "react";

const XP_KEY = "genius_xp";
const NAME_KEY = "genius_student_name";
const BADGES_KEY = "genius_badges";
const STREAK_KEY = "genius_streak";
const STREAK_DATE_KEY = "genius_streak_date";

const todayKey = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / 86400000);
};

export function useXP() {
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem(XP_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [studentName, setStudentName] = useState(() => localStorage.getItem(NAME_KEY) || "");
  const [badges, setBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem(BADGES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [streak, setStreak] = useState<number>(() => {
    const last = localStorage.getItem(STREAK_DATE_KEY);
    const cur = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10);
    const today = todayKey();
    if (!last) {
      localStorage.setItem(STREAK_DATE_KEY, today);
      localStorage.setItem(STREAK_KEY, "1");
      return 1;
    }
    const diff = daysBetween(last, today);
    let next = cur;
    if (diff === 0) next = cur || 1;
    else if (diff === 1) next = cur + 1;
    else next = 1;
    localStorage.setItem(STREAK_DATE_KEY, today);
    localStorage.setItem(STREAK_KEY, String(next));
    return next;
  });

  useEffect(() => { localStorage.setItem(XP_KEY, String(xp)); }, [xp]);
  useEffect(() => { localStorage.setItem(NAME_KEY, studentName); }, [studentName]);
  useEffect(() => { localStorage.setItem(BADGES_KEY, JSON.stringify(badges)); }, [badges]);

  const addXP = useCallback((amount: number) => setXp(prev => prev + amount), []);
  const awardBadge = useCallback((badge: string) => {
    setBadges(prev => (prev.includes(badge) ? prev : [...prev, badge]));
  }, []);
  const saveStudentName = useCallback((name: string) => setStudentName(name), []);

  return { xp, studentName, badges, streak, addXP, awardBadge, saveStudentName };
}
