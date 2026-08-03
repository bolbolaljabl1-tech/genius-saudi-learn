import { useEffect, useRef, useState } from "react";
import { MessageCircleHeart, LifeBuoy, Settings, Map } from "lucide-react";
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
import { useTTS } from "@/hooks/useTTS";
import { useIdleNotify } from "@/hooks/useIdleNotify";
import { useOvertakeNotify } from "@/hooks/useOvertakeNotify";
import { checkSubscriptionStatus } from "@/lib/activation";
import { toast } from "@/components/ui/sonner";

type Screen = "stage" | "subject" | "search" | "lesson" | "quiz" | "camera" | "leaderboard" | "games" | "gallery" | "selftest" | "checkout" | "foundation";

const LOCKED_SCREENS: Screen[] = ["lesson", "quiz", "selftest", "camera", "games"];
// Distraction-free screens: hide the settings gear so it never sits near
// the back arrow or the "إنهاء" button on quizzes / self-tests / camera.
const HIDE_GEAR_SCREENS: Screen[] = ["quiz", "selftest", "camera", "checkout"];

const Index = () => {
  const [screen, setScreenRaw] = useState<Screen>("stage");
  const { daysLeft, expired, subscribed, subToken, applyServerStatus } = useTrial();

  // مكدّس التنقل الداخلي: يجعل زر رجوع الجوال يتنقل بين شاشات التطبيق
  // بدلاً من إغلاقه، ويستقر بأمان في الصفحة الرئيسية.
  const historyRef = useRef<Screen[]>([]);
  const backRef = useRef(false);

  const setScreen = (next: Screen) => {
    if (expired && LOCKED_SCREENS.includes(next)) {
      setScreenRaw("checkout");
      return;
    }
    setScreenRaw(next);
  };

  useEffect(() => {
    // حارس ثابت في سجل المتصفح حتى لا يخرج المستخدم من التطبيق.
    window.history.pushState({ appGuard: true }, "");
    const onPop = () => {
      window.history.pushState({ appGuard: true }, "");
      backRef.current = true;
      const prev = historyRef.current.pop();
      setScreenRaw(prev ?? "stage");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (backRef.current) {
      backRef.current = false;
      return;
    }
    const stack = historyRef.current;
    if (stack[stack.length - 1] !== screen) {
      const prev = stack[stack.length - 1];
      if (prev !== screen) stack.push(screen);
    }
  }, [screen]);

  const [stage, setStage] = useState("");
  const [subject, setSubject] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const { xp, studentName, badges, streak, addXP, awardBadge, saveStudentName } = useXP();
  const { speak } = useTTS();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showWhisper, setShowWhisper] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showSubSettings, setShowSubSettings] = useState(false);
  useIdleNotify(4);
  useOvertakeNotify(studentName, 60);

  // Server-verify entitlement. The token is unguessable and issued only to the
  // paying student's browser at request time, so copying another student's
  // public display name is not enough to unlock the app.
  useEffect(() => {
    if (!studentName || !subToken) return;
    let cancelled = false;
    let wasActive = false;
    const tick = async () => {
      const res = await checkSubscriptionStatus(studentName, subToken);
      if (cancelled) return;
      applyServerStatus(res.status, res.plan);
      if (res.status === "active" && !wasActive) {
        wasActive = true;
        toast.success("تم تفعيل اشتراكك من قِبَل الإدارة، نتمنى لك رحلة تعليمية ممتعة");
      }
    };
    void tick();
    const id = window.setInterval(tick, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [studentName, subToken, applyServerStatus]);


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
          onPaymentSuccess={() => {
            // Actual entitlement flip only happens after the server confirms
            // activation for this student's private token (see polling above).
            toast.success("تم إرسال طلبك، سيتم تفعيل الحساب بعد مراجعة الإدارة");
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
      {screen === "search" && <LessonSearch subject={subject} stage={stage} onSearch={handleLessonSearch} onBack={() => setScreen("subject")} />}
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

      {/* Subscription settings gear — pinned to the top-left, opposite the
          RTL back arrow (top-right) and hidden entirely on distraction-free
          screens (quizzes / self-test / camera / checkout). */}
      {!HIDE_GEAR_SCREENS.includes(screen) && (
        <button
          onClick={() => setShowSubSettings(true)}
          className="fixed top-14 left-3 z-50 bg-card border-2 border-matte-gold/30 text-matte-gold rounded-full p-2 shadow-md active:scale-95 transition"
          aria-label="إعدادات لوحة الاشتراك"
          title="إعدادات لوحة الاشتراك"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      <ShareButton />

      {/* Compact top guide banner — single-line, emoji-free, voice-guided. */}
      <button
        onClick={() => {
          speak("أهلاً بك في منصة الطالب العبقري. اختر مرحلتك الدراسية، ثم المادة والدرس الذي تريده. استخدم صور سؤالك لحل التمارين بالكاميرا، وتحدى أصدقاءك في ألعاب العباقرة، وتابع تقدمك عبر نقاط الخبرة والأوسمة. نتمنى لك رحلة تعليمية ممتعة.");
          setShowSupport(true);
        }}
        className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] h-8 px-3 inline-flex items-center gap-1.5 rounded-full bg-royal-blue text-matte-gold border border-matte-gold/30 shadow-sm text-xs font-extrabold active:scale-95 transition"
        aria-label="دليل استكشاف المنصة"
        title="دليل استكشاف المنصة"
      >
        <Map className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">دليل استكشاف المنصة</span>
      </button>

      <button
        onClick={() => setShowWhisper(true)}
        className="fixed bottom-16 left-4 z-50 gradient-emerald text-primary-foreground rounded-full p-3 shadow-emerald-lg flex items-center gap-2 text-sm font-bold animate-pulse-glow"
      >
        <MessageCircleHeart className="w-5 h-5" />
        راسل إدارة المنصة
      </button>

      {screen !== "checkout" && <AppFooter />}
    </main>
  );
};

export default Index;
