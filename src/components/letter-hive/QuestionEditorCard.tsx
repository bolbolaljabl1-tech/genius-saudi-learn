import { CheckCircle2, ListChecks, MessageSquareText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ARABIC_LETTERS,
  type HiveMode,
  type HiveQuestion,
  type QuestionKind,
} from "@/lib/letter-hive";

interface QuestionEditorCardProps {
  question: HiveQuestion;
  index: number;
  mode: HiveMode;
  error: string | null;
  showError: boolean;
  onChange: (question: HiveQuestion) => void;
  onDelete: () => void;
}

const inputClass = "mt-1.5 min-h-12 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "block text-sm font-bold text-foreground";

const kindLabels: Record<QuestionKind, string> = {
  choice: "اختيار من متعدد",
  boolean: "صح وخطأ",
  open: "سؤال مفتوح",
};

export default function QuestionEditorCard({
  question,
  index,
  mode,
  error,
  showError,
  onChange,
  onDelete,
}: QuestionEditorCardProps) {
  const update = (patch: Partial<HiveQuestion>) => onChange({ ...question, ...patch });

  const changeKind = (kind: QuestionKind) => {
    if (kind === "boolean") {
      update({ kind, answer: "صح", distractors: [], letter: mode === "letters" ? "ص" : question.letter });
      return;
    }
    update({
      kind,
      answer: kind === "choice" && ["صح", "خطأ"].includes(question.answer) ? "" : question.answer,
      distractors: kind === "choice" ? ["", "", ""] : [],
    });
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5" aria-label={`السؤال ${index + 1}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-royal-blue font-extrabold text-matte-gold">
            {index + 1}
          </span>
          <div>
            <h3 className="font-extrabold text-heading">{kindLabels[question.kind]}</h3>
            <p className="text-xs text-muted-foreground">عدّل الحقول مباشرة</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 aria-hidden="true" />
          حذف السؤال
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          نوع السؤال
          <select className={inputClass} value={question.kind} onChange={(event) => changeKind(event.target.value as QuestionKind)}>
            <option value="choice">اختيار من متعدد</option>
            <option value="boolean">صح وخطأ</option>
            <option value="open">سؤال مفتوح</option>
          </select>
        </label>

        {mode === "letters" && (
          <label className={labelClass}>
            حرف الخلية المرتبط
            <select
              className={inputClass}
              value={question.letter}
              onChange={(event) => update({ letter: event.target.value })}
              disabled={question.kind === "boolean"}
              title={question.kind === "boolean" ? "يُضبط تلقائيًا: ص لصح وخ لخطأ" : undefined}
            >
              {ARABIC_LETTERS.map((letter) => <option key={letter} value={letter}>{letter}</option>)}
            </select>
          </label>
        )}
      </div>

      <label className={`${labelClass} mt-4`}>
        {question.kind === "boolean" ? "العبارة" : "السؤال"}
        <textarea
          className={`${inputClass} min-h-24 resize-y leading-relaxed`}
          value={question.prompt}
          onChange={(event) => update({ prompt: event.target.value })}
          placeholder={question.kind === "boolean" ? "مثال: الشمس نجم." : "اكتب السؤال هنا… يمكنك بدؤه برمز تعبيري 🐝"}
        />
      </label>

      {question.kind === "choice" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            <span className="flex items-center gap-2 text-success"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /> الإجابة الصحيحة</span>
            <input
              className={`${inputClass} border-success/60 bg-success/5 focus:border-success focus:ring-success/20`}
              value={question.answer}
              onChange={(event) => update({ answer: event.target.value })}
              placeholder="الإجابة الصحيحة"
            />
          </label>
          {question.distractors.map((option, optionIndex) => (
            <label className={labelClass} key={optionIndex}>
              الخيار الخاطئ {optionIndex + 1}
              <input
                className={inputClass}
                value={option}
                onChange={(event) => {
                  const distractors = [...question.distractors];
                  distractors[optionIndex] = event.target.value;
                  update({ distractors });
                }}
                placeholder={`خيار خاطئ ${optionIndex + 1}`}
              />
            </label>
          ))}
        </div>
      )}

      {question.kind === "boolean" && (
        <fieldset className="mt-4">
          <legend className={labelClass}>الإجابة الصحيحة</legend>
          <div className="mt-2 grid grid-cols-2 gap-3" dir="rtl">
            {["صح", "خطأ"].map((answer) => (
              <button
                type="button"
                key={answer}
                onClick={() => update({ answer, letter: answer === "صح" ? "ص" : "خ" })}
                className={`min-h-12 rounded-xl border-2 px-4 text-lg font-extrabold transition ${
                  question.answer === answer
                    ? "border-success bg-success/10 text-success"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
                aria-pressed={question.answer === answer}
              >
                {answer === "صح" ? "✓ صح" : "✕ خطأ"}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {question.kind === "open" && (
        <label className={`${labelClass} mt-4`}>
          <span className="flex items-center gap-2"><MessageSquareText className="h-5 w-5 text-primary" aria-hidden="true" /> الإجابة النموذجية القصيرة</span>
          <input
            className={inputClass}
            value={question.answer}
            onChange={(event) => update({ answer: event.target.value })}
            placeholder="تظهر للمعلم عند إظهار الإجابة"
          />
        </label>
      )}

      {showError && error && <p className="mt-3 rounded-lg bg-destructive/10 p-2.5 text-sm font-bold text-destructive" role="alert">{error}</p>}

      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
        <ListChecks className="h-4 w-4" aria-hidden="true" />
        {question.kind === "choice" ? "تُخلط الخيارات داخل اللعبة تلقائيًا" : question.kind === "open" ? "يحكم المعلم على الإجابة الشفهية" : "خياران واضحان للفريقين"}
      </div>
    </article>
  );
}
