"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { markOwnSessionComplete } from "@/lib/sessionCompletion";
import { type SessionCompletionErrorCode } from "@/app/dashboard/completionErrors";

const DASHBOARD_PATH = "/dashboard";
const SESSION_ID_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function encodeError(code: SessionCompletionErrorCode) {
  return `?error=${encodeURIComponent(code)}`;
}

function getReturnPath(formData: FormData): string {
  const returnPath = formData.get("returnPath");

  if (typeof returnPath !== "string" || !returnPath.startsWith(DASHBOARD_PATH)) {
    return DASHBOARD_PATH;
  }

  return returnPath.split("?")[0];
}

function redirectWithError(returnPath: string, code: SessionCompletionErrorCode): never {
  redirect(`${returnPath}${encodeError(code)}`);
}

export async function markSessionCompleteAction(formData: FormData) {
  const returnPath = getReturnPath(formData);
  const sessionId = formData.get("sessionId");

  if (typeof sessionId !== "string" || !sessionId) {
    redirectWithError(returnPath, "missing_session_id");
  }

  if (!SESSION_ID_UUID_PATTERN.test(sessionId)) {
    redirectWithError(returnPath, "invalid_session_id");
  }

  const completionResult = await markOwnSessionComplete(sessionId);

  if (!completionResult.ok) {
    if (completionResult.reason === "unauthenticated") {
      redirectWithError(returnPath, "unauthenticated");
    }

    if (completionResult.reason === "update_failed") {
      redirectWithError(returnPath, "update_failed");
    }

    redirectWithError(returnPath, "not_found_or_already_completed");
  }

  revalidatePath(DASHBOARD_PATH);
  revalidatePath(`/dashboard/session/${sessionId}`);
  redirect(returnPath);
}
