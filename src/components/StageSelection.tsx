import { GraduationCap, BookOpen, Camera, Trophy, Gamepad2, FlaskConical } from "lucide-react";
import PlatformHeader from "./PlatformHeader";
import appIcon from "@/assets/app-icon.png";
import heroBanner from "@/assets/hero-banner.png";

interface StageSelectionProps {
  onSelect: (stage: string) => void;
  onCamera: () => void;
  onLeaderboard: () => void;
  onGames: () => void;
  onQuizzes: () => void;
  xp: number;
  studentName: string;
}

const StageSelection = ({ onSelect, onCamera, onLeaderboard, onGames, onQuizzes, xp, studentName }: StageSelectionProps) => {
  const stages = [
    { id: "elementary", title: "المرحلة الابتدائية", description: "من الصف الأول إلى السادس", icon: BookOpen, delay: "0.1s" },
    { id: "middle", title: "المرحلة المتوسطة", description: "من الصف الأول إلى الثالث", icon: GraduationCap, delay: "0.3s" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center">
      <PlatformHeader />

      <div className="w-full px-4 flex flex-col items-center">
        {/* Top bar with XP */}
        <div className="w-full max-w-xl flex items-center justify-between mb-4 animate-slide-up">
          <button onClick={onLeaderboard} className="flex items-center gap-2 neu-btn px-5 py-3 hover:shadow-emerald transition-all active:scale-[0.98]">
            <Trophy className="w-5 h-5 text-gold" />
            <span className="text-foreground font-extrabold text-lg">{xp} XP</span>
          </button>
          {studentName && (
            <span className="text-muted-foreground text-lg font-bold">مرحباً {studentName} 👋</span>
          )}
          <img src={appIcon} alt="منصة الطالب العبقري" className="w-12 h-12 rounded-xl shadow-emerald" />
        </div>

        {/* Hero Banner */}
        <div className="w-full max-w-xl mb-6 animate-scale-in">
          <img src={heroBanner} alt="منصة الطالب العبقري" className="w-full rounded-2xl shadow-emerald-lg" />
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

        {/* Quizzes Button */}
        <button onClick={onQuizzes} className="w-full max-w-xl mb-6 py-5 rounded-2xl bg-royal-blue text-matte-gold font-extrabold text-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 animate-scale-in hover:opacity-90" style={{ animationDelay: "0.15s" }}>
          <FlaskConical className="w-7 h-7" />
          🧪 اختبارات العباقرة
        </button>

        {/* Stage Label */}
        <div className="text-center mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-muted-foreground text-xl font-bold">اختر مرحلتك الدراسية للبدء</p>
        </div>

        {/* Stage Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
          {stages.map((stage) => (
            <button key={stage.id} onClick={() => onSelect(stage.id)} className="group neu-card p-8 text-center transition-all duration-300 hover:shadow-emerald-lg hover:scale-[1.03] active:scale-[0.98] animate-scale-in cursor-pointer" style={{ animationDelay: stage.delay }}>
              <div className="inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-2xl gradient-emerald shadow-emerald mb-5 transition-transform duration-300 group-hover:scale-110">
                <stage.icon className="w-9 h-9 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-extrabold text-heading mb-2">{stage.title}</h2>
              <p className="text-muted-foreground text-base">{stage.description}</p>
            </button>
          ))}
        </div>

        {/* Leaderboard Button */}
        <button onClick={onLeaderboard} className="w-full max-w-xl mt-6 py-4 rounded-2xl neu-btn text-foreground font-extrabold text-xl hover:shadow-gold transition-all active:scale-[0.98] flex items-center justify-center gap-3 animate-scale-in" style={{ animationDelay: "0.4s" }}>
          <Trophy className="w-6 h-6 text-gold" />
          🏆 لوحة المتصدرين
        </button>
      </div>
    </div>
  );
};

export default StageSelection;
