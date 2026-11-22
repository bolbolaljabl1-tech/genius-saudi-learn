import lockedTemplate from "@/templates/letter-hive-v1-2.html?raw";

export const ARABIC_LETTERS = [
  "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص",
  "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
] as const;

export type HiveTheme = "boys" | "girls" | "neutral";
export type HiveMode = "curriculum" | "letters";
export type QuestionKind = "choice" | "boolean" | "open";

export interface HiveQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  answer: string;
  distractors: string[];
  letter: string;
}

export interface BatchRow {
  line: number;
  raw: string;
  question?: HiveQuestion;
  error?: string;
}

let questionSequence = 0;

export function createQuestionId() {
  questionSequence += 1;
  return `question-${Date.now()}-${questionSequence}`;
}

export function emptyQuestion(kind: QuestionKind = "choice"): HiveQuestion {
  return {
    id: createQuestionId(),
    kind,
    prompt: "",
    answer: kind === "boolean" ? "صح" : "",
    distractors: ["", "", ""],
    letter: kind === "boolean" ? "ص" : "ا",
  };
}

const clean = (value: string) => value.trim();
const normalizeLetter = (value: string) => {
  const variants: Record<string, string> = { "أ": "ا", "إ": "ا", "آ": "ا", "ى": "ي", "ة": "ه" };
  return variants[value] ?? value;
};

function answerStartsWithLetter(answer: string, letter: string) {
  const normalized = clean(answer)
    .replace(/^[\s\u200e\u200f]+/, "")
    .replace(/^ال/, "");
  const first = normalized.charAt(0);
  return Boolean(first) && normalizeLetter(first) === normalizeLetter(letter);
}

export function validateQuestion(question: HiveQuestion, mode: HiveMode): string | null {
  const prompt = clean(question.prompt);
  const answer = clean(question.answer);
  if (!prompt) return "اكتب نص السؤال.";
  if (prompt.includes("|") || answer.includes("|") || question.distractors.some((item) => item.includes("|"))) {
    return "علامة | مخصصة للفصل بين أجزاء السؤال.";
  }

  if (question.kind === "choice") {
    const distractors = question.distractors.map(clean);
    if (!answer) return "اكتب الإجابة الصحيحة.";
    if (distractors.some((item) => !item)) return "أكمل الخيارات الخاطئة الثلاثة.";
    const options = [answer, ...distractors];
    if (new Set(options).size !== options.length) return "يجب أن تكون الخيارات الأربعة مختلفة.";
  } else if (question.kind === "boolean") {
    if (!['صح', 'خطأ'].includes(answer)) return "اختر صح أو خطأ.";
  }

  if (mode === "letters") {
    if (!ARABIC_LETTERS.includes(question.letter as (typeof ARABIC_LETTERS)[number])) return "اختر حرف الخلية.";
    if (!answer) return "تحدي الحروف يحتاج إجابة نموذجية.";
    if (!answerStartsWithLetter(answer, question.letter)) {
      return `يجب أن تبدأ الإجابة بحرف «${question.letter}» بعد حذف «ال».`;
    }
  }

  return null;
}

export function questionToLine(question: HiveQuestion, mode: HiveMode) {
  const prefix = mode === "letters" ? `{${question.letter}} ` : "";
  const prompt = clean(question.prompt);
  const answer = clean(question.answer);
  if (question.kind === "choice") {
    return `${prefix}${prompt} | ${answer} | ${question.distractors.map(clean).join(" | ")}`;
  }
  if (question.kind === "boolean") {
    return `${prefix}${prompt} | ${answer} | ${answer === "صح" ? "خطأ" : "صح"}`;
  }
  return answer ? `${prefix}${prompt} | ${answer}` : `${prefix}${prompt}`;
}

export function questionsToBulk(questions: HiveQuestion[], mode: HiveMode) {
  return questions.map((question) => questionToLine(question, mode)).join("\n");
}

export function parseBatch(text: string, mode: HiveMode): BatchRow[] {
  return text.split(/\r?\n/).map((raw, index) => {
    const line = index + 1;
    const trimmed = raw.trim();
    if (!trimmed) return { line, raw };

    const letterMatch = trimmed.match(/^\{([^}]+)\}\s*/);
    const letter = letterMatch ? normalizeLetter(letterMatch[1].trim()) : "ا";
    if (letterMatch && !ARABIC_LETTERS.includes(letter as (typeof ARABIC_LETTERS)[number])) {
      return { line, raw, error: "حرف الخلية غير صالح." };
    }
    if (mode === "letters" && !letterMatch) {
      return { line, raw, error: "ابدأ السطر بـ {الحرف} في تحدي الحروف." };
    }

    const body = letterMatch ? trimmed.slice(letterMatch[0].length) : trimmed;
    const parts = body.split("|").map(clean);
    const prompt = parts.shift() ?? "";
    let question: HiveQuestion;

    if (parts.length === 0 || parts.length === 1) {
      question = { ...emptyQuestion("open"), prompt, answer: parts[0] ?? "", letter };
    } else if (parts.length === 2 && parts.includes("صح") && parts.includes("خطأ")) {
      const answer = parts[0];
      question = { ...emptyQuestion("boolean"), prompt, answer, letter };
    } else if (parts.length === 4) {
      question = { ...emptyQuestion("choice"), prompt, answer: parts[0], distractors: parts.slice(1), letter };
    } else {
      return { line, raw, error: "استخدم سؤالًا مفتوحًا، أو صح وخطأ، أو أربعة خيارات." };
    }

    const error = validateQuestion(question, mode);
    return error ? { line, raw, error } : { line, raw, question };
  });
}

const sample = (
  kind: QuestionKind,
  prompt: string,
  answer: string,
  letter: string,
  distractors: string[] = [],
): HiveQuestion => ({ id: createQuestionId(), kind, prompt, answer, letter, distractors });

export function createSampleQuestions(): HiveQuestion[] {
  return [
    sample("choice", "🌍 ما عاصمة المملكة العربية السعودية؟", "الرياض", "ر", ["جدة", "مكة المكرمة", "الدمام"]),
    sample("choice", "🗺️ كم عدد قارات العالم؟ اكتب العدد بالحروف.", "سبع", "س", ["خمس", "ست", "ثمان"]),
    sample("choice", "🌊 ما أكبر محيطات الأرض مساحة؟", "الهادئ", "ه", ["الأطلسي", "الهندي", "المتجمد الشمالي"]),
    sample("choice", "🔴 ما الكوكب المعروف بالكوكب الأحمر؟", "المريخ", "م", ["الزهرة", "عطارد", "المشتري"]),
    sample("choice", "🌙 ما أول أشهر السنة الهجرية؟", "محرم", "م", ["صفر", "رجب", "رمضان"]),
    sample("choice", "🌱 ما الغاز الذي تمتصه النباتات من الهواء؟", "ثاني أكسيد الكربون", "ث", ["الأكسجين", "النيتروجين", "الهيدروجين"]),
    sample("choice", "🐘 ما أكبر حيوان بري؟", "الفيل", "ف", ["الزرافة", "وحيد القرن", "الجمل"]),
    sample("choice", "🐆 ما أسرع حيوان بري؟", "الفهد", "ف", ["الأسد", "الغزال", "الحصان"]),
    sample("choice", "❤️ ما العضو الذي يضخ الدم في الجسم؟", "القلب", "ق", ["الرئة", "الكبد", "المعدة"]),
    sample("choice", "👃 ما الحاسة المرتبطة بالأنف؟", "الشم", "ش", ["السمع", "البصر", "التذوق"]),
    sample("choice", "🇸🇦 ما اللغة الرسمية في المملكة العربية السعودية؟", "العربية", "ع", ["الإنجليزية", "الفرنسية", "الأردية"]),
    sample("choice", "☘️ ما العملية التي يصنع بها النبات غذاءه؟", "البناء الضوئي", "ب", ["التنفس", "النتح", "الإنبات"]),
    sample("choice", "☀️ ما مصدر ضوء النهار؟", "الشمس", "ش", ["القمر", "النجوم البعيدة", "البرق"]),
    sample("choice", "💨 ما أكثر غازات الهواء وفرة؟", "النيتروجين", "ن", ["الأكسجين", "ثاني أكسيد الكربون", "الهيدروجين"]),
    sample("choice", "🔬 ما وحدة بناء الكائن الحي؟", "الخلية", "خ", ["النسيج", "العضو", "الجهاز"]),
    sample("choice", "🧠 ما العضو الرئيس المسؤول عن التفكير؟", "الدماغ", "د", ["القلب", "الرئة", "المعدة"]),
    sample("choice", "🕋 كم عدد أركان الإسلام؟ اكتب العدد بالحروف.", "خمسة", "خ", ["ثلاثة", "أربعة", "ستة"]),
    sample("choice", "⭐ ما النجم الأقرب إلى الأرض؟", "الشمس", "ش", ["القمر", "الزهرة", "المشتري"]),
    sample("choice", "🐪 ما الحيوان الملقب بسفينة الصحراء؟", "الجمل", "ج", ["الحصان", "الفيل", "الغزال"]),
    sample("choice", "🐧 ما الطائر الذي لا يطير ويعيش في القطب الجنوبي؟", "البطريق", "ب", ["النعامة", "الصقر", "الحمام"]),
    sample("choice", "🧪 ما المعدن السائل في درجة حرارة الغرفة؟", "الزئبق", "ز", ["الحديد", "الألمنيوم", "النحاس"]),
    sample("choice", "⚡ ما وحدة قياس شدة التيار الكهربائي؟", "الأمبير", "ا", ["الفولت", "الأوم", "الواط"]),
    sample("choice", "🍎 ما العالم المرتبط بقانون الجذب العام؟", "نيوتن", "ن", ["أينشتاين", "إديسون", "ابن الهيثم"]),
    sample("choice", "👁️ ما الجزء الملون في العين؟", "القزحية", "ق", ["الشبكية", "القرنية", "العدسة"]),
    sample("boolean", "🌍 الشمس تدور حول الأرض.", "خطأ", "خ"),
    sample("boolean", "🧊 الماء النقي يتجمد عند صفر درجة مئوية.", "صح", "ص"),
    sample("open", "💡 اذكر مصدرًا متجددًا للطاقة.", "الطاقة الشمسية", "ط"),
    sample("open", "🌕 ما اسم القمر الطبيعي التابع للأرض؟", "القمر", "ق"),
  ];
}

export function createInstanceId() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const randomPart = (length: number) => {
    const values = new Uint32Array(length);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(values);
    else values.forEach((_, index) => { values[index] = Math.floor(Math.random() * alphabet.length); });
    return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  };
  return `lh-${randomPart(6)}-${randomPart(4)}`;
}

export function escapeSingleQuotedJs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
    .replace(/<\/script/gi, "<\\/script");
}

export function buildLetterHiveHtml(questions: HiveQuestion[], theme: HiveTheme, mode: HiveMode, instanceId = createInstanceId()) {
  const bank = questions.map((question) => `'${escapeSingleQuotedJs(questionToLine(question, mode))}'`).join(",");
  return lockedTemplate
    .replace("[UNIQUE-INSTANCE-ID]", instanceId)
    .replace("[DEFAULT-THEME]", theme)
    .replace("const bank=[];", `const bank=[${bank}];`);
}

export function safeGameFilename(title: string) {
  const cleaned = clean(title)
    .replace(/[\\/:*?"<>|%\u0000-\u001f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 60);
  return `خلية_الحروف_${cleaned || "لعبة"}.html`;
}

export function downloadHtmlFile(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const file = new File([blob], filename, { type: blob.type });
  const touch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    return navigator.share({ files: [file], title: filename });
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return Promise.resolve();
}
