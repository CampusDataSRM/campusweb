"use client";

import { Check, Download, Share, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useInstallState } from "@/hooks/use-pwa";
import { notify } from "@/lib/toast";
import {
  cachedPagePaths,
  clearCachedPages,
  promptInstall,
  swEnabled,
  swSupported,
} from "@/lib/pwa/sw-client";

/** Settings: install Campus Web as an app, and what's saved for offline. */
export function AppInstall() {
  const { canPrompt, installed, ios } = useInstallState();
  const [saved, setSaved] = useState<number | null>(null);

  useEffect(() => {
    if (swSupported() && swEnabled())
      void cachedPagePaths().then((p) => setSaved(p.length));
  }, []);

  return (
    <div className="app-install panel">
      <div className="app-install-head">
        <span className="app-install-icon" aria-hidden>
          {installed ? (
            <Check className="size-5" />
          ) : (
            <Download className="size-5" />
          )}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-on-surface">
            {installed ? "Installed" : "Install Campus Web"}
          </p>
          <p className="text-sm text-on-surface-muted">
            {installed
              ? "You're using the app. It opens on its own and works offline."
              : "Its own window and icon, faster to open, and it works offline."}
          </p>
        </div>
      </div>

      {!installed &&
        (canPrompt ? (
          <Button
            size="touch"
            onClick={async () => {
              if (await promptInstall()) notify.success("Campus Web installed");
            }}
          >
            <Download aria-hidden /> Install app
          </Button>
        ) : ios ? (
          <p className="app-install-steps">
            In Safari, tap{" "}
            <Share
              aria-label="Share"
              className="inline size-4 align-text-bottom"
            />{" "}
            then <strong>Add to Home Screen</strong>.
          </p>
        ) : (
          <p className="app-install-steps">
            Use your browser&apos;s menu and choose <strong>Install</strong> or{" "}
            <strong>Add to Home Screen</strong>.
          </p>
        ))}

      {saved !== null && (
        <div className="app-install-offline">
          <span>
            {saved > 0
              ? `${saved} ${saved === 1 ? "page" : "pages"} saved for offline use`
              : "Pages are saved for offline use as you browse"}
          </span>
          {saved > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await clearCachedPages();
                setSaved(0);
                notify.success("Saved pages cleared");
              }}
            >
              <Trash2 aria-hidden /> Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
