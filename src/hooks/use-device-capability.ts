"use client";

import { useEffect, useState } from "react";

interface NavigatorWithHints extends Navigator {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
}

/**
 * Whether this device should run decorative animation (canvas/WebGL
 * backgrounds). All must hold: no reduced-motion preference, no data saver,
 * more than 4 CPU threads, more than 4 GB memory (or unreported), and a fine
 * pointer. False until mounted - so nothing heavy ships in the first paint.
 */
export function useCanRunEffects(): boolean {
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    const nav = navigator as NavigatorWithHints;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () =>
      setCapable(
        !reduced.matches &&
          !nav.connection?.saveData &&
          (nav.hardwareConcurrency ?? 0) > 4 &&
          (nav.deviceMemory === undefined || nav.deviceMemory > 4) &&
          window.matchMedia("(pointer: fine)").matches,
      );
    evaluate();
    reduced.addEventListener("change", evaluate);
    return () => reduced.removeEventListener("change", evaluate);
  }, []);

  return capable;
}
