/** Profile helpers: validity, display names and initials. */

import type { StudentProfile } from "@/network-calls/types";

/** A profile is usable only with a name or registration number (as in the app). */
export const isUsableProfile = (profile: StudentProfile | null | undefined) =>
  !!profile && !!(profile.registrationNumber?.trim() || profile.name?.trim());

/** "JANE DOE" -> "Jane Doe". */
export function titleCase(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|[\s.'-])(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase());
}

export function initials(name: string | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export const firstName = (name: string | undefined) => titleCase(name).split(" ")[0] ?? "";
