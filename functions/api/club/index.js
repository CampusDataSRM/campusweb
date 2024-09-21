const baseUrl = "https://campusapi-puce.vercel.app";

// Delete Event API
const deleteEvent = async ({eventID, authToken}) => {
  const myHeaders = new Headers();
  myHeaders.append("eventid", eventID);
  myHeaders.append(
    "Authorization",
    `Bearer ${authToken}`
  );

  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      "https://campusapi-puce.vercel.app/api/users/deleteevent",
      requestOptions
    );
    const result = await response.json();
    return { message: "success", content: result };
  } catch (error) {
    console.error(error);
  }
};


export { deleteEvent };
