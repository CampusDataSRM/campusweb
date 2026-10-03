"use client";

import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/auth";
import { LEGAL_ROUTES } from "@/constants/routes";
import { useBrowseAsGuest, useSignIn } from "@/hooks/use-auth-actions";
import { SignInError } from "@/lib/auth/sign-in-error";
import { cn } from "@/lib/utils";

interface FormValues {
  username: string;
  password: string;
}

/**
 * Student sign-in. Errors show inline under the form (screen readers get
 * them via role="alert"); the button turns into a spinner while the parallel
 * login runs, and the form is disabled so it cannot be sent twice.
 */
export function SignInForm() {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const signIn = useSignIn();
  const browseAsGuest = useBrowseAsGuest();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { username: "", password: "" } });

  const pending = signIn.isPending;
  const serverError =
    signIn.error instanceof SignInError
      ? signIn.error.message
      : signIn.error
        ? "Sign-in didn't go through. Please try again."
        : null;

  return (
    <form
      noValidate
      aria-busy={pending}
      onSubmit={handleSubmit((values) => signIn.mutate(values))}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-username`} className="text-on-surface-muted">
          Username
        </Label>
        <div className="relative">
          <UserRound
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-[1.125rem] -translate-y-1/2 text-on-surface-subtle"
          />
          <Input
            id={`${id}-username`}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="e.g. ab1234"
            disabled={pending}
            aria-invalid={!!errors.username}
            className="h-12 rounded-xl bg-surface-highest/60 pl-11 text-base"
            {...register("username", {
              validate: (value) => value.trim().length > 0 || "Enter your username.",
            })}
          />
        </div>
        {errors.username && (
          <p className="text-sm text-danger-accent">{errors.username.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-password`} className="text-on-surface-muted">
          Password
        </Label>
        <div className="relative">
          <LockKeyhole
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-[1.125rem] -translate-y-1/2 text-on-surface-subtle"
          />
          <Input
            id={`${id}-password`}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your password"
            disabled={pending}
            aria-invalid={!!errors.password}
            className="h-12 rounded-xl bg-surface-highest/60 pr-12 pl-11 text-base"
            {...register("password", {
              validate: (value) => value.length > 0 || "Enter your password.",
            })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1.5 size-9 -translate-y-1/2 rounded-lg text-on-surface-muted"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-danger-accent">{errors.password.message}</p>
        )}
      </div>

      <div aria-live="polite">
        {serverError && (
          <p
            role="alert"
            className="rounded-xl border border-danger/40 bg-danger-container px-4 py-3 text-sm font-semibold text-on-danger-container"
          >
            {serverError}
          </p>
        )}
      </div>

      <Button type="submit" size="touch" disabled={pending} className="h-12 text-base">
        {pending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Signing in
          </>
        ) : (
          "Sign in"
        )}
      </Button>


      <Button
        type="button"
        variant="outline"
        size="touch"
        disabled={pending}
        onClick={() => void browseAsGuest()}
        className="h-12"
      >
        Just looking? Browse as a guest
      </Button>

      <div className="flex flex-col items-center gap-2 pt-1 text-sm">
        <Link
          href={ROUTES.clubLogin}
          className={cn(
            "font-semibold text-primary-accent underline-offset-4 hover:underline",
            pending && "pointer-events-none opacity-50",
          )}
        >
          Organising a club? Open the club portal
        </Link>
        <p className="text-center text-xs text-on-surface-subtle">
          Your password is only used to sign you in - it is never saved.{" "}
          <Link href={LEGAL_ROUTES.center} className="underline underline-offset-2 hover:text-on-surface-muted">
            Legal &amp; policies
          </Link>
        </p>
      </div>
    </form>
  );
}
