import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardPaste,
  Download,
  Eye,
  FileCheck2,
  ListChecks,
  Palette,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuestionEditorCard from "@/components/letter-hive/QuestionEditorCard";
import { SITE_URL } from "@/lib/site";
import {
  buildLetterHiveHtml,
  createSampleQuestions,
  downloadHtmlFile,
  emptyQuestion,
  parseBatch,
  questionsToBulk,
  safeGameFilename,
  validateQuestion,
  type HiveMode,
  type HiveQuestion,
  type HiveTheme,
} from "@/lib/letter-hive";

const themes: Array<{ id: HiveTheme; title: string; description: string; card: string; icon: string }> = [
  { id: "boys", title: "طلاب", description: "أزرق وسماوي", card: "border-hive-boys bg-hive-boys-soft", icon: "bg-hive-boys" },
  { id: "girls", title: "طالبات", description: "وردي وبنفسجي", card: "border-hive-girls bg-hive-girls-soft", icon: "bg-hive-girls" },
  { id: "neutral", title: "عام / مرح", description: "بنفسجي وبرتقالي", card: "border-hive-neutral bg-hive-neutral-soft", icon: "bg-hive-neutral" },
];

const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 py-3 text-lg text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

function StepHeading({ id, number, title, description, icon: Icon }: { id: string; number: number; title: string; description: string; icon: typeof Palette }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-matte-gold text-xl font-black text-matte-gold-foreground shadow-gold">{number}</span>
      <div className="min-w-0 flex-1">
        <h2 id={id} className="flex items-center gap-2 text-xl font-black text-heading sm:text-2xl"><Icon className="h-6 w-6 text-primary" aria-hidden="true" />{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
      </div>
    </div>
  );
}

export default function LetterHive() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [theme, setTheme] = useState<HiveTheme>("neutral");
  const [mode, setMode] = useState<HiveMode>("curriculum");
  const [questions, setQuestions] = useState<HiveQuestion[]>([]);
  const [editorTab, setEditorTab] = useState<"form" | "bulk">("form");
  const [bulkText, setBulkText] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "صانع لعبة خلية الحروف التفاعلية | منصة الطالب العبقري";
    return () => { document.title = previousTitle; };
  }, []);

  const errors = useMemo(() => questions.map((question) => validateQuestion(question, mode)), [questions, mode]);
  const validCount = errors.filter((error) => !error).length;
  const batchRows = useMemo(() => parseBatch(bulkText, mode), [bulkText, mode]);
  const batchErrors = batchRows.filter((row) => row.error);
  const batchValid = batchRows.filter((row) => row.question).length;

  const changeMode = (nextMode: HiveMode) => {
    setMode(nextMode);
    setBulkText(questionsToBulk(questions, nextMode));
    setShowErrors(false);
  };

  const changeEditorTab = (tab: "form" | "bulk") => {
    if (tab === "bulk" && editorTab === "form") setBulkText(questionsToBulk(questions, mode));
    setEditorTab(tab);
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, emptyQuestion()]);
    setEditorTab("form");
  };

  const importSample = () => {
    const sample = createSampleQuestions();
    setQuestions(sample);
    setBulkText(questionsToBulk(sample, mode));
    setEditorTab("form");
    setShowErrors(false);
    toast.success("أُضيفت 28 سؤالًا ثقافيًا جاهزًا للتجربة");
  };

  const syncBulk = () => {
    if (batchErrors.length) {
      toast.error(`راجع ${batchErrors.length} ${batchErrors.length === 1 ? "سطرًا" : "أسطر"} قبل المزامنة`);
      return;
    }
    const parsed = batchRows.flatMap((row) => row.question ? [row.question] : []);
    if (!parsed.length) {
      toast.error("الصق سؤالًا واحدًا صالحًا على الأقل");
      return;
    }
    setQuestions(parsed);
    setEditorTab("form");
    setShowErrors(false);
    toast.success(`تمت مزامنة ${parsed.length} سؤالًا مع النموذج`);
  };

  const prepareGame = () => {
    setShowErrors(true);
    if (!title.trim()) {
      toast.error("اكتب عنوان الدرس أو اللعبة أولًا");
      return null;
    }
    if (!questions.length) {
      toast.error("أضف سؤالًا واحدًا على الأقل أولًا");
      setEditorTab("form");
      return null;
    }
    if (errors.some(Boolean)) {
      setEditorTab("form");
      toast.error("راجع الحقول المعلّمة في بطاقات الأسئلة");
      document.getElementById("questions-step")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return null;
    }
    return buildLetterHiveHtml(questions, theme, mode);
  };

  const openPreview = () => {
    const html = prepareGame();
    if (html) setPreviewHtml(html);
  };

  const downloadGame = async () => {
    const html = prepareGame();
    if (!html) return;
    try {
      await downloadHtmlFile(html, safeGameFilename(title));
      toast.success("تم تجهيز ملف اللعبة — يعمل دون إنترنت");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("تعذر تنزيل الملف، حاول مرة أخرى");
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-secondary/35 pb-24 font-tajawal">
      <header className="border-b-4 border-matte-gold bg-royal-blue text-royal-blue-foreground shadow-lg">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-matte-gold text-3xl shadow-gold" aria-hidden="true">🐝</span>
            <div>
              <h1 className="text-2xl font-black leading-tight text-matte-gold sm:text-3xl">صانع لعبة خلية الحروف التفاعلية 🐝</h1>
              <p className="mt-1 text-sm font-bold text-royal-blue-foreground/85">صمّم مسابقتك الصفية ونزّلها للعمل دون إنترنت</p>
            </div>
          </div>
          <Button asChild variant="outline" className="min-h-12 shrink-0 border-matte-gold/60 bg-transparent text-matte-gold hover:bg-matte-gold hover:text-matte-gold-foreground">
            <Link to="/" aria-label="العودة إلى الصفحة الرئيسية"><ArrowRight /> العودة إلى الرئيسية</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-3 py-6 sm:px-6 sm:py-8">
        <section className="rounded-3xl border border-matte-gold/30 bg-card p-4 shadow-sm sm:p-6" aria-labelledby="identity-heading">
          <StepHeading id="identity-heading" number={1} title="إعدادات الهوية والسمة" description="سمِّ لعبتك واختر ألوانها ونمط الأسئلة المناسب لدرسك." icon={Palette} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block font-bold text-foreground">
              عنوان الدرس أو اللعبة <span className="text-destructive">*</span>
              <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: مراجعة درس النباتات" maxLength={80} aria-invalid={showErrors && !title.trim()} />
              <span className="mt-1 block text-xs font-normal text-muted-foreground">يُستخدم تلقائيًا في اسم ملف التنزيل.</span>
              {showErrors && !title.trim() && <span className="mt-1 block text-xs font-bold text-destructive" role="alert">عنوان اللعبة مطلوب.</span>}
            </label>
            <label className="block font-bold text-foreground">
              اسم المادة <span className="font-normal text-muted-foreground">(اختياري)</span>
              <input className={inputClass} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="مثال: العلوم" maxLength={60} />
            </label>
          </div>

          <fieldset className="mt-6">
            <legend className="mb-3 font-extrabold text-foreground">الفئة والسمة اللونية</legend>
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
              {themes.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  aria-pressed={theme === item.id}
                  className={`flex min-h-20 items-center gap-3 rounded-2xl border-2 p-3 text-right transition active:scale-[0.98] ${theme === item.id ? item.card : "border-border bg-background hover:border-primary/40"}`}
                >
                  <span className={`h-10 w-10 shrink-0 rounded-full ${item.icon}`} aria-hidden="true" />
                  <span><span className="block font-extrabold text-heading">{item.title}</span><span className="text-sm text-muted-foreground">{item.description}</span></span>
                  {theme === item.id && <CheckCircle2 className="mr-auto h-5 w-5 shrink-0 text-success" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="mb-3 font-extrabold text-foreground">نمط الأسئلة</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => changeMode("curriculum")} aria-pressed={mode === "curriculum"} className={`min-h-24 rounded-2xl border-2 p-4 text-right transition ${mode === "curriculum" ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                <span className="block text-lg font-extrabold text-heading">📚 وضع المنهج (عادي)</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">الحروف للتوصيل فقط، دون ربط الإجابة بحرف الخلية.</span>
              </button>
              <button type="button" onClick={() => changeMode("letters")} aria-pressed={mode === "letters"} className={`min-h-24 rounded-2xl border-2 p-4 text-right transition ${mode === "letters" ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                <span className="block text-lg font-extrabold text-heading">🔥 تحدي الحروف</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">تبدأ إجابة كل سؤال بحرف خليته بعد حذف «ال».</span>
              </button>
            </div>
          </fieldset>
        </section>

        <section id="questions-step" className="scroll-mt-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6" aria-labelledby="questions-heading">
          <StepHeading id="questions-heading" number={2} title="محرر الأسئلة" description="أضف الأسئلة واحدًا واحدًا، أو الصق بنكًا كاملًا بالصيغة السريعة." icon={ListChecks} />

          <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-secondary/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 font-extrabold text-foreground" aria-live="polite">
              <FileCheck2 className="h-6 w-6 text-primary" aria-hidden="true" />
              <span>{questions.length} سؤالًا مضافًا</span>
              {questions.length > 0 && <span className="text-sm font-bold text-success">· {validCount} صالح</span>}
            </div>
            <Button type="button" variant="outline" onClick={importSample} className="min-h-11 border-gold/60 text-foreground hover:bg-gold-light">
              <Sparkles className="text-gold" /> استيراد 28 سؤالًا جاهزًا للتجربة
            </Button>
          </div>

          {questions.length > 0 && questions.length < 25 && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm font-bold text-foreground" role="status">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
              لديك أقل من 25 سؤالًا، وهو عدد خلايا اللوحة. يمكنك المتابعة، وتُستحسن إضافة المزيد لتنويع الجولات.
            </div>
          )}

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5" role="tablist" aria-label="طريقة إدخال الأسئلة">
            <button type="button" role="tab" aria-selected={editorTab === "form"} onClick={() => changeEditorTab("form")} className={`min-h-12 rounded-xl px-2 text-sm font-extrabold transition sm:text-base ${editorTab === "form" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>الإدخال الذكي</button>
            <button type="button" role="tab" aria-selected={editorTab === "bulk"} onClick={() => changeEditorTab("bulk")} className={`min-h-12 rounded-xl px-2 text-sm font-extrabold transition sm:text-base ${editorTab === "bulk" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>اللصق الجماعي السريع</button>
          </div>

          {editorTab === "form" ? (
            <div role="tabpanel">
              <Button type="button" onClick={addQuestion} className="mb-5 min-h-12 w-full text-base font-extrabold sm:w-auto sm:px-6">
                <Plus /> إضافة سؤال جديد
              </Button>
              {questions.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 px-4 py-10 text-center">
                  <span className="text-5xl" aria-hidden="true">🐝</span>
                  <h3 className="mt-3 text-xl font-extrabold text-heading">ابدأ بنك أسئلتك</h3>
                  <p className="mx-auto mt-2 max-w-md leading-relaxed text-muted-foreground">أضف سؤالًا جديدًا، أو استورد النموذج الثقافي الجاهز لتجربة الصانع فورًا.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <QuestionEditorCard
                      key={question.id}
                      question={question}
                      index={index}
                      mode={mode}
                      error={errors[index]}
                      showError={showErrors}
                      onChange={(updated) => setQuestions((current) => current.map((item) => item.id === updated.id ? updated : item))}
                      onDelete={() => setQuestions((current) => current.filter((item) => item.id !== question.id))}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div role="tabpanel">
              <label className="block font-extrabold text-foreground" htmlFor="bulk-questions"><ClipboardPaste className="mb-2 inline h-5 w-5 text-primary" /> الصق الأسئلة، سؤالًا في كل سطر</label>
              <textarea
                id="bulk-questions"
                dir="rtl"
                className="min-h-72 w-full resize-y rounded-2xl border border-input bg-background p-4 font-mono text-base leading-8 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
                placeholder={"اختيار من متعدد: السؤال | الإجابة الصحيحة | خيار خاطئ | خيار خاطئ | خيار خاطئ\nصح وخطأ: العبارة | صح | خطأ\nسؤال مفتوح: السؤال | الإجابة النموذجية"}
                spellCheck={false}
              />
              <div className={`mt-3 rounded-xl p-3 text-sm font-bold ${batchErrors.length ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`} aria-live="polite">
                {batchValid} سؤالًا صالحًا · {batchErrors.length} سطر يحتاج مراجعة
                {batchErrors.length > 0 && (
                  <ul className="mt-2 list-inside list-disc font-medium">
                    {batchErrors.slice(0, 8).map((row) => <li key={row.line}>السطر {row.line}: {row.error}</li>)}
                    {batchErrors.length > 8 && <li>وأسطر أخرى تحتاج مراجعة.</li>}
                  </ul>
                )}
              </div>
              <div className="mt-4 rounded-2xl bg-secondary/60 p-4 text-sm leading-7 text-foreground">
                <strong className="block text-heading">الصيغ المدعومة:</strong>
                <code className="block overflow-x-auto whitespace-nowrap rounded-lg bg-card p-2 font-tajawal">السؤال | الصحيحة | خاطئة | خاطئة | خاطئة</code>
                <code className="mt-2 block rounded-lg bg-card p-2 font-tajawal">العبارة | صح | خطأ</code>
                <code className="mt-2 block rounded-lg bg-card p-2 font-tajawal">السؤال | الإجابة النموذجية</code>
                {mode === "letters" && <p className="mt-2 font-bold text-primary">ابدأ كل سطر بوسم الحرف، مثل: {"{ب} ما مصدر ضوء النهار؟ | الشمس…"} مع مراعاة بداية الإجابة.</p>}
              </div>
              <Button type="button" onClick={syncBulk} className="mt-4 min-h-12 w-full text-base font-extrabold"><RefreshCw /> مزامنة مع النموذج</Button>
            </div>
          )}
        </section>

        <section className="rounded-3xl border-2 border-matte-gold/40 bg-card p-4 shadow-gold sm:p-6" aria-labelledby="generate-heading">
          <StepHeading id="generate-heading" number={3} title="المعاينة والتوليد والتنزيل" description="جرّب الخلايا والأجراس والأصوات، ثم نزّل نسخة HTML مستقلة تعمل دون إنترنت." icon={Download} />
          <div className="mb-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-secondary/70 p-3"><strong className="block text-xl text-royal-blue">{validCount}</strong><span className="text-xs font-bold text-muted-foreground">سؤال صالح</span></div>
            <div className="rounded-xl bg-secondary/70 p-3"><strong className="block text-xl text-royal-blue">5×5</strong><span className="text-xs font-bold text-muted-foreground">لوحة الخلية</span></div>
            <div className="rounded-xl bg-secondary/70 p-3"><strong className="block text-xl text-royal-blue">V1.2</strong><span className="text-xs font-bold text-muted-foreground">القالب المقفل</span></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={openPreview} disabled={!questions.length} className="min-h-14 border-primary/50 text-lg font-extrabold text-primary hover:bg-primary/10 hover:text-primary"><Eye className="h-6 w-6" /> معاينة حية للعبة</Button>
            <Button type="button" onClick={downloadGame} disabled={!questions.length} className="min-h-14 bg-royal-blue text-lg font-extrabold text-matte-gold shadow-lg hover:bg-royal-blue/90"><Download className="h-6 w-6" /> توليد وتنزيل ملف اللعبة HTML</Button>
          </div>
          <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">يُنشأ الملف داخل متصفحك بالكامل، ولا تُرسل أسئلتك إلى أي خادم.</p>
        </section>
      </div>

      <footer className="mx-auto max-w-5xl px-4 pt-2 text-center">
        <p className="font-amiri text-xl font-bold text-royal-blue">منصة الطالب العبقري - 2026 🎓</p>
        <a href={SITE_URL} className="mt-1 inline-block font-bold text-primary underline underline-offset-4">abqarai.com</a>
      </footer>

      <Dialog open={Boolean(previewHtml)} onOpenChange={(open) => { if (!open) setPreviewHtml(""); }}>
        <DialogContent dir="rtl" className="flex h-[94vh] w-[96vw] max-w-[96vw] flex-col gap-2 overflow-hidden rounded-2xl p-3 sm:p-4">
          <DialogHeader className="shrink-0 text-right">
            <DialogTitle className="pl-8 text-xl font-black text-heading">معاينة خلية الحروف 🐝</DialogTitle>
            <DialogDescription>هذه هي اللعبة الناتجة نفسها؛ جرّب فتح خلية والضغط على جرس أحد الفريقين.</DialogDescription>
          </DialogHeader>
          {previewHtml && (
            <iframe
              title="معاينة لعبة خلية الحروف"
              srcDoc={previewHtml}
              sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups allow-fullscreen"
              className="min-h-0 w-full flex-1 rounded-xl border border-border bg-background"
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
