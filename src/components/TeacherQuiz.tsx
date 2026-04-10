import { useState, useRef } from "react";
import { ArrowRight, Printer, Play, Plus, Trash2, Volume2 } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";
import PlatformHeader from "./PlatformHeader";
import jsPDF from "jspdf";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface TeacherQuizProps {
  onBack: () => void;
}

const TeacherQuiz = ({ onBack }: TeacherQuizProps) => {
  const [step, setStep] = useState<"setup" | "exam" | "result">("setup");
  const [schoolName, setSchoolName] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { speak } = useTTS();
  const resultRef = useRef<HTMLDivElement>(null);

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      id: String(prev.length + 1),
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
    }]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: string, value: string | number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== idx) return q;
      if (field === "text") return { ...q, text: value as string };
      if (field === "correctIndex") return { ...q, correctIndex: value as number };
      return q;
    }));
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[oIdx] = value;
      return { ...q, options: opts };
    }));
  };

  const canStartExam = questions.every(q => q.text.trim() && q.options.every(o => o.trim()));

  const handleAnswer = (optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [questions[currentQ].id]: optionIdx }));
    if (currentQ < questions.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next);
      setTimeout(() => speak(questions[next].text), 300);
    } else {
      setStep("result");
    }
  };

  const score = questions.filter(q => answers[q.id] === q.correctIndex).length;

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Use built-in helvetica (no Arabic font loading needed for structure)
    // We'll use simple text positioning
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    
    // Header box
    doc.setDrawColor(30, 58, 95);
    doc.setFillColor(30, 58, 95);
    doc.rect(10, 10, pageWidth - 20, 35, "F");
    
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(14);
    doc.text("Genius Student Platform - Exam", pageWidth / 2, 22, { align: "center" });
    doc.setFontSize(10);
    doc.text("2026", pageWidth / 2, 30, { align: "center" });
    
    // Info table
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    let y = 55;
    const info = [
      ["School", schoolName || "_______________"],
      ["Subject", subject || "_______________"],
      ["Class", className || "_______________"],
      ["Student", studentName || "_______________"],
      ["Date", new Date().toLocaleDateString("ar-SA")],
    ];
    
    info.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, pageWidth - 15, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text(val, pageWidth - 45, y, { align: "right" });
      y += 8;
    });
    
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(10, y, pageWidth - 10, y);
    y += 10;
    
    // Questions
    questions.forEach((q, qIdx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Q${qIdx + 1}: ${q.text}`, pageWidth - 15, y, { align: "right" });
      y += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      q.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        doc.circle(pageWidth - 18, y - 1.5, 2);
        doc.text(`${letter}) ${opt}`, pageWidth - 23, y, { align: "right" });
        y += 7;
      });
      
      y += 5;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Genius Student Platform - 2026", pageWidth / 2, 290, { align: "center" });
    
    doc.save(`exam-${subject || "quiz"}.pdf`);
  };

  // SETUP SCREEN
  if (step === "setup") {
    return (
      <div className="min-h-screen flex flex-col pb-20">
        <PlatformHeader />
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-4 mb-3 self-start">
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold text-lg">رجوع</span>
        </button>

        <div className="text-center mb-4 animate-slide-up px-4">
          <h2 className="text-2xl font-extrabold text-heading">📝 اختبارات المعلم</h2>
          <p className="text-muted-foreground text-base mt-1">أنشئ اختبارك وصدّره PDF أو ابدأه إلكترونياً</p>
        </div>

        <div className="px-4 space-y-3 max-w-xl mx-auto w-full">
          {/* Exam Info */}
          <div className="bg-card/80 backdrop-blur-lg border border-border/50 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-lg text-heading">ترويسة الاختبار</h3>
            <input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="اسم المدرسة" className="w-full p-3 rounded-xl border border-border bg-background text-foreground" />
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="المادة" className="w-full p-3 rounded-xl border border-border bg-background text-foreground" />
            <input value={className} onChange={e => setClassName(e.target.value)} placeholder="الفصل" className="w-full p-3 rounded-xl border border-border bg-background text-foreground" />
            <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="اسم الطالب (اختياري)" className="w-full p-3 rounded-xl border border-border bg-background text-foreground" />
          </div>

          {/* Questions */}
          {questions.map((q, qIdx) => (
            <div key={q.id} className="bg-card/80 backdrop-blur-lg border border-border/50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-heading">السؤال {qIdx + 1}</span>
                <button onClick={() => removeQuestion(qIdx)} className="text-destructive hover:scale-110 transition-transform">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input value={q.text} onChange={e => updateQuestion(qIdx, "text", e.target.value)} placeholder="نص السؤال" className="w-full p-3 rounded-xl border border-border bg-background text-foreground" />
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={q.correctIndex === oIdx}
                    onChange={() => updateQuestion(qIdx, "correctIndex", oIdx)}
                    className="accent-primary w-5 h-5"
                  />
                  <input value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} placeholder={`الخيار ${oIdx + 1}`} className="flex-1 p-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                </div>
              ))}
            </div>
          ))}

          <button onClick={addQuestion} className="w-full py-3 rounded-xl border-2 border-dashed border-primary/40 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
            <Plus className="w-5 h-5" />
            إضافة سؤال
          </button>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => { setCurrentQ(0); setAnswers({}); setStep("exam"); setTimeout(() => speak(questions[0].text), 500); }}
              disabled={!canStartExam}
              className="py-4 rounded-xl gradient-emerald text-primary-foreground font-bold text-lg shadow-emerald disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Play className="w-5 h-5" />
              بدء الاختبار
            </button>
            <button
              onClick={exportPDF}
              disabled={!canStartExam}
              className="py-4 rounded-xl bg-royal-blue text-matte-gold font-bold text-lg shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Printer className="w-5 h-5" />
              تصدير PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EXAM SCREEN
  if (step === "exam") {
    const q = questions[currentQ];
    return (
      <div className="min-h-screen flex flex-col pb-20">
        <PlatformHeader />
        <div className="px-4 flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
          <div className="w-full bg-card/80 backdrop-blur-lg border border-border/50 rounded-3xl p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground font-bold">السؤال {currentQ + 1} / {questions.length}</span>
              <button onClick={() => speak(q.text)} className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                <Volume2 className="w-5 h-5 text-primary" />
              </button>
            </div>
            <h3 className="text-xl font-extrabold text-heading mb-6">{q.text}</h3>
            <div className="space-y-3">
              {q.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleAnswer(oIdx)}
                  className="w-full text-right p-4 rounded-xl border border-border bg-background hover:bg-primary/5 hover:border-primary/40 transition-all font-bold text-foreground active:scale-[0.98]"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULT SCREEN
  return (
    <div className="min-h-screen flex flex-col pb-20">
      <PlatformHeader />
      <div className="px-4 flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
        <div ref={resultRef} className="w-full bg-card/80 backdrop-blur-lg border border-border/50 rounded-3xl p-6 text-center animate-scale-in">
          <div className="text-6xl mb-4">{score === questions.length ? "🏆" : score >= questions.length / 2 ? "⭐" : "💪"}</div>
          <h2 className="text-2xl font-extrabold text-heading mb-2">النتيجة</h2>
          <p className="text-4xl font-extrabold text-primary mb-2">{score} / {questions.length}</p>
          <p className="text-muted-foreground mb-6">
            {score === questions.length ? "ممتاز! إجابات كاملة!" : score >= questions.length / 2 ? "أحسنت! استمر في التميز" : "حاول مرة أخرى!"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setStep("setup"); setAnswers({}); setCurrentQ(0); }} className="py-3 rounded-xl gradient-emerald text-primary-foreground font-bold active:scale-95 transition-transform">
              اختبار جديد
            </button>
            <button onClick={exportPDF} className="py-3 rounded-xl bg-royal-blue text-matte-gold font-bold active:scale-95 transition-transform flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" />
              طباعة PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherQuiz;
