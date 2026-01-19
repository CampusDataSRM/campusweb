"use client";

import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/global/loader";
import LineChart from "@/components/global/graph/line";
import { pageNames } from "@/components/global/navbar/page-link";
import { toTwoDecimalPlaces } from "@/functions/round-off";
import { useRouter } from "next/navigation";
import FloatingNavbar from "@/components/global/floatingNavbar";

const Marks = () => {
  const router = useRouter();
  const [testreport, setTestreport] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    if (!Cookies.get("X-CSRF-Token") || !localStorage.getItem("studentData")) {
      router.push("/client/login/student");
    } else {
      const rawData = localStorage.getItem("studentData");
      const dataStudent = JSON.parse(rawData);
      setTestreport(dataStudent?.testPerformances);
      setLoading(false);
    }
  }, []);

  const percentages = (obj) => {
    let percent = [];
    for (let key in obj) {
      percent.push(obj[key].percentage);
    }
    return percent;
  };

  const dataLabels = (obj) => {
    let labels = Object.keys(obj);
    if (labels.length < 6) {
      for (let i = 0; i <= 6 - labels.length; i++) {
        labels.push(" ");
      }
      return labels;
    } else {
      return labels;
    }
  };

  return (
    <>
      <div className="max-h-screen overflow-auto pb-floatingNavHeight">
        <Navbar items={pageNames.filter((item) => item !== "Marks")} />
        <FloatingNavbar />
        <main className="px-3">
          <SectionTitle title="Marks" />
          {testreport ? (
            <>
              {testreport.length > 0 ? (
                <div className="flex flex-col gap-3 justify-center pb-3">
                  {testreport.map((test, index) => (
                    <div
                      className="theme_box_bg px-4 py-5 flex flex-col gap-5 justify-center"
                      key={index}
                    >
                      <div className="flex justify-between gap-4 items-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-base font-semibold text-theme_text_normal">
                            {test.courseName
                              ? test.courseName
                              : test.courseCode
                                ? test.courseCode
                                : "Not Available"}
                          </span>
                          <span className="text-sm font-semibold text-theme_text_normal_60">
                            {test.courseCode
                              ? test.courseCode
                              : "Not Available"}{" "}
                            -{" "}
                            {test.courseType
                              ? test.courseType
                              : "Not Available"}
                          </span>
                        </div>
                        <div className="text-theme_primary font-bold flex items-end gap-[2px] pr-3">
                          <span className="text-2xl ">
                            {toTwoDecimalPlaces(test.totalMarkGot)}
                          </span>
                          <span className="text-lg ">/</span>
                          <span className="text-lg ">{test.totalMarks}</span>
                        </div>
                      </div>
                      <div className="py-2">
                        {test.tests && Object.keys(test.tests).length > 0 && (
                          <>
                            <div className="flex justify-center gap-2 items-center pb-2">
                              <span className="bg-theme_text_normal/40 w-3 h-3 rounded-full border-2 border-theme_secondary"></span>
                              <span className="text-xs font-light tracking-wide text-theme_text_normal">
                                Percentage
                              </span>
                            </div>
                            <LineChart
                              chartDetails={{
                                chartLabels: dataLabels(test.tests),
                                values: percentages(test.tests),
                              }}
                            />
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {Object.keys(test.tests && test.tests).map(
                          (testName, index) => (
                            <div
                              className="theme_box_bg flex flex-col gap-2 justify-center items-center py-3 px-5"
                              key={index}
                            >
                              <span className="text-base font-bold text-theme_primary tracking-wide">
                                {testName}
                              </span>
                              <span className="text-sm font-semibold text-theme_text_normal">
                                {" "}
                                {test.tests[testName].got} /{" "}
                                {test.tests[testName].total}
                              </span>
                            </div>
                          ),
                        )}
                        {test.tests && Object.keys(test.tests).length === 0 && (
                          <div className="theme_box_bg flex flex-col gap-2 justify-center items-center py-4 w-full">
                            <span className="text-base font-medium text-theme_text_normal tracking-wide">
                              No Record Found
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <div className="theme_box_bg py-6 w-full">
              <span className="text-theme_text_normal font-medium tracking-wide flex justify-center">
                No data found for Test Performances.
              </span>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Marks;
