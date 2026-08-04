import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles, Loader2, BookOpen, Rocket, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface LessonSearchProps {
  subject: string;
  stage?: string;
  onSearch: (lessonTitle: string) => void;
  onBack: () => void;
}

const subjectNames: Record<string, string> = {
  arabic: "لغتي",
  math: "الرياضيات",
  science: "العلوم",
  social: "الدراسات الاجتماعية",
  islamic: "الدراسات الإسلامية",
  digital: "المهارات الرقمية",
  art: "التربية الفنية",
  pe: "التربية البدنية",
  life: "المهارات الحياتية",
  english: "اللغة الإنجليزية",
  quran: "القرآن الكريم",
};

const STAGES = [
  { id: "elementary", label: "المرحلة الابتدائية" },
  { id: "middle", label: "المرحلة المتوسطة" },
];

const GRADES: Record<string, string[]> = {
  elementary: [
    "الصف الأول الابتدائي",
    "الصف الثاني الابتدائي",
    "الصف الثالث الابتدائي",
    "الصف الرابع الابتدائي",
    "الصف الخامس الابتدائي",
    "الصف السادس الابتدائي",
  ],
  middle: ["الصف الأول المتوسط", "الصف الثاني المتوسط", "الصف الثالث المتوسط"],
};

const SEMESTERS = ["الفصل الدراسي الأول", "الفصل الدراسي الثاني"];

const selectClass =
  "w-full py-5 px-4 rounded-2xl border-2 border-input bg-card text-foreground text-xl font-extrabold focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 appearance-none";

const LessonSearch = ({ subject, stage, onSearch, onBack }: LessonSearchProps) => {
  const [selStage, setSelStage] = useState(stage && GRADES[stage] ? stage : "");
  const [grade, setGrade] = useState("");
  const [selSubject, setSelSubject] = useState(subjectNames[subject] ? subject : "");
  const [semester, setSemester] = useState("");
  const [lesson, setLesson] = useState("");
  const [lessons, setLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBook, setShowBook] = useState(false);

  const subjectLabel = subjectNames[selSubject] ?? "";
  const ready = Boolean(selStage && grade && selSubject && semester);

  const bookUrl = useMemo(
    () =>
      `https://ien.edu.sa/#/search?q=${encodeURIComponent(
        `${subjectLabel} ${grade} ${semester}`.trim(),
      )}`,
    [subjectLabel, grade, semester],
  );

  useEffect(() => {
    setGrade("");
  }, [selStage]);

  useEffect(() => {
    setLesson("");
    setLessons([]);
    if (!ready) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase.functions.invoke("list-lessons", {
        body: {
          stage: STAGES.find((s) => s.id === selStage)?.label ?? "",
          grade,
          subject: subjectLabel,
          semester,
        },
      });
      if (cancelled) return;
      setLoading(false);
      if (error || data?.error) {
        toast.error(data?.error || "تعذر جلب الدروس، يرجى المحاولة مجدداً");
        return;
      }
      setLessons(Array.isArray(data?.lessons) ? data.lessons : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, selStage, grade, selSubject, semester, subjectLabel]);

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 pb-32">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start"
      >
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-emerald shadow-emerald mb-4 animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-extrabold text-heading mb-2">تحديد الدرس</h2>
          <p className="text-muted-foreground text-xl">اختر المرحلة ثم الصف والمادة والفصل الدراسي</p>
        </div>

        <div className="space-y-4 animate-scale-in" dir="rtl">
          <select value={selStage} onChange={(e) => setSelStage(e.target.value)} className={selectClass}>
            <option value="">اختر المرحلة</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            disabled={!selStage}
            className={selectClass}
          >
            <option value="">اختر الصف</option>
            {(GRADES[selStage] ?? []).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select value={selSubject} onChange={(e) => setSelSubject(e.target.value)} className={selectClass}>
            <option value="">اختر المادة</option>
            {Object.entries(subjectNames).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>

          <select value={semester} onChange={(e) => setSemester(e.target.value)} className={selectClass}>
            <option value="">اختر الفصل الدراسي</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="relative">
            <select
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              disabled={!ready || loading || lessons.length === 0}
              className={selectClass}
            >
              <option value="">
                {loading ? "جارٍ استخراج الدروس المقررة" : ready ? "اختر عنوان الدرس" : "أكمل الاختيارات أعلاه"}
              </option>
              {lessons.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            {loading && (
              <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 animate-spin text-primary" />
            )}
          </div>

          <button
            onClick={() => window.open(bookUrl, "_blank", "noopener,noreferrer")}
            disabled={!ready}
            className="w-full py-5 rounded-2xl neu-btn text-foreground font-extrabold text-xl flex items-center justify-center gap-3 active:scale-[0.98] transition disabled:opacity-50"
          >
            <BookOpen className="w-6 h-6 text-gold" />
            تصفح كتاب المادة
          </button>


          <button
            onClick={() => lesson && onSearch(lesson)}
            disabled={!lesson}
            className="w-full py-6 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-2xl shadow-emerald-lg flex items-center justify-center gap-3 active:scale-[0.98] transition disabled:opacity-50"
          >
            <Rocket className="w-7 h-7" />
            ابدأ التحدي
          </button>
        </div>
      </div>

      {showBook && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col">
          <div className="flex items-center justify-between p-3 bg-card">
            <span className="font-extrabold text-lg text-heading">كتاب {subjectLabel}</span>
            <div className="flex items-center gap-2">
              <a
                href={bookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full neu-btn"
                aria-label="فتح الكتاب في نافذة جديدة"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button onClick={() => setShowBook(false)} className="p-2 rounded-full neu-btn" aria-label="إغلاق">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <iframe src={bookUrl} title="عارض كتاب المادة" className="flex-1 w-full bg-white" />
        </div>
      )}
    </div>
  );
};

export default LessonSearch;
