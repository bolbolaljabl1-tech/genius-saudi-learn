import { useState, useEffect } from "react";
import { ArrowRight, Trophy, Medal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import appIcon from "@/assets/app-icon.png";

interface LeaderboardProps {
  onBack: () => void;
  currentName: string;
  currentXP: number;
}

interface LeaderboardEntry {
  id: string;
  student_name: string;
  xp: number;
  badges: string[];
}

const Leaderboard = ({ onBack, currentName, currentXP }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { syncAndFetch(); }, []);

  const syncAndFetch = async () => {
    if (currentName) {
      const { data: existing } = await (supabase as any).from("leaderboard").select("id").eq("student_name", currentName).maybeSingle();
      if (existing) {
        await (supabase as any).from("leaderboard").update({ xp: currentXP, updated_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        await (supabase as any).from("leaderboard").insert({ student_name: currentName, xp: currentXP });
      }
    }
    const { data } = await (supabase as any).from("leaderboard").select("*").order("xp", { ascending: false }).limit(50);
    setEntries((data as LeaderboardEntry[]) || []);
    setLoading(false);
  };

  const getRankIcon = (i: number) => {
    if (i === 0) return <span className="text-3xl">🥇</span>;
    if (i === 1) return <span className="text-3xl">🥈</span>;
    if (i === 2) return <span className="text-3xl">🥉</span>;
    return <span className="w-8 h-8 text-center text-muted-foreground font-extrabold text-xl">{i + 1}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-gold shadow-gold mb-4">
          <Trophy className="w-10 h-10 text-gold-foreground" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground">🏆 لوحة المتصدرين</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted-foreground text-xl font-bold">لا يوجد طلاب بعد. كن أول المتصدرين!</p>
      ) : (
        <div className="max-w-lg mx-auto w-full space-y-3">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={`neu-card p-5 flex items-center gap-4 animate-scale-in ${entry.student_name === currentName ? "ring-3 ring-primary shadow-emerald" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {getRankIcon(i)}
              <span className="flex-1 font-extrabold text-foreground text-xl">{entry.student_name}</span>
              {entry.badges?.includes("وسام العبقري") && <img src={appIcon} alt="وسام" className="w-8 h-8 rounded-lg" />}
              <span className="text-primary font-extrabold text-xl">{entry.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
