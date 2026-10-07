import { supabase } from "@/integrations/supabase/client";

const ADMIN_TOKEN_KEY = "genius_admin_token";

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("activation", { body });
  if (error) throw error;
  return data as T;
}

export async function adminLogin(passphrase: string): Promise<boolean> {
  try {
    const result = await invoke<{ ok?: boolean; token?: string }>({ action: "admin_login", passphrase });
    if (!result.ok || !result.token) return false;
    sessionStorage.setItem(ADMIN_TOKEN_KEY, result.token);
    return true;
  } catch {
    return false;
  }
}

export const getAdminToken = () => sessionStorage.getItem(ADMIN_TOKEN_KEY);
export const clearAdminToken = () => sessionStorage.removeItem(ADMIN_TOKEN_KEY);

export interface LeaderboardRow {
  id: string;
  student_name: string;
  xp: number;
  badges: string[] | null;
  updated_at: string | null;
}

export async function listLeaderboardEntries(): Promise<LeaderboardRow[]> {
  const adminToken = getAdminToken();
  if (!adminToken) throw new Error("unauthorized");
  const result = await invoke<{ entries?: LeaderboardRow[]; error?: string }>({ action: "list_leaderboard", adminToken });
  if (result.error === "unauthorized") {
    clearAdminToken();
    throw new Error("unauthorized");
  }
  return result.entries ?? [];
}

export async function deleteLeaderboardEntry(id: string): Promise<void> {
  const adminToken = getAdminToken();
  if (!adminToken) throw new Error("unauthorized");
  const result = await invoke<{ ok?: boolean; error?: string }>({ action: "delete_leaderboard_entry", adminToken, id });
  if (result.error === "unauthorized") {
    clearAdminToken();
    throw new Error("unauthorized");
  }
  if (!result.ok) throw new Error("failed");
}