"use client";

import { isDemoSession } from "@/functions/demo/student-demo";

const DemoNotice = () => {
  if (!isDemoSession()) return null;

  return (
    <div className="mb-4 rounded-lg border border-theme_primary/40 bg-theme_primary/10 px-3 py-2 text-sm tracking-wide text-theme_text_primary">
      Demo account — all names and records shown here are fictional sample data.
    </div>
  );
};

export default DemoNotice;
