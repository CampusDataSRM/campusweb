import { baseURL } from "@/constants/baseURL";

// Student Data API
const getStudentData = async (authToken, netId = "") => {
  const myHeaders = new Headers();
  myHeaders.append("X-CSRF-Token", authToken);
  if (netId?.trim()) {
    myHeaders.append("X-Net-ID", netId.trim());
  }

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
    cache: "no-store",
    credentials: "include",
  };

  try {
    const response = await fetch(`${baseURL}/api/auth/user/`, requestOptions);
    if (response.status === 429) {
      return { message: "too_many_requests" };
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { message: "error", content: result };
    }
    return { message: "success", content: result };
  } catch (error) {
    return { message: "error", content: error };
  }
};

// Batch Data API
const getStudentBatch = async (authToken) => {
  const myHeaders = new Headers();
  myHeaders.append("X-CSRF-Token", authToken);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
    credentials: "include",
  };

  try {
    const response = await fetch(`${baseURL}/api/auth/batch`, requestOptions);
    const result = await response.json();
    return { message: "success", content: result };
  } catch (error) {
    return { message: "error", content: error };
  }
};

// Planner API
const getPlannerData = async (authToken, netId = "") => {
  const myHeaders = new Headers();
  myHeaders.append("X-CSRF-Token", authToken);
  if (netId?.trim()) {
    myHeaders.append("X-Net-ID", netId.trim());
  }

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
    credentials: "include",
  };

  try {
    const route = authToken?.startsWith("sp_session=")
      ? "planner/cached"
      : "planner";
    const response = await fetch(`${baseURL}/api/auth/${route}`, requestOptions);
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { message: "error", content: result };
    }
    return { message: "success", content: result };
  } catch (error) {
    return { message: "error", content: error };
  }
};

const studentPortalRequest = async (path, payload, authToken) => {
  const headers = { "Content-Type": "application/json" };
  if (authToken?.trim()) {
    headers["X-CSRF-Token"] = authToken.trim();
  }
  const response = await fetch(`${baseURL}/api/student-portal/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    redirect: "follow",
    cache: "no-store",
    credentials: "include",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.status !== "success") {
    const error = new Error(
      result?.message || "Student Portal is temporarily unavailable.",
    );
    error.status = response.status;
    error.code = result?.code;
    throw error;
  }
  return result;
};

const loginStudentPortal = (netId, password, authToken) =>
  studentPortalRequest("login", { net_id: netId, password }, authToken);

const forceRefreshStudentData = async (authToken, netId) => {
  const response = await fetch(`${baseURL}/api/auth/force-refresh/user`, {
    method: "POST",
    headers: {
      "X-CSRF-Token": authToken,
      "X-Net-ID": netId,
    },
    redirect: "follow",
    cache: "no-store",
    credentials: "include",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      result?.error || result?.message || "Could not refresh attendance data.",
    );
  }
  return result;
};

// Timetable API
const getTimetableData = async (authToken) => {
  const rawData = localStorage.getItem("studentData");
  const dataStudent = JSON.parse(rawData);
  const batch = dataStudent?.comboBatch;

  const myHeaders = new Headers();
  myHeaders.append("X-CSRF-Token", authToken);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
    credentials: "include",
  };

  try {
    const response = await fetch(
      `${baseUrl}/api/auth/timetable/${batch}`,
      requestOptions,
    );
    const result = await response.json();

    return { message: "success", content: result };
  } catch (error) {
    return { message: "error", content: error };
  }
};

const studentPortalLogin = async (net_id, password, registration_number) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    redirect: "follow",
    credentials: "include",
    body: JSON.stringify({ net_id, password, registration_number }),
  };

  try {
    const response = await fetch(
      `${baseURL}/api/student-portal/login`,
      requestOptions,
    );
    const result = await response.json();
    if (response.ok && result?.status === "success") {
      return { message: "success", content: result };
    }
    return { message: "failed", status: response.status, content: result };
  } catch (error) {
    return { message: "error", content: error };
  }
};

const getAttendanceFromStudentPortal = async (net_id) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    redirect: "follow",
    credentials: "include",
    body: JSON.stringify({ net_id }),
  };

  try {
    const response = await fetch(
      `${baseURL}/api/student-portal/attendance`,
      requestOptions,
    );
    if (response.status === 401) {
      return { message: "unauthorized", status: 401 };
    }
    if (!response.ok) {
      return { message: "failed", status: response.status };
    }
    const result = await response.json();
    if (result?.status === "success") {
      return { message: "success", content: result };
    }
    return { message: "failed", status: response.status, content: result };
  } catch (error) {
    return { message: "error", content: error };
  }
};

export {
  getStudentData,
  getStudentBatch,
  getPlannerData,
  getTimetableData,
  getAttendanceFromStudentPortal,
  studentPortalLogin,
  loginStudentPortal,
  forceRefreshStudentData,
};
