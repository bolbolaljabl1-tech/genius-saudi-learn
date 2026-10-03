import { GraduationCap, BookOpen, Camera, Trophy, Gamepad2, ClipboardCheck, Blocks, Sparkles, Star, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/AnimatedLogo";
import heroBanner from "@/assets/hero-banner.png";
import { Music2, Twitter, ExternalLink } from "lucide-react";

interface StageSelectionProps {
  onSelect: (stage: string) => void;
  onCamera: () => void;
  onLeaderboard: () => void;
  onGames: () => void;
  onSelfTest: () => void;
  onFoundation: () => void;
  onStudio: () => void;
  onDashboard: () => void;
  xp: number;
  studentName: string;
  streak?: number;
}

const StageSelection = ({ onSelect, onCamera, onLeaderboard, onGames, onSelfTest, onFoundation, onStudio, onDashboard, xp, studentName, streak = 0 }: StageSelectionProps) => {

  const stages = [
    { id: "elementary", title: "المرحلة الابتدائية", description: "من الصف الأول إلى السادس", icon: BookOpen, delay: "0.1s" },
    { id: "middle", title: "المرحلة المتوسطة", description: "من الصف الأول إلى الثالث", icon: GraduationCap, delay: "0.3s" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center pt-2">
      <div className="w-full px-4 flex flex-col items-center">
        {/* Student stars and quick progress */}
        <div className="w-full max-w-xl flex items-center justify-between mb-2 animate-slide-up">
          <Button onClick={onDashboard} variant="outline" className="flex items-center gap-2 h-12 px-3 sm:px-5 border-gold/50 font-extrabold text-base sm:text-lg" aria-label={`لوحة إنجازاتي، ${xp} نجمة`}>
            <Star className="star-soft-pulse fill-gold text-gold" aria-hidden="true" />
            <span className="text-foreground tabular-nums">{xp.toLocaleString("ar-SA")}</span>
            <LayoutDashboard className="text-primary" aria-hidden="true" />
            <span className="hidden sm:inline">إنجازاتي</span>
          </Button>
          {studentName && (
            <span className="text-muted-foreground text-base font-bold flex items-center gap-2">
              {studentName}
              {streak > 0 && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-extrabold shadow-sm animate-pulse-glow"
                  title={`سلسلة ${streak} يوم متتالية`}
                  aria-label={`سلسلة ${streak} يوم`}
                >
                  🔥 {streak}
                </span>
              )}
            </span>
          )}
          <AnimatedLogo xp={xp} studentName={studentName} size="md" />
        </div>

        {/* Hero Banner - main identity (enlarged 30%) */}
        <h1 className="sr-only">منصة الطالب العبقري — مراجعة وتحديات ذكية</h1>
        <div className="w-full max-w-3xl mb-5 animate-scale-in px-0">
          <img
            src={heroBanner}
            alt="منصة الطالب العبقري — شعار الواجهة الرئيسية"
            width={1200}
            height={600}
            fetchPriority="high"
            decoding="async"
            className="w-full rounded-3xl shadow-emerald-lg"
          />
        </div>

        {/* Camera Solver Button */}
        <button onClick={onCamera} className="w-full max-w-xl mb-4 py-5 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-2xl shadow-emerald-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 animate-scale-in" style={{ animationDelay: "0.05s" }}>
          <Camera className="w-7 h-7" />
          📸 صور سؤالك
        </button>

        {/* Games Button */}
        <button onClick={onGames} className="w-full max-w-xl mb-4 py-5 rounded-2xl gradient-gold text-gold-foreground font-extrabold text-2xl shadow-gold active:scale-[0.98] transition-all flex items-center justify-center gap-3 animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <Gamepad2 className="w-7 h-7" />
          🎮 ألعاب العباقرة
        </button>

        {/* AI Quiz Studio */}
        <button
          onClick={onStudio}
          className="w-full max-w-xl mb-4 py-5 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-2xl shadow-emerald-lg border-2 border-gold/60 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1 animate-scale-in animate-gold-neon"
          style={{ animationDelay: "0.12s" }}
          aria-label="صَمِّم لعبتك بنفسك"
        >
          <span className="flex items-center gap-3">
            <Sparkles className="w-7 h-7" />
            صَمِّم لعبتك بنفسك
          </span>
          <span className="text-sm font-bold opacity-90">استوديو التحديات التفاعلية بالذكاء الاصطناعي</span>
        </button>


        {/* Self Test Button */}
        <button onClick={onSelfTest} className="w-full max-w-xl mb-4 py-5 rounded-2xl bg-royal-blue text-matte-gold font-extrabold text-2xl shadow-emerald-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 animate-scale-in animate-gold-neon" style={{ animationDelay: "0.15s" }}>
          <ClipboardCheck className="w-7 h-7" />
          اختبر نفسك
        </button>

        {/* قسم التأسيس — مواد نافس الأربع */}
        <button
          onClick={onFoundation}
          className="w-full max-w-xl mb-4 px-4 py-3 rounded-2xl neu-card border-2 border-gold/50 text-right active:scale-[0.98] transition-all animate-scale-in hover:shadow-gold stage-card-3d"
          style={{ animationDelay: "0.18s" }}
          aria-label="قسم التأسيس لمواد نافس الأربع"
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl gradient-gold shadow-gold shrink-0">
              <Blocks className="w-6 h-6 text-gold-foreground" />
            </span>
            <span>
              <span className="block text-xl font-extrabold text-heading">التأسيس</span>
              <span className="block text-xs sm:text-sm font-bold text-muted-foreground leading-snug">
                (المهارات الأساسية للمواد المستهدفة في الاختبارات الوطنية)
              </span>
            </span>
          </span>
        </button>




        {/* Stage Label */}
        <div className="text-center mb-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-muted-foreground text-base font-bold">اختر مرحلتك الدراسية للبدء</p>
        </div>

        {/* Stage Cards */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => onSelect(stage.id)}
              className="group bg-card rounded-xl px-2 py-3 text-center border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-lg active:scale-[0.97] animate-scale-in cursor-pointer stage-card-3d"
              style={{ animationDelay: stage.delay }}
            >
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg gradient-emerald shadow-emerald mb-1.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <stage.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-base font-extrabold text-heading mb-0">{stage.title}</h2>
              <p className="text-muted-foreground text-xs font-medium">{stage.description}</p>
            </button>
          ))}
        </div>

        {/* Leaderboard Button */}
        <button onClick={onLeaderboard} className="w-full max-w-xl mt-6 py-4 rounded-2xl neu-btn text-foreground font-extrabold text-xl hover:shadow-gold transition-all active:scale-[0.98] flex items-center justify-center gap-3 animate-scale-in" style={{ animationDelay: "0.4s" }}>
          <Trophy className="w-6 h-6 text-gold" />
          🏆 لوحة المتصدرين
        </button>

        <section aria-label="حسابات المنصة الرسمية" className="w-full max-w-xl mt-10 mb-28 text-center">
          <h2 className="font-aref text-2xl font-bold text-heading mb-4">تابع حسابات المنصة الرسمية</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="https://x.com/tchjaber" target="_blank" rel="noopener noreferrer" aria-label="تابع منصة الطالب العبقري على إكس" className="social-follow-link group">
              <Twitter className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="text-lg font-extrabold">إكس</span>
              <ExternalLink className="w-4 h-4 opacity-70" aria-hidden="true" />
            </a>
            <a href="https://www.tiktok.com/@.al71393" target="_blank" rel="noopener noreferrer" aria-label="تابع منصة الطالب العبقري على تيك توك" className="social-follow-link group">
              <Music2 className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="text-lg font-extrabold">تيك توك</span>
              <ExternalLink className="w-4 h-4 opacity-70" aria-hidden="true" />
            </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default StageSelection;
