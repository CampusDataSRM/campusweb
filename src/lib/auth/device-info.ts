/** A readable device label; no fingerprinting or persistent device identifier. */
export const WEB_APP_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION || "2026.10.08-sessions.3";

export function webDeviceHeaders(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
) {
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\/|FxiOS\//.test(userAgent)
        ? "Firefox"
        : /Chrome\/|CriOS\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "Browser";
  const os = /iPhone|iPad|iPod/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Macintosh|Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "unknown OS";
  const version = userAgent.match(
    browser === "Edge"
      ? /Edg\/([\d.]+)/
      : browser === "Opera"
        ? /OPR\/([\d.]+)/
        : browser === "Firefox"
          ? /(?:Firefox|FxiOS)\/([\d.]+)/
          : browser === "Chrome"
            ? /(?:Chrome|CriOS)\/([\d.]+)/
            : /Version\/([\d.]+)/,
  )?.[1];
  return {
    "X-Client": "web",
    "X-Device-Platform": os,
    "X-Device-Name": browser,
    "X-Device-Model": version ? `${browser} ${version}` : browser,
    "X-App-Version": WEB_APP_VERSION,
  };
}
