import { BookOpen, Globe, Calculator, FlaskConical, ArrowRight, Search, BookOpenCheck, Monitor, Palette, Dumbbell, Heart, Languages, Landmark } from "lucide-react";
import { useState } from "react";

interface SubjectSelectionProps {
  stage: string;
  onSelect: (subject: string) => void;
  onBack: () => void;
}

const SubjectSelection = ({ stage, onSelect, onBack }: SubjectSelectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const stageTitle = stage === "elementary" ? "المرحلة الابتدائية" : "المرحلة المتوسطة";

  const subjects = [
    { id: "arabic", title: "لغتي", icon: BookOpen, color: "from-emerald-500 to-teal-600" },
    { id: "math", title: "الرياضيات", icon: Calculator, color: "from-amber-500 to-orange-600" },
    { id: "science", title: "العلوم", icon: FlaskConical, color: "from-violet-500 to-purple-600" },
    { id: "social", title: "الدراسات الاجتماعية", icon: Globe, color: "from-sky-500 to-blue-600" },
    { id: "islamic", title: "الدراسات الإسلامية", icon: BookOpenCheck, color: "from-teal-500 to-cyan-600" },
    { id: "digital", title: "المهارات الرقمية", icon: Monitor, color: "from-indigo-500 to-blue-600" },
    { id: "art", title: "التربية الفنية", icon: Palette, color: "from-pink-500 to-rose-600" },
    { id: "pe", title: "التربية البدنية", icon: Dumbbell, color: "from-green-500 to-lime-600" },
    { id: "life", title: "المهارات الحياتية", icon: Heart, color: "from-red-400 to-pink-500" },
    { id: "english", title: "اللغة الإنجليزية", icon: Languages, color: "from-blue-500 to-indigo-600" },
    { id: "quran", title: "القرآن الكريم", icon: Landmark, color: "from-yellow-600 to-amber-700" },
  ];

  const filteredSubjects = subjects.filter(s =>
    s.title.includes(searchQuery.trim())
  );

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="text-center mb-6 animate-slide-up">
        <h2 className="text-3xl font-extrabold text-heading mb-2">{stageTitle}</h2>
        <p className="text-muted-foreground text-xl">اختر المادة التي تريد مراجعتها</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto w-full mb-6 animate-scale-in">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن المادة..."
            className="w-full pr-13 pl-4 py-4 rounded-2xl border-2 border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xl font-bold"
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full overflow-y-auto pb-20">
        {filteredSubjects.map((subject, i) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className="group neu-card p-5 text-center transition-all duration-300 hover:shadow-emerald-lg hover:scale-[1.03] active:scale-[0.98] animate-scale-in cursor-pointer"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${subject.color} shadow-lg mb-3 transition-transform duration-300 group-hover:scale-110`}>
              <subject.icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-base font-extrabold text-heading leading-tight">{subject.title}</h3>
          </button>
        ))}
        {filteredSubjects.length === 0 && (
          <div className="col-span-2 text-center py-10 text-muted-foreground text-xl font-bold">
            لا توجد نتائج
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectSelection;
