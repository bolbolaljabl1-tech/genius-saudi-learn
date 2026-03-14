import { useState, useEffect, useCallback } from "react";

const XP_KEY = "genius_xp";
const NAME_KEY = "genius_student_name";
const BADGES_KEY = "genius_badges";

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

  useEffect(() => { localStorage.setItem(XP_KEY, String(xp)); }, [xp]);
  useEffect(() => { localStorage.setItem(NAME_KEY, studentName); }, [studentName]);
  useEffect(() => { localStorage.setItem(BADGES_KEY, JSON.stringify(badges)); }, [badges]);

  const addXP = useCallback((amount: number) => {
    setXp(prev => prev + amount);
  }, []);

  const awardBadge = useCallback((badge: string) => {
    setBadges(prev => {
      if (prev.includes(badge)) return prev;
      return [...prev, badge];
    });
  }, []);

  const saveStudentName = useCallback((name: string) => {
    setStudentName(name);
  }, []);

  return { xp, studentName, badges, addXP, awardBadge, saveStudentName };
}
