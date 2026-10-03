"use client";

import { Loader2 } from "lucide-react";
import { useId } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/club/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClubSignIn } from "@/hooks/use-club";
import { ApiError } from "@/lib/api/axios-client";

export function ClubSignInForm() {
  const id = useId();
  const signIn = useClubSignIn();
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>();
  const message =
    signIn.error instanceof ApiError && (signIn.error.status === 401 || signIn.error.status === 400)
      ? "Incorrect email or password."
      : signIn.error
        ? "Sign-in didn't go through. Please try again."
        : null;

  return (
    <form noValidate onSubmit={handleSubmit((values) => signIn.mutate(values))} className="flex flex-col gap-5">
      <FormField id={`${id}-email`} label="Club email" error={errors.email?.message}>
        <Input id={`${id}-email`} type="email" autoComplete="email" className="h-12 rounded-xl" {...register("email", { required: "Enter your club's email." })} />
      </FormField>
      <FormField id={`${id}-password`} label="Password" error={errors.password?.message}>
        <Input id={`${id}-password`} type="password" autoComplete="current-password" className="h-12 rounded-xl" {...register("password", { required: "Enter your password." })} />
      </FormField>
      {message && <p role="alert" className="rounded-xl bg-danger-container px-4 py-3 text-sm font-semibold text-on-danger-container">{message}</p>}
      <Button type="submit" size="touch" className="h-12" disabled={signIn.isPending}>
        {signIn.isPending && <Loader2 className="animate-spin" aria-hidden />}
        Sign in
      </Button>
    </form>
  );
}
