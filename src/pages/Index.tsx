import { useEffect, useState } from "react";
import { MessageCircleHeart, LifeBuoy, Settings } from "lucide-react";
import StageSelection from "@/components/StageSelection";
import SubjectSelection from "@/components/SubjectSelection";
import LessonSearch from "@/components/LessonSearch";
import LessonContent from "@/components/LessonContent";
import QuizModule from "@/components/QuizModule";
import CameraSolver from "@/components/CameraSolver";
import ShareButton from "@/components/ShareButton";
import Leaderboard from "@/components/Leaderboard";
import GamesHub from "@/components/GamesHub";
import GeniusGallery from "@/components/GeniusGallery";
import SelfTest from "@/components/SelfTest";
import StudentNameModal from "@/components/StudentNameModal";
import WhisperModal from "@/components/WhisperModal";
import SupportModal from "@/components/SupportModal";
import AppFooter from "@/components/AppFooter";
import TrialBanner from "@/components/TrialBanner";
import Checkout from "@/components/Checkout";
import SubscriptionSettings from "@/components/SubscriptionSettings";
import { useXP } from "@/hooks/useXP";
import { useTrial } from "@/hooks/useTrial";
import { useIdleNotify } from "@/hooks/useIdleNotify";
import { useOvertakeNotify } from "@/hooks/useOvertakeNotify";
import { checkSubscriptionStatus } from "@/lib/activation";
import { toast } from "@/components/ui/sonner";

type Screen = "stage" | "subject" | "search" | "lesson" | "quiz" | "camera" | "leaderboard" | "games" | "gallery" | "selftest" | "checkout";

const LOCKED_SCREENS: Screen[] = ["lesson", "quiz", "selftest", "camera", "games"];

const Index = () => {
  const [screen, setScreenRaw] = useState<Screen>("stage");
  const { daysLeft, expired, subscribed, subscribe } = useTrial();

  const setScreen = (next: Screen) => {
    if (expired && LOCKED_SCREENS.includes(next)) {
      setScreenRaw("checkout");
      return;
    }
    setScreenRaw(next);
  };
  const [stage, setStage] = useState("");
  const [subject, setSubject] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const { xp, studentName, badges, streak, addXP, awardBadge, saveStudentName } = useXP();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showWhisper, setShowWhisper] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showSubSettings, setShowSubSettings] = useState(false);
  useIdleNotify(4);
  useOvertakeNotify(studentName, 60);

  const handleStageSelect = (s: string) => { setStage(s); setScreen("subject"); };
  const handleSubjectSelect = (s: string) => { setSubject(s); setScreen("search"); };
  const handleLessonSearch = (title: string) => { setLessonTitle(title); setScreen("lesson"); };

  const handleQuizComplete = (score: number, total: number) => {
    if (score === total) { addXP(100); awardBadge("وسام العبقري"); }
    else { addXP(Math.round((score / total) * 50)); }
  };

  const openLeaderboard = () => {
    if (!studentName) { setShowNameModal(true); }
    else { setScreen("leaderboard"); }
  };

  const handleNameSave = (name: string) => {
    saveStudentName(name);
    setShowNameModal(false);
    setScreen("leaderboard");
  };

  return (
    <main className={`${subscribed ? "pt-16" : "pt-24"} pb-16`}>
      <TrialBanner
        daysLeft={daysLeft}
        expired={expired}
        subscribed={subscribed}
        onSubscribe={() => setScreenRaw("checkout")}
      />
      {showNameModal && <StudentNameModal onSave={handleNameSave} />}

      {screen === "checkout" && (
        <Checkout
          expired={expired}
          onBack={() => setScreenRaw("stage")}
          onPaymentSuccess={(selectedPlan) => {
            subscribe(selectedPlan);
            toast.success("تم تفعيل اشتراكك بنجاح، نتمنى لك رحلة تعليمية ممتعة");
            setScreenRaw("stage");
          }}
        />
      )}

      {screen === "stage" && (
        <StageSelection
          onSelect={handleStageSelect}
          onCamera={() => setScreen("camera")}
          onLeaderboard={openLeaderboard}
          onGames={() => setScreen("games")}
          onGallery={() => setScreen("gallery")}
          onSelfTest={() => setScreen("selftest")}
          xp={xp}
          studentName={studentName}
          streak={streak}
        />
      )}
      {screen === "subject" && <SubjectSelection stage={stage} onSelect={handleSubjectSelect} onBack={() => setScreen("stage")} />}
      {screen === "search" && <LessonSearch subject={subject} onSearch={handleLessonSearch} onBack={() => setScreen("subject")} />}
      {screen === "lesson" && <LessonContent lessonTitle={lessonTitle} subject={subject} stage={stage} onStartQuiz={() => setScreen("quiz")} onBack={() => setScreen("search")} onVideoXP={() => addXP(10)} />}
      {screen === "quiz" && <QuizModule lessonTitle={lessonTitle} subject={subject} stage={stage} onBack={() => setScreen("lesson")} onRestart={() => { setScreen("lesson"); setTimeout(() => setScreen("quiz"), 100); }} onQuizComplete={handleQuizComplete} />}
      {screen === "camera" && <CameraSolver onBack={() => setScreen("stage")} onXP={() => addXP(20)} />}
      {screen === "leaderboard" && <Leaderboard onBack={() => setScreen("stage")} currentName={studentName} currentXP={xp} />}
      {screen === "games" && <GamesHub onBack={() => setScreen("stage")} onXP={(amount) => addXP(amount)} onBadge={(badge) => awardBadge(badge)} studentName={studentName} />}
      {screen === "gallery" && <GeniusGallery onBack={() => setScreen("stage")} />}
      {screen === "selftest" && <SelfTest onBack={() => setScreen("stage")} onXP={(n) => addXP(n)} />}

      {showWhisper && <WhisperModal onClose={() => setShowWhisper(false)} />}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      {showSubSettings && (
        <SubscriptionSettings
          onClose={() => setShowSubSettings(false)}
          onUpgrade={() => {
            setShowSubSettings(false);
            setScreenRaw("checkout");
          }}
        />
      )}

      {/* Subscription settings button */}
      <button
        onClick={() => setShowSubSettings(true)}
        className="fixed top-14 right-3 z-50 bg-card border-2 border-matte-gold/30 text-matte-gold rounded-full p-2 shadow-md active:scale-95 transition"
        aria-label="إعدادات لوحة الاشتراك"
        title="إعدادات لوحة الاشتراك"
      >
        <Settings className="w-5 h-5" />
      </button>

      <ShareButton />

      {/* Top guide button — golden neon */}
      <button
        onClick={() => setShowSupport(true)}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-royal-blue text-matte-gold rounded-full px-4 py-2 flex items-center gap-2 text-sm font-extrabold animate-gold-neon"
        aria-label="دليل استكشاف المنصة"
      >
        <LifeBuoy className="w-5 h-5" />
        <span>🗺️ دليل استكشاف المنصة</span>
      </button>

      <button
        onClick={() => setShowWhisper(true)}
        className="fixed bottom-16 left-4 z-50 gradient-emerald text-primary-foreground rounded-full p-3 shadow-emerald-lg flex items-center gap-2 text-sm font-bold animate-pulse-glow"
      >
        <MessageCircleHeart className="w-5 h-5" />
        راسل إدارة المنصة
      </button>

      <AppFooter />
    </main>
  );
};

export default Index;
