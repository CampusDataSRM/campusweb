export const resolveStudentBatch = (comboBatch) => {
  if (Array.isArray(comboBatch)) {
    return comboBatch.at(-1) || "";
  }
  return typeof comboBatch === "string" ? comboBatch.trim() : "";
};
