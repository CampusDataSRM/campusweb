"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type State = "idle" | "loading" | "done";

/**
 * A thin glowing line across the top while the next page loads. Starts on a
 * click of any same-site link to another page; finishes when the path
 * changes. Pure CSS animation (see `.route-progress`).
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<{ state: State; path: string }>({ state: "idle", path: pathname });

  // Finish on arrival - derived during render, no effect needed.
  if (state.path !== pathname) {
    setState({ state: state.state === "loading" ? "done" : "idle", path: pathname });
  }

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Capture phase: next/link calls preventDefault() on its own clicks,
      // so this has to look before it does.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      setState((current) => ({ ...current, state: "loading" }));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (state.state === "idle") return null;
  return (
    <div
      aria-hidden
      data-state={state.state}
      className="route-progress"
      onAnimationEnd={() => state.state === "done" && setState((current) => ({ ...current, state: "idle" }))}
    />
  );
}
