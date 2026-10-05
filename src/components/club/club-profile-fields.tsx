"use client";

import { ImageUp, Check } from "lucide-react";
import { useId, useState } from "react";
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
export function ClubIdentityFields({
  register,
  errors,
}: {
  register: UseFormRegister<ClubProfileFormValues>;
  errors: FieldErrors<ClubProfileFormValues>;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-4">
      <FormField
        id={`${id}-name`}
        label="Club name"
        error={errors.name?.message}
      >
        <Input
          id={`${id}-name`}
          className="h-12 rounded-xl"
          {...register("name", { required: "Your club needs a name." })}
        />
      </FormField>
      <FormField
        id={`${id}-desc`}
        label="What does your club do?"
        error={errors.description?.message}
      >
        <textarea
          id={`${id}-desc`}
          rows={4}
          className="w-full resize-y rounded-xl border border-input bg-input/30 px-3.5 py-3 text-base text-on-surface transition-colors outline-none placeholder:text-on-surface-subtle focus-visible:border-primary-accent focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary-accent)_16%,transparent),0_0_28px_-8px_var(--primary-accent)] md:text-sm"
          {...register("description", {
            required: "Tell students what you do.",
            maxLength: { value: 600, message: "Keep it under 600 characters." },
          })}
        />
      </FormField>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-on-surface-muted">
          Up to three labels
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LABEL_FIELDS.map((field, index) => (
            <div key={field} className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-subtle"
              >
                #
              </span>
              <Input
                aria-label={`Label ${index + 1}`}
                placeholder={["Tech", "Design", "Social"][index]}
                className="h-12 rounded-xl pl-8"
                {...register(field)}
              />
            </div>
          ))}
        </div>
      </fieldset>
      <label className="group relative block cursor-pointer">
        <input type="checkbox" className="peer sr-only" {...register("isRecruiting")} />
        <span className="relative flex min-h-11 items-center justify-between sm:justify-center gap-2 rounded-xl bg-surface-high px-4 text-sm font-semibold text-on-surface-muted transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
          {/* Unchecked Border */}
          <span className="absolute inset-0 rounded-xl border border-outline-variant transition-opacity group-has-checked:opacity-0" />
          
          {/* Checked Gradient Border */}
          <span 
            className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity group-has-checked:opacity-100" 
            style={{ WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} 
          />

          <span aria-hidden className="static sm:absolute sm:left-4 z-10 flex size-4 shrink-0 items-center justify-center rounded border-2 border-current transition-colors group-has-checked:border-primary group-has-checked:text-primary">
            <Check className="size-3 opacity-0 transition-opacity group-has-checked:opacity-100" strokeWidth={3} />
          </span>
          <span className="z-10 group-has-checked:bg-gradient-to-r group-has-checked:from-primary group-has-checked:to-secondary group-has-checked:bg-clip-text group-has-checked:text-transparent">
            We&apos;re recruiting new members
          </span>
        </span>
      </label>
    </div>
  );
}

export function ClubContactFields({
  register,
  errors,
  onLogo,
  logoName,
  logoPreviewUrl,
  currentLogoUrl,
}: {
  register: UseFormRegister<ClubProfileFormValues>;
  errors: FieldErrors<ClubProfileFormValues>;
  onLogo: (file: File | null) => void;
  logoName?: string;
  /** Preview of the newly chosen file, if the caller made one. */
  logoPreviewUrl?: string | null;
  /** The logo students currently see (profile editing only). */
  currentLogoUrl?: string;
}) {
  const id = useId();
  const [logoError, setLogoError] = useState<string | null>(null);
  const shown = logoPreviewUrl ?? currentLogoUrl;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setLogoError(null);
      onLogo(null);
      return;
    }

    if (file.size > 200 * 1024) {
      setLogoError("Logo must be under 200 KB.");
      onLogo(null);
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setLogoError("Logo must be a JPG, JPEG, or PNG.");
      onLogo(null);
      return;
    }

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width !== img.height) {
        setLogoError("Logo must be perfectly square (1:1 ratio).");
        onLogo(null);
      } else {
        setLogoError(null);
        onLogo(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setLogoError("Invalid image file.");
      onLogo(null);
    };
    img.src = objectUrl;
  };

  return (
    <div className="flex flex-col gap-4">
      <FormField
        id={`${id}-web`}
        label="Website or social link"
        error={errors.websiteLink?.message}
      >
        <Input
          id={`${id}-web`}
          type="url"
          inputMode="url"
          placeholder="https://"
          className="h-12 rounded-xl"
          {...register("websiteLink", {
            pattern: {
              value: /^https?:\/\/\S+$/i,
              message: "Use a full link starting with https://",
            },
          })}
        />
      </FormField>
      <FormField
        id={`${id}-logo`}
        label="Logo"
        error={logoError ?? undefined}
        hint={
          !logoError && logoName
            ? `Selected: ${logoName}`
            : !logoError
              ? "Square image (1:1), PNG or JPG, up to 200 KB."
              : undefined
        }
      >
        <div className="flex items-center gap-4">
          <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-high text-on-surface-muted">
            {shown ? (
              // eslint-disable-next-line @next/next/no-img-element -- may be a local object URL; nothing to optimise
              <img
                src={shown}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <ImageUp aria-hidden className="size-5" />
            )}
          </span>
          <label className="pressable inline-flex h-10 cursor-pointer items-center rounded-lg border border-border bg-input/30 px-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-input/50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
            {logoName ? "Change logo" : "Choose logo"}
            <input
              id={`${id}-logo`}
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </FormField>
    </div>
  );
}

export const toProfileInput = (
  values: ClubProfileFormValues,
  logo: File | null,
) => ({
  name: values.name.trim(),
  description: values.description.trim(),
  websiteLink: values.websiteLink.trim(),
  isRecruiting: values.isRecruiting,
  labels: [
    values.label1.trim(),
    values.label2.trim(),
    values.label3.trim(),
  ] as [string, string, string],
  logo,
});
