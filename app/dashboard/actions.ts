"use server";

import { revalidatePath } from "next/cache";
import { markOwnSessionComplete } from "@/lib/sessionCompletion";

export async function markSessionCompleteAction(formData: FormData) {
  const sessionId = formData.get("sessionId");

  if (typeof sessionId !== "string" || !sessionId) {
    throw new Error("Session ID is required but was not provided.");
  }

  const completionResult = await markOwnSessionComplete(sessionId);

  if (!completionResult.ok) {
    if (completionResult.reason === "unauthenticated") {
      throw new Error("You must be signed in to complete a session.");
    }

    if (completionResult.reason === "update_failed") {
      throw new Error(
        completionResult.errorMessage
          ? `Failed to complete session: ${completionResult.errorMessage}`
          : "Failed to complete session due to an unexpected database error.",
      );
    }

    throw new Error("Session could not be completed because it was not found or is already completed.");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/session/${sessionId}`);
}
