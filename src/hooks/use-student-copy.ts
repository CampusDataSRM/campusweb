"use client";

import { copyFor, type StudentCopy } from "@/constants/copy";
import { useSession } from "@/context/session-context";

export function useStudentCopy(): StudentCopy {
  return copyFor(useSession().session?.kind);
}
