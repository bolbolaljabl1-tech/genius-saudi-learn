import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Gamepad2, Shuffle, Pencil, Trophy, BookOpen, Calculator, FlaskConical, BookOpenCheck, Landmark, Hexagon, Globe, Monitor, Palette, Dumbbell, Heart, Languages, Zap, Target } from "lucide-react";
import ConfettiCelebration from "./ConfettiCelebration";
import HexBattleGame from "./HexBattleGame";
import appIcon from "@/assets/app-icon.png";

interface GamesHubProps {
  onBack: () => void;
  onXP: (amount: number) => void;
  onBadge: (badge: string) => void;
  studentName: string;
}

type GameScreen = "subjects" | "menu" | "maze" | "letters" | "hunter" | "hexbattle" | "challenge-mode";

// ─── Subject definitions ───
interface SubjectDef {
  id: string;
  title: string;
  icon: typeof BookOpen;
  color: string;
  accent: string;
  bgAccent: string;
}

const subjects: SubjectDef[] = [
  { id: "quran", title: "القرآن الكريم", icon: Landmark, color: "from-green-600 to-emerald-700", accent: "ring-green-500 shadow-green-500/30", bgAccent: "bg-green-50" },
  { id: "islamic", title: "الدراسات الإسلامية", icon: BookOpenCheck, color: "from-teal-500 to-cyan-600", accent: "ring-teal-500 shadow-teal-500/30", bgAccent: "bg-teal-50" },
  { id: "math", title: "الرياضيات", icon: Calculator, color: "from-red-500 to-rose-600", accent: "ring-red-500 shadow-red-500/30", bgAccent: "bg-red-50" },
  { id: "science", title: "العلوم", icon: FlaskConical, color: "from-blue-500 to-indigo-600", accent: "ring-blue-500 shadow-blue-500/30", bgAccent: "bg-blue-50" },
  { id: "arabic", title: "لغتي الخالدة", icon: BookOpen, color: "from-amber-500 to-orange-600", accent: "ring-amber-500 shadow-amber-500/30", bgAccent: "bg-amber-50" },
  { id: "social", title: "الدراسات الاجتماعية", icon: Globe, color: "from-sky-500 to-blue-600", accent: "ring-sky-500 shadow-sky-500/30", bgAccent: "bg-sky-50" },
  { id: "digital", title: "المهارات الرقمية", icon: Monitor, color: "from-indigo-500 to-blue-600", accent: "ring-indigo-500 shadow-indigo-500/30", bgAccent: "bg-indigo-50" },
  { id: "art", title: "التربية الفنية", icon: Palette, color: "from-pink-500 to-rose-600", accent: "ring-pink-500 shadow-pink-500/30", bgAccent: "bg-pink-50" },
  { id: "pe", title: "التربية البدنية", icon: Dumbbell, color: "from-green-500 to-lime-600", accent: "ring-green-500 shadow-green-500/30", bgAccent: "bg-green-50" },
  { id: "life", title: "المهارات الحياتية", icon: Heart, color: "from-red-400 to-pink-500", accent: "ring-red-400 shadow-red-400/30", bgAccent: "bg-red-50" },
  { id: "english", title: "اللغة الإنجليزية", icon: Languages, color: "from-blue-500 to-indigo-600", accent: "ring-blue-500 shadow-blue-500/30", bgAccent: "bg-blue-50" },
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
  social: {
    pairs: [
      { id: 1, term: "خط الاستواء", definition: "خط وهمي يقسم الأرض إلى نصفين شمالي وجنوبي" },
      { id: 2, term: "القارة", definition: "مساحة واسعة من اليابسة تضم عدة دول" },
      { id: 3, term: "المناخ", definition: "حالة الجو السائدة في منطقة لفترة طويلة" },
      { id: 4, term: "الخريطة", definition: "تمثيل مصغر لسطح الأرض أو جزء منه" },
      { id: 5, term: "السكان", definition: "عدد الأفراد الذين يعيشون في منطقة معينة" },
      { id: 6, term: "الهجرة", definition: "انتقال الأفراد من مكان إلى آخر للإقامة" },
    ],
    words: [
      { word: "خريطة", scrambled: "ةطيرخ" },
      { word: "قارة", scrambled: "ةراق" },
      { word: "مناخ", scrambled: "خانم" },
      { word: "تضاريس", scrambled: "سيراضت" },
      { word: "وطن", scrambled: "نطو" },
      { word: "حدود", scrambled: "دودح" },
    ],
    questions: [
      { q: "كم عدد قارات العالم؟", opts: ["5", "6", "7", "8"], correct: 2 },
      { q: "ما أكبر قارة في العالم؟", opts: ["أفريقيا", "آسيا", "أوروبا", "أمريكا الشمالية"], correct: 1 },
      { q: "ما عاصمة المملكة العربية السعودية؟", opts: ["جدة", "مكة", "الرياض", "المدينة"], correct: 2 },
      { q: "ما أطول نهر في العالم؟", opts: ["الأمازون", "النيل", "المسيسيبي", "دجلة"], correct: 1 },
      { q: "في أي قارة تقع مصر؟", opts: ["آسيا", "أوروبا", "أفريقيا", "أمريكا"], correct: 2 },
      { q: "ما أكبر محيط في العالم؟", opts: ["الأطلسي", "الهندي", "الهادئ", "المتجمد"], correct: 2 },
      { q: "ما الجهة التي تشرق منها الشمس؟", opts: ["الغرب", "الشمال", "الجنوب", "الشرق"], correct: 3 },
      { q: "ما أصغر قارة في العالم؟", opts: ["أوروبا", "أستراليا", "أنتاركتيكا", "أمريكا الجنوبية"], correct: 1 },
      { q: "كم عدد مناطق المملكة الإدارية؟", opts: ["10", "13", "15", "20"], correct: 1 },
      { q: "ما البحر الذي يفصل بين آسيا وأفريقيا؟", opts: ["المتوسط", "الأحمر", "العربي", "قزوين"], correct: 1 },
    ],
  },
  digital: {
    pairs: [
      { id: 1, term: "البرمجة", definition: "كتابة تعليمات يفهمها الحاسب لتنفيذ مهام محددة" },
      { id: 2, term: "الخوارزمية", definition: "خطوات مرتبة لحل مشكلة أو إنجاز مهمة" },
      { id: 3, term: "قاعدة البيانات", definition: "مجموعة منظمة من البيانات المخزنة إلكترونياً" },
      { id: 4, term: "الشبكة", definition: "ربط أجهزة الحاسب ببعضها لتبادل البيانات" },
      { id: 5, term: "نظام التشغيل", definition: "برنامج يدير موارد الحاسب وتطبيقاته" },
      { id: 6, term: "الأمن السيبراني", definition: "حماية الأنظمة والشبكات من الهجمات الإلكترونية" },
    ],
    words: [
      { word: "حاسوب", scrambled: "بوساح" },
      { word: "برمجة", scrambled: "ةجمرب" },
      { word: "شبكة", scrambled: "ةكبش" },
      { word: "بيانات", scrambled: "تانايب" },
      { word: "ملف", scrambled: "فلم" },
      { word: "طابعة", scrambled: "ةعباط" },
    ],
    questions: [
      { q: "ما وحدة قياس سعة التخزين الأساسية؟", opts: ["بت", "بايت", "هرتز", "بكسل"], correct: 1 },
      { q: "كم بت في البايت الواحد؟", opts: ["4", "8", "16", "32"], correct: 1 },
      { q: "ما اختصار RAM؟", opts: ["ذاكرة القراءة فقط", "ذاكرة الوصول العشوائي", "القرص الصلب", "المعالج"], correct: 1 },
      { q: "أي مما يلي نظام تشغيل؟", opts: ["وورد", "ويندوز", "كروم", "فوتوشوب"], correct: 1 },
      { q: "ما امتداد ملفات الصور الشائع؟", opts: [".doc", ".mp3", ".jpg", ".exe"], correct: 2 },
      { q: "ما وظيفة المعالج (CPU)؟", opts: ["التخزين", "المعالجة والحساب", "العرض", "الطباعة"], correct: 1 },
      { q: "أي من هذه لغة برمجة؟", opts: ["HTML", "Python", "PDF", "WiFi"], correct: 1 },
      { q: "ما الجهاز المستخدم لإدخال النصوص؟", opts: ["الشاشة", "الطابعة", "لوحة المفاتيح", "السماعة"], correct: 2 },
      { q: "ما وظيفة جدار الحماية (Firewall)؟", opts: ["تسريع الإنترنت", "حماية الشبكة", "تخزين الملفات", "طباعة المستندات"], correct: 1 },
      { q: "ما هو الفيروس الحاسوبي؟", opts: ["برنامج مفيد", "برنامج ضار", "جهاز إدخال", "نظام تشغيل"], correct: 1 },
    ],
  },
  art: {
    pairs: [
      { id: 1, term: "الألوان الأساسية", definition: "أحمر وأزرق وأصفر لا يمكن الحصول عليها بالمزج" },
      { id: 2, term: "الألوان الثانوية", definition: "ألوان تنتج من مزج لونين أساسيين" },
      { id: 3, term: "التكوين", definition: "ترتيب العناصر الفنية في العمل بشكل متناسق" },
      { id: 4, term: "الظل والنور", definition: "تدرج الإضاءة على الأشكال لإعطاء بُعد ثلاثي" },
      { id: 5, term: "النسيج", definition: "ملمس السطح الحقيقي أو الإيهامي في العمل الفني" },
      { id: 6, term: "الزخرفة", definition: "تزيين الأسطح بوحدات هندسية أو نباتية متكررة" },
    ],
    words: [
      { word: "رسم", scrambled: "مسر" },
      { word: "لوحة", scrambled: "ةحول" },
      { word: "فرشاة", scrambled: "ةاشرف" },
      { word: "ألوان", scrambled: "ناولأ" },
      { word: "نحت", scrambled: "تحن" },
      { word: "زخرفة", scrambled: "ةفرخز" },
    ],
    questions: [
      { q: "ما الألوان الأساسية الثلاث؟", opts: ["أحمر وأخضر وأزرق", "أحمر وأصفر وأزرق", "أصفر وبرتقالي وأخضر", "أبيض وأسود ورمادي"], correct: 1 },
      { q: "ما اللون الناتج من مزج الأحمر والأصفر؟", opts: ["أخضر", "بنفسجي", "برتقالي", "بني"], correct: 2 },
      { q: "ما اللون الناتج من مزج الأزرق والأصفر؟", opts: ["أخضر", "بنفسجي", "برتقالي", "رمادي"], correct: 0 },
      { q: "ما نوع الخط المستقيم الأفقي؟", opts: ["يدل على الحركة", "يدل على الهدوء والاستقرار", "يدل على القوة", "يدل على الفوضى"], correct: 1 },
      { q: "ما هو فن الزخرفة الإسلامية؟", opts: ["رسم الوجوه", "تكرار أشكال هندسية ونباتية", "النحت فقط", "التصوير الفوتوغرافي"], correct: 1 },
      { q: "ما الأداة المستخدمة في الرسم بالألوان المائية؟", opts: ["قلم رصاص", "فرشاة ناعمة", "إزميل", "مسطرة"], correct: 1 },
      { q: "ما العنصر الفني الذي يعبر عن الحركة؟", opts: ["اللون", "الخط", "النقطة", "الملمس"], correct: 1 },
      { q: "ما الفرق بين الرسم والتلوين؟", opts: ["لا فرق", "الرسم بالخطوط والتلوين بالألوان", "التلوين أصعب", "الرسم بالألوان فقط"], correct: 1 },
      { q: "ما هو فن الكولاج؟", opts: ["الرسم بالفحم", "لصق مواد مختلفة", "النحت على الخشب", "الطباعة"], correct: 1 },
      { q: "ما نوع الفن الذي يستخدم الطين؟", opts: ["الرسم", "الخزف", "التصوير", "الطباعة"], correct: 1 },
    ],
  },
  pe: {
    pairs: [
      { id: 1, term: "الإحماء", definition: "تمارين تحضيرية قبل النشاط الرياضي الرئيسي" },
      { id: 2, term: "اللياقة البدنية", definition: "قدرة الجسم على أداء الأنشطة البدنية بكفاءة" },
      { id: 3, term: "التحمل", definition: "قدرة الجسم على بذل جهد لفترة طويلة" },
      { id: 4, term: "المرونة", definition: "قدرة المفاصل على الحركة في مدى واسع" },
      { id: 5, term: "السرعة", definition: "القدرة على أداء حركات متتالية في أقل زمن" },
      { id: 6, term: "التوازن", definition: "القدرة على الحفاظ على ثبات الجسم أثناء الحركة" },
    ],
    words: [
      { word: "رياضة", scrambled: "ةضاير" },
      { word: "جري", scrambled: "يرج" },
      { word: "كرة", scrambled: "ةرك" },
      { word: "سباحة", scrambled: "ةحابس" },
      { word: "قفز", scrambled: "زفق" },
      { word: "تمرين", scrambled: "نيرمت" },
    ],
    questions: [
      { q: "ما أهمية الإحماء قبل التمرين؟", opts: ["لا فائدة منه", "تحضير العضلات ومنع الإصابات", "زيادة الوزن", "الراحة"], correct: 1 },
      { q: "كم دقيقة يُنصح بالنشاط البدني يومياً للأطفال؟", opts: ["15 دقيقة", "30 دقيقة", "60 دقيقة", "120 دقيقة"], correct: 2 },
      { q: "ما الرياضة التي تُلعب بالمضرب؟", opts: ["كرة القدم", "كرة الريشة", "السباحة", "الجري"], correct: 1 },
      { q: "كم عدد لاعبي فريق كرة القدم؟", opts: ["9", "10", "11", "12"], correct: 2 },
      { q: "ما العنصر الأهم للياقة القلبية؟", opts: ["رفع الأثقال", "الجري والسباحة", "تمارين الإطالة", "النوم"], correct: 1 },
      { q: "ما فائدة تمارين الإطالة؟", opts: ["زيادة القوة", "زيادة المرونة", "زيادة الوزن", "لا فائدة"], correct: 1 },
      { q: "أي رياضة تُمارس في الماء؟", opts: ["الكاراتيه", "كرة السلة", "السباحة", "ألعاب القوى"], correct: 2 },
      { q: "ما الوضع الصحيح للجري؟", opts: ["الظهر منحني", "الرأس منخفض", "الظهر مستقيم والنظر للأمام", "الأذرع ثابتة"], correct: 2 },
      { q: "ما أفضل وقت لشرب الماء أثناء الرياضة؟", opts: ["قبل فقط", "بعد فقط", "قبل وأثناء وبعد", "لا حاجة للماء"], correct: 2 },
      { q: "ما الرياضة الوطنية في السعودية؟", opts: ["كرة السلة", "كرة القدم", "التنس", "السباحة"], correct: 1 },
    ],
  },
  life: {
    pairs: [
      { id: 1, term: "إدارة الوقت", definition: "تنظيم الوقت وتوزيعه على المهام بفعالية" },
      { id: 2, term: "التواصل الفعال", definition: "التعبير عن الأفكار والمشاعر بوضوح واحترام" },
      { id: 3, term: "حل المشكلات", definition: "إيجاد حلول مناسبة للتحديات والعقبات" },
      { id: 4, term: "التعاون", definition: "العمل مع الآخرين لتحقيق هدف مشترك" },
      { id: 5, term: "النظافة الشخصية", definition: "العناية بنظافة الجسم والمظهر" },
      { id: 6, term: "الادخار", definition: "توفير جزء من المال لاستخدامه مستقبلاً" },
    ],
    words: [
      { word: "نظافة", scrambled: "ةفاظن" },
      { word: "تعاون", scrambled: "نواعت" },
      { word: "احترام", scrambled: "مارتحا" },
      { word: "صحة", scrambled: "ةحص" },
      { word: "أمان", scrambled: "ناما" },
      { word: "غذاء", scrambled: "ءاذغ" },
    ],
    questions: [
      { q: "ما أهمية غسل اليدين؟", opts: ["للتسلية", "لمنع انتشار الجراثيم", "لا فائدة", "لتبريد اليدين"], correct: 1 },
      { q: "كم ساعة نوم يحتاج الطفل يومياً؟", opts: ["4-5", "6-7", "8-10", "12-14"], correct: 2 },
      { q: "ما أفضل طريقة لحل الخلاف مع صديق؟", opts: ["الصراخ", "التجاهل", "الحوار الهادئ", "العنف"], correct: 2 },
      { q: "ما الغذاء الصحي المتوازن؟", opts: ["حلويات فقط", "وجبات سريعة", "فواكه وخضروات وبروتين", "مشروبات غازية"], correct: 2 },
      { q: "ما فائدة الادخار؟", opts: ["لا فائدة", "تأمين المستقبل", "إنفاق أكثر", "التباهي"], correct: 1 },
      { q: "كيف نتعامل مع الغرباء على الإنترنت؟", opts: ["نشارك معلوماتنا", "نثق بهم", "نكون حذرين ولا نشارك بياناتنا", "نرسل صورنا"], correct: 2 },
      { q: "ما أهمية الإفطار الصباحي؟", opts: ["غير مهم", "يمنح الطاقة والتركيز", "يسبب الكسل", "يزيد النوم"], correct: 1 },
      { q: "ما التصرف الصحيح عند الحريق؟", opts: ["الاختباء", "فتح النوافذ", "الخروج بهدوء واتباع خطة الإخلاء", "عدم التحرك"], correct: 2 },
      { q: "ما أهمية العمل الجماعي؟", opts: ["يبطئ العمل", "ينجز المهام بشكل أفضل", "غير مفيد", "يسبب المشاكل"], correct: 1 },
      { q: "ما رقم الطوارئ في السعودية؟", opts: ["999", "911", "112", "100"], correct: 1 },
    ],
  },
  english: {
    pairs: [
      { id: 1, term: "Noun", definition: "كلمة تدل على اسم شخص أو مكان أو شيء" },
      { id: 2, term: "Verb", definition: "كلمة تدل على حدث أو فعل" },
      { id: 3, term: "Adjective", definition: "كلمة تصف الاسم وتبين صفاته" },
      { id: 4, term: "Pronoun", definition: "كلمة تحل محل الاسم مثل He, She, It" },
      { id: 5, term: "Preposition", definition: "كلمة تبين العلاقة المكانية أو الزمانية مثل in, on, at" },
      { id: 6, term: "Adverb", definition: "كلمة تصف الفعل وتبين كيفية وقوعه" },
    ],
    words: [
      { word: "School", scrambled: "loohcS" },
      { word: "Book", scrambled: "kooB" },
      { word: "Teacher", scrambled: "rehcaeT" },
      { word: "Apple", scrambled: "elppA" },
      { word: "Water", scrambled: "retaW" },
      { word: "Friend", scrambled: "dneirF" },
    ],
    questions: [
      { q: "What is the meaning of 'Cat'?", opts: ["كلب", "قطة", "طائر", "سمكة"], correct: 1 },
      { q: "What color is the sky?", opts: ["Red", "Green", "Blue", "Yellow"], correct: 2 },
      { q: "Choose the correct: She ___ a student.", opts: ["am", "is", "are", "be"], correct: 1 },
      { q: "What is the plural of 'child'?", opts: ["childs", "childen", "children", "childes"], correct: 2 },
      { q: "What day comes after Monday?", opts: ["Wednesday", "Tuesday", "Sunday", "Thursday"], correct: 1 },
      { q: "How many months in a year?", opts: ["10", "11", "12", "13"], correct: 2 },
      { q: "What is the opposite of 'big'?", opts: ["tall", "small", "long", "wide"], correct: 1 },
      { q: "Choose the correct: I ___ to school every day.", opts: ["goes", "going", "go", "gone"], correct: 2 },
      { q: "What is 'شمس' in English?", opts: ["Moon", "Star", "Sun", "Cloud"], correct: 2 },
      { q: "Which is a fruit?", opts: ["Carrot", "Potato", "Banana", "Onion"], correct: 2 },
    ],
  },
};

const GamesHub = ({ onBack, onXP, onBadge, studentName }: GamesHubProps) => {
  const [gameScreen, setGameScreen] = useState<GameScreen>("subjects");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [celebrate, setCelebrate] = useState(false);
  const [challengeMode, setChallengeMode] = useState<"single" | "all" | null>(null);
  const [activeLettersData, setActiveLettersData] = useState<SpellingWord[]>([]);

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

  const openChallengeMode = () => {
    setChallengeMode(null);
    setGameScreen("challenge-mode");
  };

  const startLettersWithMode = (mode: "single" | "all") => {
    setChallengeMode(mode);
    let words: SpellingWord[];
    if (mode === "all") {
      const allWords = Object.values(gameData).flatMap(d => d.words);
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      words = shuffled.slice(0, 6);
    } else {
      words = data?.words || [];
    }
    setActiveLettersData(words);
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
    const words = activeLettersData;
    if (!words.length) return;
    const isCorrect = spellingInput.trim() === words[spellingIndex].word;
    if (isCorrect) {
      setSpellingScore(s => s + 1);
      setSpellingFeedback("correct");
    } else {
      setSpellingFeedback("wrong");
    }
    setTimeout(() => {
      setSpellingFeedback(null);
      setSpellingInput("");
      if (spellingIndex + 1 >= words.length) {
        const finalScore = isCorrect ? spellingScore + 1 : spellingScore;
        setSpellingDone(true);
        if (finalScore === words.length) {
          onXP(100);
          onBadge("وسام العبقري");
          triggerCelebrate();
        } else {
          onXP(Math.round((finalScore / words.length) * 50));
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

  // ─── Hex Battle Game ───
  if (gameScreen === "hexbattle") {
    return <HexBattleGame onBack={() => setGameScreen("subjects")} onXP={onXP} onBadge={onBadge} studentName={studentName} />;
  }

  // ─── Subject Selection Screen ───
  if (gameScreen === "subjects") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <BackButton onClick={onBack} />
        <div className="text-center mb-6 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-gold shadow-gold mb-4">
            <Gamepad2 className="w-10 h-10 text-gold-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-heading mb-2">🎮 ركن العباقرة</h1>
          <p className="text-muted-foreground text-xl">اختر المادة للبدء في التحدي!</p>
        </div>

        {/* Hex Battle featured card */}
        <button
          onClick={() => setGameScreen("hexbattle")}
          className="w-full max-w-md mx-auto mb-5 neu-card p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-scale-in cursor-pointer ring-2 ring-primary/30"
        >
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl gradient-emerald shadow-emerald-lg flex items-center justify-center">
            <Hexagon className="w-9 h-9 text-white" />
          </div>
          <div className="flex-1 text-right">
            <h3 className="text-xl font-extrabold text-heading">⬡ شبكة التحدي الثنائي</h3>
            <p className="text-muted-foreground text-sm mt-1">تحدَّ صديقك على الشبكة السداسية! 🔥</p>
          </div>
          <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">جديد</span>
        </button>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full pb-20">
          {subjects.map((sub, i) => (
            <button
              key={sub.id}
              onClick={() => selectSubject(sub.id)}
              className="group neu-card p-5 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] animate-scale-in cursor-pointer"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${sub.color} shadow-lg mb-3 transition-transform duration-300 group-hover:scale-110`}>
                <sub.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-sm font-extrabold text-heading leading-tight">{sub.title}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Challenge Mode Selection (Glassmorphism) ───
  if (gameScreen === "challenge-mode") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <BackButton onClick={() => setGameScreen("menu")} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl animate-scale-in">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${currentSubject?.color || "from-primary to-primary"} shadow-lg mb-4`}>
                <Pencil className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-heading mb-2">🔤 خلية الحروف</h2>
              <p className="text-muted-foreground text-lg">اختر نوع التحدي</p>
            </div>

            <div className="space-y-4">
              {/* Single Subject Challenge */}
              <button
                onClick={() => startLettersWithMode("single")}
                className="w-full bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl p-5 text-right flex items-center gap-4 transition-all duration-300 hover:bg-white/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${currentSubject?.color || "from-primary to-primary"} shadow-lg flex items-center justify-center`}>
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-heading">🎯 تحدي المادة الواحدة</h3>
                  <p className="text-muted-foreground text-sm mt-1">أسئلة من {currentSubject?.title} فقط</p>
                </div>
              </button>

              {/* Global Challenge */}
              <button
                onClick={() => startLettersWithMode("all")}
                className="w-full bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl p-5 text-right flex items-center gap-4 transition-all duration-300 hover:bg-white/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-heading">⚡ تحدي العبقري الشامل</h3>
                  <p className="text-muted-foreground text-sm mt-1">أسئلة عشوائية من جميع المواد</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Games Menu for selected subject ───
  if (gameScreen === "menu") {
    const gamesMenu = [
      { id: "maze", title: "🧩 لغز المتاهة", description: "طابق المصطلح بتعريفه الصحيح لفتح الأبواب", icon: Shuffle, start: startMaze },
      { id: "letters", title: "🔤 خلية الحروف", description: "أعد ترتيب الحروف لتكوين المصطلح الصحيح", icon: Pencil, start: openChallengeMode },
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
              className="w-full neu-card p-5 text-right flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-scale-in cursor-pointer"
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
  if (gameScreen === "letters" && activeLettersData.length > 0) {
    const words = activeLettersData;
    const modeLabel = challengeMode === "all" ? "تحدي شامل" : currentSubject?.title;
    return (
      <div className="min-h-screen flex flex-col px-4 py-6">
        <ConfettiCelebration trigger={celebrate} />
        <BackButton onClick={() => setGameScreen("challenge-mode")} />
        <h2 className="text-2xl font-extrabold text-heading text-center mb-2">🔤 خلية الحروف — {modeLabel}</h2>

        {spellingDone ? (
          <div className="text-center py-10 animate-bounce-in">
            {spellingScore === words.length && <img src={appIcon} alt="وسام" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-gold" />}
            <p className="text-3xl font-extrabold text-foreground mb-2">النتيجة: {spellingScore}/{words.length}</p>
            <p className="text-gold text-xl font-bold mb-6">
              {spellingScore === words.length ? "🏆 مبروك! وسام العبقري!" : `+${Math.round((spellingScore / words.length) * 50)} XP`}
            </p>
            <button onClick={() => startLettersWithMode(challengeMode || "single")} className={`py-3 px-8 rounded-2xl bg-gradient-to-br ${currentSubject?.color || "from-primary to-primary"} text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all`}>إعادة اللعبة</button>
          </div>
        ) : (
          <div className="max-w-md mx-auto w-full text-center space-y-6 mt-6">
            <p className="text-muted-foreground text-lg">الكلمة {spellingIndex + 1} من {words.length}</p>
            <div className={`neu-card p-8 animate-scale-in ${spellingFeedback === "correct" ? "ring-4 ring-success" : spellingFeedback === "wrong" ? "ring-4 ring-destructive" : ""}`}>
              <p className="text-4xl font-extrabold text-gold tracking-widest mb-4">{words[spellingIndex].scrambled}</p>
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
            <button onClick={checkSpelling} disabled={!spellingInput.trim()} className={`w-full py-4 rounded-2xl bg-gradient-to-br ${currentSubject?.color || "from-primary to-primary"} text-white font-bold text-xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all`}>
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
                  cls += " hover:shadow-lg";
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
                    <span className="font-extrabold ml-3">
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
