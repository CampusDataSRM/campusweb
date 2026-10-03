"use client";

import { KeyRound, Loader2 } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentPortalUnlock } from "@/hooks/use-student-portal-unlock";

/**
 * Shown when attendance must come from the Student Portal and its session
 * has lapsed: one password field, used once to reconnect and not kept.
 */
export function UnlockPrompt({ subject = "attendance" }: { subject?: string }) {
  const id = useId();
  const [password, setPassword] = useState("");
  const unlock = useStudentPortalUnlock();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (password) unlock.mutate(password, { onSuccess: () => setPassword("") });
      }}
      className="flex flex-col gap-4 rounded-3xl border border-primary/40 bg-primary-container/40 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
          <KeyRound aria-hidden className="size-5" />
        </span>
        <div>
          <h2 className="font-heading font-bold text-on-surface">Unlock {subject}</h2>
          <p className="text-sm text-on-surface-muted">
            Enter your password to load your latest {subject}. It&apos;s used once to sync and never saved.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Label htmlFor={id} className="sr-only">Password</Label>
        <Input
          id={id}
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={unlock.isPending}
          className="h-11 flex-1 rounded-xl bg-surface-highest/60"
        />
        <Button type="submit" size="touch" disabled={!password || unlock.isPending}>
          {unlock.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {unlock.isPending ? "Syncing" : `Load ${subject}`}
        </Button>
      </div>
      {unlock.error && (
        <p role="alert" className="text-sm font-semibold text-danger-accent">{unlock.error.message}</p>
      )}
    </form>
  );
}
