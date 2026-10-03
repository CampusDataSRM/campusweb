import Image from "next/image";

import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils";

/**
 * The Campus Web wordmark. `stacked` is the tall mark for hero areas; the
 * default is the horizontal lockup for headers and the sidebar. Brand artwork
 * keeps its own colours by design - it is the one image the theme does not
 * recolour.
 */
export function Logo({
  variant = "horizontal",
  className,
  priority,
}: {
  variant?: "horizontal" | "stacked";
  className?: string;
  priority?: boolean;
}) {
  const stacked = variant === "stacked";
  return (
    <Image
      src={stacked ? "/logo2.svg" : "/logo.svg"}
      alt={SITE.name}
      width={stacked ? 248 : 312}
      height={stacked ? 164 : 38}
      priority={priority}
      className={cn(stacked ? "h-auto w-40" : "h-7 w-auto", className)}
    />
  );
}
