export const STUDENT_PORTAL_SESSION_MARKER = "sp_session=http_only";

export const isStudentPortalSession = (value = "") =>
  value.trim().startsWith("sp_session=");
