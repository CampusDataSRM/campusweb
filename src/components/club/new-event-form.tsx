"use client";

import { ImageUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/club/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/auth";
import { useCreateEvent } from "@/hooks/use-club";
import { getErrorMessage } from "@/lib/api/axios-client";
import { notify } from "@/lib/toast";

interface Values {
  title: string;
  websiteLink: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  odsProvided: boolean;
  refreshmentsProvided: boolean;
  label1: string;
  label2: string;
  label3: string;
}

const MAX_BANNER_BYTES = 5 * 1024 * 1024;

/** Post an event: details, schedule, perks, labels and a banner (previewed). */
export function NewEventForm() {
  const id = useId();
  const router = useRouter();
  const create = useCreateEvent();
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Values>({
    defaultValues: { odsProvided: false, refreshmentsProvided: false, label1: "", label2: "", label3: "" },
  });

  useEffect(() => {
    if (!banner) return;
    const url = URL.createObjectURL(banner);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [banner]);

  const onSubmit = handleSubmit((values) => {
    if (!banner) {
      setBannerError("Add a banner image.");
      return;
    }
    create.mutate(
      {
        ...values,
        title: values.title.trim(),
        websiteLink: values.websiteLink.trim(),
        labels: [values.label1.trim(), values.label2.trim(), values.label3.trim()],
        banner,
      },
      {
        onSuccess: () => {
          notify.success("Event published");
          router.replace(ROUTES.club);
        },
      },
    );
  });

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-4 rounded-3xl border border-outline-variant bg-surface-container p-5 sm:p-6">
        <FormField id={`${id}-title`} label="Event title" error={errors.title?.message}>
          <Input id={`${id}-title`} className="h-11 rounded-xl" {...register("title", { required: "Give the event a title.", maxLength: { value: 120, message: "Keep it under 120 characters." } })} />
        </FormField>
        <FormField id={`${id}-link`} label="Registration link" error={errors.websiteLink?.message}>
          <Input id={`${id}-link`} type="url" placeholder="https://" className="h-11 rounded-xl" {...register("websiteLink", { required: "Students need somewhere to register.", pattern: { value: /^https?:\/\/\S+$/i, message: "Use a full link starting with https://" } })} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id={`${id}-sd`} label="Starts on" error={errors.startDate?.message}>
            <Input id={`${id}-sd`} type="date" className="h-11 rounded-xl" {...register("startDate", { required: "Pick a start date." })} />
          </FormField>
          <FormField id={`${id}-ed`} label="Ends on" error={errors.endDate?.message}>
            <Input id={`${id}-ed`} type="date" className="h-11 rounded-xl" {...register("endDate", { required: "Pick an end date.", validate: (v) => v >= watch("startDate") || "Ends before it starts." })} />
          </FormField>
          <FormField id={`${id}-st`} label="From" error={errors.startTime?.message}>
            <Input id={`${id}-st`} type="time" className="h-11 rounded-xl" {...register("startTime", { required: "Pick a start time." })} />
          </FormField>
          <FormField id={`${id}-et`} label="Until" error={errors.endTime?.message}>
            <Input id={`${id}-et`} type="time" className="h-11 rounded-xl" {...register("endTime", { required: "Pick an end time." })} />
          </FormField>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-outline-variant bg-surface-high px-4 text-sm font-semibold text-on-surface">
            <input type="checkbox" className="size-5 accent-[var(--primary)]" {...register("odsProvided")} /> OD provided
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-outline-variant bg-surface-high px-4 text-sm font-semibold text-on-surface">
            <input type="checkbox" className="size-5 accent-[var(--primary)]" {...register("refreshmentsProvided")} /> Refreshments
          </label>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium text-on-surface-muted">Up to three labels</legend>
          <div className="grid grid-cols-3 gap-2">
            {(["label1", "label2", "label3"] as const).map((field, i) => (
              <Input key={field} aria-label={`Label ${i + 1}`} placeholder={["Workshop", "Tech", "Free"][i]} className="h-11 rounded-xl" {...register(field)} />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col gap-4">
        <label className="group relative flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border-2 border-dashed border-outline bg-surface-container text-center transition-colors hover:border-primary">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local object URL; nothing to optimise
            <img src={preview} alt="Banner preview" className="absolute inset-0 size-full object-cover" />
          ) : (
            <>
              <ImageUp aria-hidden className="size-8 text-on-surface-muted" />
              <span className="text-sm font-semibold text-on-surface">Add a banner</span>
              <span className="text-xs text-on-surface-subtle">16:9, PNG or JPG, up to 5 MB</span>
            </>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              if (file && file.size > MAX_BANNER_BYTES) {
                setBannerError("That image is over 5 MB.");
                return;
              }
              setBannerError(null);
              setBanner(file);
            }}
          />
        </label>
        {bannerError && <p className="text-sm text-danger-accent">{bannerError}</p>}
        {create.error && <p role="alert" className="text-sm font-semibold text-danger-accent">{getErrorMessage(create.error)}</p>}
        <Button type="submit" size="touch" className="h-12" disabled={create.isPending}>
          {create.isPending && <Loader2 className="animate-spin" aria-hidden />} Publish event
        </Button>
      </div>
    </form>
  );
}
