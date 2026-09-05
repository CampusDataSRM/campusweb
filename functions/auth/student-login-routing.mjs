export const extractStudentPortalSemester = (payload) => {
  const raw =
    payload?.semester_id ??
    payload?.semesterid ??
    payload?.semesterId ??
    payload?.student?.semester_id ??
    payload?.student?.semesterid ??
    payload?.student?.semesterId;
  if (raw === null || raw === undefined || String(raw).trim() === "") {
    return null;
  }
  const semester = Number(raw);
  return Number.isInteger(semester) && semester > 0 ? semester : null;
};

export const usesStudentPortalPrimary = (payload) => {
  const semester = extractStudentPortalSemester(payload);
  if (semester === 1 || semester === 2) return true;

  // Compatibility for older Student Portal payloads that supplied the
  // registration number but not semester_id. RA26 is the 2026 first-year
  // intake. This is deliberately only a fallback; semester remains primary.
  const registration = String(
    payload?.registration_number ??
      payload?.registerno ??
      payload?.student?.registration_number ??
      payload?.student?.registerno ??
      "",
  ).toUpperCase();
  return /^RA26/.test(registration);
};
