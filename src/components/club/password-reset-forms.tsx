"use client";

import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/club/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/auth";
import { useForgotPassword, useResetPassword } from "@/hooks/use-club";
import { getErrorMessage } from "@/lib/api/axios-client";

export function ForgotPasswordForm() {
  const id = useId();
  const forgot = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  if (forgot.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheck aria-hidden className="size-10 text-success-accent" />
        <p className="font-bold text-on-surface">Check your inbox</p>
        <p className="text-sm text-on-surface-muted">If that email has a club account, a reset link is on its way.</p>
      </div>
    );
  }
  return (
    <form noValidate onSubmit={handleSubmit(({ email }) => forgot.mutate(email))} className="flex flex-col gap-5">
      <FormField id={`${id}-email`} label="Club email" error={errors.email?.message}>
        <Input id={`${id}-email`} type="email" autoComplete="email" className="h-12 rounded-xl" {...register("email", { required: "Enter your club's email." })} />
      </FormField>
      {forgot.error && <p role="alert" className="text-sm font-semibold text-danger-accent">{getErrorMessage(forgot.error)}</p>}
      <Button type="submit" size="touch" className="h-12" disabled={forgot.isPending}>
        {forgot.isPending && <Loader2 className="animate-spin" aria-hidden />} Send reset link
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const id = useId();
  const reset = useResetPassword(token);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<{ password: string; passwordConfirm: string }>();

  if (reset.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheck aria-hidden className="size-10 text-success-accent" />
        <p className="font-bold text-on-surface">Password updated</p>
        <Button size="touch" render={<Link href={ROUTES.clubLogin} />} nativeButton={false}>Sign in</Button>
      </div>
    );
  }
  return (
    <form noValidate onSubmit={handleSubmit((values) => reset.mutate(values))} className="flex flex-col gap-5">
      <FormField id={`${id}-p`} label="New password" error={errors.password?.message} hint="At least 8 characters.">
        <Input id={`${id}-p`} type="password" autoComplete="new-password" className="h-12 rounded-xl" {...register("password", { required: "Choose a password.", minLength: { value: 8, message: "Use at least 8 characters." } })} />
      </FormField>
      <FormField id={`${id}-c`} label="Confirm password" error={errors.passwordConfirm?.message}>
        <Input id={`${id}-c`} type="password" autoComplete="new-password" className="h-12 rounded-xl" {...register("passwordConfirm", { validate: (v) => v === watch("password") || "Passwords don't match." })} />
      </FormField>
      {reset.error && <p role="alert" className="text-sm font-semibold text-danger-accent">{getErrorMessage(reset.error)}</p>}
      <Button type="submit" size="touch" className="h-12" disabled={reset.isPending}>
        {reset.isPending && <Loader2 className="animate-spin" aria-hidden />} Set new password
      </Button>
    </form>
  );
}
