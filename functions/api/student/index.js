import { baseURL } from "@/constants/baseURL";

// Student Data API
const getStudentData = async (authToken) => {
  const myHeaders = new Headers();
  myHeaders.append("X-CSRF-Token", authToken);

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
  myHeaders.append("X-CSRF-Token", authToken);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(`${baseURL}/api/auth/batch`, requestOptions);
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
      requestOptions,
    );
    const result = await response.json();

    console.log("timetable result", result);

    return { message: "success", content: result };
  } catch (error) {
    console.log("ADGAERNIAERNO");

    return { message: "error", content: error };
  }
};

export { getStudentData, getStudentBatch, getPlannerData, getTimetableData };
