"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Laptop, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/auth";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { clearCachedPages } from "@/lib/pwa/sw-client";
import {
  getSessions,
  revokeOtherSessions,
  revokeSession,
  type DeviceSession,
} from "@/network-calls/sessions";
import { queryKeys } from "@/network-calls/query-keys";

function seenAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : formatDistanceToNow(date, { addSuffix: true });
}

export function DevicesView() {
  const { session, hydrated, endSession } = useSession();
  const [confirmCurrent, setConfirmCurrent] = useState<DeviceSession | null>(
    null,
  );
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState("");
  const eligible =
    !!session?.sessionToken &&
    session.kind !== "guest" &&
    session.kind !== "demo";
  const key = queryKeys.student.sessions(session?.netId ?? "");
  const devices = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => getSessions(session!, signal),
    enabled: hydrated && eligible,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
    retry: false,
  });
  const revoke = useMutation({
    mutationFn: (id: string | null) =>
      id === null ? revokeOtherSessions(session!) : revokeSession(session!, id),
    onMutate: () => setNotice(""),
    onSuccess: async (_, id) => {
      if (
        devices.data?.some(
          (device) => device.sessionId === id && device.current,
        )
      ) {
        await endSession();
        await clearCachedPages();
        window.location.replace(ROUTES.home);
        return;
      }
      setNotice(
        id === null ? "Signed out everywhere else." : "Device signed out.",
      );
      await queryClient.invalidateQueries({ queryKey: key });
    },
  });
  const others = devices.data?.filter((device) => !device.current) ?? [];
  return (
    <div className="campus-view flex flex-col gap-6">
      <Link
        href={STUDENT_ROUTES.settings}
        className="w-fit text-sm font-semibold text-primary-accent hover:underline"
      >
        ← Settings
      </Link>
      <PageHeader
        title="Devices"
        description="See where you're signed in and end sessions you no longer use."
      />
      {!hydrated ? (
        <p role="status">Loading your account…</p>
      ) : !eligible ? (
        <p className="rounded-2xl panel p-5 text-on-surface-muted">
          {session?.kind === "demo" || session?.kind === "guest"
            ? "Sign in with your student account to manage devices."
            : "Sign out and sign in again to manage devices for this account."}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="touch"
              disabled={
                revoke.isPending || others.length === 0 || devices.isError
              }
              onClick={() => revoke.mutate(null)}
            >
              {revoke.isPending && revoke.variables === null
                ? "Signing out…"
                : "Sign out everywhere else"}
            </Button>
            <Button
              variant="ghost"
              size="touch"
              disabled={devices.isFetching || revoke.isPending}
              onClick={() => void devices.refetch()}
            >
              <RefreshCw aria-hidden className="size-4" /> Refresh
            </Button>
          </div>
          {notice && (
            <p role="status" className="text-sm text-on-surface-muted">
              {notice}
            </p>
          )}
          {revoke.isError && (
            <p role="alert" className="text-sm text-danger-accent">
              Could not sign out that device. Please try again.
            </p>
          )}
          {devices.isPending && <p role="status">Loading devices…</p>}
          {devices.isError && (
            <p
              role="alert"
              className="rounded-2xl panel p-5 text-danger-accent"
            >
              Could not load devices. Please try Refresh.
            </p>
          )}
          {devices.data?.length === 0 && (
            <p className="text-on-surface-muted">No active devices found.</p>
          )}
          <ul className="flex flex-col gap-3" aria-label="Signed-in devices">
            {devices.data?.map((device) => (
              <li
                key={device.sessionId}
                className="flex flex-wrap items-start gap-4 rounded-2xl panel p-5"
              >
                <Laptop
                  aria-hidden
                  className="mt-1 size-6 shrink-0 text-primary-accent"
                />
                <div className="min-w-0 flex-1 basis-48">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words font-bold text-on-surface">
                      {device.deviceName || "Unknown device"}
                    </h2>
                    {device.current && (
                      <span className="rounded-full bg-surface-high px-3 py-1 text-xs font-semibold text-primary-accent">
                        This device
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-on-surface-muted">
                    {device.platform || "Unknown platform"} ·{" "}
                    {device.client || "Unknown client"}
                  </p>
                  <dl className="mt-3 flex flex-col gap-1 text-sm text-on-surface-subtle">
                    <div className="flex flex-wrap gap-x-2">
                      <dt>IP address</dt>
                      <dd className="break-all">{device.ip || "Unknown"}</dd>
                    </div>
                    <div className="flex flex-wrap gap-x-2">
                      <dt>Location</dt>
                      <dd>{device.approxLocation || "Unknown location"}</dd>
                    </div>
                    {device.model && (
                      <div className="flex flex-wrap gap-x-2">
                        <dt>Browser / model</dt>
                        <dd>{device.model}</dd>
                      </div>
                    )}
                    {device.appVersion && (
                      <div className="flex flex-wrap gap-x-2">
                        <dt>App version</dt>
                        <dd>{device.appVersion}</dd>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-2">
                      <dt>Last active</dt>
                      <dd>{seenAt(device.lastSeenAt)}</dd>
                    </div>
                  </dl>
                </div>
                <Button
                  variant="outline"
                  size="touch"
                  disabled={revoke.isPending}
                  aria-label={`Sign out ${device.deviceName || "device"}`}
                  onClick={() =>
                    device.current
                      ? setConfirmCurrent(device)
                      : revoke.mutate(device.sessionId)
                  }
                >
                  {revoke.isPending && revoke.variables === device.sessionId
                    ? "Signing out…"
                    : "Sign out"}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
      <Dialog
        open={!!confirmCurrent}
        onOpenChange={(open) => {
          if (!open && !revoke.isPending) setConfirmCurrent(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out this device?</DialogTitle>
            <DialogDescription>
              This browser will return to the login screen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={revoke.isPending}
              onClick={() => setConfirmCurrent(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={revoke.isPending || !confirmCurrent}
              onClick={() => {
                if (confirmCurrent) revoke.mutate(confirmCurrent.sessionId);
              }}
            >
              {revoke.isPending ? "Signing out…" : "Sign out this device"}
            </Button>
          </DialogFooter>
          {revoke.isError && (
            <p role="alert" className="text-danger-accent">
              Could not sign out. Please try again.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
