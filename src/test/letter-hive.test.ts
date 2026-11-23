import { describe, expect, it } from "vitest";
import lockedTemplate from "@/templates/letter-hive-v1-2.html?raw";
import {
  buildLetterHiveHtml,
  createSampleQuestions,
  parseBatch,
  questionsToBulk,
  safeGameFilename,
  validateQuestion,
} from "@/lib/letter-hive";

describe("Letter Hive generator", () => {
  it("ships exactly 28 playable sample questions for both modes", () => {
    const questions = createSampleQuestions();
    expect(questions).toHaveLength(28);
    for (const mode of ["curriculum", "letters"] as const) {
      expect(questions.map((question) => validateQuestion(question, mode))).toEqual(Array(28).fill(null));
      const rows = parseBatch(questionsToBulk(questions, mode), mode);
      expect(rows.filter((row) => row.error), JSON.stringify(rows.filter((row) => row.error))).toHaveLength(0);
      expect(rows.filter((row) => row.question)).toHaveLength(28);
    }
  });

  it("changes only the three permitted placeholders in the locked V1.2 template", () => {
    const questions = createSampleQuestions().slice(0, 1);
    const html = buildLetterHiveHtml(questions, "girls", "curriculum", "lh-test01-abcd");
    const restored = html
      .replace("const INSTANCE_ID='lh-test01-abcd';", "const INSTANCE_ID='[UNIQUE-INSTANCE-ID]';")
      .replace("const DEFAULT_THEME='girls';", "const DEFAULT_THEME='[DEFAULT-THEME]';")
      .replace(/const bank=\[[^\n]*\]; \/\/ إلزامي:/, "const bank=[]; // إلزامي:");
    expect(restored).toBe(lockedTemplate);
    expect(html).not.toContain("[UNIQUE-INSTANCE-ID]");
    expect(html).not.toContain("[DEFAULT-THEME]");
    expect(html).not.toContain("const bank=[];");
  });

  it("escapes quotes, backslashes, line breaks, and closing script text", () => {
    const [question] = createSampleQuestions();
    question.prompt = "سؤال المعلم 'التجريبي' \\ </script>";
    const html = buildLetterHiveHtml([question], "boys", "curriculum", "lh-safe01-test");
    expect(html).toContain("\\'التجريبي\\'");
    expect(html).toContain("\\\\");
    expect(html).toContain("<\\/script>");
    expect(html).not.toContain("سؤال المعلم 'التجريبي'");
  });

  it("reports invalid batch lines without dropping their line numbers", () => {
    const rows = parseBatch("سؤال بلا إجابة\n{ب} اختيار | صحيح | خطأ\n{ب} ما عاصمة السعودية؟ | الرياض", "letters");
    expect(rows[0].error).toContain("{الحرف}");
    expect(rows[1].error).toContain("أربعة خيارات");
    expect(rows[2].error).toContain("تبدأ الإجابة بحرف");
    expect(rows.map((row) => row.line)).toEqual([1, 2, 3]);
  });

  it("uses the lesson title in a safe Arabic HTML filename", () => {
    expect(safeGameFilename("  الدرس الأول: الحروف  ")).toBe("خلية_الحروف_الدرس_الأول_الحروف.html");
    expect(safeGameFilename("")).toBe("خلية_الحروف_لعبة.html");
  });
});
