import { useState } from "react";
import StageSelection from "@/components/StageSelection";
import SubjectSelection from "@/components/SubjectSelection";
import LessonSearch from "@/components/LessonSearch";
import LessonContent from "@/components/LessonContent";
import QuizModule from "@/components/QuizModule";
import CameraSolver from "@/components/CameraSolver";
import Leaderboard from "@/components/Leaderboard";
import StudentNameModal from "@/components/StudentNameModal";
import AppFooter from "@/components/AppFooter";
import { useXP } from "@/hooks/useXP";

type Screen = "stage" | "subject" | "search" | "lesson" | "quiz" | "camera" | "leaderboard";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("stage");
  const [stage, setStage] = useState("");
  const [subject, setSubject] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const { xp, studentName, badges, addXP, awardBadge, saveStudentName } = useXP();
  const [showNameModal, setShowNameModal] = useState(false);

  const handleStageSelect = (s: string) => {
    setStage(s);
    setScreen("subject");
  };

  const handleSubjectSelect = (s: string) => {
    setSubject(s);
    setScreen("search");
  };

  const handleLessonSearch = (title: string) => {
    setLessonTitle(title);
    setScreen("lesson");
  };

  const handleQuizComplete = (score: number, total: number) => {
    if (score === total) {
      addXP(100);
      awardBadge("وسام العبقري");
    } else {
      addXP(Math.round((score / total) * 50));
    }
  };

  const handleCameraXP = () => {
    addXP(20);
  };

  const handleVideoXP = () => {
    addXP(10);
  };

  const openLeaderboard = () => {
    if (!studentName) {
      setShowNameModal(true);
    } else {
      setScreen("leaderboard");
    }
  };

  const handleNameSave = (name: string) => {
    saveStudentName(name);
    setShowNameModal(false);
    setScreen("leaderboard");
  };

  return (
    <div className="pb-14">
      {showNameModal && <StudentNameModal onSave={handleNameSave} />}

      {screen === "stage" && (
        <StageSelection
          onSelect={handleStageSelect}
          onCamera={() => setScreen("camera")}
          onLeaderboard={openLeaderboard}
          xp={xp}
          studentName={studentName}
        />
      )}
      {screen === "subject" && (
        <SubjectSelection stage={stage} onSelect={handleSubjectSelect} onBack={() => setScreen("stage")} />
      )}
      {screen === "search" && (
        <LessonSearch subject={subject} onSearch={handleLessonSearch} onBack={() => setScreen("subject")} />
      )}
      {screen === "lesson" && (
        <LessonContent
          lessonTitle={lessonTitle}
          subject={subject}
          onStartQuiz={() => setScreen("quiz")}
          onBack={() => setScreen("search")}
          onVideoXP={handleVideoXP}
        />
      )}
      {screen === "quiz" && (
        <QuizModule
          lessonTitle={lessonTitle}
          subject={subject}
          onBack={() => setScreen("lesson")}
          onRestart={() => {
            setScreen("lesson");
            setTimeout(() => setScreen("quiz"), 100);
          }}
          onQuizComplete={handleQuizComplete}
        />
      )}
      {screen === "camera" && (
        <CameraSolver onBack={() => setScreen("stage")} onXP={handleCameraXP} />
      )}
      {screen === "leaderboard" && (
        <Leaderboard onBack={() => setScreen("stage")} currentName={studentName} currentXP={xp} />
      )}
      <AppFooter />
    </div>
  );
};

export default Index;
