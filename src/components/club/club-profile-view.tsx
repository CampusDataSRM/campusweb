"use client";

import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

import { ClubContactFields, ClubIdentityFields, toProfileInput, type ClubProfileFormValues } from "@/components/club/club-profile-fields";
import { FormField } from "@/components/club/form-field";
import { ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { PageHeader, Section } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClubProfile, useUpdateClubPassword, useUpdateClubProfile } from "@/hooks/use-club";
import type { Club } from "@/network-calls/types";

function ProfileForm({ club }: { club: Club }) {
  const save = useUpdateClubProfile();
  const [logo, setLogo] = useState<File | null>(null);
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ClubProfileFormValues>({
    defaultValues: {
      name: club.name ?? "",
      description: club.description ?? "",
      websiteLink: club.websiteLink ?? "",
      isRecruiting: !!club.isRecruiting,
      label1: club.labels?.[0] ?? "",
      label2: club.labels?.[1] ?? "",
      label3: club.labels?.[2] ?? "",
    },
  });
  return (
    <form noValidate onSubmit={handleSubmit((values) => save.mutate(toProfileInput(values, logo)))} className="flex flex-col gap-5 rounded-3xl panel p-5 sm:p-6">
      <ClubIdentityFields register={register} errors={errors} />
      <ClubContactFields register={register} errors={errors} onLogo={setLogo} logoName={logo?.name} />
      <Button type="submit" size="touch" className="w-fit" disabled={save.isPending || (!isDirty && !logo)}>
        {save.isPending && <Loader2 className="animate-spin" aria-hidden />} Save profile
      </Button>
    </form>
  );
}

function PasswordForm() {
  const id = useId();
  const update = useUpdateClubPassword();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<{ current: string; next: string; confirm: string }>();
  return (
    <form
      noValidate
      onSubmit={handleSubmit((v) => update.mutate({ currentPassword: v.current, NewPassword: v.next, PasswordConfirm: v.confirm }, { onSuccess: () => reset() }))}
      className="flex flex-col gap-4 rounded-3xl panel p-5 sm:p-6"
    >
      <FormField id={`${id}-c`} label="Current password" error={errors.current?.message}>
        <Input id={`${id}-c`} type="password" autoComplete="current-password" className="h-11 rounded-xl" {...register("current", { required: "Enter your current password." })} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id={`${id}-n`} label="New password" error={errors.next?.message}>
          <Input id={`${id}-n`} type="password" autoComplete="new-password" className="h-11 rounded-xl" {...register("next", { required: "Choose a new password.", minLength: { value: 8, message: "Use at least 8 characters." } })} />
        </FormField>
        <FormField id={`${id}-r`} label="Confirm new password" error={errors.confirm?.message}>
          <Input id={`${id}-r`} type="password" autoComplete="new-password" className="h-11 rounded-xl" {...register("confirm", { validate: (v) => v === watch("next") || "Passwords don't match." })} />
        </FormField>
      </div>
      <Button type="submit" size="touch" variant="tonal" className="w-fit" disabled={update.isPending}>
        {update.isPending && <Loader2 className="animate-spin" aria-hidden />} Change password
      </Button>
    </form>
  );
}

export function ClubProfileView() {
  const profile = useClubProfile();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Club profile" description="What students see on your club page." />
      {profile.isLoading ? (
        <ShimmerBlock className="h-96" />
      ) : !profile.data ? (
        <ErrorState error={profile.error} title="Couldn't load your profile" onRetry={() => void profile.refetch()} />
      ) : (
        <ProfileForm club={profile.data} />
      )}
      <Section title="Password">
        <PasswordForm />
      </Section>
    </div>
  );
}
