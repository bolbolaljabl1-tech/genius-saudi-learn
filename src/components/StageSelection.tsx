import { GraduationCap, BookOpen, Camera, Trophy } from "lucide-react";
import appIcon from "@/assets/app-icon.png";
import heroBanner from "@/assets/hero-banner.png";

interface StageSelectionProps {
  onSelect: (stage: string) => void;
  onCamera: () => void;
  onLeaderboard: () => void;
  xp: number;
  studentName: string;
}

const StageSelection = ({ onSelect, onCamera, onLeaderboard, xp, studentName }: StageSelectionProps) => {
  const stages = [
    {
      id: "elementary",
      title: "المرحلة الابتدائية",
      description: "من الصف الأول إلى السادس",
      icon: BookOpen,
      delay: "0.1s",
    },
    {
      id: "middle",
      title: "المرحلة المتوسطة",
      description: "من الصف الأول إلى الثالث",
      icon: GraduationCap,
      delay: "0.3s",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      {/* Top bar with XP */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 animate-slide-up">
        <button onClick={onLeaderboard} className="flex items-center gap-2 glass-card rounded-full px-4 py-2 hover:shadow-emerald transition-all active:scale-[0.98]">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-foreground font-bold text-sm">{xp} XP</span>
        </button>
        {studentName && (
          <span className="text-muted-foreground text-sm font-medium">مرحباً {studentName}</span>
        )}
        <img src={appIcon} alt="منصة الطالب العبقري" className="w-10 h-10 rounded-xl" />
      </div>

      {/* Hero Banner */}
      <div className="w-full max-w-xl mb-6 animate-scale-in">
        <img src={heroBanner} alt="منصة الطالب العبقري" className="w-full rounded-2xl shadow-emerald" />
      </div>

      {/* Camera Solver Button */}
      <button
        onClick={onCamera}
        className="w-full max-w-xl mb-6 py-4 rounded-2xl bg-gradient-to-l from-primary to-accent text-primary-foreground font-bold text-lg shadow-emerald-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 animate-scale-in"
        style={{ animationDelay: "0.05s" }}
      >
        <Camera className="w-6 h-6" />
        📸 أصوّر سؤالك
      </button>

      {/* Stage Label */}
      <div className="text-center mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <p className="text-muted-foreground text-lg">اختر مرحلتك الدراسية للبدء</p>
      </div>

      {/* Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => onSelect(stage.id)}
            className="group glass-card rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-emerald-lg hover:scale-[1.03] active:scale-[0.98] animate-scale-in cursor-pointer"
            style={{ animationDelay: stage.delay }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-emerald shadow-emerald mb-5 transition-transform duration-300 group-hover:scale-110">
              <stage.icon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">{stage.title}</h2>
            <p className="text-muted-foreground text-sm">{stage.description}</p>
          </button>
        ))}
      </div>

      {/* Leaderboard Button */}
      <button
        onClick={onLeaderboard}
        className="w-full max-w-xl mt-6 py-3 rounded-xl border border-border text-foreground font-bold hover:bg-muted transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-scale-in"
        style={{ animationDelay: "0.4s" }}
      >
        <Trophy className="w-5 h-5 text-primary" />
        🏆 لوحة المتصدرين
      </button>
    </div>
  );
};

export default StageSelection;
