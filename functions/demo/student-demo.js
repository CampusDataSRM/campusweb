import { baseURL } from "@/constants/baseURL";

export const DEMO_NET_ID = "campusdemo";
export const DEMO_SESSION = "campusweb_demo";

const demoRequest = async (path, options = {}) => {
  const token = localStorage.getItem("campuswebDemoToken") || "";
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
  localStorage.setItem("campuswebDemoToken", result.demo_token);
  localStorage.setItem("campuswebDemo", "true");
  return result;
};

export const getDemoStudent = async () =>
  (await demoRequest("snapshot")).content;

export const getDemoClubs = async () => (await demoRequest("clubs")).data;

export const getDemoEvents = async () => (await demoRequest("events")).data;

export const logoutDemo = async () => {
  try {
    await demoRequest("logout", { method: "POST" });
  } finally {
    localStorage.removeItem("campuswebDemoToken");
    localStorage.removeItem("campuswebDemo");
  }
};

export const isDemoSession = () =>
  typeof window !== "undefined" &&
  localStorage.getItem("campuswebDemo") === "true";
