import test from "node:test";
import assert from "node:assert/strict";
import { webDeviceHeaders } from "../src/lib/auth/device-info.ts";
for (const [ua, label] of [
  [
    "Mozilla/5.0 (Windows NT 10.0) Chrome/130.0 Safari/537.36",
    "Chrome on Windows",
  ],
  [
    "Mozilla/5.0 (Windows NT 10.0) Chrome/130.0 Safari/537.36 Edg/130.0",
    "Edge on Windows",
  ],
  [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X) Version/18 Safari/605.1",
    "Safari on macOS",
  ],
  ["Mozilla/5.0 (iPhone) CriOS/130.0 Safari/605.1", "Chrome on iOS"],
  ["Mozilla/5.0 (Linux; Android 14) Chrome/130.0", "Chrome on Android"],
  ["Mozilla/5.0 (Linux) Firefox/130.0", "Firefox on Linux"],
])
  test(label, () =>
    assert.deepEqual(webDeviceHeaders(ua), {
      "X-Client": "web",
      "X-Device-Platform": "web",
      "X-Device-Name": label,
    }),
  );
