import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowRight, Trophy, Bot, Users, Clock, Volume2 } from "lucide-react";
import ConfettiCelebration from "./ConfettiCelebration";
import ShareButton from "./ShareButton";
import { supabase } from "@/integrations/supabase/client";
import { useTTS } from "@/hooks/useTTS";

interface HexBattleGameProps {
  onBack: () => void;
  onXP: (amount: number) => void;
  onBadge: (badge: string) => void;
  studentName: string;
  subjectFilter?: string;
}

interface Question {
  q: string;
  opts: string[];
  correct: number;
  subject: string;
}

const allQuestions: Question[] = [
  // القرآن الكريم
  { q: "كم عدد سور القرآن الكريم؟", opts: ["112", "114", "116", "120"], correct: 1, subject: "quran" },
  { q: "ما أطول سورة في القرآن؟", opts: ["آل عمران", "البقرة", "النساء", "المائدة"], correct: 1, subject: "quran" },
  { q: "ما أقصر سورة في القرآن؟", opts: ["الإخلاص", "الكوثر", "النصر", "الفلق"], correct: 1, subject: "quran" },
  { q: "في أي سورة وردت آية الكرسي؟", opts: ["آل عمران", "البقرة", "النساء", "المائدة"], correct: 1, subject: "quran" },
  { q: "ما حكم النون الساكنة قبل الباء؟", opts: ["إدغام", "إخفاء", "إقلاب", "إظهار"], correct: 2, subject: "quran" },
  { q: "كم عدد أجزاء القرآن؟", opts: ["20", "25", "30", "40"], correct: 2, subject: "quran" },
  { q: "ما السورة التي تعدل ثلث القرآن؟", opts: ["الفاتحة", "الإخلاص", "الكوثر", "النصر"], correct: 1, subject: "quran" },
  { q: "ما مقدار المد الطبيعي؟", opts: ["حركة", "حركتان", "أربع حركات", "ست حركات"], correct: 1, subject: "quran" },
  { q: "من أول من جمع القرآن؟", opts: ["عمر", "أبو بكر", "عثمان", "علي"], correct: 1, subject: "quran" },
  { q: "ما اسم السورة التي تبدأ بـ 'الحمد لله'؟", opts: ["البقرة", "الفاتحة", "الأنعام", "الكهف"], correct: 1, subject: "quran" },
  // الدراسات الإسلامية
  { q: "كم عدد أركان الإسلام؟", opts: ["3", "4", "5", "6"], correct: 2, subject: "islamic" },
  { q: "كم عدد الصلوات المفروضة؟", opts: ["3", "4", "5", "7"], correct: 2, subject: "islamic" },
  { q: "ما أول ما يُحاسب عليه العبد؟", opts: ["الزكاة", "الصلاة", "الصيام", "الحج"], correct: 1, subject: "islamic" },
  { q: "في أي شهر يجب صيام رمضان؟", opts: ["شعبان", "رمضان", "شوال", "ذو الحجة"], correct: 1, subject: "islamic" },
  { q: "أين يقع المسجد الحرام؟", opts: ["المدينة", "مكة", "القدس", "الطائف"], correct: 1, subject: "islamic" },
  { q: "كم عدد أركان الإيمان؟", opts: ["5", "6", "7", "4"], correct: 1, subject: "islamic" },
  { q: "من خاتم الأنبياء؟", opts: ["إبراهيم", "موسى", "عيسى", "محمد ﷺ"], correct: 3, subject: "islamic" },
  { q: "كم ركعة في صلاة المغرب؟", opts: ["2", "3", "4", "5"], correct: 1, subject: "islamic" },
  { q: "ما أول ركن من أركان الإسلام؟", opts: ["الصلاة", "الشهادتان", "الزكاة", "الصيام"], correct: 1, subject: "islamic" },
  // الرياضيات
  { q: "ما ناتج 7 × 8 ؟", opts: ["54", "56", "58", "64"], correct: 1, subject: "math" },
  { q: "ما محيط مربع طول ضلعه 5 سم؟", opts: ["15", "20", "25", "10"], correct: 1, subject: "math" },
  { q: "ما مساحة مستطيل طوله 6 وعرضه 4؟", opts: ["10", "20", "24", "30"], correct: 2, subject: "math" },
  { q: "ما قيمة س في: س + 3 = 10؟", opts: ["5", "6", "7", "8"], correct: 2, subject: "math" },
  { q: "كم يساوي ½ + ¼ ؟", opts: ["¾", "⅔", "½", "1"], correct: 0, subject: "math" },
  { q: "ما ناتج 144 ÷ 12 ؟", opts: ["10", "11", "12", "13"], correct: 2, subject: "math" },
  { q: "كم زاوية في المثلث؟", opts: ["2", "3", "4", "5"], correct: 1, subject: "math" },
  { q: "ما مجموع زوايا المثلث؟", opts: ["90°", "180°", "270°", "360°"], correct: 1, subject: "math" },
  { q: "ما العدد الأولي؟", opts: ["4", "6", "7", "9"], correct: 2, subject: "math" },
  { q: "ما ناتج 25² ؟", opts: ["525", "625", "725", "425"], correct: 1, subject: "math" },
  // العلوم
  { q: "ما أقرب كوكب للشمس؟", opts: ["الزهرة", "عطارد", "الأرض", "المريخ"], correct: 1, subject: "science" },
  { q: "ما الغاز الذي نتنفسه؟", opts: ["النيتروجين", "CO₂", "الأكسجين", "الهيدروجين"], correct: 2, subject: "science" },
  { q: "كم حالة للمادة؟", opts: ["2", "3", "4", "5"], correct: 1, subject: "science" },
  { q: "ما وحدة قياس القوة؟", opts: ["جول", "نيوتن", "واط", "أمبير"], correct: 1, subject: "science" },
  { q: "ما العضو المسؤول عن ضخ الدم؟", opts: ["الرئة", "الكبد", "القلب", "الكلية"], correct: 2, subject: "science" },
  { q: "ما أكبر كوكب في المجموعة الشمسية؟", opts: ["زحل", "المشتري", "أورانوس", "نبتون"], correct: 1, subject: "science" },
  { q: "ما سرعة الضوء تقريباً؟", opts: ["300 كم/ث", "300,000 كم/ث", "30,000 كم/ث", "3,000 كم/ث"], correct: 1, subject: "science" },
  { q: "ما العملية التي يصنع بها النبات غذاءه؟", opts: ["التنفس", "البناء الضوئي", "الإخراج", "الامتصاص"], correct: 1, subject: "science" },
  // لغتي الخالدة
  { q: "ما إعراب 'الطالبُ' في: الطالبُ مجتهدٌ؟", opts: ["مبتدأ مرفوع", "فاعل", "خبر", "بدل"], correct: 0, subject: "arabic" },
  { q: "ما نوع الجملة: 'يلعب الأطفالُ'؟", opts: ["اسمية", "فعلية", "شرطية", "شبه جملة"], correct: 1, subject: "arabic" },
  { q: "ما الحرف الناسخ في: 'إنَّ العلمَ نورٌ'؟", opts: ["إنَّ", "العلم", "نور", "لا يوجد"], correct: 0, subject: "arabic" },
  { q: "ما نوع الهمزة في 'استخرج'؟", opts: ["قطع", "وصل", "متوسطة", "متطرفة"], correct: 1, subject: "arabic" },
  { q: "ما الفعل المضارع المرفوع؟", opts: ["لم يكتبْ", "يكتبُ", "اكتبْ", "لن يكتبَ"], correct: 1, subject: "arabic" },
  { q: "ما جمع كلمة 'كتاب'؟", opts: ["كتب", "كتابات", "كُتّاب", "أكتبة"], correct: 0, subject: "arabic" },
  { q: "ما إعراب 'سعيداً' في: جاء الطالبُ سعيداً؟", opts: ["مفعول به", "حال", "تمييز", "خبر"], correct: 1, subject: "arabic" },
  { q: "أداة الاستفهام عن المكان؟", opts: ["متى", "كيف", "أين", "لماذا"], correct: 2, subject: "arabic" },
  // الدراسات الاجتماعية
  { q: "كم عدد قارات العالم؟", opts: ["5", "6", "7", "8"], correct: 2, subject: "social" },
  { q: "ما أكبر قارة في العالم؟", opts: ["أفريقيا", "آسيا", "أوروبا", "أمريكا"], correct: 1, subject: "social" },
  { q: "ما عاصمة المملكة العربية السعودية؟", opts: ["جدة", "مكة", "الرياض", "المدينة"], correct: 2, subject: "social" },
  { q: "ما أطول نهر في العالم؟", opts: ["الأمازون", "النيل", "المسيسيبي", "دجلة"], correct: 1, subject: "social" },
  { q: "ما أكبر محيط في العالم؟", opts: ["الأطلسي", "الهندي", "الهادئ", "المتجمد"], correct: 2, subject: "social" },
  { q: "ما الجهة التي تشرق منها الشمس؟", opts: ["الغرب", "الشمال", "الجنوب", "الشرق"], correct: 3, subject: "social" },
  { q: "ما أصغر قارة في العالم؟", opts: ["أوروبا", "أستراليا", "أنتاركتيكا", "أمريكا الجنوبية"], correct: 1, subject: "social" },
  { q: "كم عدد مناطق المملكة الإدارية؟", opts: ["10", "13", "15", "20"], correct: 1, subject: "social" },
  // المهارات الرقمية
  { q: "ما وحدة قياس سعة التخزين؟", opts: ["هرتز", "بايت", "واط", "بكسل"], correct: 1, subject: "digital" },
  { q: "ما هي لغة HTML؟", opts: ["لغة برمجة", "لغة ترميز", "نظام تشغيل", "متصفح"], correct: 1, subject: "digital" },
  { q: "ما وظيفة RAM؟", opts: ["تخزين دائم", "تخزين مؤقت", "معالجة", "عرض"], correct: 1, subject: "digital" },
  { q: "ما أكبر وحدة تخزين؟", opts: ["كيلوبايت", "ميغابايت", "غيغابايت", "تيرابايت"], correct: 3, subject: "digital" },
  { q: "ما وظيفة المعالج (CPU)؟", opts: ["التخزين", "المعالجة", "العرض", "الطباعة"], correct: 1, subject: "digital" },
  { q: "ما نظام التشغيل الأكثر استخداماً للحواسيب؟", opts: ["Linux", "macOS", "Windows", "Chrome OS"], correct: 2, subject: "digital" },
  // التربية الفنية
  { q: "ما الألوان الأساسية؟", opts: ["أحمر وأزرق وأصفر", "أخضر وبرتقالي وبنفسجي", "أبيض وأسود ورمادي", "وردي وبني وذهبي"], correct: 0, subject: "art" },
  { q: "ماذا ينتج عن خلط الأحمر والأصفر؟", opts: ["أخضر", "برتقالي", "بنفسجي", "بني"], correct: 1, subject: "art" },
  { q: "ما الألوان الثانوية؟", opts: ["أحمر وأزرق وأصفر", "برتقالي وأخضر وبنفسجي", "أبيض وأسود", "ذهبي وفضي"], correct: 1, subject: "art" },
  { q: "ماذا ينتج عن خلط الأزرق والأصفر؟", opts: ["برتقالي", "بنفسجي", "أخضر", "بني"], correct: 2, subject: "art" },
  { q: "ما الفن الذي يستخدم الطين؟", opts: ["الرسم", "الخزف", "النسيج", "الطباعة"], correct: 1, subject: "art" },
  // التربية البدنية
  { q: "كم عدد لاعبي كرة القدم في الفريق؟", opts: ["9", "10", "11", "12"], correct: 2, subject: "pe" },
  { q: "ما أهم تمرين قبل الرياضة؟", opts: ["النوم", "الإحماء", "الأكل", "الشرب"], correct: 1, subject: "pe" },
  { q: "كم شوط في مباراة كرة القدم؟", opts: ["1", "2", "3", "4"], correct: 1, subject: "pe" },
  { q: "ما الرياضة التي تستخدم المضرب؟", opts: ["كرة القدم", "السباحة", "التنس", "الجري"], correct: 2, subject: "pe" },
  { q: "ما فائدة الرياضة للجسم؟", opts: ["تقوية العضلات", "زيادة الوزن", "الكسل", "لا فائدة"], correct: 0, subject: "pe" },
  // المهارات الحياتية
  { q: "ما أهم وجبة في اليوم؟", opts: ["الغداء", "العشاء", "الإفطار", "الوجبة الخفيفة"], correct: 2, subject: "life" },
  { q: "كم ساعة نوم يحتاجها الطالب؟", opts: ["4-5", "6-7", "8-10", "12-14"], correct: 2, subject: "life" },
  { q: "ما أفضل طريقة لتنظيم الوقت؟", opts: ["الجدول", "العشوائية", "السهر", "اللعب فقط"], correct: 0, subject: "life" },
  { q: "ما أهمية غسل اليدين؟", opts: ["النظافة", "اللعب", "الأكل", "النوم"], correct: 0, subject: "life" },
  { q: "ما السلوك الصحيح عند العطس؟", opts: ["فتح الفم", "تغطية الفم", "العطس بقوة", "لا شيء"], correct: 1, subject: "life" },
  // اللغة الإنجليزية
  { q: "What is the past tense of 'go'?", opts: ["goed", "went", "gone", "going"], correct: 1, subject: "english" },
  { q: "What is the plural of 'child'?", opts: ["childs", "children", "childes", "childern"], correct: 1, subject: "english" },
  { q: "Choose the correct: She ___ a student.", opts: ["am", "is", "are", "be"], correct: 1, subject: "english" },
  { q: "What color is the sky?", opts: ["Red", "Green", "Blue", "Yellow"], correct: 2, subject: "english" },
  { q: "What is the opposite of 'hot'?", opts: ["warm", "cool", "cold", "freezing"], correct: 2, subject: "english" },
];

// Fisher-Yates shuffle
const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const subjectNames: Record<string, string> = {
  quran: "القرآن", islamic: "الإسلامية", math: "الرياضيات", science: "العلوم",
  arabic: "لغتي", social: "الاجتماعيات", digital: "المهارات الرقمية", art: "الفنية",
  pe: "البدنية", life: "الحياتية", english: "الإنجليزية",
};

const subjectEmoji: Record<string, string> = {
  quran: "📖", islamic: "🕌", math: "🔢", science: "🔬", arabic: "✍️",
  social: "🌍", digital: "💻", art: "🎨", pe: "⚽", life: "💡", english: "🇬🇧",
};

const BOARD_SIZE = 5;

const generateGrid = () => {
  const cells: { row: number; col: number; id: string }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      cells.push({ row: r, col: c, id: `${r}-${c}` });
    }
  }
  return cells;
};

const areNeighbors = (r1: number, c1: number, r2: number, c2: number) => {
  const dr = r2 - r1;
  const dc = c2 - c1;
  if (r1 % 2 === 0) {
    return (
      (dr === 0 && Math.abs(dc) === 1) ||
      (dr === -1 && (dc === 0 || dc === -1)) ||
      (dr === 1 && (dc === 0 || dc === -1))
    );
  }
  return (
    (dr === 0 && Math.abs(dc) === 1) ||
    (dr === -1 && (dc === 0 || dc === 1)) ||
    (dr === 1 && (dc === 0 || dc === 1))
  );
};

const checkWin = (cells: Map<string, "green" | "red">, color: "green" | "red"): boolean => {
  const colorCells = Array.from(cells.entries()).filter(([, c]) => c === color);
  if (colorCells.length === 0) return false;

  const visited = new Set<string>();
  const dfs = (r: number, c: number) => {
    const key = `${r}-${c}`;
    if (visited.has(key)) return;
    visited.add(key);
    for (let nr = 0; nr < BOARD_SIZE; nr++) {
      for (let nc = 0; nc < BOARD_SIZE; nc++) {
        const nk = `${nr}-${nc}`;
        if (!visited.has(nk) && cells.get(nk) === color && areNeighbors(r, c, nr, nc)) {
          dfs(nr, nc);
        }
      }
    }
  };

  if (color === "green") {
    const starts = colorCells.filter(([k]) => k.endsWith("-0"));
    for (const [k] of starts) {
      const [r] = k.split("-").map(Number);
      dfs(r, 0);
    }
    return Array.from(visited).some(k => k.endsWith(`-${BOARD_SIZE - 1}`));
  } else {
    const starts = colorCells.filter(([k]) => k.startsWith("0-"));
    for (const [k] of starts) {
      const [, c] = k.split("-").map(Number);
      dfs(0, c);
    }
    return Array.from(visited).some(k => k.startsWith(`${BOARD_SIZE - 1}-`));
  }
};

const getMedalInfo = (seconds: number) => {
  if (seconds <= 30) return { medal: "🥇", label: "الوسام الذهبي", color: "text-yellow-500", bg: "bg-yellow-100", key: "gold" };
  if (seconds <= 60) return { medal: "🥈", label: "الوسام الفضي", color: "text-gray-400", bg: "bg-gray-100", key: "silver" };
  return { medal: "🥉", label: "الوسام البرونزي", color: "text-amber-700", bg: "bg-amber-100", key: "bronze" };
};

type GameMode = "select" | "pvp" | "ai";

const HexBattleGame = ({ onBack, onXP, onBadge, studentName, subjectFilter }: HexBattleGameProps) => {
  const [gameMode, setGameMode] = useState<GameMode>("select");
  const [grid] = useState(generateGrid);
  const [cellOwners, setCellOwners] = useState<Map<string, "green" | "red">>(new Map());
  const [currentPlayer, setCurrentPlayer] = useState<"green" | "red">("green");
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [winner, setWinner] = useState<"green" | "red" | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const winnerRef = useRef<HTMLDivElement>(null);

  // Shuffle-based question system (no repeats)
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  // Timer state
  const [timerStarted, setTimerStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);

  // Win modal with name input
  const [showWinModal, setShowWinModal] = useState(false);
  const [winnerName, setWinnerName] = useState(studentName || "");
  const { speak } = useTTS();

  // Initialize shuffled questions
  useEffect(() => {
    const filtered = subjectFilter && subjectFilter !== "all"
      ? allQuestions.filter(q => q.subject === subjectFilter)
      : allQuestions;
    setShuffledQuestions(shuffleArray(filtered));
    setQuestionIndex(0);
  }, [subjectFilter]);

  const getNextQuestion = useCallback((): Question => {
    if (questionIndex >= shuffledQuestions.length) {
      // Re-shuffle when exhausted
      const newShuffle = shuffleArray(shuffledQuestions);
      setShuffledQuestions(newShuffle);
      setQuestionIndex(1);
      return newShuffle[0];
    }
    const q = shuffledQuestions[questionIndex];
    setQuestionIndex(prev => prev + 1);
    return q;
  }, [questionIndex, shuffledQuestions]);

  // Timer tick
  useEffect(() => {
    if (!timerStarted || winner) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 200);
    return () => clearInterval(interval);
  }, [timerStarted, startTime, winner]);

  const handleCellClick = (id: string) => {
    if (winner || cellOwners.has(id) || selectedCell || aiThinking) return;
    if (gameMode === "ai" && currentPlayer === "red") return;

    // Start timer on first move
    if (!timerStarted) {
      setTimerStarted(true);
      setStartTime(Date.now());
    }

    setSelectedCell(id);
    const q = getNextQuestion();
    setCurrentQuestion(q);
    setAnswered(false);
    setSelectedAnswer(null);
    // Auto-read question aloud
    speak(q.q);
  };

  const handleWin = (player: "green" | "red") => {
    const time = Math.floor((Date.now() - startTime) / 1000);
    setFinalTime(time);
    setWinner(player);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 4000);

    if (gameMode === "ai" && player === "green") {
      onXP(150);
      onBadge("وسام بطل الشبكة");
    } else if (gameMode === "pvp") {
      onXP(150);
      onBadge("وسام بطل الشبكة");
    }

    setShowWinModal(true);
    sendTelegramNotification(player);
  };

  const processAnswer = useCallback((idx: number, question: Question, cell: string, player: "green" | "red") => {
    const newOwners = new Map(cellOwners);
    if (idx === question.correct) {
      newOwners.set(cell, player);
      setCellOwners(newOwners);

      if (checkWin(newOwners, player)) {
        handleWin(player);
        return;
      }
    }

    setTimeout(() => {
      setSelectedCell(null);
      setCurrentQuestion(null);
      setAnswered(false);
      setSelectedAnswer(null);
      setCurrentPlayer(p => p === "green" ? "red" : "green");
    }, 1500);
  }, [cellOwners, gameMode, onXP, onBadge, startTime, timerStarted]);

  const handleAnswer = (idx: number) => {
    if (answered || !currentQuestion) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    processAnswer(idx, currentQuestion, selectedCell!, currentPlayer);
  };

  // AI turn
  useEffect(() => {
    if (gameMode !== "ai" || currentPlayer !== "red" || winner || selectedCell) return;

    setAiThinking(true);
    const timeout = setTimeout(() => {
      const emptyCells = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const id = `${r}-${c}`;
          if (!cellOwners.has(id)) emptyCells.push(id);
        }
      }
      if (emptyCells.length === 0) { setAiThinking(false); return; }

      const redCells = Array.from(cellOwners.entries()).filter(([, c]) => c === "red");
      let chosen: string;
      if (redCells.length === 0) {
        const topEmpty = emptyCells.filter(id => id.startsWith("0-"));
        chosen = topEmpty.length > 0 ? topEmpty[Math.floor(Math.random() * topEmpty.length)] : emptyCells[Math.floor(Math.random() * emptyCells.length)];
      } else {
        const adjacent = emptyCells.filter(id => {
          const [r, c] = id.split("-").map(Number);
          return redCells.some(([k]) => {
            const [rr, rc] = k.split("-").map(Number);
            return areNeighbors(r, c, rr, rc);
          });
        });
        chosen = adjacent.length > 0 ? adjacent[Math.floor(Math.random() * adjacent.length)] : emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }

      // Start timer on AI first move too
      if (!timerStarted) {
        setTimerStarted(true);
        setStartTime(Date.now());
      }

      const question = getNextQuestion();
      setSelectedCell(chosen);
      setCurrentQuestion(question);
      setAnswered(false);
      setSelectedAnswer(null);

      setTimeout(() => {
        const aiCorrect = Math.random() < 0.7;
        const aiAnswer = aiCorrect ? question.correct : ((question.correct + 1 + Math.floor(Math.random() * 3)) % 4);
        setSelectedAnswer(aiAnswer);
        setAnswered(true);

        const newOwners = new Map(cellOwners);
        if (aiAnswer === question.correct) {
          newOwners.set(chosen, "red");
          setCellOwners(newOwners);
          if (checkWin(newOwners, "red")) {
            const time = Math.floor((Date.now() - startTime) / 1000);
            setFinalTime(time);
            setWinner("red");
            setCelebrate(true);
            setTimeout(() => setCelebrate(false), 4000);
            setShowWinModal(true);
          }
        }

        setTimeout(() => {
          setSelectedCell(null);
          setCurrentQuestion(null);
          setAnswered(false);
          setSelectedAnswer(null);
          setAiThinking(false);
          if (!checkWin(newOwners, "red")) {
            setCurrentPlayer("green");
          }
        }, 1500);
      }, 1200);
    }, 800);

    return () => clearTimeout(timeout);
  }, [currentPlayer, gameMode, winner, selectedCell, cellOwners]);

  const sendTelegramNotification = async (winnerColor: "green" | "red") => {
    setSendingTelegram(true);
    try {
      const name = winnerName || studentName || (winnerColor === "green" ? "اللاعب الأخضر" : "اللاعب الأحمر");
      await supabase.functions.invoke("send-telegram", {
        body: {
          student_name: name,
          message: `🏆 بطل جديد يسيطر على ساحة العباقرة!\n👤 الفائز: ${name}\n🔥 هل تجرؤ على تحديه؟\n🔗 https://genius-saudi-learn.lovable.app`,
        },
      });
    } catch {
      // silent fail
    } finally {
      setSendingTelegram(false);
    }
  };

  const saveToGallery = async () => {
    if (!winnerName.trim() || finalTime === null) return;
    const medal = getMedalInfo(finalTime);
    try {
      await (supabase as any).from("genius_gallery").insert({
        student_name: winnerName.trim(),
        medal: medal.key,
        time_seconds: finalTime,
        subject: subjectFilter || "all",
        game_mode: gameMode,
      });
    } catch {
      // silent
    }
    setShowWinModal(false);
  };

  const resetGame = () => {
    setCellOwners(new Map());
    setCurrentPlayer("green");
    setSelectedCell(null);
    setCurrentQuestion(null);
    setWinner(null);
    setAiThinking(false);
    setTimerStarted(false);
    setStartTime(0);
    setElapsed(0);
    setFinalTime(null);
    setShowWinModal(false);
    setWinnerName(studentName || "");
    // Re-shuffle questions
    const filtered = subjectFilter && subjectFilter !== "all"
      ? allQuestions.filter(q => q.subject === subjectFilter)
      : allQuestions;
    setShuffledQuestions(shuffleArray(filtered));
    setQuestionIndex(0);
  };

  const getCellColor = (id: string) => {
    const owner = cellOwners.get(id);
    if (owner === "green") return "bg-emerald-500 border-emerald-600 shadow-emerald-500/40";
    if (owner === "red") return "bg-red-500 border-red-600 shadow-red-500/40";
    if (selectedCell === id) return "bg-amber-400 border-amber-500 ring-4 ring-amber-300";
    return "bg-card border-border hover:bg-muted hover:border-primary/40";
  };

  const subjectTitle = subjectFilter && subjectFilter !== "all" ? subjectNames[subjectFilter] || "" : "شامل";

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec} ث`;
  };

  // Mode selection screen
  if (gameMode === "select") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start">
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold text-lg">رجوع</span>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full gap-6">
          <h1 className="text-3xl font-extrabold text-heading mb-2 text-center">⬡ شبكة التحدي — {subjectTitle}</h1>
          <p className="text-muted-foreground text-lg text-center mb-4">اختر نوع التحدي</p>

          <button
            onClick={() => setGameMode("pvp")}
            className="w-full bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-scale-in"
          >
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl gradient-emerald shadow-emerald flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-right">
              <h3 className="text-xl font-extrabold text-heading">👥 لاعب ضد لاعب</h3>
              <p className="text-muted-foreground text-sm mt-1">تحدَّ صديقك على نفس الجهاز!</p>
            </div>
          </button>

          <button
            onClick={() => setGameMode("ai")}
            className="w-full bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-scale-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-royal-blue shadow-lg flex items-center justify-center">
              <Bot className="w-8 h-8 text-matte-gold" />
            </div>
            <div className="flex-1 text-right">
              <h3 className="text-xl font-extrabold text-heading">🤖 ضد الذكاء الاصطناعي</h3>
              <p className="text-muted-foreground text-sm mt-1">هل تستطيع هزيمة العبقري الآلي؟</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-3 py-4 pb-24">
      <ConfettiCelebration trigger={celebrate} />

      {/* Win Modal with name input & medal */}
      {showWinModal && finalTime !== null && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div ref={winnerRef} className="neu-card p-8 max-w-sm w-full animate-bounce-in text-center">
            <div className="text-6xl mb-3">{getMedalInfo(finalTime).medal}</div>
            <h2 className="text-2xl font-extrabold text-foreground mb-1">
              🏆 {gameMode === "ai" ? (winner === "green" ? "فزت!" : "فاز الذكاء الاصطناعي!") : `فاز ${winner === "green" ? "الأخضر" : "الأحمر"}!`}
            </h2>
            <p className={`text-xl font-bold mb-1 ${getMedalInfo(finalTime).color}`}>
              {getMedalInfo(finalTime).label}
            </p>
            <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-bold">{formatTime(finalTime)}</span>
            </div>
            <p className="text-lg font-bold text-primary mb-2">+150 XP + وسام بطل الشبكة</p>
            <input
              type="text"
              value={winnerName}
              onChange={(e) => setWinnerName(e.target.value)}
              placeholder="اسم الفائز"
              className="w-full px-5 py-4 rounded-2xl border-2 border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl font-bold mb-4"
              dir="rtl"
            />
            <p className="font-ruqaa text-matte-gold text-sm mb-4">منصة الطالب العبقري</p>
            {sendingTelegram && <p className="text-sm text-muted-foreground mb-2">جارٍ إرسال التحدي...</p>}
            <div className="flex gap-3">
              <button
                onClick={saveToGallery}
                disabled={!winnerName.trim()}
                className="flex-1 py-3 rounded-2xl gradient-emerald text-white font-bold text-lg shadow-emerald-lg active:scale-[0.97] transition-all disabled:opacity-50"
              >
                حفظ في المعرض ✨
              </button>
              <button
                onClick={() => { setShowWinModal(false); resetGame(); }}
                className="py-3 px-6 rounded-2xl bg-muted text-foreground font-bold text-lg active:scale-[0.97] transition-all"
              >
                جديد ⬡
              </button>
            </div>
          </div>
        </div>
      )}

      {winner && !showWinModal && <ShareButton context="win" resultContainerRef={winnerRef} />}

      {/* Header */}
      <button onClick={() => { resetGame(); setGameMode("select"); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="text-center mb-2 animate-slide-up">
        <h1 className="text-2xl font-extrabold text-heading">
          ⬡ شبكة التحدي — {subjectTitle} {gameMode === "ai" ? "🤖" : "👥"}
        </h1>
      </div>

      {/* Timer display */}
      <div className="flex items-center justify-center gap-2 mb-2 text-lg font-bold">
        <Clock className="w-5 h-5 text-primary" />
        <span className={`${timerStarted ? "text-primary" : "text-muted-foreground"}`}>
          {timerStarted ? formatTime(elapsed) : "0 ث"}
        </span>
      </div>

      {/* Turn indicator */}
      <div className="flex items-center justify-between max-w-sm mx-auto w-full mb-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${currentPlayer === "green" ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400" : "bg-emerald-50 text-emerald-400"}`}>
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          {gameMode === "ai" ? "أنت ↔" : "أخضر ↔"}
        </div>
        {aiThinking && <span className="text-sm text-muted-foreground animate-pulse font-bold">🤖 يفكر...</span>}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${currentPlayer === "red" ? "bg-red-100 text-red-700 ring-2 ring-red-400" : "bg-red-50 text-red-400"}`}>
          {gameMode === "ai" ? "🤖 ↕" : "أحمر ↕"}
          <div className="w-3 h-3 rounded-full bg-red-500" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mb-3 text-xs text-muted-foreground">
        <span>🟢 {gameMode === "ai" ? "أنت" : "أخضر"}: يسار ← يمين</span>
        <span>🔴 {gameMode === "ai" ? "الذكاء" : "أحمر"}: أعلى ← أسفل</span>
      </div>

      {/* Hex Grid */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute -left-3 top-0 bottom-0 w-1.5 rounded-full bg-emerald-500" />
          <div className="absolute -right-3 top-0 bottom-0 w-1.5 rounded-full bg-emerald-500" />
          <div className="absolute top-[-8px] left-0 right-0 h-1.5 rounded-full bg-red-500" />
          <div className="absolute bottom-[-8px] left-0 right-0 h-1.5 rounded-full bg-red-500" />

          <div className="py-2 px-2">
            {Array.from({ length: BOARD_SIZE }, (_, r) => (
              <div
                key={r}
                className="flex justify-center gap-1"
                style={{ marginTop: r === 0 ? 0 : -4, marginRight: r % 2 === 1 ? 24 : 0 }}
              >
                {Array.from({ length: BOARD_SIZE }, (_, c) => {
                  const id = `${r}-${c}`;
                  const isDisabled = winner !== null || cellOwners.has(id) || selectedCell !== null || aiThinking || (gameMode === "ai" && currentPlayer === "red");
                  return (
                    <button
                      key={id}
                      onClick={() => handleCellClick(id)}
                      disabled={isDisabled}
                      className={`w-12 h-12 rounded-lg border-2 shadow-md transition-all duration-200 text-xs font-bold
                        ${getCellColor(id)}
                        ${!isDisabled ? "active:scale-90 cursor-pointer" : ""}
                      `}
                      style={{
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                        width: 48,
                        height: 48,
                      }}
                    >
                      {cellOwners.has(id) ? (cellOwners.get(id) === "green" ? "🟢" : "🔴") : "⬡"}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {currentQuestion && selectedCell && !winner && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-3 pb-20" onClick={e => e.stopPropagation()}>
          <div className="w-full max-w-md bg-card rounded-3xl p-5 shadow-2xl animate-slide-up border border-border mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {subjectEmoji[currentQuestion.subject] || "📚"} {subjectNames[currentQuestion.subject] || currentQuestion.subject}
              </span>
              <span className={`text-sm font-bold ${currentPlayer === "green" ? "text-emerald-600" : "text-red-600"}`}>
                {gameMode === "ai" && currentPlayer === "red" ? "🤖 دور الذكاء" : `دور ${currentPlayer === "green" ? (gameMode === "ai" ? "أنت" : "الأخضر") : "الأحمر"}`}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-lg font-extrabold leading-8 text-foreground flex-1">{currentQuestion.q}</p>
              <button onClick={() => speak(currentQuestion.q)} className="flex-shrink-0 p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 pb-2">
              {currentQuestion.opts.map((opt, i) => {
                let cls = "w-full py-3 px-4 rounded-xl border-2 text-right font-bold text-base transition-all active:scale-[0.97]";
                if (answered) {
                  if (i === currentQuestion.correct) cls += " border-emerald-500 bg-emerald-50 text-emerald-700";
                  else if (i === selectedAnswer) cls += " border-red-500 bg-red-50 text-red-700";
                  else cls += " border-border opacity-40";
                } else {
                  cls += " border-border bg-card hover:border-primary/50";
                }
                const isAiTurn = gameMode === "ai" && currentPlayer === "red";
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={answered || isAiTurn} className={cls}>
                    <span className="ml-2">{["🅰️", "🅱️", "🅲", "🅳"][i]}</span> {opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <p className={`text-center mt-3 font-bold text-sm ${selectedAnswer === currentQuestion.correct ? "text-emerald-600" : "text-red-600"}`}>
                {selectedAnswer === currentQuestion.correct ? "✅ إجابة صحيحة! تم احتلال الخلية" : "❌ إجابة خاطئة! انتقل الدور"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HexBattleGame;
