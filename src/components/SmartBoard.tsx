import { useEffect, useRef, useState } from "react";
import { ArrowRight, Brush, Eraser, RotateCcw, Sparkles, PenLine } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SmartBoardProps {
  onBack: () => void;
  initialSubject?: string;
  initialSkill?: string;
}

const SUBJECTS: { id: string; label: string; skills: string[] }[] = [
  {
    id: "arabic",
    label: "اللغة العربية",
    skills: [
      "كتابة الحروف والكلمات بخط صحيح",
      "الإملاء وعلامات الترقيم",
      "إعراب الجملة الاسمية والفعلية",
      "تكوين جملة مفيدة",
    ],
  },
  {
    id: "english",
    label: "اللغة الإنجليزية",
    skills: [
      "Handwriting letters and words",
      "Spelling core vocabulary",
      "Basic grammar and tenses",
      "Sentence building",
    ],
  },
  {
    id: "math",
    label: "الرياضيات",
    skills: [
      "العمليات الحسابية الأربع",
      "الكسور والأعداد العشرية",
      "حل المسائل الجبرية",
      "رسم الأشكال الهندسية والقياس",
    ],
  },
  {
    id: "science",
    label: "العلوم",
    skills: [
      "رسم دورة حياة الكائن الحي",
      "تمثيل حالات المادة",
      "الدارة الكهربائية البسيطة",
      "تصنيف المفاهيم العلمية",
    ],
  },
];

const SmartBoard = ({ onBack, initialSubject, initialSkill }: SmartBoardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [subject, setSubject] = useState(
    SUBJECTS.some((s) => s.id === initialSubject) ? (initialSubject as string) : "arabic",
  );
  const current = SUBJECTS.find((s) => s.id === subject)!;
  const [skill, setSkill] = useState(initialSkill || current.skills[0]);
  const [task, setTask] = useState("");
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!current.skills.includes(skill)) setSkill(current.skills[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === "pen" ? "#123a6b" : "#ffffff";
    ctx.lineWidth = tool === "pen" ? 4 : 26;
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    void rect;
    setFeedback("");
  };

  const check = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);
    setFeedback("");
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const imageBase64 = dataUrl.split(",")[1];
      const { data, error } = await supabase.functions.invoke("smart-board", {
        body: { imageBase64, subject, skill, task },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      const text = (data as { feedback?: string })?.feedback ?? "";
      if (!text) throw new Error("تعذر تحليل المحاولة");
      setFeedback(text);
    } catch (err) {
      toast.error((err as Error).message || "تعذر التحقق، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 pb-32" dir="rtl">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 self-start"
      >
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-gold shadow-gold mb-3">
          <PenLine className="w-8 h-8 text-gold-foreground" />
        </div>
        <h2 className="text-2xl font-extrabold text-heading">السبورة التفاعلية الذكية</h2>
        <p className="text-muted-foreground font-bold leading-relaxed">
          اكتب أو ارسم بإصبعك أو بالقلم، ثم اطلب التحقق الذكي
        </p>
      </div>

      <div className="max-w-md mx-auto w-full space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubject(s.id)}
              className={`py-3 rounded-2xl font-extrabold text-base transition active:scale-[0.98] ${
                subject === s.id
                  ? "gradient-emerald text-primary-foreground shadow-emerald"
                  : "neu-btn text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="neu-card p-3 space-y-3">
          <label className="block text-sm font-extrabold text-heading">المهارة المستهدفة</label>
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full px-3 py-3 rounded-xl border-2 border-border bg-card font-bold text-base focus:outline-none focus:border-primary"
          >
            {current.skills.map((sk) => (
              <option key={sk} value={sk}>
                {sk}
              </option>
            ))}
          </select>
          <input
            value={task}
            onChange={(e) => setTask(e.target.value.slice(0, 300))}
            placeholder="اكتب المطلوب أو السؤال (اختياري)"
            className="w-full px-3 py-3 rounded-xl border-2 border-border bg-card font-bold text-base focus:outline-none focus:border-primary"
          />
        </div>

        <div className="neu-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setTool("pen")}
                className={`px-3 py-2 rounded-xl font-extrabold text-sm flex items-center gap-1 ${
                  tool === "pen" ? "gradient-emerald text-primary-foreground" : "neu-btn"
                }`}
              >
                <Brush className="w-4 h-4" /> قلم
              </button>
              <button
                onClick={() => setTool("eraser")}
                className={`px-3 py-2 rounded-xl font-extrabold text-sm flex items-center gap-1 ${
                  tool === "eraser" ? "gradient-emerald text-primary-foreground" : "neu-btn"
                }`}
              >
                <Eraser className="w-4 h-4" /> ممحاة
              </button>
            </div>
            <button
              onClick={clear}
              className="px-3 py-2 rounded-xl neu-btn font-extrabold text-sm flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" /> مسح الكل
            </button>
          </div>
          <canvas
            ref={canvasRef}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            onPointerCancel={end}
            className="w-full h-72 rounded-2xl border-2 border-matte-gold/60 bg-white touch-none"
          />
        </div>

        <button
          onClick={check}
          disabled={loading}
          className="w-full py-4 rounded-2xl gradient-gold text-gold-foreground font-extrabold text-lg flex items-center justify-center gap-2 shadow-gold active:scale-[0.98] transition disabled:opacity-60"
        >
          <Sparkles className="w-5 h-5" />
          {loading ? "جارٍ التحقق الذكي..." : "تحقق ذكي"}
        </button>

        {feedback && (
          <div className="neu-card p-4 animate-scale-in">
            <h3 className="text-lg font-extrabold text-heading mb-2">التغذية الراجعة</h3>
            <p className="text-body-blue text-base font-bold leading-8 whitespace-pre-wrap">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartBoard;
