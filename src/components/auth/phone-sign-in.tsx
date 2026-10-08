"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompleteSignIn } from "@/hooks/use-auth-actions";
import { studentPortalSession } from "@/lib/auth/session";
import { startQrLogin, type QrView } from "@/lib/auth/qr-login";

const messages = {
  creating: "Creating your code…",
  pending: "Scan with CampusApp on your phone.",
  scanned: "Scanned — confirm on your phone",
  approved: "Approved — signing you in…",
  denied: "Login denied on your phone.",
  expired: "This code has expired.",
  consumed: "This code has already been used.",
  error: "Phone login could not connect. Please try a fresh code.",
};

export function PhoneSignIn({ onClose }: { onClose: () => void }) {
  const [generation, setGeneration] = useState(0);
  const [view, setView] = useState<QrView>({ status: "creating", seconds: 0 });
  const completeSignIn = useCompleteSignIn();
  useEffect(
    () =>
      startQrLogin(
        process.env.NEXT_PUBLIC_SERVE,
        setView,
        async ({ netId, cookies, sessionToken, sessionId, provider }) => {
          await completeSignIn(
            provider === "student_portal"
              ? studentPortalSession(netId, sessionToken, sessionId)
              : {
                  kind: "academia",
                  netId,
                  token: cookies!,
                  ...(sessionToken ? { sessionToken } : {}),
                  ...(sessionId ? { sessionId } : {}),
                  provider: "academia",
                },
          );
        },
      ),
    [generation, completeSignIn],
  );
  const waiting = view.status === "pending" || view.status === "scanned";
  return (
    <section
      className="flex flex-col items-center gap-5"
      aria-label="Log in with phone"
    >
      <Smartphone aria-hidden className="size-7 text-primary-accent" />
      <p className="text-center text-sm text-on-surface-muted">
        Already signed in to CampusApp? Scan this code and approve the login on
        your phone.
      </p>
      {view.qrPayload && (
        <div className="rounded-2xl bg-white p-4">
          <QRCodeSVG
            value={view.qrPayload}
            size={208}
            level="M"
            marginSize={4}
            title="Scan to log in with CampusApp"
          />
        </div>
      )}
      {view.status === "creating" && (
        <Loader2 aria-hidden className="size-8 animate-spin" />
      )}
      <p role="status" className="text-center text-sm font-semibold">
        {messages[view.status]}
      </p>
      {waiting && (
        <p className="text-sm tabular-nums text-on-surface-subtle">
          Expires in {view.seconds}s
        </p>
      )}
      <div className="flex w-full flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          size="touch"
          disabled={view.status === "creating" || view.status === "approved"}
          onClick={() => {
            setView({ status: "creating", seconds: 0 });
            setGeneration((n) => n + 1);
          }}
        >
          Refresh code
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="touch"
          disabled={view.status === "approved"}
          onClick={onClose}
        >
          Use username and password
        </Button>
      </div>
    </section>
  );
}
