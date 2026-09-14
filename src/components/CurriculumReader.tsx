import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Headphones, Library, Loader2, RefreshCw, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTTS } from "@/hooks/useTTS";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CurriculumReaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: string;
  grade: string;
  subject: string;
  semester: string;
  initialLesson: string;
  lessons: string[];
}

const CurriculumReader = ({
  open,
  onOpenChange,
  stage,
  grade,
  subject,
  semester,
  initialLesson,
  lessons,
}: CurriculumReaderProps) => {
  const [selectedLesson, setSelectedLesson] = useState(initialLesson);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [loadNonce, setLoadNonce] = useState(0);
  const { speak, stop } = useTTS();

  const orderedLessons = useMemo(() => {
    if (!initialLesson || lessons.includes(initialLesson)) return lessons;
    return [initialLesson, ...lessons];
  }, [initialLesson, lessons]);

  useEffect(() => {
    if (open) setSelectedLesson(initialLesson || lessons[0] || "");
  }, [open, initialLesson, lessons]);

  useEffect(() => {
    if (!open || !selectedLesson) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setNotes("");
    stop();
    setSpeaking(false);

    void supabase.functions
      .invoke("generate-summary", {
        body: {
          lessonTitle: selectedLesson,
          subject,
          stage: `${stage} - ${grade} - ${semester}`,
        },
      })
      .then(({ data, error: requestError }) => {
        if (cancelled) return;
        if (requestError || data?.error) {
          setError(data?.error || requestError?.message || "تعذر تحميل ملاحظات الدرس");
          return;
        }
        setNotes(typeof data?.summary === "string" ? data.summary : "");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, selectedLesson, stage, grade, subject, semester, stop, loadNonce]);

  const toggleSpeech = async () => {
    if (speaking) {
      stop();
      setSpeaking(false);
      return;
    }
    if (!notes) return;
    setSpeaking(true);
    try {
      await speak(notes);
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="h-[92dvh] w-[calc(100%-1rem)] max-w-4xl overflow-hidden rounded-xl border-2 border-matte-gold/40 p-0 shadow-emerald-lg"
      >
        <DialogHeader className="shrink-0 bg-royal-blue px-5 pb-4 pt-5 text-right text-matte-gold">
          <div className="flex items-center gap-3 pl-8">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-matte-gold text-matte-gold-foreground shadow-gold">
              <Library className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-extrabold">قارئ كتاب {subject}</DialogTitle>
              <DialogDescription className="mt-1 truncate text-sm font-bold text-matte-gold/80">
                {grade} · {semester}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] md:grid-cols-[17rem_1fr] md:grid-rows-1">
          <aside className="border-b border-border bg-secondary/40 p-3 md:border-b-0 md:border-l">
            <p className="mb-2 flex items-center gap-2 text-sm font-extrabold text-heading">
              <BookOpen className="h-4 w-4 text-primary" /> فهرس الدروس
            </p>
            <div className="flex max-h-32 gap-2 overflow-x-auto pb-1 md:max-h-full md:flex-col md:overflow-y-auto md:pb-0">
              {orderedLessons.map((lesson, index) => {
                const active = lesson === selectedLesson;
                return (
                  <Button
                    key={`${lesson}-${index}`}
                    type="button"
                    variant={active ? "default" : "outline"}
                    onClick={() => setSelectedLesson(lesson)}
                    className="h-auto min-w-48 justify-start whitespace-normal rounded-lg px-3 py-2 text-right text-sm font-extrabold md:min-w-0"
                  >
                    {active ? <Check className="h-4 w-4" /> : <span className="w-4 text-center">{index + 1}</span>}
                    <span className="line-clamp-2">{lesson}</span>
                  </Button>
                );
              })}
            </div>
          </aside>

          <section className="min-h-0 overflow-y-auto bg-background px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-2xl">
              <div className="mb-5 border-b-2 border-matte-gold/30 pb-4">
                <p className="mb-1 text-sm font-bold text-primary">الدرس المحدد</p>
                <h2 className="text-2xl font-extrabold leading-tight text-heading">{selectedLesson}</h2>
              </div>

              {loading ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-lg font-extrabold text-foreground">جارٍ تجهيز صفحات المراجعة</p>
                </div>
              ) : error ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                  <p className="text-base font-bold text-destructive">{error}</p>
                  <Button type="button" onClick={() => setLoadNonce((value) => value + 1)}>
                    <RefreshCw className="h-4 w-4" /> إعادة المحاولة
                  </Button>
                </div>
              ) : (
                <article className="reader-paper rounded-lg border border-border bg-card p-5 sm:p-7">
                  <div className="whitespace-pre-line text-lg font-medium leading-9 text-body-blue">{notes}</div>
                </article>
              )}

              {!loading && !error && notes && (
                <Button
                  type="button"
                  onClick={toggleSpeech}
                  className="mt-5 h-12 w-full rounded-lg text-base font-extrabold shadow-emerald"
                >
                  {speaking ? <VolumeX className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
                  {speaking ? "إيقاف الاستماع" : "استمع إلى ملاحظات الدرس"}
                </Button>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CurriculumReader;