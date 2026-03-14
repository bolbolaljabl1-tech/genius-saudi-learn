import { useState, useEffect } from "react";
import { ArrowRight, Trophy, Medal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    syncAndFetch();
  }, []);

  const syncAndFetch = async () => {
    if (currentName) {
      const { data: existing } = await supabase
        .from("leaderboard")
        .select("id")
        .eq("student_name", currentName)
        .maybeSingle();

      if (existing) {
        await supabase.from("leaderboard").update({ xp: currentXP, updated_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        await supabase.from("leaderboard").insert({ student_name: currentName, xp: currentXP });
      }
    }

    const { data } = await supabase
      .from("leaderboard")
      .select("*")
      .order("xp", { ascending: false })
      .limit(50);

    setEntries((data as LeaderboardEntry[]) || []);
    setLoading(false);
  };

  const getRankIcon = (i: number) => {
    if (i === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (i === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (i === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 text-center text-muted-foreground font-bold">{i + 1}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-medium">رجوع</span>
      </button>

      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-emerald shadow-emerald mb-4">
          <Trophy className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">🏆 لوحة المتصدرين</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted-foreground">لا يوجد طلاب بعد. كن أول المتصدرين!</p>
      ) : (
        <div className="max-w-lg mx-auto w-full space-y-3">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={`glass-card rounded-xl p-4 flex items-center gap-4 animate-scale-in ${entry.student_name === currentName ? "border-2 border-primary" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {getRankIcon(i)}
              <span className="flex-1 font-bold text-foreground">{entry.student_name}</span>
              <span className="text-primary font-bold">{entry.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
