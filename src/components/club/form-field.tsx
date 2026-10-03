import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

/** Label, control and error message, wired for screen readers. */
export function FormField({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-on-surface-muted">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-on-surface-subtle">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-sm text-danger-accent">{error}</p>}
    </div>
  );
}
