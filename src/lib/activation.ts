import { supabase } from "@/integrations/supabase/client";
import type { PlanId } from "./payment-config";

const ADMIN_TOKEN_KEY = "genius_admin_token";

async function invoke<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("activation", { body });
  if (error) throw error;
  return data as T;
}

export async function adminLogin(passphrase: string): Promise<boolean> {
  try {
    const res = await invoke<{ ok?: boolean; token?: string }>({
      action: "admin_login",
      passphrase,
    });
    if (res?.ok && res.token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, res.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function generateActivationCode(
  studentName: string,
  plan: PlanId,
): Promise<string> {
  const adminToken = getAdminToken();
  if (!adminToken) throw new Error("unauthorized");
  const res = await invoke<{ ok?: boolean; code?: string; error?: string }>({
    action: "generate_code",
    adminToken,
    studentName,
    plan,
  });
  if (res?.error === "unauthorized") {
    clearAdminToken();
    throw new Error("unauthorized");
  }
  if (!res?.ok || !res.code) throw new Error("failed_to_generate");
  return res.code;
}

export async function verifyActivationCode(
  studentName: string,
  plan: PlanId,
  code: string,
): Promise<{ ok: boolean; plan: PlanId | null }> {
  try {
    const res = await invoke<{ ok?: boolean; plan?: PlanId }>({
      action: "verify_code",
      studentName,
      plan,
      code,
    });
    return { ok: !!res?.ok, plan: (res?.plan as PlanId | undefined) ?? null };
  } catch {
    return { ok: false, plan: null };
  }
}

export function detectPlanFromCode(code: string): PlanId | null {
  const c = code.trim().toUpperCase();
  if (c.startsWith("YR-")) return "yearly";
  if (c.startsWith("SM-")) return "semester";
  return null;
}
