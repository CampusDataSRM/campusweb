"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { baseURL } from "@/constants/baseURL";
import { useRouter } from "next/navigation";

const PrintTimetable = () => {
  const router = useRouter();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    if (!Cookies.get("X-CSRF-Token") || !localStorage.getItem("studentData")) {
      router.push("/client/login/student");
    } else {
      if (localStorage.getItem("studentTimetable")) {
        const res = JSON.parse(localStorage.getItem("studentTimetable"));
        setTimetable(res);
        setLoading(false);
      } else {
        const rawData = localStorage.getItem("studentData");
        const dataStudent = JSON.parse(rawData);
        const studentBatch = dataStudent?.comboBatch[dataStudent?.comboBatch.length - 1];
        // dataStudent?.comboBatch[dataStudent?.comboBatch.length - 1];
        const myHeaders = new Headers();
        myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
          cache: "no-store",
        };

        fetch(`${baseURL}/api/auth/timetable/${studentBatch}`, requestOptions)
          .then((response) => {
            console.log(" : ", response);

            if (typeof response === "string") {
              return null;
            } else if (response.status === 500) {
              sessionLogout();
            } else if (response.status === 429) {
              return "Too many requests";
            } else if (response.ok) {
              return response.json();
            } else {
              throw new Error("Failed to fetch data");
            }
          })
          .then((result) => {
            if (result === "Too many requests") {
              toast.error("Too many requests. Try again in a min.");
            } else {
              setTimetable(result);
              localStorage.setItem("studentTimetable", JSON.stringify(result));
            }
            setLoading(false);
          })
          .catch((error) => console.error(error));
      }
    }
  }, []);

  const getBgColor = (type) => {
    if (type == "Practical") {
      return "#4b237e";
    } else if (type == "Theory") {
      return "#004a7e";
    }
  };

  const arrayTimeSlot = () => {
    let c = 0;
    if (timetable?.timetable) {
      const dayArray = Object.keys(timetable?.timetable);

      for (let i = 0; i < dayArray.length; i++) {
        if (
          timetable?.timetable[dayArray[i]]["04:50 - 05:30"]["subject_name"] ==
            "No class" &&
          timetable?.timetable[dayArray[i]]["05:30 - 06:10"]["subject_name"] ==
            "No class"
        ) {
          c++;
        }
      }
    }
    if (c == 5) {
      return Object.keys(timetable?.timetable?.Day1).slice(0, 10);
    } else {
      return Object.keys(timetable?.timetable?.Day1);
    }
  };

  const truncateWord = (word) => {
    if (word.length > 37) {
      return word.slice(0, 31) + "...";
    } else {
      return word;
    }
  };

  const roomCodeComponent = (room_code) => {
    return (
      <span
        className="mt-3 tracking-wider"
        style={{
          padding: "",
          fontSize: "12px",
          fontWeight: "800",
          color: "rgba(255, 255, 255, 0.7)",
          display: "inline-block",
          borderRadius: "5px",
          textAlign: "center",
        }}
      >
        {''}
      </span>
    );
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "-99999px",
          left: "-99999px",
          height: "100vh",
          width: "100%",
          backgroundColor: "#000",
        }}
      >
        {!loading && (
          <>
            <table
              className="timetable"
              id="timetable"
              style={{ width: "100%", backgroundColor: "#000" }}
            >
              <thead>
                <tr>
                  <th>
                    <img src="/logo_png.png" alt="logo" className="w-10 h-auto" />
                  </th>
                  <th>DO1</th>
                  <th>DO2</th>
                  <th>DO3</th>
                  <th>DO4</th>
                  <th>DO5</th>
                </tr>
              </thead>
              <tbody>
                {timetable?.timetable && timetable?.timetable?.Day1 && (
                  <>
                    {arrayTimeSlot().map((key, index) => (
                      <tr key={index}>
                        <td
                          style={{
                            width: "150px",
                            textAlign: "center",
                            fontWeight: "600",
                            fontStretch: "expanded",
                            backgroundColor: "#000",
                            color: "#fff",
                            padding: "20px",
                          }}
                        >
                          {key}
                        </td>
                        <td
                          style={{
                            backgroundColor: getBgColor(
                              timetable?.timetable?.Day1[key]?.subject_type
                            ),
                          }}
                        >
                          {timetable?.timetable?.Day1[key]?.subject_name ==
                          "No class"
                            ? "-"
                            : truncateWord(
                                timetable?.timetable?.Day1[key]?.subject_name
                              )}
                          <br />
                          {timetable?.timetable?.Day1[key]?.room_code ==
                          "N/A" ? (
                            <></>
                          ) : (
                            <>
                            {roomCodeComponent(timetable?.timetable?.Day1[key]?.room_code)}
                            </>
                          )}
                        </td>
                        <td
                          style={{
                            backgroundColor: getBgColor(
                              timetable?.timetable?.Day2[key]?.subject_type
                            ),
                          }}
                        >
                          {timetable?.timetable?.Day2[key]?.subject_name ==
                          "No class"
                            ? "-"
                            : truncateWord(
                                timetable?.timetable?.Day2[key]?.subject_name
                              )}
                              {timetable?.timetable?.Day2[key]?.room_code ==
                          "N/A" ? (
                            <></>
                          ) : (
                            <>
                            {roomCodeComponent(timetable?.timetable?.Day2[key]?.room_code)}
                            </>
                          )}
                        </td>
                        <td
                          style={{
                            backgroundColor: getBgColor(
                              timetable?.timetable?.Day3[key]?.subject_type
                            ),
                          }}
                        >
                          {timetable?.timetable?.Day3[key]?.subject_name ==
                          "No class"
                            ? "-"
                            : truncateWord(
                                timetable?.timetable?.Day3[key]?.subject_name
                              )}
                              {timetable?.timetable?.Day3[key]?.room_code ==
                          "N/A" ? (
                            <></>
                          ) : (
                            <>
                            {roomCodeComponent(timetable?.timetable?.Day3[key]?.room_code)}
                            </>
                          )}
                        </td>
                        <td
                          style={{
                            backgroundColor: getBgColor(
                              timetable?.timetable?.Day4[key]?.subject_type
                            ),
                          }}
                        >
                          {timetable?.timetable?.Day4[key]?.subject_name ==
                          "No class"
                            ? "-"
                            : truncateWord(
                                timetable?.timetable?.Day4[key]?.subject_name
                              )}
                              {timetable?.timetable?.Day4[key]?.room_code ==
                          "N/A" ? (
                            <></>
                          ) : (
                            <>
                            {roomCodeComponent(timetable?.timetable?.Day4[key]?.room_code)}
                            </>
                          )}
                        </td>
                        <td
                          style={{
                            backgroundColor: getBgColor(
                              timetable?.timetable?.Day5[key]?.subject_type
                            ),
                          }}
                        >
                          {timetable?.timetable?.Day5[key]?.subject_name ==
                          "No class"
                            ? "-"
                            : truncateWord(
                                timetable?.timetable?.Day5[key]?.subject_name
                              )}
                              {timetable?.timetable?.Day5[key]?.room_code ==
                          "N/A" ? (
                            <></>
                          ) : (
                            <>
                            {roomCodeComponent(timetable?.timetable?.Day5[key]?.room_code)}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
              <tfoot>
                <tr style={{ paddingBottom: "20px" }}>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", color: "#fff" }}
                  >
                    <div className="flex flex-row justify-center items-end w-full gap-2">
                      <span className="text-base">Powered By | </span>
                      <span className="text-base">The Campus Web</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>
    </>
  );
};

export default PrintTimetable;
