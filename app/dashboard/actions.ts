"use server";

import { revalidatePath } from "next/cache";
import { markOwnSessionComplete } from "@/lib/sessionCompletion";

export async function markSessionCompleteAction(formData: FormData) {
  const sessionId = formData.get("sessionId");

  if (typeof sessionId !== "string" || !sessionId) {
    throw new Error("Missing session id.");
  }

  const completed = await markOwnSessionComplete(sessionId);

  if (!completed) {
    throw new Error("Could not mark session as complete.");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/session/${sessionId}`);
}
