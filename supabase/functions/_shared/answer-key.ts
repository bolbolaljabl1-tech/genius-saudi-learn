// Answer-key alignment guard.
//
// Generative models frequently return an options array whose order does not
// match the numeric index they intended (off-by-one, reversed, or simply a
// stale index after they rewrote the options). To make validation reliable we
// ALSO ask the model for the correct answer as literal text and re-derive the
// index from the options array here, on the server, before the client ever
// sees the question.

const AR_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

const toLatinDigits = (value: string) => value.replace(/[٠-٩۰-۹]/g, (d) => AR_DIGITS[d] ?? d);

/** Arabic-insensitive normalization: digits, tashkeel, alef/ya/ta-marbuta variants. */
export function normalizeAnswerText(value: unknown): string {
  if (typeof value !== "string") return "";
  let text = toLatinDigits(value).trim();
  text = text.replace(/[\u064B-\u0652\u0670\u0640]/g, "");
  text = text.replace(/[\u0622\u0623\u0625]/g, "\u0627");
  text = text.replace(/\u0649/g, "\u064A");
  text = text.replace(/\u0629/g, "\u0647");
  text = text.replace(/\u0624/g, "\u0648").replace(/\u0626/g, "\u064A");
  text = text.replace(/\u0621/g, "");
  // Option labels the model sometimes prefixes: "أ) ", "1- ", "( ب )".
  text = text.replace(/^[\s(\[]*[أابجدهـ\d]{1,2}[\s]*[).\-–:]\s*/u, "");
  text = text.replace(/[\s\u200f\u200e]+/g, " ").trim();
  return text;
}

function numericValue(value: string): number | null {
  const cleaned = toLatinDigits(value).replace(/[^\d.\-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchIndex(options: string[], answer: string): number {
  const target = normalizeAnswerText(answer);
  if (!target) return -1;

  const normalized = options.map((option) => normalizeAnswerText(option));
  const exact = normalized.indexOf(target);
  if (exact !== -1) return exact;

  // Numeric equality: "٠٫٥" / "0.5" / "0.50" must all resolve to the same option.
  const targetNumber = numericValue(target);
  if (targetNumber !== null) {
    const numeric = normalized.findIndex((option) => {
      const value = numericValue(option);
      return value !== null && Math.abs(value - targetNumber) < 1e-9;
    });
    if (numeric !== -1) return numeric;
  }

  // Last resort: a single option that contains the answer text verbatim.
  const contained = normalized.filter((option) => option.includes(target));
  if (contained.length === 1) return normalized.indexOf(contained[0]);

  return -1;
}

export interface McqLike {
  options?: unknown;
  correctIndex?: unknown;
  correctAnswer?: unknown;
  [key: string]: unknown;
}

/**
 * Returns the question with `options` cleaned and `correctIndex` guaranteed to
 * point at the option holding the correct answer text. Questions whose answer
 * cannot be resolved are returned as `null` so callers can drop them instead of
 * showing a wrongly keyed question.
 */
export function alignMcq<T extends McqLike>(question: T): T | null {
  const rawOptions = Array.isArray(question.options) ? question.options : null;
  if (!rawOptions) return question;

  const options = rawOptions.map((option) => String(option ?? "").trim()).filter((option) => option.length > 0);
  if (options.length < 2) return null;

  const fromText = matchIndex(options, String(question.correctAnswer ?? ""));
  const declared = Number(question.correctIndex);
  const declaredValid = Number.isInteger(declared) && declared >= 0 && declared < options.length;

  let correctIndex: number;
  if (fromText !== -1) {
    correctIndex = fromText;
  } else if (declaredValid) {
    correctIndex = declared;
  } else {
    return null;
  }

  const aligned = { ...question, options, correctIndex } as T;
  delete (aligned as McqLike).correctAnswer;
  return aligned;
}

/** Shared prompt clause so every generator returns a text answer key. */
export const ANSWER_KEY_RULE = `قاعدة إلزامية لضبط مفتاح الإجابة:
- أعد الحقل correctAnswer بنص الإجابة الصحيحة منسوخاً حرفياً كما ورد داخل مصفوفة options دون أي زيادة أو ترقيم.
- أعد الحقل correctIndex برقم موضع تلك الإجابة نفسها داخل المصفوفة، بحيث يكون options[correctIndex] مطابقاً تماماً لقيمة correctAnswer.
- تحقق من صحة الحل حسابياً ومنطقياً قبل كتابة الخيارات، ولا تعد ترتيب الخيارات بعد تحديد الإجابة.`;
