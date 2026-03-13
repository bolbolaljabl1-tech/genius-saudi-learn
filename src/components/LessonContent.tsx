import { ArrowRight, Play, FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface LessonContentProps {
  lessonTitle: string;
  subject: string;
  onStartQuiz: () => void;
  onBack: () => void;
}

const subjectNames: Record<string, string> = {
  arabic: "اللغة العربية",
  english: "اللغة الإنجليزية",
  math: "الرياضيات",
  science: "العلوم",
};

const LessonContent = ({ lessonTitle, subject, onStartQuiz, onBack }: LessonContentProps) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    generateSummary();
  }, [lessonTitle, subject]);

  const generateSummary = async () => {
    setLoading(true);
    setError("");
    
    // Simulated summary since we don't have backend yet
    // This will be replaced with actual AI call when Cloud is enabled
    setTimeout(() => {
      setSummary(
        `📚 ملخص درس "${lessonTitle}" في مادة ${subjectNames[subject] || subject}:\n\n` +
        `يتناول هذا الدرس المفاهيم الأساسية المتعلقة بـ "${lessonTitle}". ` +
        `يُعد هذا الموضوع من المواضيع المهمة التي يحتاج الطالب إلى فهمها بشكل جيد.\n\n` +
        `🔑 النقاط الرئيسية:\n` +
        `• التعريف بمفهوم ${lessonTitle} وأهميته\n` +
        `• القواعد والأسس المتعلقة بالموضوع\n` +
        `• أمثلة تطبيقية توضيحية\n` +
        `• تمارين وأنشطة للتدريب\n\n` +
        `💡 نصيحة: راجع الدرس أكثر من مرة وحاول حل التمارين بنفسك قبل الاطلاع على الإجابات.\n\n` +
        `⚡ لتفعيل الملخصات الذكية بالذكاء الاصطناعي، يرجى تفعيل Lovable Cloud.`
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start"
      >
        <ArrowRight className="w-5 h-5" />
        <span className="font-medium">رجوع</span>
      </button>

      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center animate-slide-up">
          <h2 className="text-2xl font-bold text-foreground mb-1">{lessonTitle}</h2>
          <p className="text-muted-foreground text-sm">{subjectNames[subject]}</p>
        </div>

        {/* Video Section */}
        <div className="glass-card rounded-2xl overflow-hidden animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <div className="aspect-video bg-gradient-to-br from-foreground/5 to-foreground/10 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full gradient-emerald flex items-center justify-center shadow-emerald">
              <Play className="w-7 h-7 text-primary-foreground mr-[-2px]" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              فيديو شرح: {lessonTitle}
            </p>
            <p className="text-muted-foreground/60 text-xs">
              من منصة عين التعليمية / فاهم
            </p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="glass-card rounded-2xl p-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">شرح مختصر نصي</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="mr-3 text-muted-foreground">جاري إنشاء الملخص...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-destructive mb-3">{error}</p>
              <button
                onClick={generateSummary}
                className="text-primary font-medium hover:underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="text-foreground/85 leading-8 whitespace-pre-line text-base">
              {summary}
            </div>
          )}
        </div>

        {/* Quiz Button */}
        <button
          onClick={onStartQuiz}
          className="w-full py-4 rounded-2xl gradient-emerald text-primary-foreground font-bold text-lg shadow-emerald transition-all duration-300 hover:shadow-emerald-lg active:scale-[0.98] animate-scale-in"
          style={{ animationDelay: "0.3s" }}
        >
          🧠 بدء اختبار العباقرة
        </button>
      </div>
    </div>
  );
};

export default LessonContent;
