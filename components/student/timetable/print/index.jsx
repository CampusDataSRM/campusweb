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
        const studentBatch =
          dataStudent?.comboBatch[dataStudent?.comboBatch.length - 1];
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
  console.log(timetable?.timetable?.Day5);
  const getBgColor = (type) => {
    if (type == "Practical") {
      return "purple";
    } else if (type == "Theory") {
      return "indigo";
    }
  };
  return (
    <>
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px", height: "100vh", width: "100%" }}>
        {!loading && (
          <>
            <table className="timetable" id="timetable">
              <thead>
                <tr>
                  <th
                    style={{
                      fontWeight: "600",
                      fontStretch: "expanded",
                      backgroundColor: "#0094FF",
                      color: "black",
                    }}
                  >
                    Time
                  </th>
                  <th>Day 1</th>
                  <th>Day 2</th>
                  <th>Day 3</th>
                  <th>Day 4</th>
                  <th>Day 5</th>
                </tr>
              </thead>
              <tbody>
                {timetable?.timetable && timetable?.timetable?.Day1 && (
                  <>
                    {Object.keys(timetable?.timetable?.Day1).map(
                      (key, index) => (
                        <tr key={index}>
                          <td
                            style={{
                              width: "150px",
                              textAlign: "center",
                              fontWeight: "600",
                              fontStretch: "expanded",
                              backgroundColor: "#0094FF",
                              color: "black",
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
                              ? "N / A"
                              : timetable?.timetable?.Day1[key]?.subject_name}
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
                              ? "N / A"
                              : timetable?.timetable?.Day2[key]?.subject_name}
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
                              ? "N / A"
                              : timetable?.timetable?.Day3[key]?.subject_name}
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
                              ? "N / A"
                              : timetable?.timetable?.Day4[key]?.subject_name}
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
                              ? "N / A"
                              : timetable?.timetable?.Day5[key]?.subject_name}
                          </td>
                        </tr>
                      )
                    )}
                  </>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
};

export default PrintTimetable;