"use client";

/**
 * CGPA calculator state with undo. Lives in sessionStorage so a refresh keeps
 * the student's edits for this tab; a new tab starts from their courses.
 */

import { useCallback, useEffect, useReducer } from "react";

import { useStudentDataApi, useProfile } from "@/hooks/use-student-data";
import { seedSubjects, type CgpaSubject } from "@/lib/student/cgpa";
import { sessionGet, sessionSet } from "@/lib/session-storage";

const UNDO_LIMIT = 20;

interface State {
  subjects: CgpaSubject[];
  history: CgpaSubject[][];
  seeded: boolean;
}

type Action =
  | { type: "load"; subjects: CgpaSubject[] }
  | { type: "change"; subjects: CgpaSubject[] }
  | { type: "undo" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load":
      return { subjects: action.subjects, history: [], seeded: true };
    case "change":
      return {
        subjects: action.subjects,
        history: [...state.history, state.subjects].slice(-UNDO_LIMIT),
        seeded: true,
      };
    case "undo": {
      const previous = state.history[state.history.length - 1];
      return previous ? { ...state, subjects: previous, history: state.history.slice(0, -1) } : state;
    }
  }
}

export function useCgpaCalculator() {
  const api = useStudentDataApi();
  const profile = useProfile();
  const storageKey = `cgpa:${api.scope}`;
  const [state, dispatch] = useReducer(reducer, { subjects: [], history: [], seeded: false });

  // Seed once: this tab's saved edits, else the student's courses.
  useEffect(() => {
    if (state.seeded || !api.ready) return;
    const saved = sessionGet<CgpaSubject[]>(storageKey);
    if (saved && Array.isArray(saved)) dispatch({ type: "load", subjects: saved });
    else if (profile.data) dispatch({ type: "load", subjects: seedSubjects(profile.data) });
  }, [state.seeded, api.ready, storageKey, profile.data]);

  useEffect(() => {
    if (state.seeded) sessionSet(storageKey, state.subjects);
  }, [state.seeded, state.subjects, storageKey]);

  const update = useCallback(
    (id: string, patch: Partial<Omit<CgpaSubject, "id">>) =>
      dispatch({ type: "change", subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)) }),
    [state.subjects],
  );
  const remove = useCallback(
    (id: string) => dispatch({ type: "change", subjects: state.subjects.filter((s) => s.id !== id) }),
    [state.subjects],
  );
  const add = useCallback(
    (subject?: Omit<CgpaSubject, "id">) =>
      dispatch({
        type: "change",
        subjects: [...state.subjects, { id: `custom-${Date.now()}`, name: "", credits: 3, grade: "O", ...subject }],
      }),
    [state.subjects],
  );
  const reset = useCallback(
    () => dispatch({ type: "change", subjects: seedSubjects(profile.data) }),
    [profile.data],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);

  return {
    subjects: state.subjects,
    ready: state.seeded,
    canUndo: state.history.length > 0,
    missingCourses: seedSubjects(profile.data).filter((course) => !state.subjects.some((s) => s.id === course.id)),
    update,
    remove,
    add,
    reset,
    undo,
  };
}
