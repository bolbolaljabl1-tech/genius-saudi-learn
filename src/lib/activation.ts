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

export interface SubscriptionRequestRow {
  id: string;
  student_name: string;
  plan: PlanId;
  status: "pending" | "active";
  requested_at: string;
  activated_at: string | null;
}

export async function requestSubscription(
  studentName: string,
  plan: PlanId,
): Promise<{ ok: boolean; duplicate?: boolean }> {
  try {
    const res = await invoke<{ ok?: boolean; duplicate?: boolean }>({
      action: "request_subscription",
      studentName,
      plan,
    });
    return { ok: !!res?.ok, duplicate: !!res?.duplicate };
  } catch {
    return { ok: false };
  }
}

export async function checkSubscriptionStatus(
  studentName: string,
): Promise<{ status: "none" | "pending" | "active"; plan: PlanId | null }> {
  try {
    const res = await invoke<{ ok?: boolean; status?: string; plan?: PlanId }>({
      action: "check_status",
      studentName,
    });
    const status = (res?.status ?? "none") as "none" | "pending" | "active";
    return { status, plan: (res?.plan as PlanId | undefined) ?? null };
  } catch {
    return { status: "none", plan: null };
  }
}

export async function listSubscriptionRequests(): Promise<SubscriptionRequestRow[]> {
  const adminToken = getAdminToken();
  if (!adminToken) throw new Error("unauthorized");
  const res = await invoke<{ ok?: boolean; requests?: SubscriptionRequestRow[]; error?: string }>({
    action: "list_requests",
    adminToken,
  });
  if (res?.error === "unauthorized") {
    clearAdminToken();
    throw new Error("unauthorized");
  }
  return res?.requests ?? [];
}

export async function activateSubscriptionRequest(id: string): Promise<SubscriptionRequestRow> {
  const adminToken = getAdminToken();
  if (!adminToken) throw new Error("unauthorized");
  const res = await invoke<{ ok?: boolean; request?: SubscriptionRequestRow; error?: string }>({
    action: "activate_request",
    adminToken,
    id,
  });
  if (res?.error === "unauthorized") {
    clearAdminToken();
    throw new Error("unauthorized");
  }
  if (!res?.ok || !res.request) throw new Error("failed");
  return res.request;
}
