"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { posix as pathPosix } from "node:path";
import { markOwnSessionComplete } from "@/lib/sessionCompletion";
import { type SessionCompletionErrorCode } from "@/app/dashboard/completionErrors";
import { isAllowedDashboardReturnPath, isSessionId } from "@/app/dashboard/sessionPath";

const DASHBOARD_PATH = "/dashboard";

function formatErrorQueryParam(code: SessionCompletionErrorCode) {
  return `error=${encodeURIComponent(code)}`;
}

function getReturnPath(formData: FormData): string {
  const returnPath = formData.get("returnPath");

  if (typeof returnPath !== "string") {
    return DASHBOARD_PATH;
  }

  const hasProtocolPrefix = /^[a-zA-Z][\w+.-]*:/.test(returnPath);

  if (hasProtocolPrefix || !returnPath.startsWith("/") || returnPath.startsWith("//")) {
    return DASHBOARD_PATH;
  }

  const pathOnly = returnPath.split(/[?#]/)[0];
  const normalizedReturnPath = pathPosix.normalize(pathOnly);

  if (!isAllowedDashboardReturnPath(normalizedReturnPath)) {
    return DASHBOARD_PATH;
  }

  return normalizedReturnPath;
}

function redirectWithError(returnPath: string, code: SessionCompletionErrorCode): never {
  // `redirect` throws to short-circuit action execution and navigate immediately.
  const separator = returnPath.includes("?") ? "&" : "?";
  redirect(`${returnPath}${separator}${formatErrorQueryParam(code)}`);
}

export async function markSessionCompleteAction(formData: FormData) {
  const returnPath = getReturnPath(formData);
  const sessionId = formData.get("sessionId");

  if (typeof sessionId !== "string" || !sessionId) {
    redirectWithError(returnPath, "missing_session_id");
  }

  if (!isSessionId(sessionId)) {
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
