export const DEMO_NET_ID = "campusdemo";

export const normalizeStudentNetId = (value = "") =>
  value.trim().split("@")[0].toLowerCase();

export const isDemoNetId = (value) =>
  normalizeStudentNetId(value) === DEMO_NET_ID;

export const decodeDemoTokenExpiry = (token, decodeBase64 = globalThis.atob) => {
  try {
    const payload = token.split(".")[0];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(
      decodeBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    );
    return Number(decoded.exp) * 1000;
  } catch {
    return 0;
  }
};
