import { useEffect, useRef, useState } from "react";
import { MessageCircleHeart, Map } from "lucide-react";
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
import SplashIntro from "@/components/SplashIntro";
import { useXP } from "@/hooks/useXP";
import { useTTS } from "@/hooks/useTTS";
import { useIdleNotify } from "@/hooks/useIdleNotify";
import { useOvertakeNotify } from "@/hooks/useOvertakeNotify";
import { canAccessStudentScreen } from "@/lib/access-policy";

type Screen = "stage" | "dashboard" | "subject" | "search" | "lesson" | "quiz" | "camera" | "leaderboard" | "games" | "selftest" | "foundation" | "studio";

const Index = () => {
  const [screen, setScreenRaw] = useState<Screen>("stage");

  // FREE ACCESS (October 2026): the trial, checkout, subscription banner,
  // entitlement polling, and locked-screen redirect were removed here.
  // To restore paid access later, reintroduce one server-verified entitlement
  // guard at this entry point, then restore the plans screen and activation
  // actions before placing any student screen behind that guard.

  // مكدّس التنقل الداخلي: يجعل زر رجوع الجوال يتنقل بين شاشات التطبيق
  // بدلاً من إغلاقه، ويستقر بأمان في الصفحة الرئيسية.
  const historyRef = useRef<Screen[]>([]);
  const backRef = useRef(false);

  const setScreen = (next: Screen) => {
    if (canAccessStudentScreen()) setScreenRaw(next);
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
  useIdleNotify(4);
  useOvertakeNotify(studentName, 60);


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
    <main className="pt-14 pb-16">
      {showNameModal && <StudentNameModal onSave={handleNameSave} />}
      {showSplash && (
        <SplashIntro
          playKey={0}
          duration={2800}
          onDone={() => setShowSplash(false)}
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
      {screen === "quiz" && <div className="motion-screen-in"><QuizModule lessonTitle={lessonTitle} subject={subject} stage={stage} studentName={studentName} stars={xp} onBack={() => setScreen("lesson")} onRestart={() => { setScreen("lesson"); setTimeout(() => setScreen("quiz"), 100); }} onQuizComplete={handleQuizComplete} /></div>}
      {screen === "camera" && <div className="motion-screen-in"><CameraSolver onBack={() => setScreen("stage")} onXP={() => { addXP(20); recordCompletion("camera"); }} studentName={studentName} stars={xp} /></div>}
      {screen === "leaderboard" && <Leaderboard onBack={() => setScreen("stage")} currentName={studentName} currentXP={xp} />}
      {screen === "games" && <div className="motion-screen-in"><GamesHub onBack={() => setScreen("stage")} onXP={(amount) => { addXP(amount); recordCompletion("game"); }} onBadge={(badge) => awardBadge(badge)} studentName={studentName} stars={xp} /></div>}
      {screen === "studio" && <div className="motion-screen-in"><QuizStudio onBack={() => setScreen("stage")} onXP={(n) => { addXP(n); recordCompletion("studio"); }} onBadge={(b) => awardBadge(b)} studentName={studentName} stage={stage} stars={xp} /></div>}
      {screen === "selftest" && <div className="motion-screen-in"><SelfTest onBack={() => setScreen("stage")} onXP={(n) => { addXP(n); recordCompletion("selftest"); }} studentName={studentName} stars={xp} /></div>}

      {showWhisper && <WhisperModal onClose={() => setShowWhisper(false)} />}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
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

      <AppFooter />
    </main>
  );
};

export default Index;
