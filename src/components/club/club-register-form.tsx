"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useId, useState, useEffect } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";

import { ClubContactFields, ClubIdentityFields, toProfileInput, type ClubProfileFormValues } from "@/components/club/club-profile-fields";
import { FormField } from "@/components/club/form-field";
import { ClubPasswordField } from "@/components/club/club-password-field";
import Stepper, { Step } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/auth";
import { useRegisterClub } from "@/hooks/use-club";
import { getErrorMessage } from "@/lib/api/axios-client";

interface RegisterValues extends ClubProfileFormValues {
  email: string;
  password: string;
  passwordConfirm: string;
}

const STEP_FIELDS: Record<number, (keyof RegisterValues)[]> = {
  1: ["name", "description"],
  2: ["websiteLink"],
  3: ["email", "password", "passwordConfirm"],
};

/** Club sign-up in three steps; each step validates before moving on. */
export function ClubRegisterForm() {
  const id = useId();
  const registerClub = useRegisterClub();
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!logo) {
      setLogoPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(logo);
    setLogoPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logo]);
  const { register, trigger, getValues, watch, formState: { errors } } = useForm<RegisterValues>({
    mode: "onTouched",
    defaultValues: { name: "", description: "", websiteLink: "", isRecruiting: false, label1: "", label2: "", label3: "", email: "", password: "", passwordConfirm: "" },
  });

  if (registerClub.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-success-container text-success-accent">
          <CheckCircle2 aria-hidden className="size-6" />
        </span>
        <p className="font-heading text-h3 font-bold text-on-surface">Club registered</p>
        <p className="text-sm text-on-surface-muted">
          Once your club is verified it appears to every student. Sign in to post your first event.
        </p>
        <Button size="touch" render={<Link href={ROUTES.clubLogin} />} nativeButton={false}>Sign in</Button>
      </div>
    );
  }

  // The sign-up form is a superset of the profile form, so the shared
  // profile fields can register into it.
  const registerProfile = register as unknown as UseFormRegister<ClubProfileFormValues>;

  const submit = async () => {
    if (!(await trigger(STEP_FIELDS[3]))) return;
    const values = getValues();
    registerClub.mutate({ ...toProfileInput(values, logo), email: values.email.trim(), password: values.password, passwordConfirm: values.passwordConfirm });
  };

  return (
    <div className="flex flex-col gap-4">
      <Stepper
        initialStep={1}
        onStepChange={setStep}
        onFinalStepCompleted={() => void submit()}
        backButtonText="Back"
        nextButtonText="Next"
        completeButtonText="Create club account"
        stepCircleContainerClassName="!max-w-full !border-0 !shadow-none"
        stepContainerClassName="!px-0 !pt-0"
        contentClassName="!px-0"
        footerClassName="!px-0 !pb-0"
        nextButtonProps={{
          disabled: registerClub.isPending,
          onClickCapture: async (event) => {
            if (step >= 3) return;
            if (!(await trigger(STEP_FIELDS[step]))) {
              event.stopPropagation();
              event.preventDefault();
            }
          },
        }}
      >
        <Step>
          <ClubIdentityFields register={registerProfile} errors={errors} />
        </Step>
        <Step>
          <ClubContactFields register={registerProfile} errors={errors} onLogo={setLogo} logoName={logo?.name} logoPreviewUrl={logoPreviewUrl} />
        </Step>
        <Step>
          <div className="flex flex-col gap-4">
            <FormField id={`${id}-email`} label="Club email" error={errors.email?.message} hint="You'll sign in with this, and reset links go here.">
              <Input id={`${id}-email`} type="email" autoComplete="email" className="h-12 rounded-xl" {...register("email", { required: "Enter an email.", pattern: { value: /^\S+@\S+\.\S+$/, message: "That doesn't look like an email." } })} />
            </FormField>
            <FormField id={`${id}-pw`} label="Password" error={errors.password?.message}>
              <ClubPasswordField id={`${id}-pw`} autoComplete="new-password" {...register("password", { required: "Choose a password.", minLength: { value: 8, message: "Use at least 8 characters." } })} />
            </FormField>
            <FormField id={`${id}-pc`} label="Confirm password" error={errors.passwordConfirm?.message}>
              <ClubPasswordField id={`${id}-pc`} autoComplete="new-password" {...register("passwordConfirm", { validate: (v) => v === watch("password") || "Passwords don't match." })} />
            </FormField>
          </div>
        </Step>
      </Stepper>
      {registerClub.error && <p role="alert" className="text-center text-sm font-semibold text-danger-accent">{getErrorMessage(registerClub.error)}</p>}
    </div>
  );
}
