"use client";

import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { studentPageLink } from "@/components/global/navbar/page-link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/global/loader";
import LineChart from "@/components/global/graph/line";

const Marks = () => {
  const [testreport, setTestreport] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const rawData = localStorage.getItem("studentData");
    const dataStudent = JSON.parse(rawData);
    setTestreport(dataStudent?.testPerformances);
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
      for (let i = 0; i <= 5 - labels.length; i++) {
        labels.push(" ");
      }
      return labels;
    } else {
      return labels;
    }
  };

  return (
    <>
      <div className="max-h-screen overflow-auto sm:hidden">
        <Navbar />
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
                          <span className="text-2xl ">{test.totalMarkGot}</span>
                          <span className="text-lg ">/</span>
                          <span className="text-lg ">{test.totalMarks}</span>
                        </div>
                      </div>
                      <div>
                        {test.tests && Object.keys(test.tests).length > 0 && (
                          <LineChart
                            chartDetails={{chartLabels: dataLabels(test.tests), values: percentages(test.tests)}}
                          />
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
                          )
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
            <Loader />
          )}
        </main>
      </div>
    </>
  );
};

export default Marks;
