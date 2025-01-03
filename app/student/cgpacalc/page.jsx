"use client";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState } from "react";
import { pageNames } from "@/components/global/navbar/page-link";
import FloatingNavbar from "@/components/global/floatingNavbar";

const CgpaCalc = () => {
  const [uniqueCourses, setUniqueCourses] = useState([]);
  const [currentSGPA, setCurrentSGPA] = useState(0);
  const [currentCredits, setCurrentCredits] = useState(0);

  const gradePoints = {
    O: 10,
    "A+": 9,
    A: 8,
    "B+": 7,
    B: 6,
    C: 5,
    P: 4,
    F: 0,
    Ab: 0,
    I: 0,
    "set": 0,
  };

  const calculateSGPA = (courses) => {
    let totalCredits = 0;
    let totalPoints = 0;

    for (let i = 0; i < courses?.length; i++) {
      const credit = Number(courses[i].credit) || 0;
      const gradePoint = gradePoints[courses[i].grade] || 0;
      totalCredits += credit;
      totalPoints += credit * gradePoint;
    }

    // Avoid division by zero
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(3) : 0;
  };

  useEffect(() => {
    const credits = uniqueCourses?.reduce((acc, course) => {
      return acc + Number(course.credit);
    }, 0);
    setCurrentCredits(credits);
    const sgpa = calculateSGPA(uniqueCourses);
    setCurrentSGPA(sgpa);
    console.log("sgpa : ", sgpa);
  }, [uniqueCourses]);

  const handleCreditChange = (index, newCredit) => {
    const updatedCourses = [...uniqueCourses];
    updatedCourses[index].credit = newCredit;
    setUniqueCourses(updatedCourses);
  };

  const handleGradeChange = (index, newGrade) => {
    const updatedCourses = [...uniqueCourses];
    updatedCourses[index].grade = newGrade;
    setUniqueCourses(updatedCourses);
  };
  return (
    <>
      <div className="max-h-screen overflow-auto pb-floatingNavHeight">
        <Navbar items={pageNames.filter((item) => item !== "Calendar")} />
        <FloatingNavbar />
        <main className="px-3 pb-3">
          <SectionTitle
            title="CGPA calculator"
            icon={"/icons/CGPA/secondary.svg"}
          />

          {/* Credits and GPA display */}
          <div className="">
            {
              <>
                <div className="text-theme_text_normal font-semibold text-xl flex justify-center items-center gap-5 m-5">
                  <div>
                    <span>Credits : </span>
                    <span className="text-theme_primary text-2xl font-black">
                      {currentCredits}
                    </span>
                  </div>
                  <div>
                    <span>SGPA : </span>
                    <span className="text-theme_primary text-2xl font-black">
                      {currentSGPA}
                    </span>
                  </div>
                </div>

                {/* clear and add your subjects button */}
                <div className="flex justify-end gap-2 items-center my-2">
                  <button
                    onClick={() => setUniqueCourses([])}
                    className="text-theme_primary font-bold  rounded-lg p-2"
                  >
                    Clear
                  </button>
                </div>

                {/* SUBJECT ROW */}
                {uniqueCourses?.map((course, index) => (
                  <div
                    key={index}
                    className="theme_box_bg relative p-3 flex flex-col gap-4 m-2 text-theme_text_normal"
                  >
                    <button
                      onClick={() => {
                        const updatedCourses = uniqueCourses.filter(
                          (_, i) => i !== index
                        );
                        setUniqueCourses(updatedCourses);
                      }}
                      className="text-red-500 absolute right-0 -top-2 bg-black/20 rounded-full px-1 font-bold"
                    >
                      X
                    </button>
                    <div className="flex justify-around items-stretch gap-3 h-20">
                      <input
                        type="text"
                        defaultValue={course.courseTitle}
                        className="theme_box_bg w-full p-3 flex items-center text-lg focus:outline-none"
                      ></input>
                      <div
                        onClick={() => console.log("open credits dropdown")}
                        className="theme_box_bg flex flex-col justify-center items-center p-2 cursor-pointer"
                      >
                        {/* <div className="text-2xl font-bold">{"5"}</div> */}
                        <select
                          defaultValue={course.credit}
                          className="bg-transparent text-2xl text-center font-bold w-full p-3 flex items-center focus:outline-none appearance-none"
                          onChange={(e) =>
                            handleCreditChange(index, e.target.value)
                          }
                        >
                          {Array.from({ length: 20 }, (_, i) => (
                            <option
                              className="text-black text-sm text-center"
                              key={i}
                              value={i}
                            >
                              {i}
                            </option>
                          ))}
                        </select>
                        <div className="text-theme_green font-semibold">
                          Credits
                        </div>
                      </div>
                      <div
                        // onClick={() => console.log("open grades dropdown")}
                        className="theme_box_bg flex flex-col justify-center items-center p-2 cursor-pointer"
                      >
                        <select
                          className="bg-transparent text-2xl text-center font-bold w-fit p-3 flex items-center focus:outline-none appearance-none"
                          defaultValue={"set"}
                          onChange={(e) =>
                            handleGradeChange(index, e.target.value)
                          }
                        >
                          <option
                            className="text-black/50 text-sm text-center"
                            key="set"
                            value="set"
                            disabled
                          >
                            set
                          </option>
                          <option
                            className="text-black text-sm text-center"
                            key="O"
                            value="O"
                          >
                            O
                          </option>
                          <option
                            className="text-black text-sm text-center"
                            key="A+"
                            value="A+"
                          >
                            A+
                          </option>
                          <option
                            className="text-black text-sm text-center"
                            key="A"
                            value="A"
                          >
                            A
                          </option>
                          <option
                            className="text-black text-sm text-center"
                            key="B+"
                            value="B+"
                          >
                            B+
                          </option>
                          <option
                            className="text-black text-sm text-center"
                            key="B"
                            value="B"
                          >
                            B
                          </option>
                          <option
                            className="text-black text-sm text-center"
                            key="C"
                            value="C"
                          >
                            C
                          </option>
                          <option
                            className="text-black text-sm text-center"
                            key="P"
                            value="P"
                          >
                            P
                          </option>
                          <option
                            className="text-black text-sm text-center"
                            key="F"
                            value="F"
                          >
                            F
                          </option>
                          <option
                            className="text-black text-sm text-center"
                            key="Ab"
                            value="Ab"
                          >
                            Ab
                          </option>
                          <option
                            className="text-black text-sm text-center"
                            key="I"
                            value="I"
                          >
                            I
                          </option>
                        </select>
                        <div className="text-theme_green font-semibold">
                          Grade
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newCourse = {
                      serialNo: (uniqueCourses.length + 1).toString(),
                      courseCode: "",
                      courseTitle: "",
                      credit: "0",
                      regType: "Regular",
                      category: "",
                      courseType: "",
                      facultyName: "",
                      slot: "",
                      gcrCode: "",
                      roomNo: "",
                      academicYear: "",
                      grade: "O",
                    };
                    setUniqueCourses([...uniqueCourses, newCourse]);
                  }}
                  className="text-black font-black mt-2 w-full bg-theme_primary rounded-lg p-2"
                >
                  + Add Subject
                </button>
              </>
            }
          </div>
        </main>
      </div>
    </>
  );
};

export default CgpaCalc;
