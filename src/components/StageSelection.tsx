import { GraduationCap, BookOpen } from "lucide-react";

interface StageSelectionProps {
  onSelect: (stage: string) => void;
}

const StageSelection = ({ onSelect }: StageSelectionProps) => {
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-12 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-emerald shadow-emerald-lg mb-6 animate-float">
          <GraduationCap className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
          منصة الطالب العبقري
        </h1>
        <p className="text-muted-foreground text-lg">اختر مرحلتك الدراسية للبدء</p>
      </div>

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
    </div>
  );
};

export default StageSelection;
