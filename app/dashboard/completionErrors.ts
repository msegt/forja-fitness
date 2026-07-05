export const SESSION_COMPLETION_ERROR_MESSAGES = {
  missing_session_id: "We couldn't find that session. Please try again.",
  invalid_session_id: "That session reference is invalid. Please refresh and try again.",
  unauthenticated: "Please sign in again before marking a session complete.",
  update_failed: "We couldn't update your session right now. Please try again shortly.",
  not_found_or_already_completed: "This session was already completed or no longer exists.",
} as const;

export type SessionCompletionErrorCode = keyof typeof SESSION_COMPLETION_ERROR_MESSAGES;

function isSessionCompletionErrorCode(value: string): value is SessionCompletionErrorCode {
  return Object.hasOwn(SESSION_COMPLETION_ERROR_MESSAGES, value);
}

export function getSessionCompletionErrorMessage(errorCode?: string | string[]): string | null {
  if (typeof errorCode !== "string") {
    return null;
  }

  if (!isSessionCompletionErrorCode(errorCode)) {
    return null;
  }

  return SESSION_COMPLETION_ERROR_MESSAGES[errorCode];
}
