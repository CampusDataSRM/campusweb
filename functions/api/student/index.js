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
  };

  try {
    const response = await fetch(`${baseURL}/api/auth/user/`, requestOptions);
    if (response.status === 429) {
      return { message: "too_many_requests" };
    }
    const result = await response.json();
    return { message: "success", content: result };
  } catch (error) {
    return { message: "error", content: error };
  }
};

// Batch Data API
const getStudentBatch = async (authToken) => {
  const myHeaders = new Headers();
  myHeaders.append(
    "X-CSRF-Token",
    authToken
  );

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${baseURL}/api/auth/batch`,
      requestOptions
    );
    const result = await response.json();
    return { message: "success", content: result };
  } catch (error) {
    console.error(error);
  }
};

// Planner API
const getPlannerData = async (authToken) => {
  const myHeaders = new Headers();
  myHeaders.append("X-CSRF-Token", authToken);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(`${baseURL}/api/auth/planner`, requestOptions);
    const result = await response.json();
    return { message: "success", content: result };
  } catch (error) {
    return { message: "error", content: error };
  }
};

const studentPortalRequest = async (path, payload, authToken) => {
  const response = await fetch(`${baseURL}/api/student-portal/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": authToken,
    },
    body: JSON.stringify(payload),
    redirect: "follow",
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.status !== "success") {
    const error = new Error(
      result?.message || "Student Portal is temporarily unavailable."
    );
    error.status = response.status;
    error.code = result?.code;
    throw error;
  }
  return result;
};

const loginStudentPortal = (netId, password, authToken) =>
  studentPortalRequest("login", { net_id: netId, password }, authToken);

const getStudentPortalAttendance = (netId, authToken) =>
  studentPortalRequest("attendance", { net_id: netId }, authToken);

const forceRefreshStudentData = async (authToken, netId) => {
  const response = await fetch(`${baseURL}/api/auth/force-refresh/user`, {
    method: "POST",
    headers: {
      "X-CSRF-Token": authToken,
      "X-Net-ID": netId,
    },
    redirect: "follow",
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      result?.error || result?.message || "Could not refresh attendance data."
    );
  }
  return result;
};

// Timetable API
const getTimetableData = async (authToken) => {
  const rawData = localStorage.getItem("studentData");
  const dataStudent = JSON.parse(rawData);
  const batch = dataStudent?.comboBatch;
  console.log(batch);

  const myHeaders = new Headers();
  myHeaders.append("X-CSRF-Token", authToken);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${baseUrl}/api/auth/timetable/${batch}`,
      requestOptions
    );
    const result = await response.json();

    console.log("timetable result", result);

    return { message: "success", content: result };
  } catch (error) {
    console.log("ADGAERNIAERNO");

    return { message: "error", content: error };
  }
};

export {
  getStudentData,
  getStudentBatch,
  getPlannerData,
  getTimetableData,
  loginStudentPortal,
  getStudentPortalAttendance,
  forceRefreshStudentData,
};
