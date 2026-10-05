"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps } from "react";

import { Input } from "@/components/ui/input";

type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

/** A password box with a show/hide toggle, on the shared Input look. */
export function ClubPasswordField({
  className,
  ...props
}: PasswordInputProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? "text" : "password"}
        className={`h-12 rounded-xl pr-12 ${className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setShow((value) => !value)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-controls={props.id ?? id}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-on-surface-muted transition-colors hover:text-on-surface"
      >
        {show ? (
          <EyeOff aria-hidden className="size-4" />
        ) : (
          <Eye aria-hidden className="size-4" />
        )}
      </button>
    </div>
  );
}
