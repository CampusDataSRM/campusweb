"use client";

import { useId } from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

import { FormField } from "@/components/club/form-field";
import { Input } from "@/components/ui/input";

export interface ClubProfileFormValues {
  name: string;
  description: string;
  websiteLink: string;
  isRecruiting: boolean;
  label1: string;
  label2: string;
  label3: string;
}

const LABEL_FIELDS = ["label1", "label2", "label3"] as const;

/** Club identity fields, shared by sign-up and profile editing. */
export function ClubIdentityFields({ register, errors }: { register: UseFormRegister<ClubProfileFormValues>; errors: FieldErrors<ClubProfileFormValues> }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-4">
      <FormField id={`${id}-name`} label="Club name" error={errors.name?.message}>
        <Input id={`${id}-name`} className="h-11 rounded-xl" {...register("name", { required: "Your club needs a name." })} />
      </FormField>
      <FormField id={`${id}-desc`} label="What does your club do?" error={errors.description?.message}>
        <textarea
          id={`${id}-desc`}
          rows={4}
          className="w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-base text-on-surface placeholder:text-on-surface-subtle focus-visible:border-ring md:text-sm"
          {...register("description", { required: "Tell students what you do.", maxLength: { value: 600, message: "Keep it under 600 characters." } })}
        />
      </FormField>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-on-surface-muted">Up to three labels</legend>
        <div className="grid grid-cols-3 gap-2">
          {LABEL_FIELDS.map((field, index) => (
            <Input key={field} aria-label={`Label ${index + 1}`} placeholder={["Tech", "Design", "Social"][index]} className="h-11 rounded-xl" {...register(field)} />
          ))}
        </div>
      </fieldset>
      <label className="flex min-h-11 items-center gap-3 rounded-xl border border-outline-variant bg-surface-high px-4 text-sm font-semibold text-on-surface">
        <input type="checkbox" className="size-5 accent-[var(--primary)]" {...register("isRecruiting")} />
        We&apos;re recruiting new members
      </label>
    </div>
  );
}

export function ClubContactFields({
  register,
  errors,
  onLogo,
  logoName,
}: {
  register: UseFormRegister<ClubProfileFormValues>;
  errors: FieldErrors<ClubProfileFormValues>;
  onLogo: (file: File | null) => void;
  logoName?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-4">
      <FormField id={`${id}-web`} label="Website or social link" error={errors.websiteLink?.message}>
        <Input id={`${id}-web`} type="url" placeholder="https://" className="h-11 rounded-xl" {...register("websiteLink", { pattern: { value: /^https?:\/\/\S+$/i, message: "Use a full link starting with https://" } })} />
      </FormField>
      <FormField id={`${id}-logo`} label="Logo" hint={logoName ? `Selected: ${logoName}` : "Square image, PNG or JPG, up to 2 MB."}>
        <Input
          id={`${id}-logo`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="h-11 rounded-xl pt-2"
          onChange={(event) => onLogo(event.target.files?.[0] ?? null)}
        />
      </FormField>
    </div>
  );
}

export const toProfileInput = (values: ClubProfileFormValues, logo: File | null) => ({
  name: values.name.trim(),
  description: values.description.trim(),
  websiteLink: values.websiteLink.trim(),
  isRecruiting: values.isRecruiting,
  labels: [values.label1.trim(), values.label2.trim(), values.label3.trim()] as [string, string, string],
  logo,
});
