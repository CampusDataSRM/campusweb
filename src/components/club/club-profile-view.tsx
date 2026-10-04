"use client";

import { AtSign, Loader2 } from "lucide-react";
import Image from "next/image";
import { useId, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  ClubContactFields,
  ClubIdentityFields,
  toProfileInput,
  type ClubProfileFormValues,
} from "@/components/club/club-profile-fields";
import { FormField } from "@/components/club/form-field";
import { ClubPasswordField } from "@/components/club/club-password-field";
import { ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { PageHeader, Section } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  useClubEvents,
  useUpdateClubPassword,
  useUpdateClubProfile,
} from "@/hooks/use-club";
import type { Club } from "@/network-calls/types";

function StatusPill({ club }: { club: Club }) {
  return club.verified ? (
    <span className="rounded-full bg-success-container px-2.5 py-1 text-xs font-extrabold text-on-success-container">
      Verified
    </span>
  ) : (
    <span className="rounded-full bg-warning-container px-2.5 py-1 text-xs font-extrabold text-on-warning-container">
      Awaiting verification
    </span>
  );
}

function ProfileForm({ club }: { club: Club }) {
  const save = useUpdateClubProfile();
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ClubProfileFormValues>({
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

  useEffect(() => {
    if (!logo) return;
    const url = URL.createObjectURL(logo);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        save.mutate(toProfileInput(values, logo)),
      )}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section
          aria-label="Club identity"
          className="flex flex-col gap-5 rounded-3xl panel p-5 sm:p-6"
        >
          <h2 className="text-h3 font-bold text-on-surface">Identity</h2>
          <ClubIdentityFields register={register} errors={errors} />
        </section>
        <section
          aria-label="Links and logo"
          className="flex flex-col gap-5 rounded-3xl panel p-5 sm:p-6"
        >
          <h2 className="text-h3 font-bold text-on-surface">Links &amp; logo</h2>
          <ClubContactFields
            register={register}
            errors={errors}
            onLogo={setLogo}
            logoName={logo?.name}
            logoPreviewUrl={logoPreview}
            currentLogoUrl={club.logo}
          />
        </section>
      </div>
      <Button
        type="submit"
        size="touch"
        className="w-fit"
        disabled={save.isPending || (!isDirty && !logo)}
      >
        {save.isPending && <Loader2 className="animate-spin" aria-hidden />}{" "}
        Save profile
      </Button>
    </form>
  );
}

function PasswordForm() {
  const id = useId();
  const update = useUpdateClubPassword();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<{ current: string; next: string; confirm: string }>();
  return (
    <form
      noValidate
      onSubmit={handleSubmit((v) =>
        update.mutate(
          {
            currentPassword: v.current,
            NewPassword: v.next,
            PasswordConfirm: v.confirm,
          },
          { onSuccess: () => reset() },
        ),
      )}
      className="flex flex-col gap-4 rounded-3xl panel p-5 sm:p-6"
    >
      <FormField
        id={`${id}-c`}
        label="Current password"
        error={errors.current?.message}
      >
        <ClubPasswordField
          id={`${id}-c`}
          autoComplete="current-password"
          {...register("current", { required: "Enter your current password." })}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id={`${id}-n`}
          label="New password"
          error={errors.next?.message}
        >
          <ClubPasswordField
            id={`${id}-n`}
            autoComplete="new-password"
            {...register("next", {
              required: "Choose a new password.",
              minLength: { value: 8, message: "Use at least 8 characters." },
            })}
          />
        </FormField>
        <FormField
          id={`${id}-r`}
          label="Confirm new password"
          error={errors.confirm?.message}
        >
          <ClubPasswordField
            id={`${id}-r`}
            autoComplete="new-password"
            {...register("confirm", {
              validate: (v) => v === watch("next") || "Passwords don't match.",
            })}
          />
        </FormField>
      </div>
      <Button
        type="submit"
        size="touch"
        variant="tonal"
        className="w-fit"
        disabled={update.isPending}
      >
        {update.isPending && <Loader2 className="animate-spin" aria-hidden />}{" "}
        Change password
      </Button>
    </form>
  );
}

/** The club's public face, and the password behind it. */
export function ClubProfileView() {
  const profile = useClubEvents();
  const club = profile.data?.club;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Club profile"
        description="What students see on your club page."
      />
      {profile.isPending ? (
        <ShimmerBlock className="h-32 rounded-3xl" />
      ) : !club ? (
        <ErrorState
          error={profile.error}
          title="Couldn't load your profile"
          onRetry={() => void profile.refetch()}
        />
      ) : (
        <section
          aria-label="Your club"
          className="relative overflow-hidden rounded-3xl panel panel-raised p-5 sm:p-6"
        >
          <div className="relative z-10 flex items-center gap-4">
            <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container sm:size-20">
              {club.logo ? (
                <Image
                  src={club.logo}
                  alt=""
                  width={80}
                  height={80}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-heading text-h2 font-extrabold text-primary-accent">
                  {club.name?.trim()?.[0]?.toUpperCase() ?? "C"}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-h3 font-bold text-on-surface">
                  {club.name ?? "Your club"}
                </h2>
                <StatusPill club={club} />
                {club.isRecruiting && (
                  <span className="rounded-full bg-secondary-container px-2.5 py-1 text-xs font-extrabold text-on-secondary-container">
                    Recruiting
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-on-surface-muted">
                <AtSign aria-hidden className="size-3.5" />
                {club.email}
              </p>
            </div>
          </div>
        </section>
      )}
      {club && <ProfileForm club={club} />}
      <Section title="Password">
        <PasswordForm />
      </Section>
    </div>
  );
}
