import { createClient } from "@/lib/supabase/server";

export async function markOwnSessionComplete(sessionId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { error } = await supabase
    .from("sessions")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("completed", false);

  return !error;
}
