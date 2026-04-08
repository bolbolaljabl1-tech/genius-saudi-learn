import { useState, useEffect } from "react";
import { ArrowRight, Trophy, Loader2, Clock, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GeniusGalleryProps {
  onBack: () => void;
}

interface GalleryEntry {
  id: string;
  student_name: string;
  medal: string;
  time_seconds: number;
  subject: string;
  created_at: string;
}

const medalOrder: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
const medalEmoji: Record<string, string> = { gold: "🥇", silver: "🥈", bronze: "🥉" };
const medalLabel: Record<string, string> = { gold: "ذهبي", silver: "فضي", bronze: "برونزي" };
const medalBg: Record<string, string> = { gold: "bg-yellow-100 ring-yellow-400", silver: "bg-gray-100 ring-gray-400", bronze: "bg-amber-100 ring-amber-600" };

const GeniusGallery = ({ onBack }: GeniusGalleryProps) => {
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await (supabase as any)
        .from("genius_gallery")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      const sorted = ((data as GalleryEntry[]) || []).sort((a, b) => {
        const ma = medalOrder[a.medal] ?? 3;
        const mb = medalOrder[b.medal] ?? 3;
        if (ma !== mb) return ma - mb;
        return a.time_seconds - b.time_seconds;
      });
      setEntries(sorted);
      setLoading(false);
    };
    fetchGallery();
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec} ث`;
  };

  const handleShare = async (entry: GalleryEntry) => {
    const text = `لقد حصلتُ على ${medalEmoji[entry.medal]} ${medalLabel[entry.medal]} في #منصة_الطالب_العبقري بزمن قياسي! هل تستطيع تحدي سرعتي؟\nhttps://genius-saudi-learn.lovable.app`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "منصة الطالب العبقري", text });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 pb-24">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-gold shadow-gold mb-4">
          <Trophy className="w-10 h-10 text-gold-foreground" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground">🏅 معرض العباقرة</h2>
        <p className="text-muted-foreground text-lg mt-2">أبطال شبكة التحدي وأوسمتهم</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted-foreground text-xl font-bold">لا يوجد أبطال بعد. كن أول العباقرة! 🌟</p>
      ) : (
        <div className="max-w-lg mx-auto w-full space-y-3">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={`neu-card p-5 flex items-center gap-4 animate-scale-in ring-2 ${medalBg[entry.medal] || ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="text-4xl">{medalEmoji[entry.medal] || "🏅"}</span>
              <div className="flex-1 min-w-0">
                <span className="font-extrabold text-foreground text-xl block truncate">
                  {entry.student_name}
                </span>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-bold">{formatTime(entry.time_seconds)}</span>
                  <span>•</span>
                  <span>{medalLabel[entry.medal]}</span>
                </div>
              </div>
              <button
                onClick={() => handleShare(entry)}
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                aria-label="مشاركة"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeniusGallery;
