import { useState, useEffect } from "react";
import { ArrowRight, Loader2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ConfettiCelebration from "./ConfettiCelebration";
import appIcon from "@/assets/app-icon.png";

interface QuizModuleProps {
  lessonTitle: string;
  subject: string;
  onBack: () => void;
  onRestart: () => void;
  onQuizComplete?: (score: number, total: number) => void;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const subjectNames: Record<string, string> = {
  arabic: "لغتي",
  math: "الرياضيات",
  science: "العلوم",
  social: "الدراسات الاجتماعية",
};

const QuizModule = ({ lessonTitle, subject, onBack, onRestart, onQuizComplete }: QuizModuleProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => { fetchQuestions(); }, [lessonTitle, subject]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-quiz", {
        body: { lessonTitle, subject: subjectNames[subject] || subject },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      const qs: Question[] = data.questions;
      const shuffled = qs.map((q) => {
        const indices = q.options.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return { ...q, options: indices.map((idx) => q.options[idx]), correctIndex: indices.indexOf(q.correctIndex) };
      });
      setQuestions(shuffled);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الأسئلة");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    if (idx === questions[currentQ].correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      const finalScore = selectedAnswer === questions[currentQ].correctIndex ? score : score;
      setFinished(true);
      onQuizComplete?.(finalScore, questions.length);
      if (finalScore === questions.length) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 4000);
      }
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
        <Loader2 className="w-14 h-14 text-primary animate-spin mb-4" />
        <p className="text-foreground font-extrabold text-2xl">جاري تحضير اختبار العباقرة...</p>
        <p className="text-muted-foreground text-lg mt-2">يتم إنشاء 10 أسئلة ذكية عن "{lessonTitle}"</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-destructive font-extrabold text-xl mb-4">{error}</p>
        <button onClick={fetchQuestions} className="text-primary font-bold text-lg hover:underline">إعادة المحاولة</button>
        <button onClick={onBack} className="text-muted-foreground font-bold text-lg hover:underline mt-3">العودة للدرس</button>
      </div>
    );
  }

  if (finished) {
    const motivation = getMotivation(score, questions.length);
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <ConfettiCelebration trigger={celebrate} />
        <div className="neu-card p-8 max-w-md w-full text-center animate-bounce-in">
          {score === questions.length && <img src={appIcon} alt="وسام العبقري" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-gold" />}
          <div className="text-6xl mb-4">{motivation.emoji}</div>
          <h2 className="text-3xl font-extrabold text-heading mb-2">نتيجة الاختبار</h2>
          <p className="text-muted-foreground text-lg mb-6">{lessonTitle}</p>

          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${pct * 2.64} 264`} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-foreground">{score}</span>
              <span className="text-sm text-muted-foreground">من {questions.length}</span>
            </div>
          </div>

          <p className="text-foreground font-extrabold text-xl mb-6">{motivation.text}</p>
          {score === questions.length && <p className="text-gold font-extrabold text-lg mb-4">🏅 +100 XP + وسام العبقري</p>}

          <div className="flex flex-col gap-3">
            <button onClick={onRestart} className="w-full py-4 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-xl shadow-emerald active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <RotateCcw className="w-6 h-6" />إعادة الاختبار
            </button>
            <button onClick={onBack} className="w-full py-4 rounded-2xl neu-btn text-foreground font-extrabold text-xl active:scale-[0.98]">العودة للدرس</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <ConfettiCelebration trigger={celebrate} />
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">إنهاء الاختبار</span>
      </button>

      <div className="max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2 text-base text-muted-foreground font-bold">
          <span>السؤال {currentQ + 1} من {questions.length}</span>
          <span>النتيجة: {score}/{currentQ + (answered ? 1 : 0)}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-muted mb-6 overflow-hidden">
          <div className="h-full rounded-full gradient-emerald transition-all duration-300" style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>

        <div className="neu-card p-6 mb-6 animate-slide-up">
          <h3 className="text-xl font-extrabold text-foreground leading-9">{q.question}</h3>
        </div>

        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let cls = "w-full neu-btn p-5 text-right transition-all duration-300 active:scale-[0.98] border-2";
            if (answered) {
              if (i === q.correctIndex) cls += " border-success bg-success/10";
              else if (i === selectedAnswer) cls += " border-destructive bg-destructive/10";
              else cls += " border-transparent opacity-40";
            } else {
              cls += " border-transparent hover:shadow-emerald";
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={answered} className={`${cls} animate-scale-in`} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center gap-3">
                  {answered && i === q.correctIndex && <CheckCircle2 className="w-6 h-6 text-success shrink-0" />}
                  {answered && i === selectedAnswer && i !== q.correctIndex && <XCircle className="w-6 h-6 text-destructive shrink-0" />}
                  <span className="text-foreground font-bold text-lg">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {answered && q.explanation && (
          <div className="mt-4 neu-card p-5 border-2 border-primary/20 bg-primary/5 animate-slide-up">
            <p className="text-foreground/80 text-base leading-8">
              <span className="font-extrabold text-primary">💡 التوضيح: </span>{q.explanation}
            </p>
          </div>
        )}

        {answered && (
          <button onClick={handleNext} className="w-full mt-6 py-4 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-xl shadow-emerald active:scale-[0.98] transition-all animate-slide-up">
            {currentQ + 1 >= questions.length ? "عرض النتيجة" : "السؤال التالي"}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizModule;
