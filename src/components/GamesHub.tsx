import { useState } from "react";
import { ArrowRight, Gamepad2, Shuffle, Pencil, Trophy } from "lucide-react";
import ConfettiCelebration from "./ConfettiCelebration";
import appIcon from "@/assets/app-icon.png";

interface GamesHubProps {
  onBack: () => void;
  onXP: (amount: number) => void;
  onBadge: (badge: string) => void;
}

type GameScreen = "menu" | "matching" | "spelling" | "million";

interface MatchPair {
  id: number;
  term: string;
  definition: string;
}

const grammarPairs: MatchPair[] = [
  { id: 1, term: "الفاعل", definition: "اسم مرفوع يدل على من قام بالفعل" },
  { id: 2, term: "المفعول به", definition: "اسم منصوب يقع عليه فعل الفاعل" },
  { id: 3, term: "المبتدأ", definition: "اسم مرفوع يبتدأ به الجملة الاسمية" },
  { id: 4, term: "الخبر", definition: "اسم مرفوع يتمم معنى المبتدأ" },
  { id: 5, term: "الحال", definition: "اسم منصوب يبيّن هيئة الفاعل أو المفعول" },
  { id: 6, term: "التمييز", definition: "اسم منصوب يزيل إبهام ما قبله" },
];

const spellingWords = [
  { word: "مدرسة", scrambled: "ةسردم" },
  { word: "كتاب", scrambled: "باتك" },
  { word: "معلم", scrambled: "ملعم" },
  { word: "قراءة", scrambled: "ةءارق" },
  { word: "عربية", scrambled: "ةيبرع" },
  { word: "نحو", scrambled: "وحن" },
];

const millionQuestions = [
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
];

const GamesHub = ({ onBack, onXP, onBadge }: GamesHubProps) => {
  const [gameScreen, setGameScreen] = useState<GameScreen>("menu");
  const [celebrate, setCelebrate] = useState(false);

  // Matching game state
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<MatchPair[]>([]);

  // Spelling game state
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [spellingInput, setSpellingInput] = useState("");
  const [spellingScore, setSpellingScore] = useState(0);
  const [spellingDone, setSpellingDone] = useState(false);
  const [spellingFeedback, setSpellingFeedback] = useState<"correct" | "wrong" | null>(null);

  // Million game state
  const [millionQ, setMillionQ] = useState(0);
  const [millionScore, setMillionScore] = useState(0);
  const [millionAnswered, setMillionAnswered] = useState(false);
  const [millionSelected, setMillionSelected] = useState<number | null>(null);
  const [millionDone, setMillionDone] = useState(false);

  const startMatching = () => {
    const shuffled = [...grammarPairs].sort(() => Math.random() - 0.5);
    setShuffledDefs(shuffled);
    setMatchedPairs([]);
    setSelectedTerm(null);
    setGameScreen("matching");
  };

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
      if (newMatched.length === grammarPairs.length) {
        onXP(100);
        onBadge("وسام العبقري");
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 4000);
      }
    } else {
      setSelectedTerm(null);
    }
  };

  const checkSpelling = () => {
    if (spellingInput.trim() === spellingWords[spellingIndex].word) {
      setSpellingScore((s) => s + 1);
      setSpellingFeedback("correct");
    } else {
      setSpellingFeedback("wrong");
    }
    setTimeout(() => {
      setSpellingFeedback(null);
      setSpellingInput("");
      if (spellingIndex + 1 >= spellingWords.length) {
        const finalScore = spellingInput.trim() === spellingWords[spellingIndex].word ? spellingScore + 1 : spellingScore;
        setSpellingDone(true);
        if (finalScore === spellingWords.length) {
          onXP(100);
          onBadge("وسام العبقري");
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 4000);
        } else {
          onXP(Math.round((finalScore / spellingWords.length) * 50));
        }
      } else {
        setSpellingIndex((i) => i + 1);
      }
    }, 1000);
  };

  const handleMillionAnswer = (idx: number) => {
    if (millionAnswered) return;
    setMillionSelected(idx);
    setMillionAnswered(true);
    if (idx === millionQuestions[millionQ].correct) {
      setMillionScore((s) => s + 1);
    }
  };

  const nextMillionQ = () => {
    if (millionQ + 1 >= millionQuestions.length) {
      setMillionDone(true);
      const finalScore = millionSelected === millionQuestions[millionQ].correct ? millionScore : millionScore;
      if (finalScore === millionQuestions.length) {
        onXP(100);
        onBadge("وسام العبقري");
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 4000);
      } else {
        onXP(Math.round((finalScore / millionQuestions.length) * 50));
      }
    } else {
      setMillionQ((q) => q + 1);
      setMillionAnswered(false);
      setMillionSelected(null);
    }
  };

  const games = [
    {
      id: "matching",
      title: "مطابقة القواعد",
      description: "طابق المصطلح النحوي بتعريفه الصحيح",
      icon: Shuffle,
      color: "gradient-emerald",
      shadowClass: "shadow-emerald",
    },
    {
      id: "spelling",
      title: "تحدي الإملاء",
      description: "أعد ترتيب الحروف لتكوين الكلمة الصحيحة",
      icon: Pencil,
      color: "gradient-gold",
      shadowClass: "shadow-gold",
    },
    {
      id: "million",
      title: "من سيربح المليون",
      description: "أجب عن 10 أسئلة نحوية واربح النقاط",
      icon: Trophy,
      color: "gradient-emerald",
      shadowClass: "shadow-emerald",
    },
  ];

  if (gameScreen === "matching") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <ConfettiCelebration trigger={celebrate} />
        <button onClick={() => setGameScreen("menu")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 self-start">
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold text-lg">رجوع</span>
        </button>
        <h2 className="text-2xl font-extrabold text-heading text-center mb-2">🧩 مطابقة القواعد</h2>
        <p className="text-muted-foreground text-center mb-6 text-lg">اختر المصطلح ثم اضغط على تعريفه</p>
        {matchedPairs.length === grammarPairs.length ? (
          <div className="text-center py-10 animate-bounce-in">
            <img src={appIcon} alt="وسام العبقري" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-gold" />
            <p className="text-3xl font-extrabold text-foreground mb-2">🏆 أحسنت! أنجزت اللعبة!</p>
            <p className="text-gold text-xl font-bold">+100 XP + وسام العبقري</p>
            <button onClick={startMatching} className="mt-6 py-3 px-8 rounded-2xl gradient-emerald text-primary-foreground font-bold text-lg shadow-emerald active:scale-[0.98] transition-all">إعادة اللعبة</button>
          </div>
        ) : (
          <div className="max-w-lg mx-auto w-full space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {grammarPairs.map((p) => (
                <button
                  key={`t-${p.id}`}
                  onClick={() => handleTermClick(p.id)}
                  disabled={matchedPairs.includes(p.id)}
                  className={`neu-btn p-4 text-center font-bold text-lg transition-all active:scale-[0.97] ${matchedPairs.includes(p.id) ? "opacity-30" : selectedTerm === p.id ? "ring-3 ring-primary shadow-emerald" : ""}`}
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
                  className={`w-full neu-btn p-4 text-right text-base transition-all active:scale-[0.98] ${matchedPairs.includes(p.id) ? "opacity-30 bg-success/10" : "hover:shadow-emerald"}`}
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

  if (gameScreen === "spelling") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <ConfettiCelebration trigger={celebrate} />
        <button onClick={() => setGameScreen("menu")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 self-start">
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold text-lg">رجوع</span>
        </button>
        <h2 className="text-2xl font-extrabold text-heading text-center mb-2">✏️ تحدي الإملاء</h2>

        {spellingDone ? (
          <div className="text-center py-10 animate-bounce-in">
            {spellingScore === spellingWords.length && <img src={appIcon} alt="وسام" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-gold" />}
            <p className="text-3xl font-extrabold text-foreground mb-2">النتيجة: {spellingScore}/{spellingWords.length}</p>
            <button onClick={() => { setSpellingIndex(0); setSpellingScore(0); setSpellingDone(false); setSpellingInput(""); }} className="mt-6 py-3 px-8 rounded-2xl gradient-emerald text-primary-foreground font-bold text-lg shadow-emerald active:scale-[0.98] transition-all">إعادة اللعبة</button>
          </div>
        ) : (
          <div className="max-w-md mx-auto w-full text-center space-y-6 mt-6">
            <p className="text-muted-foreground text-lg">الكلمة {spellingIndex + 1} من {spellingWords.length}</p>
            <div className={`neu-card p-8 animate-scale-in ${spellingFeedback === "correct" ? "ring-4 ring-success" : spellingFeedback === "wrong" ? "ring-4 ring-destructive" : ""}`}>
              <p className="text-4xl font-extrabold text-gold tracking-widest mb-4">{spellingWords[spellingIndex].scrambled}</p>
              <p className="text-muted-foreground text-lg">أعد ترتيب الحروف لتكوين الكلمة الصحيحة</p>
            </div>
            <input
              type="text"
              value={spellingInput}
              onChange={(e) => setSpellingInput(e.target.value)}
              placeholder="اكتب الكلمة هنا"
              className="w-full px-6 py-4 rounded-2xl border-2 border-input bg-card text-foreground text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              dir="rtl"
            />
            <button onClick={checkSpelling} disabled={!spellingInput.trim()} className="w-full py-4 rounded-2xl gradient-emerald text-primary-foreground font-bold text-xl shadow-emerald disabled:opacity-50 active:scale-[0.98] transition-all">
              تحقق ✓
            </button>
          </div>
        )}
      </div>
    );
  }

  if (gameScreen === "million") {
    const mq = millionQuestions[millionQ];
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <ConfettiCelebration trigger={celebrate} />
        <button onClick={() => setGameScreen("menu")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 self-start">
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold text-lg">رجوع</span>
        </button>
        <h2 className="text-2xl font-extrabold text-foreground text-center mb-4">💰 من سيربح المليون</h2>

        {millionDone ? (
          <div className="text-center py-10 animate-bounce-in">
            {millionScore === millionQuestions.length && <img src={appIcon} alt="وسام" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-gold" />}
            <p className="text-3xl font-extrabold text-foreground mb-2">النتيجة: {millionScore}/{millionQuestions.length}</p>
            <p className="text-gold text-xl font-bold mb-6">{millionScore === millionQuestions.length ? "🏆 مبروك! وسام العبقري!" : `+${Math.round((millionScore / millionQuestions.length) * 50)} XP`}</p>
            <button onClick={() => { setMillionQ(0); setMillionScore(0); setMillionDone(false); setMillionAnswered(false); setMillionSelected(null); }} className="py-3 px-8 rounded-2xl gradient-gold text-gold-foreground font-bold text-lg shadow-gold active:scale-[0.98] transition-all">إعادة اللعبة</button>
          </div>
        ) : (
          <div className="max-w-lg mx-auto w-full space-y-4">
            <div className="flex justify-between text-muted-foreground text-base font-bold">
              <span>السؤال {millionQ + 1}/{millionQuestions.length}</span>
              <span className="text-gold">💰 {millionScore * 100000} ريال</span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full gradient-gold transition-all duration-300" style={{ width: `${((millionQ + (millionAnswered ? 1 : 0)) / millionQuestions.length) * 100}%` }} />
            </div>
            <div className="neu-card p-6">
              <p className="text-xl font-extrabold text-foreground leading-9">{mq.q}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {mq.opts.map((opt, i) => {
                let cls = "neu-btn p-4 text-right text-lg font-bold transition-all active:scale-[0.98]";
                if (millionAnswered) {
                  if (i === mq.correct) cls += " ring-3 ring-success bg-success/10";
                  else if (i === millionSelected) cls += " ring-3 ring-destructive bg-destructive/10";
                  else cls += " opacity-40";
                } else {
                  cls += " hover:shadow-gold";
                }
                return (
                  <button key={i} onClick={() => handleMillionAnswer(i)} disabled={millionAnswered} className={cls}>
                    <span className="text-gold font-extrabold ml-3">{["أ", "ب", "ج", "د"][i]}</span> {opt}
                  </button>
                );
              })}
            </div>
            {millionAnswered && (
              <button onClick={nextMillionQ} className="w-full py-4 rounded-2xl gradient-gold text-gold-foreground font-bold text-xl shadow-gold active:scale-[0.98] transition-all animate-slide-up">
                {millionQ + 1 >= millionQuestions.length ? "عرض النتيجة" : "السؤال التالي"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-gold shadow-gold mb-4">
          <Gamepad2 className="w-10 h-10 text-gold-foreground" />
        </div>
        <h2 className="text-3xl font-extrabold text-heading mb-2">🎮 ألعاب العباقرة</h2>
        <p className="text-muted-foreground text-xl">تعلّم النحو والإملاء بطريقة ممتعة!</p>
      </div>

      <div className="max-w-lg mx-auto w-full space-y-5">
        {games.map((game, i) => (
          <button
            key={game.id}
            onClick={() => {
              if (game.id === "matching") startMatching();
              else if (game.id === "spelling") { setSpellingIndex(0); setSpellingScore(0); setSpellingDone(false); setSpellingInput(""); setGameScreen("spelling"); }
              else { setMillionQ(0); setMillionScore(0); setMillionDone(false); setMillionAnswered(false); setMillionSelected(null); setGameScreen("million"); }
            }}
            className="w-full neu-card p-6 flex items-center gap-5 transition-all hover:shadow-emerald-lg active:scale-[0.98] animate-scale-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`w-16 h-16 rounded-2xl ${game.color} ${game.shadowClass} flex items-center justify-center shrink-0`}>
              <game.icon className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-right flex-1">
              <h3 className="text-xl font-extrabold text-foreground">{game.title}</h3>
              <p className="text-muted-foreground text-base">{game.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GamesHub;
