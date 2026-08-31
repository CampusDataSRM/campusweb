// utils/isAndroid.ts
const isAndroid = () => {
  if (typeof window === "undefined") return false;

  const ua = (
    navigator.userAgent ||
    navigator.vendor ||
    window.opera ||
    ""
  ).toLowerCase();

  // Primary Android detection
  if (ua.includes("android")) return true;

  // Exclude iOS & iPadOS edge cases explicitly
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return false;
  }

  // Handle rare Android WebView edge cases
  // Some OEM browsers remove "Android" but keep Linux arm markers
  if (ua.includes("linux") && ua.includes("arm") && !ua.includes("mac os")) {
    return true;
  }

  return false;
};

const isIOS = () => {
  if (typeof window === "undefined") return false;

  const ua = (
    navigator.userAgent ||
    navigator.vendor ||
    window.opera ||
    ""
  ).toLowerCase();

  // Primary iOS detection
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return true;
  }

  // Handle iOS Safari on Mac (Catalina+)
  // These devices report as "Mac OS" but have "Safari" + "iPhone" in the user agent
  if (ua.includes("mac os") && ua.includes("safari") && ua.includes("iphone")) {
    return true;
  }

  return false;
};

export { isAndroid, isIOS };
