import { useEffect, useMemo, useState } from "react";
import { Sparkles, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeeklyCompetitionBannerProps {
  onOpenLeaderboard: () => void;
}

const WeeklyCompetitionBanner = ({ onOpenLeaderboard }: WeeklyCompetitionBannerProps) => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        id: index,
        left: `${8 + ((index * 19) % 86)}%`,
        top: `${12 + ((index * 31) % 74)}%`,
        delay: `${(index % 5) * 0.24}s`,
      })),
    [],
  );

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLeaving(true), 6500);
    const hideTimer = window.setTimeout(() => setVisible(false), 7000);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  const dismiss = () => {
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 450);
  };

  if (!visible) return null;

  return (
    <aside
      className={`weekly-competition-shell ${leaving ? "weekly-competition-out" : "weekly-competition-in"}`}
      aria-label="إعلان مسابقة العباقرة الأسبوعية"
    >
      <div className="relative mx-auto w-[calc(100%-1.5rem)] max-w-xl overflow-hidden rounded-2xl border-2 border-matte-gold/70 bg-royal-blue shadow-gold">
        <div aria-hidden className="absolute inset-0 weekly-competition-shimmer" />
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="weekly-competition-particle absolute h-1.5 w-1.5 rounded-full bg-matte-gold"
              style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={dismiss}
          className="absolute left-1.5 top-1.5 z-20 h-8 w-8 rounded-full text-matte-gold hover:bg-matte-gold/15 hover:text-matte-gold"
          aria-label="إغلاق إعلان المسابقة"
        >
          <X className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onOpenLeaderboard}
          className="relative z-10 h-auto w-full whitespace-normal px-9 py-4 text-right text-matte-gold hover:bg-primary/10 hover:text-matte-gold active:scale-[0.98]"
          aria-label="مسابقة العباقرة الأسبوعية، افتح لوحة المتصدرين"
        >
          <span className="flex w-full items-start gap-3">
            <span className="relative mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-matte-gold/70 bg-primary/20 shadow-gold">
              <Trophy className="h-6 w-6" />
              <Sparkles className="absolute -right-2 -top-2 h-4 w-4 weekly-competition-star" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-1 block font-aref text-xl font-bold leading-tight sm:text-2xl">
                مسابقة العباقرة الأسبوعية
              </span>
              <span className="block font-tajawal text-sm font-bold leading-relaxed text-royal-blue-foreground sm:text-base">
                أعلى ثلاثة طلاب حصولاً على نقاط (XP) خلال أسبوع واحد يحصلون على اشتراك فصل دراسي مجاني بالكامل!
              </span>
              <span className="mt-1 block text-xs font-extrabold text-matte-gold">
                اضغط لعرض لوحة المتصدرين
              </span>
            </span>
          </span>
        </Button>
      </div>
    </aside>
  );
};

export default WeeklyCompetitionBanner;