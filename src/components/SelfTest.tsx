import { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2, Timer, Send, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SelfTestProps {
  onBack: () => void;
  onXP?: (xp: number) => void;
}

type QType = "mcq" | "tf" | "calligraphy" | "matching" | "fill";
interface SQ {
  type: QType;
  question: string;
  options?: string[];
  correctIndex?: number;
  correctBool?: boolean;
  left?: string[];
  right?: string[];
  pairs?: number[]; // for matching: for each right[i] index of correct left
  blanks?: string[]; // for fill
  explanation: string;
  points?: number;
  usesPassage?: boolean;
}
interface TestData { reading_passage?: string; questions: SQ[] }

const GRADES = [
  "الأول الابتدائي","الثاني الابتدائي","الثالث الابتدائي","الرابع الابتدائي","الخامس الابتدائي","السادس الابتدائي",
  "الأول المتوسط","الثاني المتوسط","الثالث المتوسط",
];
const SUBJECTS = ["لغتي الخالدة","اللغة الإنجليزية","الرياضيات","العلوم","الدراسات الاجتماعية","الدراسات الإسلامية","المهارات الرقمية","المهارات الحياتية"];
const COUNTS = [5, 10, 15, 20];
const TYPES = [
  { id: "mixed", label: "متنوع (موصى به)" },
  { id: "mcq", label: "اختيار من متعدد" },
  { id: "tf", label: "صح أو خطأ" },
  { id: "reading", label: "فهم المقروء + متعدد" },
  { id: "matching", label: "التوصيل / المزاوجة" },
  { id: "fill", label: "أكمل الفراغ" },
];

const TEST_SECONDS = 30 * 60;

const SelfTest = ({ onBack, onXP }: SelfTestProps) => {
  const [phase, setPhase] = useState<"config" | "loading" | "test" | "result">("config");
  const [grade, setGrade] = useState(GRADES[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [count, setCount] = useState(10);
  const [qType, setQType] = useState("mixed");
  const [test, setTest] = useState<TestData | null>(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [seconds, setSeconds] = useState(TEST_SECONDS);
  const [result, setResult] = useState<{ score: number; max: number; feedback: string } | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "test") return;
    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { window.clearInterval(intervalRef.current!); submit(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startTest = async () => {
    setPhase("loading"); setError("");
    try {
      const types = qType === "mixed" ? ["mcq","tf"]
        : qType === "reading" ? ["mcq"]
        : qType === "matching" ? ["matching"]
        : qType === "fill" ? ["fill"]
        : [qType];
      const { data, error: fnErr } = await supabase.functions.invoke("generate-self-test", {
        body: { grade, subject, count, types },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.questions?.length) throw new Error("لم يتم إرجاع أسئلة، حاول مرة أخرى");
      setTest(data); setAnswers({}); setSeconds(TEST_SECONDS); setPhase("test");
    } catch (e: any) { setError(e.message || "تعذر إنشاء الاختبار، حاول مرة أخرى"); setPhase("config"); }
  };

  const submit = () => {
    if (!test) return;
    let score = 0; let max = 0;
    test.questions.forEach((q, i) => {
      const pts = q.points || (q.type === "calligraphy" ? 6 : q.type === "matching" ? (q.right?.length || 4) : q.type === "fill" ? (q.blanks?.length || 1) : 1);
      max += pts;
      const a = answers[i];
      if (q.type === "mcq" && typeof a === "number" && a === q.correctIndex) score += pts;
      else if (q.type === "tf" && typeof a === "boolean" && a === q.correctBool) score += pts;
      else if (q.type === "calligraphy" && typeof a === "string" && a.trim().length >= 5) score += pts;
      else if (q.type === "matching" && a && typeof a === "object" && Array.isArray(q.pairs)) {
        let ok = 0;
        q.pairs.forEach((p, idx) => { if (a[idx] === p) ok++; });
        score += Math.round((ok / q.pairs.length) * pts);
      }
      else if (q.type === "fill" && a && typeof a === "object" && Array.isArray(q.blanks)) {
        let ok = 0;
        q.blanks.forEach((b, idx) => {
          const v = String(a[idx] || "").trim();
          if (v && v.replace(/\s+/g, "") === b.replace(/\s+/g, "")) ok++;
        });
        score += Math.round((ok / q.blanks.length) * pts);
      }
    });
    const pct = Math.round((score / max) * 100);
    const feedback = pct >= 90 ? "أداء متميز يدل على فهم عميق وتحليل دقيق. واصل على هذا النهج."
      : pct >= 70 ? "نتيجة جيدة جداً. راجع الأسئلة التي أخطأت بها وستصل إلى الإتقان."
      : pct >= 50 ? "نتيجة مقبولة. ركّز على الاستيعاب لا الحفظ، وأعد قراءة الشرح بعد كل خطأ."
      : "تحتاج إلى مراجعة منظمة. ابدأ بقراءة الدرس بهدوء ثم أعد المحاولة بأسئلة أقل.";
    setResult({ score, max, feedback });
    onXP?.(Math.round((score / max) * 30));
    setPhase("result");
  };

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  if (phase === "config") {
    return (
      <div className="min-h-screen px-4 py-6">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground mb-6"><ArrowRight className="w-5 h-5" /><span className="font-bold text-lg">رجوع</span></button>
        <div className="max-w-lg mx-auto neu-card p-6 space-y-5">
          <h2 className="text-3xl font-extrabold text-heading text-center">اختبر نفسك</h2>
          <p className="text-muted-foreground text-center text-base">اختبار ذكي يقيس الفهم والتحليل وفق معايير هيئة تقويم التعليم</p>

          <label className="block">
            <span className="font-extrabold text-foreground text-lg">الصف الدراسي</span>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-2 w-full p-3 rounded-xl border-2 border-input bg-background text-foreground text-lg font-bold">
              {GRADES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="font-extrabold text-foreground text-lg">المادة</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-2 w-full p-3 rounded-xl border-2 border-input bg-background text-foreground text-lg font-bold">
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="font-extrabold text-foreground text-lg">عدد الأسئلة</span>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-2 w-full p-3 rounded-xl border-2 border-input bg-background text-foreground text-lg font-bold">
              {COUNTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="font-extrabold text-foreground text-lg">نوع الأسئلة</span>
            <select value={qType} onChange={(e) => setQType(e.target.value)} className="mt-2 w-full p-3 rounded-xl border-2 border-input bg-background text-foreground text-lg font-bold">
              {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>

          {error && <p className="text-destructive font-bold text-center">{error}</p>}

          <button onClick={startTest} className="w-full py-4 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-xl shadow-emerald active:scale-[0.98]">
            ابدأ الاختبار (30 دقيقة)
          </button>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Loader2 className="w-14 h-14 text-primary animate-spin mb-4" />
        <p className="text-foreground font-extrabold text-2xl">جاري إعداد اختبارك الذكي...</p>
      </div>
    );
  }

  if (phase === "test" && test) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur py-2 -mx-4 px-4 flex items-center justify-between mb-4 border-b">
          <button onClick={onBack} className="font-bold text-base text-muted-foreground">إنهاء</button>
          <div className="flex items-center gap-2 font-extrabold text-xl text-foreground"><Timer className="w-6 h-6 text-primary" />{fmt(seconds)}</div>
          <button onClick={submit} className="px-4 py-2 rounded-xl gradient-emerald text-primary-foreground font-extrabold flex items-center gap-1"><Send className="w-4 h-4" />إرسال</button>
        </div>

        <div className="max-w-2xl mx-auto space-y-5">
          {test.reading_passage && (
            <div className="neu-card p-5 bg-primary/5 border-2 border-primary/20">
              <h3 className="font-extrabold text-foreground text-xl mb-2">نص فهم المقروء</h3>
              <p className="text-body-blue text-lg leading-9 whitespace-pre-wrap">{test.reading_passage}</p>
            </div>
          )}

          {test.questions.map((q, i) => (
            <div key={i} className="neu-card p-5">
              <p className="font-extrabold text-foreground text-lg mb-3">{i + 1}. {q.question}</p>

              {q.type === "mcq" && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt, j) => (
                    <button key={j} onClick={() => setAnswers({ ...answers, [i]: j })}
                      className={`w-full text-right p-3 rounded-xl border-2 font-bold text-base ${answers[i] === j ? "border-primary bg-primary/10" : "border-input"}`}>
                      {["أ","ب","ج","د"][j]}) {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "tf" && (
                <div className="flex gap-3">
                  <button onClick={() => setAnswers({ ...answers, [i]: true })} className={`flex-1 p-3 rounded-xl border-2 font-extrabold text-lg ${answers[i] === true ? "border-success bg-success/10" : "border-input"}`}>صح</button>
                  <button onClick={() => setAnswers({ ...answers, [i]: false })} className={`flex-1 p-3 rounded-xl border-2 font-extrabold text-lg ${answers[i] === false ? "border-destructive bg-destructive/10" : "border-input"}`}>خطأ</button>
                </div>
              )}

              {q.type === "calligraphy" && (
                <div>
                  <p className="text-2xl font-ruqaa text-matte-gold bg-royal-blue p-4 rounded-xl mb-3 text-center">{q.question}</p>
                  <textarea
                    value={answers[i] || ""} onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                    rows={3} placeholder="أعد كتابة العبارة بخطك..."
                    className="w-full p-3 rounded-xl border-2 border-input bg-background text-foreground text-lg font-bold"
                  />
                </div>
              )}

              {q.type === "matching" && q.left && q.right && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center font-extrabold text-foreground text-base">
                    <div className="bg-primary/10 rounded-lg py-2">العمود (أ)</div>
                    <div className="bg-primary/10 rounded-lg py-2">العمود (ب)</div>
                  </div>
                  {q.right.map((r, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-2 gap-2 items-center">
                      <div className="p-3 rounded-xl border-2 border-input bg-background font-bold text-base">{r}</div>
                      <select
                        value={(answers[i] && answers[i][rIdx] !== undefined) ? answers[i][rIdx] : ""}
                        onChange={(e) => {
                          const cur = { ...(answers[i] || {}) };
                          cur[rIdx] = e.target.value === "" ? undefined : Number(e.target.value);
                          setAnswers({ ...answers, [i]: cur });
                        }}
                        className="p-3 rounded-xl border-2 border-input bg-background text-foreground font-bold"
                      >
                        <option value="">اختر المقابل...</option>
                        {q.left!.map((l, lIdx) => <option key={lIdx} value={lIdx}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {q.type === "fill" && Array.isArray(q.blanks) && (
                <div className="space-y-2">
                  <p className="text-body-blue text-lg leading-9 whitespace-pre-wrap">{q.question}</p>
                  {q.blanks.map((_, bIdx) => (
                    <input
                      key={bIdx}
                      type="text"
                      value={(answers[i] && answers[i][bIdx]) || ""}
                      onChange={(e) => {
                        const cur = { ...(answers[i] || {}) };
                        cur[bIdx] = e.target.value;
                        setAnswers({ ...answers, [i]: cur });
                      }}
                      placeholder={`الفراغ رقم ${bIdx + 1}`}
                      className="w-full p-3 rounded-xl border-2 border-input bg-background text-foreground text-lg font-bold"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          <button onClick={submit} className="w-full py-4 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-xl shadow-emerald active:scale-[0.98]">إرسال الإجابات</button>
        </div>
      </div>
    );
  }

  if (phase === "result" && result && test) {
    const pct = Math.round((result.score / result.max) * 100);
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="neu-card p-6 text-center">
            <h2 className="text-3xl font-extrabold text-heading mb-3">نتيجة الاختبار</h2>
            <p className="text-5xl font-extrabold text-primary mb-2">{result.score} / {result.max}</p>
            <p className="text-2xl font-extrabold text-gold mb-4">{pct}%</p>
            <p className="text-body-blue text-lg leading-8 font-bold">{result.feedback}</p>
          </div>

          <h3 className="font-extrabold text-foreground text-xl mt-6">التغذية الراجعة المفصلة</h3>
          {test.questions.map((q, i) => {
            const a = answers[i];
            const correct = q.type === "mcq" ? a === q.correctIndex : q.type === "tf" ? a === q.correctBool : (typeof a === "string" && a.trim().length >= 5);
            return (
              <div key={i} className={`neu-card p-4 border-2 ${correct ? "border-success/30" : "border-destructive/30"}`}>
                <div className="flex items-start gap-2 mb-2">
                  {correct ? <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-1" /> : <XCircle className="w-5 h-5 text-destructive shrink-0 mt-1" />}
                  <p className="font-extrabold text-foreground">{i + 1}. {q.question}</p>
                </div>
                {q.type === "mcq" && q.options && typeof q.correctIndex === "number" && (
                  <p className="text-sm text-muted-foreground">الإجابة الصحيحة: {["أ","ب","ج","د"][q.correctIndex]}) {q.options[q.correctIndex]}</p>
                )}
                {q.type === "tf" && (
                  <p className="text-sm text-muted-foreground">الإجابة الصحيحة: {q.correctBool ? "صح" : "خطأ"}</p>
                )}
                <p className="text-body-blue text-base mt-2 leading-7">{q.explanation}</p>
              </div>
            );
          })}

          <div className="flex gap-3">
            <button onClick={() => { setPhase("config"); setResult(null); setTest(null); }} className="flex-1 py-4 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-lg flex items-center justify-center gap-2"><RotateCcw className="w-5 h-5" />اختبار جديد</button>
            <button onClick={onBack} className="flex-1 py-4 rounded-2xl neu-btn text-foreground font-extrabold text-lg">العودة</button>
          </div>
          <p className="text-center font-ruqaa text-matte-gold text-base pt-4">منصة الطالب العبقري - 2026</p>
        </div>
      </div>
    );
  }

  return null;
};

export default SelfTest;
