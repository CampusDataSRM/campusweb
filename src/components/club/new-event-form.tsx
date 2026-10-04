"use client";

import { ImageUp, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";

import { ClubEventCard } from "@/components/club/club-event-card";
import { FormField } from "@/components/club/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/auth";
import { useClubEvents, useCreateEvent } from "@/hooks/use-club";
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
const MAX_BANNER_BYTES = 600 * 1024;

const LABEL_FIELDS = ["label1", "label2", "label3"] as const;

/** Perk toggles: quiet chips that fill with the primary container when on. */
function PerkToggle({
  name,
  label,
  register,
}: {
  name: "odsProvided" | "refreshmentsProvided";
  label: string;
  register: ReturnType<typeof useForm<Values>>["register"];
}) {
  return (
    <label className="group relative block cursor-pointer">
      <input type="checkbox" className="peer sr-only" {...register(name)} />
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
          {label}
        </span>
      </span>
    </label>
  );
}

/** Post an event: the form on the left, the student's card live on the right. */
export function NewEventForm() {
  const id = useId();
  const router = useRouter();
  const create = useCreateEvent();
  const { data } = useClubEvents();
  const club = data?.club;
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: {
      title: "",
      websiteLink: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      odsProvided: false,
      refreshmentsProvided: false,
      label1: "",
      label2: "",
      label3: "",
    },
  });

  useEffect(() => {
    if (!banner) return;
    const url = URL.createObjectURL(banner);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [banner]);

  const values = watch();
  const draftDates = values.startDate
    ? values.endDate && values.endDate !== values.startDate
      ? `${values.startDate} to ${values.endDate}`
      : values.startDate
    : "";
  const draftTiming = values.startTime
    ? values.endTime
      ? `${values.startTime} to ${values.endTime}`
      : values.startTime
    : "";
  const draftLabels = [values.label1, values.label2, values.label3];

  const onSubmit = handleSubmit((formValues) => {
    if (!banner) {
      setBannerError("Add a banner image.");
      return;
    }
    create.mutate(
      {
        ...formValues,
        title: formValues.title.trim(),
        websiteLink: formValues.websiteLink.trim(),
        labels: [
          formValues.label1.trim(),
          formValues.label2.trim(),
          formValues.label3.trim(),
        ],
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
    <form
      noValidate
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start"
    >
      <div className="flex flex-col gap-6 rounded-3xl panel p-5 sm:p-6">
        <section aria-label="Basics" className="flex flex-col gap-5">
          <h2 className="text-h3 font-bold text-on-surface">The basics</h2>
          <FormField
            id={`${id}-title`}
            label="Event title"
            error={errors.title?.message}
          >
            <Input
              id={`${id}-title`}
              className="h-12 rounded-xl"
              {...register("title", {
                required: "Give the event a title.",
                maxLength: {
                  value: 120,
                  message: "Keep it under 120 characters.",
                },
              })}
            />
          </FormField>
          <FormField
            id={`${id}-link`}
            label="Registration link"
            error={errors.websiteLink?.message}
          >
            <Input
              id={`${id}-link`}
              type="url"
              inputMode="url"
              placeholder="https://"
              className="h-12 rounded-xl"
              {...register("websiteLink", {
                required: "Students need somewhere to register.",
                pattern: {
                  value: /^https?:\/\/\S+$/i,
                  message: "Use a full link starting with https://",
                },
              })}
            />
          </FormField>
        </section>

        <section
          aria-label="Schedule"
          className="flex flex-col gap-5 border-t border-outline-variant pt-6"
        >
          <h2 className="text-h3 font-bold text-on-surface">When it happens</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id={`${id}-sd`}
              label="Starts on"
              error={errors.startDate?.message}
            >
              <Input
                id={`${id}-sd`}
                type="date"
                className="h-12 rounded-xl"
                {...register("startDate", { required: "Pick a start date." })}
              />
            </FormField>
            <FormField
              id={`${id}-ed`}
              label="Ends on"
              error={errors.endDate?.message}
            >
              <Input
                id={`${id}-ed`}
                type="date"
                className="h-12 rounded-xl"
                {...register("endDate", {
                  required: "Pick an end date.",
                  validate: (v) =>
                    v >= watch("startDate") || "Ends before it starts.",
                })}
              />
            </FormField>
            <FormField
              id={`${id}-st`}
              label="From"
              error={errors.startTime?.message}
            >
              <Input
                id={`${id}-st`}
                type="time"
                className="h-12 rounded-xl"
                {...register("startTime", { required: "Pick a start time." })}
              />
            </FormField>
            <FormField
              id={`${id}-et`}
              label="Until"
              error={errors.endTime?.message}
            >
              <Input
                id={`${id}-et`}
                type="time"
                className="h-12 rounded-xl"
                {...register("endTime", { required: "Pick an end time." })}
              />
            </FormField>
          </div>
        </section>

        <section
          aria-label="Perks and labels"
          className="flex flex-col gap-4 border-t border-outline-variant pt-6"
        >
          <h2 className="text-h3 font-bold text-on-surface">
            Perks and labels
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <PerkToggle
              name="odsProvided"
              label="OD provided"
              register={register}
            />
            <PerkToggle
              name="refreshmentsProvided"
              label="Refreshments"
              register={register}
            />
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium text-on-surface-muted">
              Up to three labels
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {LABEL_FIELDS.map((field, i) => (
                <div key={field} className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-subtle"
                  >
                    #
                  </span>
                  <Input
                    aria-label={`Label ${i + 1}`}
                    placeholder={["Workshop", "Tech", "Free"][i]}
                    className="h-12 rounded-xl pl-8"
                    {...register(field)}
                  />
                </div>
              ))}
            </div>
          </fieldset>
        </section>
      </div>

      <aside
        aria-label="Preview"
        className="flex flex-col gap-4 lg:sticky lg:top-8"
      >
        <p className="text-sm font-bold text-on-surface">
          What students will see
        </p>
        <ClubEventCard
          phase="draft"
          title={values.title}
          dates={draftDates}
          timing={draftTiming}
          labels={draftLabels}
          odsProvided={values.odsProvided}
          refreshmentsProvided={values.refreshmentsProvided}
          clubName={club?.name}
          clubLogo={club?.logo}
          poster={
            <label className="group/poster absolute inset-0 cursor-pointer">
              {preview && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL; nothing to optimise */}
                  <img
                    src={preview}
                    alt=""
                    className="absolute inset-0 size-full scale-125 object-cover opacity-45 blur-2xl"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL; nothing to optimise */}
                  <img
                    src={preview}
                    alt="Banner preview"
                    className="absolute inset-0 size-full object-contain"
                  />
                  <span className="absolute inset-0 z-10 hidden items-center justify-center bg-surface-lowest/60 text-sm font-bold text-on-surface backdrop-blur-sm group-hover/poster:flex group-focus-within/poster:flex">
                    Replace banner
                  </span>
                </>
              )}
              {!preview && (
                <span className="club-poster-empty absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                  <ImageUp
                    aria-hidden
                    className="size-8 text-on-surface-muted"
                  />
                  <span className="text-sm font-bold text-on-surface">
                    Add a banner
                  </span>
                  <span className="text-xs text-on-surface-subtle">
                    PNG or JPG, up to 600 KB
                  </span>
                </span>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg"
                aria-label="Event banner"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (file && file.size > MAX_BANNER_BYTES) {
                    setBannerError("That image is over 600 KB.");
                    return;
                  }
                  if (file && !["image/jpeg", "image/png"].includes(file.type)) {
                    setBannerError("Banner must be a JPG, JPEG, or PNG.");
                    return;
                  }
                  setBannerError(null);
                  setBanner(file);
                }}
              />
            </label>
          }
        />
        {bannerError && (
          <p className="text-sm font-semibold text-danger-accent">
            {bannerError}
          </p>
        )}
        {create.error && (
          <p role="alert" className="text-sm font-semibold text-danger-accent">
            {getErrorMessage(create.error)}
          </p>
        )}
        <Button
          type="submit"
          size="touch"
          className="h-12 sheen"
          disabled={create.isPending}
        >
          {create.isPending && <Loader2 className="animate-spin" aria-hidden />}
          Publish event
        </Button>
        <p className="text-xs font-semibold text-on-surface-subtle">
          Goes to every student the moment you publish.
        </p>
      </aside>
    </form>
  );
}
