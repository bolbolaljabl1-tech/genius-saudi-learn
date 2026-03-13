import { BookOpen, Globe, Calculator, FlaskConical, ArrowRight } from "lucide-react";

interface SubjectSelectionProps {
  stage: string;
  onSelect: (subject: string) => void;
  onBack: () => void;
}

const SubjectSelection = ({ stage, onSelect, onBack }: SubjectSelectionProps) => {
  const stageTitle = stage === "elementary" ? "المرحلة الابتدائية" : "المرحلة المتوسطة";

  const subjects = [
    { id: "arabic", title: "اللغة العربية", icon: BookOpen, color: "from-emerald-500 to-teal-600" },
    { id: "english", title: "اللغة الإنجليزية", icon: Globe, color: "from-sky-500 to-blue-600" },
    { id: "math", title: "الرياضيات", icon: Calculator, color: "from-amber-500 to-orange-600" },
    { id: "science", title: "العلوم", icon: FlaskConical, color: "from-violet-500 to-purple-600" },
  ];

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
      >
        <ArrowRight className="w-5 h-5" />
        <span className="font-medium">رجوع</span>
      </button>

      <div className="text-center mb-10 animate-slide-up">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{stageTitle}</h2>
        <p className="text-muted-foreground">اختر المادة التي تريد مراجعتها</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
        {subjects.map((subject, i) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className="group glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-emerald-lg hover:scale-[1.03] active:scale-[0.98] animate-scale-in cursor-pointer"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${subject.color} shadow-lg mb-4 transition-transform duration-300 group-hover:scale-110`}>
              <subject.icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground">{subject.title}</h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelection;
