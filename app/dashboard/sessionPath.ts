const SESSION_ID_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DASHBOARD_PATH = "/dashboard";

export function isSessionId(value: string): boolean {
  return SESSION_ID_UUID_PATTERN.test(value);
}

export function isAllowedDashboardReturnPath(value: string): boolean {
  if (value === DASHBOARD_PATH) {
    return true;
  }

  if (!value.startsWith(`${DASHBOARD_PATH}/session/`)) {
    return false;
  }

  const sessionId = value.slice(`${DASHBOARD_PATH}/session/`.length);
  return isSessionId(sessionId);
}
