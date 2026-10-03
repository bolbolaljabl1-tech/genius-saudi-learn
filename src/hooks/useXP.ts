import { useState, useEffect, useCallback } from "react";

const XP_KEY = "genius_xp";
const NAME_KEY = "genius_student_name";
const BADGES_KEY = "genius_badges";
const STREAK_KEY = "genius_streak";
const STREAK_DATE_KEY = "genius_streak_date";
const PROGRESS_KEY = "genius_activity_progress";

export type ActivityKind = "quiz" | "selftest" | "game" | "studio" | "camera";
export interface ActivityProgress {
  quiz: number;
  selftest: number;
  game: number;
  studio: number;
  camera: number;
  recent: { kind: ActivityKind; at: string }[];
}
const emptyProgress = (): ActivityProgress => ({ quiz: 0, selftest: 0, game: 0, studio: 0, camera: 0, recent: [] });

const todayKey = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / 86400000);
};

export function useXP() {
  const [progress, setProgress] = useState<ActivityProgress>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null");
      if (saved && typeof saved === "object") {
        const base = emptyProgress();
        for (const kind of ["quiz", "selftest", "game", "studio", "camera"] as ActivityKind[]) {
          base[kind] = Number.isSafeInteger(saved[kind]) && saved[kind] >= 0 ? saved[kind] : 0;
        }
        base.recent = Array.isArray(saved.recent) ? saved.recent.filter((item: any) => item && typeof item.at === "string" && ["quiz", "selftest", "game", "studio", "camera"].includes(item.kind)).slice(0, 4) : [];
        return base;
      }
    } catch { /* No prior activity yet. */ }
    return emptyProgress();
  });
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem(XP_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [studentName, setStudentName] = useState(() => {
    const existing = localStorage.getItem(NAME_KEY);
    if (existing) return existing;
    // Frictionless onboarding: generate a temporary display name in the
    // background so features that need a name (XP, leaderboards previews)
    // work without forcing the user through a modal on first entry.
    const temp = `طالب-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(NAME_KEY, temp);
    return temp;
  });
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
  useEffect(() => { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); }, [progress]);

  const addXP = useCallback((amount: number) => setXp(prev => prev + amount), []);
  const awardBadge = useCallback((badge: string) => {
    setBadges(prev => (prev.includes(badge) ? prev : [...prev, badge]));
  }, []);
  const saveStudentName = useCallback((name: string) => setStudentName(name), []);
  const recordCompletion = useCallback((kind: ActivityKind) => {
    setProgress(prev => ({
      ...prev,
      [kind]: prev[kind] + 1,
      recent: [{ kind, at: new Date().toISOString() }, ...prev.recent].slice(0, 4),
    }));
  }, []);

  return { xp, studentName, badges, streak, progress, addXP, awardBadge, saveStudentName, recordCompletion };
}
