"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { baseURL } from "@/constants/baseURL";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function FeedbackWidget() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedRating, setSelectedRating] = useState("");
  const [comment, setComment] = useState("");

  const fetchFeedback = async () => {
    setLoading(true);
    const token = Cookies.get("X-CSRF-Token");
    if (!token) {
      router.push("/client/login/student");
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/auth/feedback`, {
        method: "GET",
        headers: {
          "X-CSRF-Token": token,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        Cookies.remove("X-CSRF-Token");
        router.push("/client/login/student");
        return;
      }
      
      if (response.status === 404 || response.status === 422) {
        setData({ available: false });
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to load feedback");
        setLoading(false);
        return;
      }

      const result = await response.json();
      setData(result);
      setSelectedRating(result.defaultRating || "");
      setComment(result.defaultComment || "");
    } catch (error) {
      toast.error("Network error while fetching feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    const token = Cookies.get("X-CSRF-Token");

    try {
      const response = await fetch(`${baseURL}/api/auth/feedback`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: selectedRating,
          comment: comment,
        }),
      });

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        Cookies.remove("X-CSRF-Token");
        router.push("/client/login/student");
        return;
      }

      const result = await response.json().catch(() => ({}));

      if (response.status === 409) {
        toast.info("Feedback was already completed.");
        fetchFeedback();
        setShowModal(false);
        return;
      }

      if (response.status === 502) {
        toast.error(result.message || "Temporary failure. Please try again later.");
        return;
      }

      if (!response.ok) {
        toast.error(result.message || "Failed to submit feedback.");
        return;
      }

      toast.success(result.message || "Feedback submitted successfully!");
      setShowModal(false);
      fetchFeedback(); // Refresh state
    } catch (error) {
      toast.error("Network error while submitting feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="theme_box_bg p-4 flex justify-center items-center rounded-lg mt-4 mb-4 animate-pulse">
        <span className="text-sm text-theme_text_normal">Loading feedback status...</span>
      </div>
    );
  }

  if (!data || data.available === false || data.completed) {
    return null;
  }

  return (
    <div className="mt-4 mb-4">
      {/* Strip UI */}
      <div className="bg-gradient-to-r from-theme_primary/20 to-theme_secondary/20 p-4 flex justify-between items-center rounded-lg border border-theme_primary/50 shadow-md">
        <div>
          <h3 className="text-base font-semibold text-white">Your Feedback form is pending</h3>
          <p className="text-xs text-theme_text_normal mt-1">{data.pendingCourseCount} courses need feedback.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-br from-theme_primary to-theme_secondary px-4 py-2 rounded-md text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity"
        >
          Fill it Now
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-700 bg-[#0f172a]">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-black/20">
              <h2 className="text-lg font-bold text-white">Course Feedback</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-black/20 p-3 rounded-lg">
                <div>
                  <div className="font-bold text-white text-lg">{data.totalCourses}</div>
                  <div className="text-gray-400">Total</div>
                </div>
                <div>
                  <div className="font-bold text-theme_red text-lg">{data.pendingCourseCount}</div>
                  <div className="text-gray-400">Pending</div>
                </div>
                <div>
                  <div className="font-bold text-theme_green text-lg">{data.completedCourseCount}</div>
                  <div className="text-gray-400">Completed</div>
                </div>
              </div>

              {/* Theory Courses */}
              {data.theoryCourses?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-theme_primary mb-2 flex items-center">
                    Theory Courses ({data.pendingTheoryCount} pending)
                  </h3>
                  <div className="space-y-2">
                    {data.theoryCourses.map((course, idx) => (
                      <div key={idx} className="bg-black/30 p-2 rounded flex justify-between items-center text-xs">
                        <span className="text-gray-300 truncate pr-2">{course.display}</span>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${course.feedbackCompleted ? 'bg-theme_green/20 text-theme_green' : 'bg-theme_red/20 text-theme_red'}`}>
                          {course.feedbackCompleted ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Courses */}
              {data.practicalCourses?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-theme_secondary mb-2 flex items-center">
                    Practical Courses ({data.pendingPracticalCount} pending)
                  </h3>
                  <div className="space-y-2">
                    {data.practicalCourses.map((course, idx) => (
                      <div key={idx} className="bg-black/30 p-2 rounded flex justify-between items-center text-xs">
                        <span className="text-gray-300 truncate pr-2">{course.display}</span>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${course.feedbackCompleted ? 'bg-theme_green/20 text-theme_green' : 'bg-theme_red/20 text-theme_red'}`}>
                          {course.feedbackCompleted ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form */}
              {data.canSubmit && !data.completed && (
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rating</label>
                    <select
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(e.target.value)}
                      className="w-full bg-black/40 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:border-theme_primary"
                    >
                      {data.ratings?.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="w-full bg-black/40 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:border-theme_primary resize-none"
                      placeholder="Add your comments here..."
                      maxLength={2000}
                    ></textarea>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-black/20 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md text-gray-300 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              {data.canSubmit && !data.completed && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={submitting}
                  className="bg-gradient-to-br from-theme_primary to-theme_secondary px-6 py-2 rounded-md text-white text-sm font-semibold shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "Submit Feedback"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">Confirm Submission</h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-300">
                Apply "{selectedRating}" to all {data.totalCourses} courses and submit the feedback?
              </p>
            </div>
            <div className="p-4 border-t border-gray-700 bg-black/20 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-md text-gray-300 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-br from-theme_primary to-theme_secondary px-6 py-2 rounded-md text-white text-sm font-semibold shadow-lg hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
