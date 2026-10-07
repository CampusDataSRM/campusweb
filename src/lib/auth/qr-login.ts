/** Ephemeral QR channel. Secrets stay in this closure, outside query caches/storage. */
export type QrState =
  | "creating"
  | "pending"
  | "scanned"
  | "approved"
  | "denied"
  | "expired"
  | "consumed"
  | "error";
export interface QrView {
  status: QrState;
  channelId?: string;
  seconds: number;
}
export interface QrApproval {
  netId: string;
  cookies: string;
}

export function qrPayload(channelId: string): string {
  return `campusweb://qr-login?v=1&ch=${encodeURIComponent(channelId)}`;
}

export function startQrLogin(
  base: string | undefined,
  update: (view: QrView) => void,
  approve: (session: QrApproval) => Promise<void>,
): () => void {
  let active = true;
  let channelId = "";
  let webSecret = "";
  let deadline = 0;
  let status: QrState = "creating";
  let pollTimer: ReturnType<typeof setTimeout> | undefined;
  let countdown: ReturnType<typeof setInterval> | undefined;
  const controller = new AbortController();
  const clear = () => {
    clearTimeout(pollTimer);
    clearInterval(countdown);
    controller.abort();
    webSecret = "";
  };
  const publish = () =>
    update({
      status,
      // Hide the code on terminal states so it cannot invite another scan.
      channelId:
        status === "pending" || status === "scanned" ? channelId : undefined,
      seconds: Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
    });
  const finish = (next: QrState) => {
    if (!active) return;
    status = next;
    active = false;
    clear();
    publish();
  };
  const request = async (url: URL, method: "GET" | "POST") => {
    const response = await fetch(url, {
      method,
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("QR request failed");
    return response.json();
  };
  const poll = async () => {
    if (!active) return;
    if (Date.now() >= deadline) {
      finish("expired");
      return;
    }
    try {
      const url = new URL(`${base!.replace(/\/$/, "")}/qr/status`);
      url.searchParams.set("channelId", channelId);
      url.searchParams.set("webSecret", webSecret);
      const result = await request(url, "GET");
      if (!active) return;
      if (Date.now() >= deadline) {
        finish("expired");
        return;
      }
      if (result.status === "approved") {
        if (
          typeof result.netId !== "string" ||
          !result.netId ||
          typeof result.cookies !== "string" ||
          !result.cookies
        ) {
          finish("error");
          return;
        }
        finish("approved"); // Stop before persisting or navigating: approval is returned once.
        try {
          await approve({ netId: result.netId, cookies: result.cookies });
        } catch {
          status = "error";
          publish();
        }
        return;
      }
      if (["denied", "expired", "consumed"].includes(result.status)) {
        finish(result.status);
        return;
      }
      if (result.status !== "pending" && result.status !== "scanned") {
        finish("error");
        return;
      }
      status = result.status;
      publish();
      // Schedule after completion so requests cannot overlap or consume approval twice.
      pollTimer = setTimeout(() => void poll(), 2000);
    } catch {
      finish("error");
    }
  };
  update({ status: "creating", seconds: 0 });
  void (async () => {
    try {
      if (
        typeof window !== "undefined" &&
        window.location.protocol !== "https:"
      )
        throw new Error("HTTPS required");
      if (!base || new URL(base).protocol !== "https:")
        throw new Error("HTTPS API required");
      const result = await request(
        new URL(`${base.replace(/\/$/, "")}/qr/create`),
        "POST",
      );
      if (!active) return;
      if (
        typeof result.channelId !== "string" ||
        !result.channelId ||
        typeof result.webSecret !== "string" ||
        !result.webSecret ||
        !Number.isFinite(result.expiresInSeconds) ||
        result.expiresInSeconds <= 0
      ) {
        finish("error");
        return;
      }
      channelId = result.channelId;
      webSecret = result.webSecret;
      deadline = Date.now() + result.expiresInSeconds * 1000;
      status = "pending";
      publish();
      countdown = setInterval(() => {
        if (Date.now() >= deadline) finish("expired");
        else if (active) publish();
      }, 250);
      pollTimer = setTimeout(() => void poll(), 2000);
    } catch {
      finish("error");
    }
  })();
  return () => {
    active = false;
    clear();
  };
}
