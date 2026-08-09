import { useState } from "react";
import { ArrowRight, BookOpen, Calculator, FlaskConical, Languages, Blocks, Rocket, PenLine } from "lucide-react";
import SmartBoard from "./SmartBoard";

interface FoundationHubProps {
  onSelectSkill: (subject: string, skill: string) => void;
  onBack: () => void;
}

interface FoundationSubject {
  id: string;
  title: string;
  icon: typeof BookOpen;
  color: string;
  axes: string[];
}

/**
 * قسم التأسيس: محاور تراكمية كبرى لمواد الاختبارات الوطنية الأربع،
 * منفصل تماماً عن مسار الدروس الفصلية (مرحلة/صف/فصل/درس).
 */
const FOUNDATION_SUBJECTS: FoundationSubject[] = [
  {
    id: "arabic",
    title: "اللغة العربية (لغتي)",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
    axes: [
      "القواعد النحوية الأساسية",
      "الإملاء وعلامات الترقيم",
      "الفهم القرائي واستخلاص المعنى",
      "الثروة اللغوية والمعجم",
      "التعبير الكتابي وبناء الجملة",
    ],
  },
  {
    id: "math",
    title: "الرياضيات",
    icon: Calculator,
    color: "from-amber-500 to-orange-600",
    axes: [
      "الأعداد والعمليات الحسابية",
      "الكسور والأعداد العشرية والنسب",
      "القياس والوحدات",
      "الهندسة والأشكال",
      "الجبر وحل المسائل",
      "الإحصاء وتمثيل البيانات",
    ],
  },
  {
    id: "science",
    title: "العلوم",
    icon: FlaskConical,
    color: "from-violet-500 to-purple-600",
    axes: [
      "المفاهيم العلمية الأساسية",
      "علوم الحياة والكائنات الحية",
      "المادة وخصائصها وتحولاتها",
      "الطاقة والحركة والقوى",
      "علوم الأرض والفضاء",
      "مهارات الاستقصاء العلمي",
    ],
  },
  {
    id: "english",
    title: "اللغة الإنجليزية",
    icon: Languages,
    color: "from-blue-500 to-indigo-600",
    axes: [
      "القواعد الأساسية (Basic Grammar)",
      "الأزمنة والأفعال (Tenses and Verbs)",
      "المفردات الأساسية (Core Vocabulary)",
      "فهم المقروء (Reading Comprehension)",
      "بناء الجملة والكتابة (Sentence Building)",
    ],
  },
];

const FoundationHub = ({ onSelectSkill, onBack }: FoundationHubProps) => {
  const [openId, setOpenId] = useState<string>("");

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 pb-32">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start"
      >
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="text-center mb-6 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-gold shadow-gold mb-4">
          <Blocks className="w-10 h-10 text-gold-foreground" />
        </div>
        <h2 className="text-3xl font-extrabold text-heading mb-2">التأسيس</h2>
        <p className="text-muted-foreground text-lg font-bold leading-relaxed">
          المهارات الأساسية للمواد المستهدفة في الاختبارات الوطنية
        </p>
      </div>

      <div className="max-w-md mx-auto w-full space-y-4" dir="rtl">
        {FOUNDATION_SUBJECTS.map((s, i) => {
          const open = openId === s.id;
          return (
            <div
              key={s.id}
              className="neu-card p-4 animate-scale-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <button
                onClick={() => setOpenId(open ? "" : s.id)}
                className="w-full flex items-center gap-3 text-right active:scale-[0.99] transition"
                aria-expanded={open}
              >
                <span
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${s.color} shadow-lg shrink-0`}
                >
                  <s.icon className="w-7 h-7 text-primary-foreground" />
                </span>
                <span className="flex-1">
                  <span className="block text-xl font-extrabold text-heading">{s.title}</span>
                  <span className="block text-sm font-bold text-muted-foreground">
                    {s.axes.length} محاور تأسيسية كبرى
                  </span>
                </span>
              </button>

              {open && (
                <div className="mt-4 space-y-3">
                  {s.axes.map((axis) => (
                    <button
                      key={axis}
                      onClick={() => onSelectSkill(s.id, axis)}
                      className="w-full py-4 px-4 rounded-2xl neu-btn text-foreground font-extrabold text-lg text-right flex items-center justify-between gap-3 active:scale-[0.98] transition"
                    >
                      <span className="leading-snug">{axis}</span>
                      <Rocket className="w-5 h-5 text-gold shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FoundationHub;
