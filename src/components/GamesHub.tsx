import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Gamepad2, Shuffle, Pencil, Trophy, BookOpen, Calculator, FlaskConical, BookOpenCheck, Landmark, Hexagon } from "lucide-react";
import ConfettiCelebration from "./ConfettiCelebration";
import HexBattleGame from "./HexBattleGame";
import appIcon from "@/assets/app-icon.png";

interface GamesHubProps {
  onBack: () => void;
  onXP: (amount: number) => void;
  onBadge: (badge: string) => void;
  studentName: string;
}

type GameScreen = "subjects" | "menu" | "maze" | "letters" | "hunter" | "hexbattle";

// ─── Subject definitions ───
interface SubjectDef {
  id: string;
  title: string;
  icon: typeof BookOpen;
  color: string;        // gradient class
  accent: string;       // ring/shadow color
  bgAccent: string;     // light bg
}

const subjects: SubjectDef[] = [
  { id: "quran", title: "القرآن الكريم", icon: Landmark, color: "from-green-600 to-emerald-700", accent: "ring-green-500 shadow-green-500/30", bgAccent: "bg-green-50" },
  { id: "islamic", title: "الدراسات الإسلامية", icon: BookOpenCheck, color: "from-teal-500 to-cyan-600", accent: "ring-teal-500 shadow-teal-500/30", bgAccent: "bg-teal-50" },
  { id: "math", title: "الرياضيات", icon: Calculator, color: "from-red-500 to-rose-600", accent: "ring-red-500 shadow-red-500/30", bgAccent: "bg-red-50" },
  { id: "science", title: "العلوم", icon: FlaskConical, color: "from-blue-500 to-indigo-600", accent: "ring-blue-500 shadow-blue-500/30", bgAccent: "bg-blue-50" },
  { id: "arabic", title: "لغتي الخالدة", icon: BookOpen, color: "from-amber-500 to-orange-600", accent: "ring-amber-500 shadow-amber-500/30", bgAccent: "bg-amber-50" },
];

// ─── Game data per subject ───
interface MatchPair { id: number; term: string; definition: string; }
interface SpellingWord { word: string; scrambled: string; }
interface HunterQuestion { q: string; opts: string[]; correct: number; }

const gameData: Record<string, { pairs: MatchPair[]; words: SpellingWord[]; questions: HunterQuestion[] }> = {
  quran: {
    pairs: [
      { id: 1, term: "الإدغام", definition: "إدخال حرف ساكن في حرف متحرك بحيث يصيران حرفاً واحداً" },
      { id: 2, term: "الإخفاء", definition: "النطق بالحرف بصفة بين الإظهار والإدغام" },
      { id: 3, term: "الإظهار", definition: "إخراج كل حرف من مخرجه من غير غنة" },
      { id: 4, term: "المد الطبيعي", definition: "مد بمقدار حركتين لا يتوقف على سبب" },
      { id: 5, term: "القلقلة", definition: "اضطراب الصوت عند النطق بالحرف الساكن" },
      { id: 6, term: "الإقلاب", definition: "قلب النون الساكنة ميماً مع الغنة" },
    ],
    words: [
      { word: "تجويد", scrambled: "ديوجت" },
      { word: "تلاوة", scrambled: "ةوالت" },
      { word: "سورة", scrambled: "ةروس" },
      { word: "ترتيل", scrambled: "ليترت" },
      { word: "مصحف", scrambled: "فحصم" },
      { word: "حفظ", scrambled: "ظفح" },
    ],
    questions: [
      { q: "كم عدد سور القرآن الكريم؟", opts: ["112", "114", "116", "120"], correct: 1 },
      { q: "ما أطول سورة في القرآن؟", opts: ["آل عمران", "النساء", "البقرة", "المائدة"], correct: 2 },
      { q: "ما أقصر سورة في القرآن؟", opts: ["الإخلاص", "الكوثر", "النصر", "الفلق"], correct: 1 },
      { q: "في أي سورة وردت آية الكرسي؟", opts: ["آل عمران", "البقرة", "النساء", "المائدة"], correct: 1 },
      { q: "ما حكم النون الساكنة قبل حرف الباء؟", opts: ["إدغام", "إخفاء", "إقلاب", "إظهار"], correct: 2 },
      { q: "كم عدد أجزاء القرآن الكريم؟", opts: ["20", "25", "30", "40"], correct: 2 },
      { q: "ما السورة التي تعدل ثلث القرآن؟", opts: ["الفاتحة", "الإخلاص", "الكوثر", "النصر"], correct: 1 },
      { q: "ما مقدار المد الطبيعي؟", opts: ["حركة واحدة", "حركتان", "أربع حركات", "ست حركات"], correct: 1 },
      { q: "من هو أول من جمع القرآن؟", opts: ["عمر بن الخطاب", "أبو بكر الصديق", "عثمان بن عفان", "علي بن أبي طالب"], correct: 1 },
      { q: "ما اسم السورة التي تبدأ بـ 'الحمد لله'؟", opts: ["البقرة", "الفاتحة", "الأنعام", "الكهف"], correct: 1 },
    ],
  },
  islamic: {
    pairs: [
      { id: 1, term: "الصلاة", definition: "الركن الثاني من أركان الإسلام" },
      { id: 2, term: "الزكاة", definition: "إخراج مال مخصوص لمستحقيه" },
      { id: 3, term: "الصيام", definition: "الإمساك عن المفطرات من الفجر إلى المغرب" },
      { id: 4, term: "الحج", definition: "قصد بيت الله الحرام لأداء مناسك مخصوصة" },
      { id: 5, term: "الشهادتان", definition: "أشهد أن لا إله إلا الله وأن محمداً رسول الله" },
      { id: 6, term: "الوضوء", definition: "غسل أعضاء مخصوصة بنية رفع الحدث" },
    ],
    words: [
      { word: "صلاة", scrambled: "ةالص" },
      { word: "زكاة", scrambled: "ةاكز" },
      { word: "صيام", scrambled: "مايص" },
      { word: "وضوء", scrambled: "ءوضو" },
      { word: "تيمم", scrambled: "ممیت" },
      { word: "سنة", scrambled: "ةنس" },
    ],
    questions: [
      { q: "كم عدد أركان الإسلام؟", opts: ["3", "4", "5", "6"], correct: 2 },
      { q: "كم عدد الصلوات المفروضة؟", opts: ["3", "4", "5", "7"], correct: 2 },
      { q: "ما أول ما يُحاسب عليه العبد يوم القيامة؟", opts: ["الزكاة", "الصلاة", "الصيام", "الحج"], correct: 1 },
      { q: "في أي شهر يجب صيام رمضان؟", opts: ["شعبان", "رمضان", "شوال", "ذو الحجة"], correct: 1 },
      { q: "أين يقع المسجد الحرام؟", opts: ["المدينة", "مكة", "القدس", "الطائف"], correct: 1 },
      { q: "كم عدد أركان الإيمان؟", opts: ["5", "6", "7", "4"], correct: 1 },
      { q: "من هو خاتم الأنبياء والمرسلين؟", opts: ["إبراهيم", "موسى", "عيسى", "محمد ﷺ"], correct: 3 },
      { q: "ما هو النصاب في زكاة المال؟", opts: ["85 غرام ذهب", "100 غرام ذهب", "50 غرام ذهب", "200 غرام ذهب"], correct: 0 },
      { q: "كم ركعة في صلاة المغرب؟", opts: ["2", "3", "4", "5"], correct: 1 },
      { q: "ما أول ركن من أركان الإسلام؟", opts: ["الصلاة", "الشهادتان", "الزكاة", "الصيام"], correct: 1 },
    ],
  },
  math: {
    pairs: [
      { id: 1, term: "المحيط", definition: "مجموع أطوال أضلاع الشكل الهندسي" },
      { id: 2, term: "المساحة", definition: "قياس المنطقة المحصورة داخل شكل مستوٍ" },
      { id: 3, term: "الكسر", definition: "عدد يُعبّر عن جزء من كل" },
      { id: 4, term: "المعادلة", definition: "جملة رياضية تحتوي على متغير ومساواة" },
      { id: 5, term: "النسبة", definition: "مقارنة بين كميتين بالقسمة" },
      { id: 6, term: "الزاوية القائمة", definition: "زاوية قياسها 90 درجة" },
    ],
    words: [
      { word: "جمع", scrambled: "عمج" },
      { word: "طرح", scrambled: "حرط" },
      { word: "ضرب", scrambled: "برض" },
      { word: "قسمة", scrambled: "ةمسق" },
      { word: "كسر", scrambled: "رسك" },
      { word: "معادلة", scrambled: "ةلداعم" },
    ],
    questions: [
      { q: "ما ناتج 7 × 8 ؟", opts: ["54", "56", "58", "64"], correct: 1 },
      { q: "ما محيط مربع طول ضلعه 5 سم؟", opts: ["15 سم", "20 سم", "25 سم", "10 سم"], correct: 1 },
      { q: "ما مساحة مستطيل طوله 6 وعرضه 4؟", opts: ["10", "20", "24", "30"], correct: 2 },
      { q: "ما قيمة س في: س + 3 = 10؟", opts: ["5", "6", "7", "8"], correct: 2 },
      { q: "كم يساوي ½ + ¼ ؟", opts: ["¾", "⅔", "½", "1"], correct: 0 },
      { q: "ما ناتج 144 ÷ 12 ؟", opts: ["10", "11", "12", "13"], correct: 2 },
      { q: "كم زاوية في المثلث؟", opts: ["2", "3", "4", "5"], correct: 1 },
      { q: "ما مجموع زوايا المثلث؟", opts: ["90°", "180°", "270°", "360°"], correct: 1 },
      { q: "ما العدد الأولي من بين هذه الأعداد؟", opts: ["4", "6", "7", "9"], correct: 2 },
      { q: "ما ناتج 25² ؟", opts: ["525", "625", "725", "425"], correct: 1 },
    ],
  },
  science: {
    pairs: [
      { id: 1, term: "الخلية", definition: "وحدة البناء والوظيفة في الكائن الحي" },
      { id: 2, term: "التبخر", definition: "تحول المادة من الحالة السائلة إلى الغازية" },
      { id: 3, term: "الجاذبية", definition: "قوة تجذب الأجسام نحو مركز الأرض" },
      { id: 4, term: "البناء الضوئي", definition: "عملية تحويل الطاقة الضوئية إلى غذاء في النبات" },
      { id: 5, term: "الذرة", definition: "أصغر جزء من العنصر يحتفظ بخصائصه" },
      { id: 6, term: "النظام البيئي", definition: "تفاعل الكائنات الحية مع بيئتها غير الحية" },
    ],
    words: [
      { word: "خلية", scrambled: "ةيلخ" },
      { word: "ذرة", scrambled: "ةرذ" },
      { word: "طاقة", scrambled: "ةقاط" },
      { word: "كوكب", scrambled: "بكوك" },
      { word: "مغناطيس", scrambled: "سيطانغم" },
      { word: "بركان", scrambled: "ناكرب" },
    ],
    questions: [
      { q: "ما أقرب كوكب للشمس؟", opts: ["الزهرة", "عطارد", "الأرض", "المريخ"], correct: 1 },
      { q: "ما الغاز الذي نتنفسه؟", opts: ["النيتروجين", "ثاني أكسيد الكربون", "الأكسجين", "الهيدروجين"], correct: 2 },
      { q: "كم حالة للمادة؟", opts: ["2", "3", "4", "5"], correct: 1 },
      { q: "ما وحدة قياس القوة؟", opts: ["جول", "نيوتن", "واط", "أمبير"], correct: 1 },
      { q: "ما العضو المسؤول عن ضخ الدم؟", opts: ["الرئة", "الكبد", "القلب", "الكلية"], correct: 2 },
      { q: "ما سرعة الضوء تقريباً؟", opts: ["300 كم/ث", "300,000 كم/ث", "30,000 كم/ث", "3,000 كم/ث"], correct: 1 },
      { q: "أي طبقة تحمي الأرض من الأشعة فوق البنفسجية؟", opts: ["التروبوسفير", "الأوزون", "الميزوسفير", "الثيرموسفير"], correct: 1 },
      { q: "ما أكبر كوكب في المجموعة الشمسية؟", opts: ["زحل", "المشتري", "أورانوس", "نبتون"], correct: 1 },
      { q: "ما العملية التي يصنع بها النبات غذاءه؟", opts: ["التنفس", "البناء الضوئي", "الإخراج", "الامتصاص"], correct: 1 },
      { q: "ما المادة التي تتكون منها العظام بشكل رئيسي؟", opts: ["الحديد", "الكالسيوم", "البوتاسيوم", "الصوديوم"], correct: 1 },
    ],
  },
  arabic: {
    pairs: [
      { id: 1, term: "الفاعل", definition: "اسم مرفوع يدل على من قام بالفعل" },
      { id: 2, term: "المفعول به", definition: "اسم منصوب يقع عليه فعل الفاعل" },
      { id: 3, term: "المبتدأ", definition: "اسم مرفوع يبتدأ به الجملة الاسمية" },
      { id: 4, term: "الخبر", definition: "اسم مرفوع يتمم معنى المبتدأ" },
      { id: 5, term: "الحال", definition: "اسم منصوب يبيّن هيئة الفاعل أو المفعول" },
      { id: 6, term: "التمييز", definition: "اسم منصوب يزيل إبهام ما قبله" },
    ],
    words: [
      { word: "مدرسة", scrambled: "ةسردم" },
      { word: "كتاب", scrambled: "باتك" },
      { word: "معلم", scrambled: "ملعم" },
      { word: "قراءة", scrambled: "ةءارق" },
      { word: "عربية", scrambled: "ةيبرع" },
      { word: "نحو", scrambled: "وحن" },
    ],
    questions: [
      { q: "ما إعراب كلمة 'الطالبُ' في: الطالبُ مجتهدٌ؟", opts: ["مبتدأ مرفوع", "فاعل مرفوع", "خبر مرفوع", "بدل مرفوع"], correct: 0 },
      { q: "ما نوع الجملة: 'يلعب الأطفالُ'؟", opts: ["جملة اسمية", "جملة فعلية", "جملة شرطية", "شبه جملة"], correct: 1 },
      { q: "ما علامة نصب جمع المؤنث السالم؟", opts: ["الفتحة", "الكسرة", "الياء", "الألف"], correct: 1 },
      { q: "ما الحرف الناسخ في: 'إنَّ العلمَ نورٌ'؟", opts: ["إنَّ", "العلم", "نور", "لا يوجد"], correct: 0 },
      { q: "ما نوع الهمزة في كلمة 'استخرج'؟", opts: ["همزة قطع", "همزة وصل", "همزة متوسطة", "همزة متطرفة"], correct: 1 },
      { q: "ما إعراب 'سعيداً' في: جاء الطالبُ سعيداً؟", opts: ["مفعول به", "حال منصوب", "تمييز", "خبر"], correct: 1 },
      { q: "ما الفعل المضارع المرفوع؟", opts: ["لم يكتبْ", "يكتبُ", "اكتبْ", "لن يكتبَ"], correct: 1 },
      { q: "ما جمع كلمة 'كتاب'؟", opts: ["كتب", "كتابات", "كُتّاب", "كتب وكتابات"], correct: 0 },
      { q: "ما المفعول المطلق في: 'ضربتُ ضرباً شديداً'؟", opts: ["ضربتُ", "ضرباً", "شديداً", "لا يوجد"], correct: 1 },
      { q: "ما أداة الاستفهام التي تسأل عن المكان؟", opts: ["متى", "كيف", "أين", "لماذا"], correct: 2 },
    ],
  },
};

const GamesHub = ({ onBack, onXP, onBadge, studentName }: GamesHubProps) => {
  const [gameScreen, setGameScreen] = useState<GameScreen>("subjects");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [celebrate, setCelebrate] = useState(false);

  const currentSubject = subjects.find(s => s.id === selectedSubject);
  const data = gameData[selectedSubject];

  // ─── Maze (Matching) state ───
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<MatchPair[]>([]);

  // ─── Letters (Spelling) state ───
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [spellingInput, setSpellingInput] = useState("");
  const [spellingScore, setSpellingScore] = useState(0);
  const [spellingDone, setSpellingDone] = useState(false);
  const [spellingFeedback, setSpellingFeedback] = useState<"correct" | "wrong" | null>(null);

  // ─── Hunter state ───
  const [hunterQ, setHunterQ] = useState(0);
  const [hunterScore, setHunterScore] = useState(0);
  const [hunterAnswered, setHunterAnswered] = useState(false);
  const [hunterSelected, setHunterSelected] = useState<number | null>(null);
  const [hunterDone, setHunterDone] = useState(false);

  // Falling animation for hunter
  const [fallingItems, setFallingItems] = useState<{ id: number; x: number; delay: number }[]>([]);

  const triggerCelebrate = useCallback(() => {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 4000);
  }, []);

  const getAccentClasses = () => {
    if (!currentSubject) return { ring: "ring-primary", shadow: "shadow-emerald", gradient: "gradient-emerald", bg: "bg-muted" };
    return { ring: currentSubject.accent.split(" ")[0], shadow: currentSubject.accent, gradient: `bg-gradient-to-br ${currentSubject.color}`, bg: currentSubject.bgAccent };
  };
  const accent = getAccentClasses();

  const selectSubject = (id: string) => {
    setSelectedSubject(id);
    setGameScreen("menu");
  };

  const startMaze = () => {
    if (!data) return;
    const shuffled = [...data.pairs].sort(() => Math.random() - 0.5);
    setShuffledDefs(shuffled);
    setMatchedPairs([]);
    setSelectedTerm(null);
    setGameScreen("maze");
  };

  const startLetters = () => {
    setSpellingIndex(0);
    setSpellingScore(0);
    setSpellingDone(false);
    setSpellingInput("");
    setSpellingFeedback(null);
    setGameScreen("letters");
  };

  const startHunter = () => {
    setHunterQ(0);
    setHunterScore(0);
    setHunterDone(false);
    setHunterAnswered(false);
    setHunterSelected(null);
    setGameScreen("hunter");
  };

  // Generate falling animation items for hunter
  useEffect(() => {
    if (gameScreen === "hunter" && !hunterDone && data) {
      const items = data.questions[hunterQ]?.opts.map((_, i) => ({
        id: i,
        x: 10 + Math.random() * 70,
        delay: i * 0.3,
      })) || [];
      setFallingItems(items);
    }
  }, [gameScreen, hunterQ, hunterDone, data]);

  const handleTermClick = (id: number) => {
    if (matchedPairs.includes(id)) return;
    setSelectedTerm(id);
  };

  const handleDefClick = (pair: MatchPair) => {
    if (selectedTerm === null || matchedPairs.includes(pair.id)) return;
    if (selectedTerm === pair.id) {
      const newMatched = [...matchedPairs, pair.id];
      setMatchedPairs(newMatched);
      setSelectedTerm(null);
      if (data && newMatched.length === data.pairs.length) {
        onXP(100);
        onBadge("وسام العبقري");
        triggerCelebrate();
      }
    } else {
      setSelectedTerm(null);
    }
  };

  const checkSpelling = () => {
    if (!data) return;
    const isCorrect = spellingInput.trim() === data.words[spellingIndex].word;
    if (isCorrect) {
      setSpellingScore(s => s + 1);
      setSpellingFeedback("correct");
    } else {
      setSpellingFeedback("wrong");
    }
    setTimeout(() => {
      setSpellingFeedback(null);
      setSpellingInput("");
      if (spellingIndex + 1 >= data.words.length) {
        const finalScore = isCorrect ? spellingScore + 1 : spellingScore;
        setSpellingDone(true);
        if (finalScore === data.words.length) {
          onXP(100);
          onBadge("وسام العبقري");
          triggerCelebrate();
        } else {
          onXP(Math.round((finalScore / data.words.length) * 50));
        }
      } else {
        setSpellingIndex(i => i + 1);
      }
    }, 1000);
  };

  const handleHunterAnswer = (idx: number) => {
    if (hunterAnswered || !data) return;
    setHunterSelected(idx);
    setHunterAnswered(true);
    if (idx === data.questions[hunterQ].correct) {
      setHunterScore(s => s + 1);
    }
  };

  const nextHunterQ = () => {
    if (!data) return;
    if (hunterQ + 1 >= data.questions.length) {
      setHunterDone(true);
      const finalScore = hunterSelected === data.questions[hunterQ].correct ? hunterScore : hunterScore;
      if (finalScore === data.questions.length) {
        onXP(100);
        onBadge("وسام العبقري");
        triggerCelebrate();
      } else {
        onXP(Math.round((finalScore / data.questions.length) * 50));
      }
    } else {
      setHunterQ(q => q + 1);
      setHunterAnswered(false);
      setHunterSelected(null);
    }
  };

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 self-start">
      <ArrowRight className="w-5 h-5" />
      <span className="font-bold text-lg">رجوع</span>
    </button>
  );

  // ─── Subject Selection Screen ───
  if (gameScreen === "subjects") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <BackButton onClick={onBack} />
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-gold shadow-gold mb-4">
            <Gamepad2 className="w-10 h-10 text-gold-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-heading mb-2">🎮 ركن العباقرة</h1>
          <p className="text-muted-foreground text-xl">اختر المادة للبدء في التحدي!</p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
          {subjects.map((sub, i) => (
            <button
              key={sub.id}
              onClick={() => selectSubject(sub.id)}
              className="group neu-card p-5 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] animate-scale-in cursor-pointer"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${sub.color} shadow-lg mb-3 transition-transform duration-300 group-hover:scale-110`}>
                <sub.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-base font-extrabold text-heading leading-tight">{sub.title}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Games Menu for selected subject ───
  if (gameScreen === "menu") {
    const gamesMenu = [
      { id: "maze", title: "🧩 لغز المتاهة", description: "طابق المصطلح بتعريفه الصحيح لفتح الأبواب", icon: Shuffle, start: startMaze },
      { id: "letters", title: "🔤 خلية الحروف", description: "أعد ترتيب الحروف لتكوين المصطلح الصحيح", icon: Pencil, start: startLetters },
      { id: "hunter", title: "🎯 صائد العباقرة", description: "اصطد الإجابات الصحيحة المتساقطة!", icon: Trophy, start: startHunter },
    ];

    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <ConfettiCelebration trigger={celebrate} />
        <BackButton onClick={() => setGameScreen("subjects")} />
        <div className="text-center mb-8 animate-slide-up">
          {currentSubject && (
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${currentSubject.color} shadow-lg mb-4`}>
              <currentSubject.icon className="w-10 h-10 text-white" />
            </div>
          )}
          <h2 className="text-3xl font-extrabold text-heading mb-2">{currentSubject?.title}</h2>
          <p className="text-muted-foreground text-xl">اختر اللعبة وابدأ التحدي!</p>
        </div>
        <div className="max-w-lg mx-auto w-full space-y-5">
          {gamesMenu.map((game, i) => (
            <button
              key={game.id}
              onClick={game.start}
              className={`w-full neu-card p-5 text-right flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-scale-in cursor-pointer`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${currentSubject?.color} shadow-lg flex items-center justify-center`}>
                <game.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-heading">{game.title}</h3>
                <p className="text-muted-foreground text-base mt-1">{game.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Maze Game (Matching) ───
  if (gameScreen === "maze" && data) {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <ConfettiCelebration trigger={celebrate} />
        <BackButton onClick={() => setGameScreen("menu")} />
        <h2 className="text-2xl font-extrabold text-heading text-center mb-2">🧩 لغز المتاهة — {currentSubject?.title}</h2>
        <p className="text-muted-foreground text-center mb-6 text-lg">اختر المصطلح ثم اضغط على تعريفه لفتح الباب</p>

        {matchedPairs.length === data.pairs.length ? (
          <div className="text-center py-10 animate-bounce-in">
            <img src={appIcon} alt="وسام العبقري" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-gold" />
            <p className="text-3xl font-extrabold text-foreground mb-2">🏆 أحسنت! فتحت كل الأبواب!</p>
            <p className="text-gold text-xl font-bold">+100 XP + وسام العبقري</p>
            <button onClick={startMaze} className={`mt-6 py-3 px-8 rounded-2xl bg-gradient-to-br ${currentSubject?.color} text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all`}>إعادة اللعبة</button>
          </div>
        ) : (
          <div className="max-w-lg mx-auto w-full space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {data.pairs.map((p) => (
                <button
                  key={`t-${p.id}`}
                  onClick={() => handleTermClick(p.id)}
                  disabled={matchedPairs.includes(p.id)}
                  className={`neu-btn p-4 text-center font-bold text-lg transition-all active:scale-[0.97] ${matchedPairs.includes(p.id) ? "opacity-30" : selectedTerm === p.id ? `ring-3 ${currentSubject?.accent}` : ""}`}
                >
                  {p.term}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {shuffledDefs.map((p) => (
                <button
                  key={`d-${p.id}`}
                  onClick={() => handleDefClick(p)}
                  disabled={matchedPairs.includes(p.id)}
                  className={`w-full neu-btn p-4 text-right text-base transition-all active:scale-[0.98] ${matchedPairs.includes(p.id) ? "opacity-30 bg-success/10" : `hover:${currentSubject?.accent}`}`}
                >
                  {p.definition}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Letters Game (Spelling) ───
  if (gameScreen === "letters" && data) {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <ConfettiCelebration trigger={celebrate} />
        <BackButton onClick={() => setGameScreen("menu")} />
        <h2 className="text-2xl font-extrabold text-heading text-center mb-2">🔤 خلية الحروف — {currentSubject?.title}</h2>

        {spellingDone ? (
          <div className="text-center py-10 animate-bounce-in">
            {spellingScore === data.words.length && <img src={appIcon} alt="وسام" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-gold" />}
            <p className="text-3xl font-extrabold text-foreground mb-2">النتيجة: {spellingScore}/{data.words.length}</p>
            <p className="text-gold text-xl font-bold mb-6">
              {spellingScore === data.words.length ? "🏆 مبروك! وسام العبقري!" : `+${Math.round((spellingScore / data.words.length) * 50)} XP`}
            </p>
            <button onClick={startLetters} className={`py-3 px-8 rounded-2xl bg-gradient-to-br ${currentSubject?.color} text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all`}>إعادة اللعبة</button>
          </div>
        ) : (
          <div className="max-w-md mx-auto w-full text-center space-y-6 mt-6">
            <p className="text-muted-foreground text-lg">الكلمة {spellingIndex + 1} من {data.words.length}</p>
            <div className={`neu-card p-8 animate-scale-in ${spellingFeedback === "correct" ? "ring-4 ring-success" : spellingFeedback === "wrong" ? "ring-4 ring-destructive" : ""}`}>
              <p className="text-4xl font-extrabold text-gold tracking-widest mb-4">{data.words[spellingIndex].scrambled}</p>
              <p className="text-muted-foreground text-lg">أعد ترتيب الحروف لتكوين المصطلح الصحيح</p>
            </div>
            <input
              type="text"
              value={spellingInput}
              onChange={(e) => setSpellingInput(e.target.value)}
              placeholder="اكتب الكلمة هنا"
              className="w-full px-6 py-4 rounded-2xl border-2 border-input bg-card text-foreground text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              dir="rtl"
            />
            <button onClick={checkSpelling} disabled={!spellingInput.trim()} className={`w-full py-4 rounded-2xl bg-gradient-to-br ${currentSubject?.color} text-white font-bold text-xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all`}>
              تحقق ✓
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Hunter Game ───
  if (gameScreen === "hunter" && data) {
    const hq = data.questions[hunterQ];
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <ConfettiCelebration trigger={celebrate} />
        <BackButton onClick={() => setGameScreen("menu")} />
        <h2 className="text-2xl font-extrabold text-heading text-center mb-4">🎯 صائد العباقرة — {currentSubject?.title}</h2>

        {hunterDone ? (
          <div className="text-center py-10 animate-bounce-in">
            {hunterScore === data.questions.length && <img src={appIcon} alt="وسام" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-gold" />}
            <p className="text-3xl font-extrabold text-foreground mb-2">النتيجة: {hunterScore}/{data.questions.length}</p>
            <p className="text-gold text-xl font-bold mb-6">
              {hunterScore === data.questions.length ? "🏆 مبروك! وسام العبقري!" : `+${Math.round((hunterScore / data.questions.length) * 50)} XP`}
            </p>
            <button onClick={startHunter} className={`py-3 px-8 rounded-2xl bg-gradient-to-br ${currentSubject?.color} text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all`}>إعادة اللعبة</button>
          </div>
        ) : (
          <div className="max-w-lg mx-auto w-full space-y-4">
            <div className="flex justify-between text-muted-foreground text-base font-bold">
              <span>السؤال {hunterQ + 1}/{data.questions.length}</span>
              <span className="text-gold">🎯 {hunterScore} اصطياد</span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${currentSubject?.color} transition-all duration-300`} style={{ width: `${((hunterQ + (hunterAnswered ? 1 : 0)) / data.questions.length) * 100}%` }} />
            </div>
            <div className="neu-card p-6">
              <p className="text-xl font-extrabold text-foreground leading-9">{hq.q}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 relative">
              {hq.opts.map((opt, i) => {
                const falling = fallingItems.find(f => f.id === i);
                let cls = "neu-btn p-4 text-right text-lg font-bold transition-all active:scale-[0.98]";
                if (hunterAnswered) {
                  if (i === hq.correct) cls += " ring-3 ring-success bg-success/10";
                  else if (i === hunterSelected) cls += " ring-3 ring-destructive bg-destructive/10";
                  else cls += " opacity-40";
                } else {
                  cls += ` hover:shadow-lg`;
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleHunterAnswer(i)}
                    disabled={hunterAnswered}
                    className={cls}
                    style={{
                      animation: !hunterAnswered ? `fallIn 0.6s ease-out ${falling?.delay || 0}s both` : undefined,
                    }}
                  >
                    <span className={`font-extrabold ml-3`} style={{ color: currentSubject ? undefined : undefined }}>
                      {["🅰️", "🅱️", "🅲", "🅳"][i]}
                    </span>{" "}
                    {opt}
                  </button>
                );
              })}
            </div>
            {hunterAnswered && (
              <button onClick={nextHunterQ} className={`w-full py-4 rounded-2xl bg-gradient-to-br ${currentSubject?.color} text-white font-bold text-xl shadow-lg active:scale-[0.98] transition-all animate-slide-up`}>
                {hunterQ + 1 >= data.questions.length ? "عرض النتيجة" : "اصطد التالي! 🎯"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default GamesHub;
