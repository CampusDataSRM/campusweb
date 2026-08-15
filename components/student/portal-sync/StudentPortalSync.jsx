"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAttendanceFromStudentPortal,
  studentPortalLogin,
} from "@/functions/api/student";

/**
 * Extracts the net ID from a value that may be an email (e.g. "ac2741@srmist.edu.in") or raw ID ("ac2741").
 */
const extractNetId = (value) => {
  if (!value) return "";
  return value.split("@")[0].toLowerCase();
};

/**
 * Maps attendance data from the student portal onto the existing courses array.
 * Matches by courseCode ↔ subjectcode.
 */
const mapAttendanceToCourses = (courses, attendance) => {
  if (!courses || !attendance) return courses;

  const attendanceMap = {};
  for (const item of attendance) {
    attendanceMap[item.subjectcode] = item;
  }

  return courses.map((course) => {
    const match = attendanceMap[course.courseCode];
    if (!match) return course;

    const present = parseFloat(match.present) || 0;
    const total = parseFloat(match.total) || 0;
    const attendancePercent = match.presentpercentage;

    let margin = 0;
    let required = 0;

    if (total > 0) {
      if (parseFloat(attendancePercent) >= 75) {
        // How many more classes can be missed while staying at/above 75%
        margin = Math.floor((present - 0.75 * total) / 0.75);
      } else {
        // How many consecutive classes need to be attended to reach 75%
        required = Math.ceil((0.75 * total - present) / 0.25);
      }
    }

    return {
      ...course,
      hoursPresent: match.present,
      hoursAbsent: match.absent,
      hoursConducted: match.total,
      attendancePercent: attendancePercent,
      margin,
      required,
    };
  });
};

/**
 * StudentPortalSync — Self-contained component that handles fetching real attendance
 * from the student portal and merging it into the existing course data in localStorage.
 *
 * Props:
 * - onSync: callback invoked after attendance data has been successfully merged and
 *   localStorage updated. The parent should re-read studentData to refresh UI.
 */
const StudentPortalSync = ({ onSync }) => {
  const [showModal, setShowModal] = useState(false);
  const [portalNetId, setPortalNetId] = useState(
    () =>
      extractNetId(localStorage.getItem("net_id")) ||
      extractNetId(localStorage.getItem("userid")) ||
      "",
  );
  const [portalPassword, setPortalPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  /**
   * Merges attendance data into localStorage's studentData and calls onSync.
   */
  const mergeAndPersist = useCallback(
    (attendanceArray) => {
      const raw = localStorage.getItem("studentData");
      if (!raw) return;

      const studentData = JSON.parse(raw);
      studentData.courses = mapAttendanceToCourses(
        studentData.courses,
        attendanceArray,
      );

      localStorage.setItem("studentData", JSON.stringify(studentData));
      onSync?.();
    },
    [onSync],
  );

  /**
   * Attempts to fetch attendance from the student portal.
   * Returns true if successful, false otherwise.
   */
  const tryFetchAttendance = useCallback(
    async (netId) => {
      const result = await getAttendanceFromStudentPortal(netId);

      if (result.message === "success") {
        mergeAndPersist(result.content.attendance);
        return { success: true };
      }

      if (result.message === "unauthorized") {
        return { success: false, reason: "unauthorized" };
      }

      return { success: false, reason: "error" };
    },
    [mergeAndPersist],
  );

  /**
   * Main sync flow — runs once when the component mounts.
   */
  useEffect(() => {
    if (hasSynced) return;

    const runSync = async () => {
      const raw = localStorage.getItem("studentData");
      if (!raw) return;

      const studentData = JSON.parse(raw);

      // Only sync when the flag is true
      if (!studentData?.studentPortalLoginRequired) return;

      const storedNetId = extractNetId(localStorage.getItem("net_id"));
      if (!storedNetId) {
        // No net_id in localStorage — need the user to log in
        setShowModal(true);
        setHasSynced(true);
        return;
      }

      setSyncing(true);
      const result = await tryFetchAttendance(storedNetId);
      setSyncing(false);

      if (result.success) {
        setHasSynced(true);
        return;
      }

      if (result.reason === "unauthorized") {
        // Session expired on student portal — need re-login
        setShowModal(true);
      } else {
        toast.error("Failed to sync attendance. Will retry next session.");
      }

      setHasSynced(true);
    };

    runSync();
  }, [hasSynced, tryFetchAttendance]);

  /**
   * Handles student portal login form submission.
   */
  const handlePortalLogin = async (e) => {
    e?.preventDefault();
    if (submitting) return;

    const raw = localStorage.getItem("studentData");
    if (!raw) {
      toast.error("Student data not found. Please re-login.");
      setShowModal(false);
      return;
    }

    const studentData = JSON.parse(raw);
    const registrationNumber = studentData?.registrationNumber;

    // Use the net_id from state (user may have entered it manually)
    const netId = portalNetId.trim().toLowerCase();

    if (!netId) {
      toast.error("Please enter your Net ID.");
      return;
    }

    if (!portalPassword.trim()) {
      toast.error("Please enter your student portal password.");
      return;
    }

    setSubmitting(true);

    // Step 1: Login to student portal
    const loginResult = await studentPortalLogin(
      netId,
      portalPassword,
      registrationNumber,
    );

    if (loginResult.message !== "success") {
      toast.error(
        loginResult.content?.message ||
          "Student portal login failed. Check your credentials.",
      );
      setSubmitting(false);
      return;
    }

    // Store net_id on successful login
    localStorage.setItem("net_id", netId);

    // Step 2: Retry fetching attendance
    const attendanceResult = await tryFetchAttendance(netId);

    if (attendanceResult.success) {
      toast.success("Attendance synced successfully!");
      setShowModal(false);
    } else {
      toast.error(
        "Attendance sync failed. Will retry next session.",
      );
      setShowModal(false);
    }

    setSubmitting(false);
  };

  // Syncing indicator (brief, non-blocking)
  if (syncing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="theme_box_bg px-6 py-5 flex items-center gap-3 rounded-xl shadow-2xl border border-gray-700">
          <svg
            className="animate-spin h-5 w-5 text-theme_primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm text-theme_text_normal tracking-wide">
            Syncing attendance...
          </span>
        </div>
      </div>
    );
  }

  // Login modal
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-700 bg-[#0f172a]">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-lg font-bold text-white">
              Student Portal Login
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Required to sync your attendance data
            </p>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handlePortalLogin} className="p-4 space-y-4">
          {/* Net ID — editable if not found in localStorage, read-only if pre-filled */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Net ID
            </label>
            <input
              type="text"
              value={portalNetId}
              onChange={(e) => setPortalNetId(e.target.value.trim())}
              disabled={
                !!(extractNetId(localStorage.getItem("net_id")) ||
                extractNetId(localStorage.getItem("userid")))
              }
              placeholder="Enter your Net ID (e.g. ac2741)"
              className={`w-full bg-black/40 border border-gray-700 rounded-md p-3 text-sm tracking-wide focus:outline-none focus:border-theme_primary ${
                extractNetId(localStorage.getItem("net_id")) ||
                extractNetId(localStorage.getItem("userid"))
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-white placeholder:text-gray-500 placeholder:text-xs"
              }`}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Student Portal Password
            </label>
            <div className="flex gap-1">
              <input
                type={passwordVisible ? "text" : "password"}
                value={portalPassword}
                onChange={(e) => setPortalPassword(e.target.value)}
                placeholder="Enter your student portal password"
                className="flex-1 bg-black/40 border border-gray-700 rounded-md p-3 text-white text-sm tracking-wide focus:outline-none focus:border-theme_primary placeholder:text-gray-500 placeholder:text-xs"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="bg-black/40 border border-gray-700 rounded-md px-3 text-gray-400 hover:text-white transition-colors"
              >
                {passwordVisible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    fill="currentColor"
                  >
                    <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    fill="currentColor"
                  >
                    <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 leading-relaxed">
            This is your SRM Student Portal password, which may differ from your
            Campus Web login password.
          </p>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 bg-black/20 flex justify-end gap-3">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-md text-gray-300 hover:text-white transition-colors text-sm"
          >
            Skip
          </button>
          <button
            onClick={handlePortalLogin}
            disabled={submitting}
            className="bg-gradient-to-br from-theme_primary to-theme_secondary px-6 py-2 rounded-md text-white text-sm font-semibold shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          >
            {submitting ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Sync Attendance"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPortalSync;
