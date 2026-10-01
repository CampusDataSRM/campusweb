import { useEffect, useState } from "react";
import { isDemoSession } from "@/functions/demo/student-demo";

// Whether this is the evaluator (campusdemo) session, read after mount so the
// prerendered page and the first client render agree.
//
// As in Campus App, the evaluator sees an events programme, not a timetable
// of classes: attendance reads as check-ins, marks as event scores.
export const useDemoSession = () => {
  const [demo, setDemo] = useState(false);
  useEffect(() => setDemo(isDemoSession()), []);
  return demo;
};
