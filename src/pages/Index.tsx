import { useState } from "react";
import StageSelection from "@/components/StageSelection";
import SubjectSelection from "@/components/SubjectSelection";
import LessonSearch from "@/components/LessonSearch";
import LessonContent from "@/components/LessonContent";
import QuizModule from "@/components/QuizModule";
import AppFooter from "@/components/AppFooter";

type Screen = "stage" | "subject" | "search" | "lesson" | "quiz";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("stage");
  const [stage, setStage] = useState("");
  const [subject, setSubject] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");

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

  return (
    <div className="pb-14">
      {screen === "stage" && <StageSelection onSelect={handleStageSelect} />}
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
        />
      )}
      <AppFooter />
    </div>
  );
};

export default Index;
