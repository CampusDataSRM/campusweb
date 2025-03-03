import { baseURL } from "@/constants/baseURL";

// Delete Event API
const deleteEvent = async ({ eventID, authToken }) => {
  const myHeaders = new Headers();
  myHeaders.append("eventid", eventID);
  myHeaders.append("Authorization", `Bearer ${authToken}`);

  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${baseURL}/api/users/deleteevent`,
      requestOptions
    );
    const result = await response.json();
    return { message: "success", content: result };
  } catch (error) {
    console.error(error);
  }
};

const sendResetPasswordEmail = async (email) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    email: email,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${baseURL}/api/auth/forgotpassword`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

const resetPassword = async (club) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    password: club.password,
    passwordConfirm: club.passwordConfirm,
  });

  const requestOptions = {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${baseURL}/api/auth/resetpassword/${club.token}`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

export { deleteEvent, sendResetPasswordEmail, resetPassword };
