import { ACTIVATION_SALT, type PlanId } from "./payment-config";

// توليد رمز تفعيل قصير وفريد لكل (اسم الطالب + الباقة)
// نفس الاسم والباقة يُنتجان نفس الرمز دائماً، حتى يتمكن المشرف من توليده وإرساله للطالب
export async function generateActivationCode(
  studentName: string,
  plan: PlanId
): Promise<string> {
  const normalized = studentName.trim().replace(/\s+/g, " ").toLowerCase();
  const payload = `${normalized}|${plan}|${ACTIVATION_SALT}`;
  const buf = new TextEncoder().encode(payload);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  const bytes = Array.from(new Uint8Array(hashBuf));
  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  // 10 خانات سداسية عشرية بأحرف كبيرة + بادئة لتمييز الباقة
  const prefix = plan === "yearly" ? "YR" : "SM";
  return `${prefix}-${hex.slice(0, 10).toUpperCase()}`;
}

export async function verifyActivationCode(
  studentName: string,
  plan: PlanId,
  code: string
): Promise<boolean> {
  const expected = await generateActivationCode(studentName, plan);
  return expected === code.trim().toUpperCase();
}

// محاولة كشف الباقة من الرمز المُدخل (sm/yr)
export function detectPlanFromCode(code: string): PlanId | null {
  const c = code.trim().toUpperCase();
  if (c.startsWith("YR-")) return "yearly";
  if (c.startsWith("SM-")) return "semester";
  return null;
}
