import { useEffect, useRef, useState } from "react";
import { MessageCircleHeart, Settings, Map } from "lucide-react";
import StageSelection from "@/components/StageSelection";
import StudentDashboard from "@/components/StudentDashboard";
import FoundationHub from "@/components/FoundationHub";
import SubjectSelection from "@/components/SubjectSelection";
import LessonSearch from "@/components/LessonSearch";
import LessonContent from "@/components/LessonContent";
import QuizModule from "@/components/QuizModule";
import CameraSolver from "@/components/CameraSolver";
import ShareButton from "@/components/ShareButton";
import Leaderboard from "@/components/Leaderboard";
import GamesHub from "@/components/GamesHub";
import QuizStudio from "@/components/QuizStudio";
import SelfTest from "@/components/SelfTest";
import StudentNameModal from "@/components/StudentNameModal";
import WhisperModal from "@/components/WhisperModal";
import SupportModal from "@/components/SupportModal";
import AppFooter from "@/components/AppFooter";
import TrialBanner from "@/components/TrialBanner";
import SplashIntro from "@/components/SplashIntro";
import Checkout from "@/components/Checkout";
import SubscriptionSettings from "@/components/SubscriptionSettings";
import { useXP } from "@/hooks/useXP";
import { useTrial } from "@/hooks/useTrial";
import { useTTS } from "@/hooks/useTTS";
import { useIdleNotify } from "@/hooks/useIdleNotify";
import { useOvertakeNotify } from "@/hooks/useOvertakeNotify";
import { checkSubscriptionStatus } from "@/lib/activation";
import { toast } from "@/components/ui/sonner";

type Screen = "stage" | "dashboard" | "subject" | "search" | "lesson" | "quiz" | "camera" | "leaderboard" | "games" | "selftest" | "checkout" | "foundation" | "studio";

const LOCKED_SCREENS: Screen[] = ["lesson", "quiz", "selftest", "camera", "games", "studio"];

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

  const prevScreenRef = useRef<Screen>("stage");
  useEffect(() => {
    if (backRef.current) {
      backRef.current = false;
    } else if (prevScreenRef.current !== screen) {
      historyRef.current.push(prevScreenRef.current);
    }
    prevScreenRef.current = screen;
  }, [screen]);

  // حفظ الظهور فور الدخول الأول حتى لا تعاد المقدمة بعد تحديث الصفحة.
  const [showSplash, setShowSplash] = useState(() => {
    try {
      if (window.localStorage.getItem("abqari_splash_seen") === "1") return false;
      window.localStorage.setItem("abqari_splash_seen", "1");
    } catch {
      // تبقى المقدمة قابلة للإغلاق إذا عطّل المتصفح التخزين.
    }
    return true;
  });

  const [stage, setStage] = useState(() => localStorage.getItem("genius_selected_stage") || "");
  const [subject, setSubject] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [fromFoundation, setFromFoundation] = useState(false);
  const { xp, studentName, streak, progress, addXP, awardBadge, saveStudentName, recordCompletion } = useXP();
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


  const handleStageSelect = (s: string) => { setStage(s); localStorage.setItem("genius_selected_stage", s); setScreen("subject"); };
  const handleSubjectSelect = (s: string) => { setSubject(s); setScreen("search"); };
  const handleLessonSearch = (title: string) => { setLessonTitle(title); setFromFoundation(false); setScreen("lesson"); };

  const handleQuizComplete = (score: number, total: number) => {
    recordCompletion("quiz");
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
      {showSplash && (
        <SplashIntro
          playKey={0}
          duration={2800}
          onDone={() => setShowSplash(false)}
        />
      )}

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
        <div key="stage" className="motion-screen-in">
        <StageSelection
          onSelect={handleStageSelect}
          onCamera={() => setScreen("camera")}
          onLeaderboard={openLeaderboard}
          onGames={() => setScreen("games")}
          onSelfTest={() => setScreen("selftest")}
          onFoundation={() => setScreen("foundation")}
          onStudio={() => setScreen("studio")}
          onDashboard={() => setScreen("dashboard")}

          xp={xp}
          studentName={studentName}
          streak={streak}
        />
        </div>
      )}
      {screen === "dashboard" && <div key="dashboard" className="motion-screen-in"><StudentDashboard onBack={() => setScreen("stage")} studentName={studentName} stage={stage} stars={xp} progress={progress} /></div>}
      {screen === "foundation" && (
        <FoundationHub
          onSelectSkill={(subj, skill) => {
            setSubject(subj);
            setLessonTitle(skill);
            setFromFoundation(true);
            setScreen("lesson");
          }}
          onBack={() => setScreen("stage")}
        />
      )}
      {screen === "subject" && <div className="motion-screen-in"><SubjectSelection stage={stage} onSelect={handleSubjectSelect} onBack={() => setScreen("stage")} /></div>}
      {screen === "search" && <div className="motion-screen-in"><LessonSearch subject={subject} stage={stage} onSearch={handleLessonSearch} onBack={() => setScreen("subject")} /></div>}
      {screen === "lesson" && <div className="motion-screen-in"><LessonContent lessonTitle={lessonTitle} subject={subject} stage={stage} onStartQuiz={() => setScreen("quiz")} onBack={() => setScreen(fromFoundation ? "foundation" : "search")} onVideoXP={() => addXP(10)} /></div>}
      {screen === "quiz" && <div className="motion-screen-in"><QuizModule lessonTitle={lessonTitle} subject={subject} stage={stage} onBack={() => setScreen("lesson")} onRestart={() => { setScreen("lesson"); setTimeout(() => setScreen("quiz"), 100); }} onQuizComplete={handleQuizComplete} /></div>}
      {screen === "camera" && <div className="motion-screen-in"><CameraSolver onBack={() => setScreen("stage")} onXP={() => { addXP(20); recordCompletion("camera"); }} /></div>}
      {screen === "leaderboard" && <Leaderboard onBack={() => setScreen("stage")} currentName={studentName} currentXP={xp} />}
      {screen === "games" && <div className="motion-screen-in"><GamesHub onBack={() => setScreen("stage")} onXP={(amount) => { addXP(amount); recordCompletion("game"); }} onBadge={(badge) => awardBadge(badge)} studentName={studentName} /></div>}
      {screen === "studio" && <div className="motion-screen-in"><QuizStudio onBack={() => setScreen("stage")} onXP={(n) => { addXP(n); recordCompletion("studio"); }} onBadge={(b) => awardBadge(b)} studentName={studentName} stage={stage} /></div>}
      {screen === "selftest" && <div className="motion-screen-in"><SelfTest onBack={() => setScreen("stage")} onXP={(n) => { addXP(n); recordCompletion("selftest"); }} /></div>}

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
          speak("أهلاً بك في منصة الطالب العبقري. اختر مرحلتك الدراسية، ثم المادة والدرس الذي تريده. استخدم صور سؤالك لحل التمارين بالكاميرا، وتحدى أصدقاءك في ألعاب العباقرة، وتابع تقدمك عبر النجوم والأوسمة. نتمنى لك رحلة تعليمية ممتعة.");
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
