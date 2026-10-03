/** A short tick on phones that support it (Android Chrome); silent elsewhere. */
export function tapHaptic(): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(8);
  } catch {
    // Blocked until the user has interacted, or by policy - nothing to do.
  }
}
