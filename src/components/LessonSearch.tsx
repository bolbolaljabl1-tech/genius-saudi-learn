import { Search, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface LessonSearchProps {
  subject: string;
  onSearch: (lessonTitle: string) => void;
  onBack: () => void;
}

const subjectNames: Record<string, string> = {
  arabic: "لغتي",
  math: "الرياضيات",
  science: "العلوم",
  social: "الدراسات الاجتماعية",
};

const LessonSearch = ({ subject, onSearch, onBack }: LessonSearchProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-emerald shadow-emerald mb-5 animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground mb-2">{subjectNames[subject] || subject}</h2>
          <p className="text-muted-foreground text-xl">ابحث عن الدرس الذي تريد مراجعته</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <div className="relative">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="أدخل عنوان الدرس (مثلاً: الفاعل)"
              className="w-full pr-14 pl-5 py-5 rounded-2xl border-2 border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xl font-bold"
              dir="rtl"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim()}
            className="w-full mt-4 py-5 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-2xl shadow-emerald transition-all duration-300 hover:shadow-emerald-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            🔍 ابحث عن الدرس
          </button>
        </form>
      </div>
    </div>
  );
};

export default LessonSearch;
