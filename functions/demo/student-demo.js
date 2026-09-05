import { baseURL } from "@/constants/baseURL";
import Cookies from "js-cookie";
import { DEMO_NET_ID, decodeDemoTokenExpiry } from "./demo-session.mjs";

export { DEMO_NET_ID };
export const DEMO_SESSION = "campusweb_demo";
const DEMO_TOKEN_KEY = "campuswebDemoToken";
const DEMO_FLAG_KEY = "campuswebDemo";
const DEMO_EXPIRY_KEY = "campuswebDemoExpiresAt";

export const clearDemoSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_TOKEN_KEY);
  localStorage.removeItem(DEMO_FLAG_KEY);
  localStorage.removeItem(DEMO_EXPIRY_KEY);
  if (Cookies.get("X-CSRF-Token") === DEMO_SESSION) Cookies.remove("X-CSRF-Token");
  if (localStorage.getItem("studentNetId") === DEMO_NET_ID) {
    localStorage.removeItem("studentNetId");
    localStorage.removeItem("studentData");
    localStorage.removeItem("studentTimetable");
    localStorage.removeItem("studentCalendar");
  }
};

const demoRequest = async (path, options = {}) => {
  const token = localStorage.getItem(DEMO_TOKEN_KEY) || "";
  const response = await fetch(`${baseURL}/api/demo/${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { "X-Demo-Token": token }),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    clearDemoSession();
    window.location.assign("/client/login/student");
  }
  if (!response.ok) {
    throw new Error(body?.message || "The demo service is unavailable.");
  }
  return body;
};

export const loginDemo = async (netId, password) => {
  const result = await demoRequest("login", {
    method: "POST",
    body: JSON.stringify({ net_id: netId, password }),
  });
  const expiresAt = decodeDemoTokenExpiry(result.demo_token);
  if (!result.demo_token || !expiresAt || expiresAt <= Date.now()) {
    clearDemoSession();
    throw new Error("The demo service returned an invalid session.");
  }
  localStorage.setItem(DEMO_TOKEN_KEY, result.demo_token);
  localStorage.setItem(DEMO_FLAG_KEY, "true");
  localStorage.setItem(DEMO_EXPIRY_KEY, String(expiresAt));
  return result;
};

export const getDemoStudent = async () =>
  (await demoRequest("snapshot")).content;

export const getDemoClubs = async () => (await demoRequest("clubs")).data;

export const getDemoEvents = async () => (await demoRequest("events")).data;

export const getDemoTimetable = async () => await demoRequest("timetable");

export const logoutDemo = async () => {
  try {
    await demoRequest("logout", { method: "POST" });
  } finally {
    clearDemoSession();
  }
};

export const isDemoSession = () => {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(DEMO_FLAG_KEY) !== "true") return false;
  const token = localStorage.getItem(DEMO_TOKEN_KEY) || "";
  const expiresAt = Number(localStorage.getItem(DEMO_EXPIRY_KEY)) || decodeDemoTokenExpiry(token);
  if (!token || !expiresAt || expiresAt <= Date.now()) {
    clearDemoSession();
    return false;
  }
  return true;
};
