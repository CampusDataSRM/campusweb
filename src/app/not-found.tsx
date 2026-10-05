import { Compass } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 px-page text-center">
      <p aria-hidden className="font-heading text-[clamp(5rem,4rem+8vw,10rem)] leading-none font-extrabold text-surface-bright">404</p>
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="flex items-center justify-center gap-2 text-h2 font-extrabold text-on-surface">
          <Compass aria-hidden className="size-7 text-primary-accent" /> Page not found
        </h1>
        <p className="text-on-surface-muted">That link doesn&apos;t go anywhere. It may have moved, or never existed.</p>
      </div>
      <Button size="touch" render={<Link href="/" />} nativeButton={false}>
        Back to Campus Web
      </Button>
    </main>
  );
}
