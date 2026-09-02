import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, Sparkles, Loader2, ListChecks, Shuffle, ArrowDownUp, Zap,
  Trophy, Timer, Flame, RotateCcw, CheckCircle2, XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface QuizStudioProps {
  onBack: () => void;
  onXP: (amount: number) => void;
  onBadge: (badge: string) => void;
  studentName: string;
  stage?: string;
}

interface MCQ { question: string; options: string[]; correctIndex: number; explanation: string }
interface Pair { left: string; right: string }
interface Sequencing { instruction: string; items: string[] }
interface SpeedItem { statement: string; isTrue: boolean }
interface GamePack { title: string; mcq: MCQ[]; matching: Pair[]; sequencing: Sequencing; speed: SpeedItem[] }

type Mode = "mcq" | "matching" | "sequencing" | "speed";

const MODES: { id: Mode; title: string; desc: string; icon: typeof ListChecks; theme: string }[] = [
  { id: "mcq", title: "الاختيار من متعدد", desc: "ثمانية أسئلة بأربعة خيارات", icon: ListChecks, theme: "gradient-emerald text-primary-foreground" },
  { id: "matching", title: "المطابقة", desc: "اربط المصطلح بمعناه الصحيح", icon: Shuffle, theme: "gradient-gold text-gold-foreground" },
  { id: "sequencing", title: "الترتيب والتسلسل", desc: "رتب العناصر بالتسلسل الصحيح", icon: ArrowDownUp, theme: "bg-royal-blue text-matte-gold" },
  { id: "speed", title: "تحدي السرعة", desc: "صواب أو خطأ خلال ثوانٍ", icon: Zap, theme: "gradient-emerald text-primary-foreground" },
];

// Fisher-Yates: prevents repetition and predictable ordering.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const praise = ["إجابة دقيقة، أحسنت", "ممتاز، استمر بهذا التركيز", "إتقان واضح", "أداء رائع"];
const encourage = ["راجع المعلومة ثم واصل", "لا بأس، التعلم يبدأ من المحاولة", "ركز أكثر في المحاولة القادمة"];

const QuizStudio = ({ onBack, onXP, onBadge, studentName, stage }: QuizStudioProps) => {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<GamePack | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);

  // Shared scoring state
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const [board, setBoard] = useState<{ student_name: string; xp: number }[]>([]);

  const fetchBoard = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("leaderboard").select("student_name, xp").order("xp", { ascending: false }).limit(5);
    setBoard(data || []);
  }, []);

  useEffect(() => { void fetchBoard(); }, [fetchBoard]);

  const showFlash = (ok: boolean) => {
    const list = ok ? praise : encourage;
    setFlash({ ok, text: list[Math.floor(Math.random() * list.length)] });
    window.setTimeout(() => setFlash(null), 900);
  };

  const registerAnswer = (ok: boolean, base: number) => {
    if (ok) {
      const nextCombo = combo + 1;
      const multiplier = nextCombo >= 5 ? 3 : nextCombo >= 3 ? 2 : 1;
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
      setScore((s) => s + base * multiplier);
    } else {
      setCombo(0);
    }
    showFlash(ok);
  };

  const resetRound = () => {
    setScore(0); setCombo(0); setBestCombo(0); setFinished(false); setFlash(null);
  };

  const generate = async () => {
    if (!topic.trim() && content.trim().length < 20) {
      toast.error("يرجى كتابة الموضوع أو لصق محتوى دراسي كافٍ");
      return;
    }
    setLoading(true);
    setPack(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-game", {
        body: { topic: topic.trim(), content: content.trim(), stage: stage || "" },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const p = data as GamePack;
      if (!p?.mcq?.length) throw new Error("تعذر توليد الأسئلة، حاول بصياغة أخرى");
      setPack(p);
      toast.success("تم توليد حزمة الألعاب، اختر نمط التحدي");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر توليد الألعاب حالياً");
    } finally {
      setLoading(false);
    }
  };

  const finishRound = async () => {
    setFinished(true);
    const earned = Math.max(5, Math.round(score / 2));
    onXP(earned);
    if (bestCombo >= 5) onBadge("وسام السلسلة الذهبية");
    if (studentName) {
      const { data: existing } = await (supabase as any)
        .from("leaderboard").select("id, xp").eq("student_name", studentName).maybeSingle();
      if (existing) {
        await (supabase as any).from("leaderboard")
          .update({ xp: (existing.xp || 0) + earned, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await (supabase as any).from("leaderboard").insert({ student_name: studentName, xp: earned });
      }
      void fetchBoard();
    }
  };

  const multiplier = combo >= 5 ? 3 : combo >= 3 ? 2 : 1;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 pb-28">
      <button
        onClick={() => (mode ? (setMode(null), resetRound()) : onBack())}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 self-start"
      >
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="text-center mb-6 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-gold shadow-gold mb-3 animate-pulse-glow">
          <Sparkles className="w-10 h-10 text-gold-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold text-heading mb-1">صَمِّم لعبتك بنفسك</h1>
        <p className="text-muted-foreground text-lg font-bold">استوديو التحديات التفاعلية بالذكاء الاصطناعي</p>
      </div>

      {/* Composer */}
      {!mode && (
        <div className="w-full max-w-xl mx-auto neu-card p-5 mb-5 animate-scale-in">
          <label className="block text-base font-extrabold text-heading mb-2" htmlFor="qs-topic">
            الموضوع أو اسم الدرس
          </label>
          <input
            id="qs-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value.slice(0, 200))}
            placeholder="مثال: الكسور العشرية، دورة الماء في الطبيعة"
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg font-bold outline-none focus:border-primary transition"
          />
          <label className="block text-base font-extrabold text-heading mt-4 mb-2" htmlFor="qs-grade">
            الصف الدراسي
          </label>
          <select
            id="qs-grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg font-bold outline-none focus:border-primary transition"
          >
            <option value="">اختر الصف الدراسي</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <button
            onClick={generate}
            disabled={loading}
            className="w-full mt-4 py-4 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-xl shadow-emerald-lg active:scale-[0.98] transition disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            {loading ? "جارٍ توليد الألعاب" : "توليد الألعاب الأربع"}
          </button>
        </div>
      )}

      {/* Mode picker */}
      {pack && !mode && (
        <div className="w-full max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => { resetRound(); setMode(m.id); }}
              className="neu-card p-5 text-right active:scale-[0.98] hover:shadow-gold transition-all animate-scale-in"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <span className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-lg ${m.theme}`}>
                <m.icon className="w-8 h-8" />
              </span>
              <h2 className="text-xl font-extrabold text-heading">{m.title}</h2>
              <p className="text-muted-foreground text-sm font-bold mt-1">{m.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Scoreboard */}
      {mode && !finished && (
        <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-2 mb-4 animate-slide-up">
          <span className="neu-btn px-4 py-2 font-extrabold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" /> {score}
          </span>
          <span className={`px-4 py-2 rounded-full font-extrabold text-lg flex items-center gap-2 transition-all ${combo >= 3 ? "gradient-gold text-gold-foreground shadow-gold animate-pulse-glow" : "neu-btn"}`}>
            <Flame className="w-5 h-5" /> سلسلة {combo} · ×{multiplier}
          </span>
        </div>
      )}

      {/* Feedback flash */}
      {flash && (
        <div className="fixed inset-x-0 top-24 z-[80] flex justify-center pointer-events-none animate-scale-in">
          <span className={`px-6 py-3 rounded-full font-extrabold text-lg shadow-lg flex items-center gap-2 ${flash.ok ? "gradient-emerald text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
            {flash.ok ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            {flash.text}
          </span>
        </div>
      )}

      {mode && !finished && pack && (
        <div className="w-full max-w-xl mx-auto">
          {mode === "mcq" && <McqGame items={pack.mcq} onAnswer={registerAnswer} onDone={finishRound} />}
          {mode === "speed" && <SpeedGame items={pack.speed} onAnswer={registerAnswer} onDone={finishRound} />}
          {mode === "matching" && <MatchingGame pairs={pack.matching} onAnswer={registerAnswer} onDone={finishRound} />}
          {mode === "sequencing" && <SequenceGame data={pack.sequencing} onAnswer={registerAnswer} onDone={finishRound} />}
        </div>
      )}

      {/* Results */}
      {finished && (
        <div className="w-full max-w-xl mx-auto neu-card p-6 text-center animate-scale-in mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-gold shadow-gold mb-3 animate-bounce">
            <Trophy className="w-10 h-10 text-gold-foreground" />
          </div>
          <h2 className="text-2xl font-extrabold text-heading mb-2">انتهى التحدي</h2>
          <p className="text-lg font-bold text-foreground">النقاط: {score} · أطول سلسلة: {bestCombo}</p>
          <p className="text-muted-foreground font-bold mt-1">تمت إضافة نقاط الخبرة إلى سجلك</p>
          <div className="flex gap-3 mt-5">
            <button onClick={() => { resetRound(); }} className="flex-1 py-3 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-lg active:scale-[0.98] transition flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" /> إعادة المحاولة
            </button>
            <button onClick={() => { setMode(null); resetRound(); }} className="flex-1 py-3 rounded-2xl neu-btn font-extrabold text-lg active:scale-[0.98] transition">
              اختيار نمط آخر
            </button>
          </div>
        </div>
      )}

      {/* Mini leaderboard */}
      <div className="w-full max-w-xl mx-auto neu-card p-5 animate-slide-up">
        <h3 className="text-xl font-extrabold text-heading mb-3 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-gold" /> أفضل خمسة عباقرة
        </h3>
        {board.length === 0 ? (
          <p className="text-muted-foreground font-bold">لا توجد نتائج بعد، كن أول المتصدرين</p>
        ) : (
          <ul className="space-y-2">
            {board.map((b, i) => (
              <li
                key={`${b.student_name}-${i}`}
                className={`flex items-center justify-between px-4 py-2 rounded-2xl font-extrabold ${b.student_name === studentName ? "gradient-gold text-gold-foreground shadow-gold" : "bg-muted text-foreground"}`}
              >
                <span>{i + 1}. {b.student_name}</span>
                <span>{b.xp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* ---------------- Countdown hook ---------------- */
function useCountdown(seconds: number, key: number, onExpire: () => void, active: boolean) {
  const [left, setLeft] = useState(seconds);
  const cb = useRef(onExpire);
  cb.current = onExpire;
  useEffect(() => {
    if (!active) return;
    setLeft(seconds);
    const id = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { window.clearInterval(id); cb.current(); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [key, seconds, active]);
  return left;
}

const TimerBar = ({ left, total }: { left: number; total: number }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-1 text-sm font-extrabold text-muted-foreground">
      <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {left} ثانية</span>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-linear ${left / total < 0.3 ? "bg-destructive" : "gradient-emerald"}`}
        style={{ width: `${(left / total) * 100}%` }}
      />
    </div>
  </div>
);

/* ---------------- MCQ ---------------- */
const McqGame = ({ items, onAnswer, onDone }: { items: MCQ[]; onAnswer: (ok: boolean, base: number) => void; onDone: () => void }) => {
  const list = useMemo(() => shuffle(items), [items]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = list[i];

  const next = useCallback(() => {
    if (i + 1 >= list.length) onDone();
    else { setI(i + 1); setPicked(null); }
  }, [i, list.length, onDone]);

  const expire = useCallback(() => {
    if (picked === null) { setPicked(-1); onAnswer(false, 0); window.setTimeout(next, 1200); }
  }, [picked, onAnswer, next]);

  const left = useCountdown(20, i, expire, picked === null);

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    onAnswer(idx === q.correctIndex, 10);
    window.setTimeout(next, 1400);
  };

  return (
    <div key={i} className="neu-card p-5 animate-scale-in">
      <TimerBar left={left} total={20} />
      <p className="text-sm font-extrabold text-muted-foreground mb-2">السؤال {i + 1} من {list.length}</p>
      <h2 className="text-xl font-extrabold text-heading mb-4 leading-relaxed">{q.question}</h2>
      <div className="space-y-3">
        {q.options.map((opt, idx) => {
          const isCorrect = idx === q.correctIndex;
          const state = picked === null ? "" : isCorrect ? "gradient-emerald text-primary-foreground shadow-emerald" : idx === picked ? "bg-destructive text-destructive-foreground" : "opacity-60";
          return (
            <button
              key={idx}
              onClick={() => choose(idx)}
              disabled={picked !== null}
              className={`w-full text-right px-4 py-4 rounded-2xl font-extrabold text-lg transition-all active:scale-[0.98] ${state || "neu-btn"}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && q.explanation && (
        <p className="mt-4 text-base font-bold text-muted-foreground leading-relaxed animate-slide-up">{q.explanation}</p>
      )}
    </div>
  );
};

/* ---------------- Speed ---------------- */
const SpeedGame = ({ items, onAnswer, onDone }: { items: SpeedItem[]; onAnswer: (ok: boolean, base: number) => void; onDone: () => void }) => {
  const list = useMemo(() => shuffle(items), [items]);
  const [i, setI] = useState(0);
  const [locked, setLocked] = useState(false);
  const q = list[i];

  const next = useCallback(() => {
    if (i + 1 >= list.length) onDone();
    else { setI(i + 1); setLocked(false); }
  }, [i, list.length, onDone]);

  const expire = useCallback(() => {
    if (!locked) { setLocked(true); onAnswer(false, 0); window.setTimeout(next, 900); }
  }, [locked, onAnswer, next]);

  const left = useCountdown(8, i, expire, !locked);

  const answer = (val: boolean) => {
    if (locked) return;
    setLocked(true);
    onAnswer(val === q.isTrue, 8);
    window.setTimeout(next, 900);
  };

  return (
    <div key={i} className="neu-card p-5 animate-scale-in">
      <TimerBar left={left} total={8} />
      <p className="text-sm font-extrabold text-muted-foreground mb-2">العبارة {i + 1} من {list.length}</p>
      <h2 className="text-2xl font-extrabold text-heading mb-6 leading-relaxed min-h-24">{q.statement}</h2>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => answer(true)} disabled={locked} className="py-6 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-2xl shadow-emerald-lg active:scale-[0.96] transition">
          صواب
        </button>
        <button onClick={() => answer(false)} disabled={locked} className="py-6 rounded-2xl bg-destructive text-destructive-foreground font-extrabold text-2xl shadow-lg active:scale-[0.96] transition">
          خطأ
        </button>
      </div>
    </div>
  );
};

/* ---------------- Matching ---------------- */
const MatchingGame = ({ pairs, onAnswer, onDone }: { pairs: Pair[]; onAnswer: (ok: boolean, base: number) => void; onDone: () => void }) => {
  const lefts = useMemo(() => shuffle(pairs), [pairs]);
  const rights = useMemo(() => shuffle(pairs), [pairs]);
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);

  useEffect(() => {
    if (solved.length && solved.length === pairs.length) {
      const t = window.setTimeout(onDone, 800);
      return () => window.clearTimeout(t);
    }
  }, [solved, pairs.length, onDone]);

  const pickRight = (r: Pair) => {
    if (!selLeft) return;
    const ok = pairs.some((p) => p.left === selLeft && p.right === r.right);
    onAnswer(ok, 12);
    if (ok) setSolved((s) => [...s, selLeft]);
    else { setWrong(r.right); window.setTimeout(() => setWrong(null), 600); }
    setSelLeft(null);
  };

  return (
    <div className="neu-card p-5 animate-scale-in">
      <p className="text-base font-extrabold text-heading mb-4">اختر المصطلح ثم اختر معناه الصحيح</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {lefts.map((p) => {
            const done = solved.includes(p.left);
            return (
              <button
                key={p.left}
                onClick={() => !done && setSelLeft(p.left)}
                disabled={done}
                className={`w-full px-3 py-4 rounded-2xl font-extrabold text-base transition-all active:scale-[0.97] ${done ? "gradient-emerald text-primary-foreground shadow-emerald" : selLeft === p.left ? "gradient-gold text-gold-foreground shadow-gold" : "neu-btn"}`}
              >
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {rights.map((p) => {
            const done = solved.includes(p.left);
            return (
              <button
                key={p.right}
                onClick={() => !done && pickRight(p)}
                disabled={done}
                className={`w-full px-3 py-4 rounded-2xl font-extrabold text-base transition-all active:scale-[0.97] ${done ? "gradient-emerald text-primary-foreground shadow-emerald" : wrong === p.right ? "bg-destructive text-destructive-foreground" : "neu-btn"}`}
              >
                {p.right}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Sequencing ---------------- */
const SequenceGame = ({ data, onAnswer, onDone }: { data: Sequencing; onAnswer: (ok: boolean, base: number) => void; onDone: () => void }) => {
  const pool = useMemo(() => shuffle(data.items), [data.items]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);

  useEffect(() => {
    if (chosen.length && chosen.length === data.items.length) {
      const t = window.setTimeout(onDone, 800);
      return () => window.clearTimeout(t);
    }
  }, [chosen, data.items.length, onDone]);

  const pick = (item: string) => {
    if (chosen.includes(item)) return;
    const expected = data.items[chosen.length];
    const ok = item === expected;
    onAnswer(ok, 12);
    if (ok) setChosen((c) => [...c, item]);
    else { setShake(item); window.setTimeout(() => setShake(null), 600); }
  };

  return (
    <div className="neu-card p-5 animate-scale-in">
      <p className="text-base font-extrabold text-heading mb-1">{data.instruction}</p>
      <p className="text-sm font-bold text-muted-foreground mb-4">اضغط العناصر بالتسلسل الصحيح</p>
      <div className="space-y-3">
        {pool.map((item) => {
          const order = chosen.indexOf(item);
          return (
            <button
              key={item}
              onClick={() => pick(item)}
              disabled={order >= 0}
              className={`w-full text-right px-4 py-4 rounded-2xl font-extrabold text-base transition-all active:scale-[0.97] flex items-center justify-between gap-3 ${order >= 0 ? "gradient-emerald text-primary-foreground shadow-emerald" : shake === item ? "bg-destructive text-destructive-foreground" : "neu-btn"}`}
            >
              <span>{item}</span>
              {order >= 0 && <span className="shrink-0 w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">{order + 1}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizStudio;
