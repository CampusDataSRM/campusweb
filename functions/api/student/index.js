const baseUrl = "https://campusapi-puce.vercel.app";

// Student Data API
const getStudentData = async (authToken) => {
  const myHeaders = new Headers();
  myHeaders.append("X-CSRF-Token", authToken);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(`${baseUrl}/api/auth/user/`, requestOptions);
    const result = await response.json();
    return { message: "success", content: result };
  } catch (error) {
    return { message: "failed_to_fetch", content: error };
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
    const response = await fetch(`${baseUrl}/api/auth/planner`, requestOptions);
    const result = await response.json();
    return { message: "success", content: result };
  } catch (error) {
    return { message: "failed_to_fetch", content: error };
  }
};

// Timetable API
const getTimetableData = async (authToken, batch) => {
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
    return { message: "success", content: result };
  } catch (error) {
    return { message: "failed_to_fetch", content: error };
  }
};

export { getStudentData, getPlannerData, getTimetableData };
