import { GraduationCap, BookOpen, Camera, Trophy, Gamepad2, ClipboardCheck, Blocks, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onGuide: () => void;
}

const StageSelection = ({ onSelect, onCamera, onLeaderboard, onGames, onSelfTest, onFoundation, onStudio, onDashboard, xp, studentName, onGuide }: StageSelectionProps) => {

  const stages = [
    { id: "elementary", title: "المرحلة الابتدائية", description: "من الصف الأول إلى السادس", icon: BookOpen, delay: "0.1s" },
    { id: "middle", title: "المرحلة المتوسطة", description: "من الصف الأول إلى الثالث", icon: GraduationCap, delay: "0.3s" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center pt-2">
      <div className="w-full px-4 flex flex-col items-center">
        <header dir="rtl" className="w-full max-w-3xl mb-5 border-b border-matte-gold/30 bg-royal-blue text-matte-gold">
          <div className="grid grid-cols-2 sm:grid-cols-[auto_auto_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-3 py-3 font-amiri text-base font-bold">
            <Button variant="ghost" onClick={onGuide} className="h-auto min-h-11 px-1 whitespace-normal text-base text-matte-gold hover:bg-matte-gold/10 hover:text-matte-gold">دليل استكشاف المنصة</Button>
            <span dir="ltr" className="text-center tabular-nums">{xp.toLocaleString("en-US")} XP</span>
            <Button variant="ghost" onClick={onDashboard} className="h-auto min-h-11 px-1 text-base text-matte-gold hover:bg-matte-gold/10 hover:text-matte-gold">إنجازاتي</Button>
            <span className="min-w-0 text-center break-words leading-relaxed">{studentName || "اسم الطالب"}</span>
          </div>
        </header>

        <div className="w-full max-w-3xl text-center mb-6 py-4 animate-scale-in" dir="rtl">
          <h1 className="font-ruqaa text-3xl sm:text-5xl font-bold text-heading leading-relaxed">منصة الطالب العبقري</h1>
          <p className="font-amiri text-xl sm:text-2xl font-bold text-royal-blue mt-2 leading-relaxed">منصة تفاعلية ذكية للطلاب السعوديين</p>
          <p className="font-amiri text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">صمم بكل فكر بواسطة الأستاذ جابر العبدلي - 2026</p>
        </div>

        {/* قسم التأسيس — مواد نافس الأربع */}
        <Button
          onClick={onFoundation}
          className="h-auto whitespace-normal [&_svg]:size-7 w-full max-w-xl mb-4 px-4 py-3 rounded-2xl neu-card hover:bg-card border-2 border-gold/50 text-right active:scale-[0.98] transition-all animate-scale-in hover:shadow-gold stage-card-3d"
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
        </Button>




        {/* Stage Label */}
        <div className="text-center mb-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-muted-foreground text-base font-bold">اختر مرحلتك الدراسية للبدء</p>
        </div>

        {/* Stage Cards */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
          {stages.map((stage) => (
            <Button
              key={stage.id}
              onClick={() => onSelect(stage.id)}
              className="h-auto whitespace-normal block group bg-card hover:bg-card rounded-xl px-2 py-3 text-center border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-lg active:scale-[0.97] animate-scale-in cursor-pointer stage-card-3d"
              style={{ animationDelay: stage.delay }}
            >
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg gradient-emerald shadow-emerald mb-1.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <stage.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-base font-extrabold text-heading mb-0">{stage.title}</h2>
              <p className="text-muted-foreground text-xs font-medium">{stage.description}</p>
            </Button>
          ))}
        </div>

        {/* Leaderboard Button */}
        <Button onClick={onLeaderboard} className="h-auto whitespace-normal w-full max-w-xl mt-6 mb-6 py-4 rounded-2xl neu-btn text-foreground font-extrabold text-xl hover:shadow-gold transition-all active:scale-[0.98] flex items-center justify-center gap-3 animate-scale-in" style={{ animationDelay: "0.4s" }}>
          <Trophy className="w-6 h-6 text-gold" />
          🏆 لوحة المتصدرين
        </Button>

        {/* Camera Solver Button */}
        <Button onClick={onCamera} className="h-auto whitespace-normal [&_svg]:size-7 adventure-interactive w-full max-w-xl mb-4 py-5 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-2xl shadow-emerald-lg flex items-center justify-center gap-3 animate-scale-in" style={{ animationDelay: "0.05s" }}>
          <Camera className="w-7 h-7" />
          📸 صور سؤالك
        </Button>

        {/* Games Button */}
        <Button onClick={onGames} className="h-auto whitespace-normal [&_svg]:size-7 adventure-interactive w-full max-w-xl mb-4 py-5 rounded-2xl gradient-gold text-gold-foreground font-extrabold text-2xl shadow-gold flex items-center justify-center gap-3 animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <Gamepad2 className="w-7 h-7 adventure-pulse" />
          🎮 ألعاب العباقرة
        </Button>

        {/* AI Quiz Studio */}
        <Button
          onClick={onStudio}
          className="h-auto whitespace-normal [&_svg]:size-7 w-full max-w-xl mb-4 py-5 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-2xl shadow-emerald-lg border-2 border-gold/60 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1 animate-scale-in animate-gold-neon"
          style={{ animationDelay: "0.12s" }}
          aria-label="صَمِّم لعبتك بنفسك"
        >
          <span className="flex items-center gap-3">
            <Sparkles className="w-7 h-7" />
            صَمِّم لعبتك بنفسك
          </span>
          <span className="text-sm font-bold opacity-90">استوديو التحديات التفاعلية بالذكاء الاصطناعي</span>
        </Button>


        {/* Self Test Button */}
        <Button onClick={onSelfTest} className="h-auto whitespace-normal [&_svg]:size-7 w-full max-w-xl mb-4 py-5 rounded-2xl bg-royal-blue text-matte-gold font-extrabold text-2xl shadow-emerald-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 animate-scale-in animate-gold-neon" style={{ animationDelay: "0.15s" }}>
          <ClipboardCheck className="w-7 h-7" />
          اختبر نفسك
        </Button>

        <section aria-label="حسابات المنصة الرسمية" className="w-full max-w-xl mt-10 mb-28 text-center">
          <h2 className="font-aref text-2xl font-bold text-heading mb-4">تابع حسابات المنصة الرسمية</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="https://x.com/tchjaber" target="_blank" rel="noopener noreferrer" aria-label="تابع منصة الطالب العبقري على إكس" className="social-follow-link group">
              <Twitter className="w-[23.8px] h-[23.8px] sm:w-[27.2px] sm:h-[27.2px] transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="text-lg font-extrabold">إكس</span>
              <ExternalLink className="w-4 h-4 opacity-70" aria-hidden="true" />
            </a>
            <a href="https://www.tiktok.com/@.al71393" target="_blank" rel="noopener noreferrer" aria-label="تابع منصة الطالب العبقري على تيك توك" className="social-follow-link group">
              <Music2 className="w-[23.8px] h-[23.8px] sm:w-[27.2px] sm:h-[27.2px] transition-transform group-hover:scale-110" aria-hidden="true" />
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
