"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  CircleCheck,
  Clock3,
  Loader2,
  QrCode,
  RotateCw,
  ScanLine,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompleteSignIn } from "@/hooks/use-auth-actions";
import { studentPortalSession } from "@/lib/auth/session";
import { startQrLogin, type QrView } from "@/lib/auth/qr-login";
import styles from "./sign-in.module.css";

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
  const remaining = `${Math.floor(view.seconds / 60)
    .toString()
    .padStart(2, "0")}:${(view.seconds % 60).toString().padStart(2, "0")}`;
  return (
    <section className={styles.phone} aria-label="Log in with phone">
      <div
        className={styles.qrStage}
        data-state={view.status}
        aria-busy={view.status === "creating"}
      >
        {view.qrPayload ? (
          <div className={styles.qrCode}>
            <QRCodeSVG
              value={view.qrPayload}
              size={192}
              level="M"
              marginSize={4}
              title="Scan to log in with CampusApp"
            />
          </div>
        ) : (
          <div className={styles.qrPlaceholder} aria-hidden>
            {view.status === "creating" ? (
              <Loader2 className="animate-spin" />
            ) : view.status === "approved" ? (
              <CircleCheck />
            ) : view.status === "denied" ? (
              <ShieldX />
            ) : view.status === "expired" || view.status === "consumed" ? (
              <Clock3 />
            ) : (
              <QrCode />
            )}
          </div>
        )}
        <span className={styles.scanCorner} aria-hidden />
      </div>
      <div className={styles.qrStatus}>
        <p role="status">{messages[view.status]}</p>
        {waiting && (
          <span className={styles.countdown}>
            <Clock3 aria-hidden size={13} /> Expires in {remaining}
          </span>
        )}
      </div>
      {waiting && (
        <p className={styles.qrInstruction}>
          <ScanLine aria-hidden size={16} />
          <span>
            Open the QR scanner in CampusApp.
            <br />
            Scan here, then approve on your phone.
          </span>
        </p>
      )}
      <div className={styles.qrActions}>
        <Button
          type="button"
          variant="outline"
          size="touch"
          className={styles.refreshCode}
          disabled={view.status === "creating" || view.status === "approved"}
          onClick={() => {
            setView({ status: "creating", seconds: 0 });
            setGeneration((n) => n + 1);
          }}
        >
          <RotateCw aria-hidden /> Refresh code
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="touch"
          className={styles.usePassword}
          disabled={view.status === "approved"}
          onClick={onClose}
        >
          Use password instead
        </Button>
      </div>
    </section>
  );
}
