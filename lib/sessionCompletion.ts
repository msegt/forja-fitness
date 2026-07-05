import { createClient } from "@/lib/supabase/server";

export type SessionCompletionResult =
  | { ok: true }
  | {
      ok: false;
      reason: "unauthenticated" | "not_found_or_already_completed" | "update_failed";
      errorMessage?: string;
    };

export async function markOwnSessionComplete(sessionId: string): Promise<SessionCompletionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }

  const { data, error } = await supabase
    .from("sessions")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("completed", false);

  if (error) {
    return { ok: false, reason: "update_failed", errorMessage: error.message };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { ok: false, reason: "not_found_or_already_completed" };
  }

  return { ok: true };
}
