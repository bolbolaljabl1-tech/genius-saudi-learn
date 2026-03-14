import { ArrowRight, Play, FileText, Loader2, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LessonContentProps {
  lessonTitle: string;
  subject: string;
  onStartQuiz: () => void;
  onBack: () => void;
  onVideoXP?: () => void;
}

const subjectNames: Record<string, string> = {
  arabic: "اللغة العربية",
  english: "اللغة الإنجليزية",
  math: "الرياضيات",
  science: "العلوم",
};

const LessonContent = ({ lessonTitle, subject, onStartQuiz, onBack, onVideoXP }: LessonContentProps) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ainSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(lessonTitle + " عين التعليمية")}`;
  const fahemSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(lessonTitle + " فاهم")}`;

  useEffect(() => { generateSummary(); }, [lessonTitle, subject]);

  const generateSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-summary", {
        body: { lessonTitle, subject: subjectNames[subject] || subject },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الملخص");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center animate-slide-up">
          <h2 className="text-3xl font-extrabold text-foreground mb-1">{lessonTitle}</h2>
          <p className="text-muted-foreground text-lg">{subjectNames[subject]}</p>
        </div>

        {/* Video Section */}
        <div className="neu-card overflow-hidden animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <div className="aspect-video bg-gradient-to-br from-foreground/5 to-foreground/10 flex flex-col items-center justify-center gap-4 p-6">
            <div className="w-18 h-18 rounded-full gradient-emerald flex items-center justify-center shadow-emerald w-[4.5rem] h-[4.5rem]">
              <Play className="w-8 h-8 text-primary-foreground mr-[-2px]" />
            </div>
            <p className="text-foreground font-extrabold text-xl text-center">ابحث عن فيديو شرح: {lessonTitle}</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <a href={ainSearchUrl} target="_blank" rel="noopener noreferrer" onClick={() => onVideoXP?.()} className="flex-1 py-4 px-4 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-lg text-center shadow-emerald active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <ExternalLink className="w-5 h-5" />عين التعليمية
              </a>
              <a href={fahemSearchUrl} target="_blank" rel="noopener noreferrer" onClick={() => onVideoXP?.()} className="flex-1 py-4 px-4 rounded-2xl border-2 border-primary text-primary font-extrabold text-lg text-center hover:bg-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <ExternalLink className="w-5 h-5" />فاهم
              </a>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="neu-card p-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground">شرح مختصر نصي</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <span className="mr-3 text-muted-foreground text-lg font-bold">جاري إنشاء الملخص...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-destructive text-lg font-bold mb-3">{error}</p>
              <button onClick={generateSummary} className="text-primary font-bold text-lg hover:underline">إعادة المحاولة</button>
            </div>
          ) : (
            <div className="text-foreground/85 leading-9 whitespace-pre-line text-lg">{summary}</div>
          )}
        </div>

        {/* Quiz Button */}
        <button onClick={onStartQuiz} className="w-full py-5 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-2xl shadow-emerald transition-all duration-300 hover:shadow-emerald-lg active:scale-[0.98] animate-scale-in" style={{ animationDelay: "0.3s" }}>
          🧠 بدء اختبار العباقرة
        </button>
      </div>
    </div>
  );
};

export default LessonContent;
