import { ArrowRight, BookOpen, Camera, ClipboardCheck, Gamepad2, Sparkles, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivityKind, ActivityProgress } from "@/hooks/useXP";

interface StudentDashboardProps {
  onBack: () => void;
  studentName: string;
  stage: string;
  stars: number;
  progress: ActivityProgress;
}

const activities: { kind: ActivityKind; label: string; icon: typeof BookOpen }[] = [
  { kind: "quiz", label: "اختبارات الدروس", icon: BookOpen },
  { kind: "selftest", label: "اختبر نفسك", icon: ClipboardCheck },
  { kind: "game", label: "تحديات الألعاب", icon: Gamepad2 },
  { kind: "studio", label: "ألعاب صممتها", icon: Sparkles },
  { kind: "camera", label: "أسئلة مصوّرة", icon: Camera },
];

const StudentDashboard = ({ onBack, studentName, stage, stars, progress }: StudentDashboardProps) => {
  const total = activities.reduce((sum, item) => sum + progress[item.kind], 0);
  const stageLabel = stage === "elementary" ? "المرحلة الابتدائية" : stage === "middle" ? "المرحلة المتوسطة" : "لم تُحدّد بعد";

  return (
    <section dir="rtl" className="min-h-screen px-4 pt-3 pb-32">
      <div className="w-full max-w-xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2 text-lg font-extrabold text-foreground" aria-label="العودة للرئيسية">
          <ArrowRight aria-hidden="true" /> رجوع
        </Button>
        <div className="motion-stagger space-y-7">
          <header className="border-b border-border pb-6">
            <p className="text-sm font-bold text-muted-foreground mb-2">ملف الطالب</p>
            <h1 className="text-3xl font-extrabold text-heading break-words">لوحة إنجازاتي</h1>
            <p className="text-xl font-bold text-foreground mt-4 break-words">{studentName}</p>
            <p className="text-base font-bold text-muted-foreground mt-1">{stageLabel}</p>
          </header>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-7" aria-label={`رصيد النجوم ${stars}`}>
            <div>
              <p className="text-base font-bold text-muted-foreground">رصيد النجوم</p>
              <p className="text-5xl font-extrabold text-heading tabular-nums mt-1">{stars.toLocaleString("en-US")}</p>
            </div>
            <Star className="star-soft-pulse w-16 h-16 shrink-0 fill-gold text-gold" aria-hidden="true" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-heading">الأنشطة المكتملة</h2>
              <span className="text-lg font-extrabold text-primary tabular-nums" aria-label={`${total} أنشطة مكتملة`}>{total.toLocaleString("en-US")}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {activities.map(({ kind, label, icon: Icon }) => (
                <div key={kind} className="border border-border bg-card rounded-md p-4 min-h-28 flex flex-col justify-between motion-fade-in">
                  <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <span className="text-sm font-bold text-foreground leading-5">{label}</span>
                    <span className="text-xl font-extrabold text-heading tabular-nums">{progress[kind].toLocaleString("en-US")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-heading mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-gold" aria-hidden="true" /> آخر الإنجازات</h2>
            {progress.recent.length ? (
              <ul className="divide-y divide-border border-y border-border">
                {progress.recent.map((item, index) => (
                  <li key={`${item.at}-${index}`} className="py-3 flex justify-between gap-3 text-base font-bold">
                    <span className="text-foreground">{activities.find(activity => activity.kind === item.kind)?.label}</span>
                    <time className="text-muted-foreground shrink-0" dateTime={item.at}>{new Date(item.at).toLocaleDateString("ar-SA")}</time>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground font-bold">ستظهر إنجازاتك هنا بعد إكمال أول نشاط.</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentDashboard;