import { webDeviceHeaders } from "./device-info.ts";
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
  qrPayload?: string;
  seconds: number;
}
export interface QrApproval {
  netId: string;
  cookies?: string;
  sessionToken?: string;
  sessionId?: string;
  provider?: string;
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
  let encodedValue = "";
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
      qrPayload:
        status === "pending" || status === "scanned" ? encodedValue : undefined,
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
      headers: webDeviceHeaders(),
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
      // The live legacy contract requires this secret. New channels may omit it;
      // when supplied it stays only in this closure, never in the QR/view state.
      if (webSecret) url.searchParams.set("webSecret", webSecret);
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
          (result.provider === "student_portal"
            ? typeof result.sessionToken !== "string" || !result.sessionToken
            : typeof result.cookies !== "string" || !result.cookies)
        ) {
          finish("error");
          return;
        }
        finish("approved"); // Stop before persisting or navigating: approval is returned once.
        try {
          await approve({
            netId: result.netId,
            cookies: result.cookies,
            ...(typeof result.sessionToken === "string" && result.sessionToken
              ? { sessionToken: result.sessionToken }
              : {}),
            ...(typeof result.sessionId === "string"
              ? { sessionId: result.sessionId }
              : {}),
            ...(typeof result.provider === "string"
              ? { provider: result.provider }
              : {}),
          });
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
      const expiry =
        typeof result.expiresAt === "string"
          ? Date.parse(result.expiresAt)
          : typeof result.expiresAt === "number"
            ? result.expiresAt * (result.expiresAt < 1e12 ? 1000 : 1)
            : Date.now() + Number(result.expiresInSeconds) * 1000;
      const hasSecret =
        typeof result.webSecret === "string" && !!result.webSecret;
      const hasPayload =
        typeof result.qrPayload === "string" && !!result.qrPayload;
      if (
        typeof result.channelId !== "string" ||
        !result.channelId ||
        (!hasSecret && !hasPayload) ||
        !Number.isFinite(expiry) ||
        expiry <= Date.now()
      ) {
        finish("error");
        return;
      }
      channelId = result.channelId;
      webSecret = hasSecret ? result.webSecret : "";
      encodedValue = hasPayload ? result.qrPayload : qrPayload(channelId);
      const payloadUrl = new URL(encodedValue);
      if (
        payloadUrl.protocol !== "campusweb:" ||
        [...payloadUrl.searchParams.keys()].some(
          (key) => key.toLowerCase() === "websecret",
        ) ||
        (webSecret &&
          (encodedValue.includes(webSecret) ||
            encodedValue.includes(encodeURIComponent(webSecret))))
      ) {
        finish("error");
        return;
      }
      deadline = expiry;
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
