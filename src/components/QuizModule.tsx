import { useState, useEffect } from "react";
import { ArrowRight, Loader2, CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";

interface QuizModuleProps {
  lessonTitle: string;
  subject: string;
  onBack: () => void;
  onRestart: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

const subjectNames: Record<string, string> = {
  arabic: "اللغة العربية",
  english: "اللغة الإنجليزية",
  math: "الرياضيات",
  science: "العلوم",
};

const generateMockQuestions = (lesson: string, subject: string): Question[] => {
  const subjectLabel = subjectNames[subject] || subject;
  return Array.from({ length: 10 }, (_, i) => ({
    question: `سؤال ${i + 1}: ما هو المفهوم الصحيح المتعلق بـ "${lesson}" في مادة ${subjectLabel}؟`,
    options: [
      `الإجابة الصحيحة لسؤال ${i + 1}`,
      `إجابة خاطئة أ`,
      `إجابة خاطئة ب`,
      `إجابة خاطئة ج`,
    ],
    correctIndex: 0,
  }));
};

const QuizModule = ({ lessonTitle, subject, onBack, onRestart }: QuizModuleProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // Simulated question generation
    setTimeout(() => {
      const qs = generateMockQuestions(lessonTitle, subject);
      // Shuffle options for each question
      const shuffled = qs.map((q) => {
        const indices = q.options.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const newCorrect = indices.indexOf(q.correctIndex);
        return {
          ...q,
          options: indices.map((idx) => q.options[idx]),
          correctIndex: newCorrect,
        };
      });
      setQuestions(shuffled);
      setLoading(false);
    }, 2000);
  }, [lessonTitle, subject]);

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    if (idx === questions[currentQ].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  const getMotivation = (s: number, total: number) => {
    const pct = (s / total) * 100;
    if (pct === 100) return { emoji: "🏆", text: "ممتاز! أنت عبقري حقيقي!" };
    if (pct >= 80) return { emoji: "🌟", text: "أحسنت! أداء رائع جداً!" };
    if (pct >= 60) return { emoji: "💪", text: "جيد! واصل المذاكرة والتحسن!" };
    if (pct >= 40) return { emoji: "📖", text: "لا بأس، راجع الدرس وحاول مرة أخرى!" };
    return { emoji: "🔄", text: "تحتاج مراجعة أكثر، لا تستسلم!" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-foreground font-bold text-lg">جاري تحضير اختبار العباقرة...</p>
        <p className="text-muted-foreground text-sm mt-2">يتم إنشاء 10 أسئلة عن "{lessonTitle}"</p>
      </div>
    );
  }

  if (finished) {
    const motivation = getMotivation(score, questions.length);
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-6xl mb-4">{motivation.emoji}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">نتيجة الاختبار</h2>
          <p className="text-muted-foreground mb-6">{lessonTitle}</p>

          {/* Score circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${pct * 2.64} 264`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{score}</span>
              <span className="text-xs text-muted-foreground">من {questions.length}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-muted mb-3 overflow-hidden">
            <div
              className="h-full rounded-full gradient-emerald transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mb-4">{pct}%</p>

          <p className="text-foreground font-bold text-lg mb-6">{motivation.text}</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onRestart}
              className="w-full py-3 rounded-xl gradient-emerald text-primary-foreground font-bold shadow-emerald active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              إعادة الاختبار
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-xl border border-border text-foreground font-bold hover:bg-muted transition-all active:scale-[0.98]"
            >
              العودة للدرس
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start"
      >
        <ArrowRight className="w-5 h-5" />
        <span className="font-medium">إنهاء الاختبار</span>
      </button>

      <div className="max-w-lg mx-auto w-full">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
          <span>السؤال {currentQ + 1} من {questions.length}</span>
          <span>النتيجة: {score}/{currentQ + (answered ? 1 : 0)}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted mb-8 overflow-hidden">
          <div
            className="h-full rounded-full gradient-emerald transition-all duration-300"
            style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="glass-card rounded-2xl p-6 mb-6 animate-slide-up">
          <h3 className="text-lg font-bold text-foreground leading-8">{q.question}</h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let optionClasses = "glass-card rounded-xl p-4 text-right transition-all duration-300 cursor-pointer active:scale-[0.98] border-2";
            if (answered) {
              if (i === q.correctIndex) {
                optionClasses += " border-success bg-success/10";
              } else if (i === selectedAnswer) {
                optionClasses += " border-destructive bg-destructive/10";
              } else {
                optionClasses += " border-transparent opacity-50";
              }
            } else {
              optionClasses += " border-transparent hover:border-primary/30 hover:shadow-emerald";
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={`w-full ${optionClasses} animate-scale-in`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  {answered && i === q.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  )}
                  {answered && i === selectedAnswer && i !== q.correctIndex && (
                    <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                  <span className="text-foreground font-medium">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Next button */}
        {answered && (
          <button
            onClick={handleNext}
            className="w-full mt-6 py-4 rounded-2xl gradient-emerald text-primary-foreground font-bold text-lg shadow-emerald active:scale-[0.98] transition-all animate-slide-up"
          >
            {currentQ + 1 >= questions.length ? "عرض النتيجة" : "السؤال التالي"}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizModule;
