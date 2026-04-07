import { ArrowRight } from "lucide-react";
import PlatformHeader from "./PlatformHeader";

interface GeniusQuizzesProps {
  onBack: () => void;
}

const GeniusQuizzes = ({ onBack }: GeniusQuizzesProps) => (
  <div className="min-h-screen flex flex-col">
    <PlatformHeader />
    <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-4 mb-3 self-start">
      <ArrowRight className="w-5 h-5" />
      <span className="font-bold text-lg">رجوع</span>
    </button>
    <div className="text-center mb-3 animate-slide-up px-4">
      <h2 className="text-2xl font-extrabold text-heading">🧪 اختبارات العباقرة</h2>
      <p className="text-muted-foreground text-base mt-1">اختبر معلوماتك في جميع المواد!</p>
    </div>
    <div className="flex-1 px-2 pb-16">
      <iframe
        src="https://eduquiz-9ymxzjrq.manus.space"
        className="w-full rounded-2xl border border-border shadow-lg"
        style={{ height: "80vh" }}
        allow="fullscreen"
        title="اختبارات العباقرة"
      />
    </div>
  </div>
);

export default GeniusQuizzes;
