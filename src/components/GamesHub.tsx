import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  Brain,
  CheckCircle2,
  Gamepad2,
  Loader2,
  RotateCcw,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import AchievementCard from "./AchievementCard";

interface GamesHubProps {
  onBack: () => void;
  onXP: (amount: number) => void;
  onBadge: (badge: string) => void;
  studentName: string;
  stars: number;
}

interface Pair { left: string; right: string }
interface Sequencing { instruction: string; items: string[] }
interface GamePack { title: string; matching: Pair[]; sequencing: Sequencing }
type Mode = "matching" | "sequence" | "memory";

const GRADES = [
  "الصف الأول الابتدائي", "الصف الثاني الابتدائي", "الصف الثالث الابتدائي",
  "الصف الرابع الابتدائي", "الصف الخامس الابتدائي", "الصف السادس الابتدائي",
  "الصف الأول المتوسط", "الصف الثاني المتوسط", "الصف الثالث المتوسط",
];

const MODES = [
  { id: "matching" as const, title: "توصيل المفاهيم", description: "اربط كل مفهوم بمعناه الدقيق", icon: Shuffle },
  { id: "sequence" as const, title: "مغامرة الترتيب", description: "رتّب الكلمات أو الخطوات بالترتيب الصحيح", icon: ArrowDownUp },
  { id: "memory" as const, title: "الذاكرة المعرفية", description: "اكشف البطاقات وابحث عن الأزواج المترابطة", icon: Brain },
];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

const GamesHub = ({ onBack, onXP, onBadge, studentName, stars }: GamesHubProps) => {
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<GamePack | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [result, setResult] = useState<{ label: string; earned: number } | null>(null);

  const generate = async () => {
    if (!grade || !topic.trim()) {
      toast.error("اختر الصف واكتب اسم الدرس أولاً");
      return;
    }
    setLoading(true);
    setPack(null);
    setMode(null);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-game", {
        body: { topic: topic.trim(), grade },
      });
      if (error) throw error;
      if (data?.error || !Array.isArray(data?.matching) || !data?.sequencing?.items?.length) {
        throw new Error(data?.error || "تعذر تجهيز المغامرات");
      }
      setPack(data as GamePack);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تجهيز المغامرات حالياً");
    } finally {
      setLoading(false);
    }
  };

  const finish = (label: string, earned: number) => {
    if (result) return;
    setResult({ label, earned });
    onXP(earned);
    if (earned >= 40) onBadge("وسام المغامر المعرفي");
  };

  const resetAdventure = () => {
    setMode(null);
    setResult(null);
  };

  if (result && pack && mode) {
    const modeTitle = MODES.find((item) => item.id === mode)?.title ?? "مغامرة تعليمية";
    return (
      <div className="min-h-screen px-4 py-6 pb-28">
        <AchievementCard
          studentName={studentName}
          activity={`${modeTitle}: ${pack.title || topic}`}
          scoreLabel={result.label}
          earnedStars={result.earned}
          totalStars={stars}
        />
        <div className="mx-auto mt-4 grid w-full max-w-md grid-cols-2 gap-3">
          <Button onClick={resetAdventure} className="adventure-button h-14 font-extrabold">
            <RotateCcw /> مغامرة أخرى
          </Button>
          <Button onClick={onBack} variant="outline" className="h-14 font-extrabold">الرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 pb-28">
      <Button onClick={mode ? () => setMode(null) : onBack} variant="ghost" className="mb-4 text-lg font-bold">
        <ArrowRight /> رجوع
      </Button>

      <header className="mx-auto mb-6 max-w-xl text-center motion-screen-in">
        <div className="adventure-icon mx-auto mb-4">
          <Gamepad2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-heading">ألعاب العباقرة</h1>
        <p className="mt-2 text-lg font-bold text-muted-foreground">مغامرات معرفية قصيرة مصممة للمس والتركيز</p>
      </header>

      {!pack && (
        <section className="neu-card motion-pop-in mx-auto max-w-xl space-y-4 p-5">
          <label className="block font-extrabold text-foreground" htmlFor="adventure-grade">الصف الدراسي</label>
          <select id="adventure-grade" value={grade} onChange={(event) => setGrade(event.target.value)} className="w-full rounded-lg border-2 border-input bg-background p-4 text-lg font-bold text-foreground">
            <option value="">اختر الصف</option>
            {GRADES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <label className="block font-extrabold text-foreground" htmlFor="adventure-topic">المادة أو اسم الدرس</label>
          <input id="adventure-topic" value={topic} onChange={(event) => setTopic(event.target.value.slice(0, 200))} placeholder="مثال: دورة الماء أو المبتدأ والخبر" className="w-full rounded-lg border-2 border-input bg-background p-4 text-lg font-bold text-foreground" />
          <Button onClick={generate} disabled={loading} className="adventure-button h-16 w-full text-xl font-extrabold">
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="adventure-pulse" />}
            {loading ? "جارٍ تجهيز المغامرات" : "ابدأ المغامرة"}
          </Button>
        </section>
      )}

      {pack && !mode && (
        <section className="motion-stagger mx-auto grid max-w-xl gap-4">
          {MODES.map((item) => (
            <Button key={item.id} onClick={() => setMode(item.id)} variant="outline" className="adventure-choice h-auto min-h-28 justify-start whitespace-normal p-5 text-right">
              <span className="adventure-mode-icon"><item.icon className="h-7 w-7" /></span>
              <span>
                <strong className="block text-xl text-heading">{item.title}</strong>
                <span className="mt-1 block text-sm font-bold text-muted-foreground">{item.description}</span>
              </span>
            </Button>
          ))}
        </section>
      )}

      {pack && mode === "matching" && <MatchingAdventure pairs={pack.matching} onDone={(moves) => finish(`${pack.matching.length} أزواج في ${moves} محاولات`, 40)} />}
      {pack && mode === "sequence" && <SequenceAdventure data={pack.sequencing} onDone={(mistakes) => finish(`اكتمل الترتيب مع ${mistakes} أخطاء`, 35)} />}
      {pack && mode === "memory" && <MemoryAdventure pairs={pack.matching.slice(0, 6)} onDone={(moves) => finish(`${pack.matching.slice(0, 6).length} أزواج في ${moves} محاولات`, 45)} />}
    </div>
  );
};

const MatchingAdventure = ({ pairs, onDone }: { pairs: Pair[]; onDone: (moves: number) => void }) => {
  const left = useMemo(() => shuffle(pairs), [pairs]);
  const right = useMemo(() => shuffle(pairs), [pairs]);
  const [selected, setSelected] = useState<string | null>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const chooseRight = (pair: Pair) => {
    if (!selected) return;
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    const match = pairs.find((item) => item.left === selected)?.right === pair.right;
    if (match) {
      const nextSolved = [...solved, selected];
      setSolved(nextSolved);
      if (nextSolved.length === pairs.length) window.setTimeout(() => onDone(nextMoves), 450);
    }
    setSelected(null);
  };

  return (
    <section className="neu-card motion-pop-in mx-auto max-w-xl p-4">
      <h2 className="mb-4 text-xl font-extrabold text-heading">اختر المفهوم ثم معناه</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">{left.map((pair) => <Button key={pair.left} onClick={() => setSelected(pair.left)} disabled={solved.includes(pair.left)} variant={selected === pair.left ? "default" : "outline"} className="h-auto min-h-16 w-full whitespace-normal p-3 font-bold">{solved.includes(pair.left) ? <CheckCircle2 /> : null}{pair.left}</Button>)}</div>
        <div className="space-y-3">{right.map((pair) => <Button key={pair.right} onClick={() => chooseRight(pair)} disabled={solved.includes(pair.left)} variant="outline" className="h-auto min-h-16 w-full whitespace-normal p-3 font-bold">{solved.includes(pair.left) ? <CheckCircle2 className="text-success" /> : null}{pair.right}</Button>)}</div>
      </div>
    </section>
  );
};

const SequenceAdventure = ({ data, onDone }: { data: Sequencing; onDone: (mistakes: number) => void }) => {
  const pool = useMemo(() => shuffle(data.items), [data.items]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const pick = (item: string) => {
    if (chosen.includes(item)) return;
    if (item !== data.items[chosen.length]) {
      setMistakes((value) => value + 1);
      return;
    }
    const next = [...chosen, item];
    setChosen(next);
    if (next.length === data.items.length) window.setTimeout(() => onDone(mistakes), 450);
  };
  return (
    <section className="neu-card motion-pop-in mx-auto max-w-xl p-5">
      <h2 className="text-xl font-extrabold text-heading">{data.instruction}</h2>
      <p className="mb-4 mt-1 text-sm font-bold text-muted-foreground">اضغط العناصر حسب ترتيبها الصحيح</p>
      <div className="space-y-3">{pool.map((item) => { const order = chosen.indexOf(item); return <Button key={item} onClick={() => pick(item)} disabled={order >= 0} variant={order >= 0 ? "default" : "outline"} className="h-auto min-h-16 w-full justify-between whitespace-normal p-4 text-right font-bold"><span>{item}</span>{order >= 0 && <span className="rounded-full bg-primary-foreground/20 px-2 py-1">{order + 1}</span>}</Button>; })}</div>
    </section>
  );
};

interface MemoryCard { id: string; pairId: string; text: string }
const MemoryAdventure = ({ pairs, onDone }: { pairs: Pair[]; onDone: (moves: number) => void }) => {
  const cards = useMemo<MemoryCard[]>(() => shuffle(pairs.flatMap((pair, index) => [
    { id: `${index}-a`, pairId: String(index), text: pair.left },
    { id: `${index}-b`, pairId: String(index), text: pair.right },
  ])), [pairs]);
  const [open, setOpen] = useState<string[]>([]);
  const [solved, setSolved] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const reveal = (card: MemoryCard) => {
    if (open.length === 2 || open.includes(card.id) || solved.includes(card.pairId)) return;
    const nextOpen = [...open, card.id];
    setOpen(nextOpen);
    if (nextOpen.length !== 2) return;
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    const first = cards.find((item) => item.id === nextOpen[0]);
    if (first?.pairId === card.pairId) {
      const nextSolved = [...solved, card.pairId];
      window.setTimeout(() => { setSolved(nextSolved); setOpen([]); if (nextSolved.length === pairs.length) onDone(nextMoves); }, 500);
    } else {
      window.setTimeout(() => setOpen([]), 700);
    }
  };

  return (
    <section className="motion-pop-in mx-auto max-w-xl">
      <h2 className="mb-4 text-center text-xl font-extrabold text-heading">اكشف البطاقات المتطابقة معرفياً</h2>
      <div className="grid grid-cols-3 gap-3">{cards.map((card) => { const visible = open.includes(card.id) || solved.includes(card.pairId); return <Button key={card.id} onClick={() => reveal(card)} variant={visible ? "default" : "outline"} className="memory-card h-auto min-h-24 whitespace-normal p-2 text-center font-extrabold">{visible ? card.text : <Brain className="h-7 w-7 adventure-pulse" />}</Button>; })}</div>
    </section>
  );
};

export default GamesHub;