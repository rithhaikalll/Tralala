import { ArrowLeft, AlertCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface RecordActivityScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  studentName?: string;
  userRole?: "student" | "staff";
  // ✅ ADD userId to props
  userId?: string;
}

export function RecordActivityScreen({
  onNavigate,
  studentName = "Ahmad",
  userRole = "student",
  // ✅ DESTRUCTURE userId
  userId,
}: RecordActivityScreenProps) {
  const [formData, setFormData] = useState({
    activityName: "",
    activityType: "",
    date: "",
    duration: "",
    remarks: "",
    studentId: userRole === "staff" ? "" : studentName,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const activityTypes = [
    "Badminton",
    "Futsal",
    "Volleyball",
    "Ping Pong",
    "Gym",
    "Basketball",
    "Running",
    "Swimming",
    "Other",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.activityName.trim()) {
      newErrors.activityName = "Activity name is required";
    } else if (formData.activityName.length > 100) {
      newErrors.activityName = "Activity name must be less than 100 characters";
    }

    if (!formData.activityType) {
      newErrors.activityType = "Please select an activity type";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        newErrors.date = "Cannot record activities for future dates";
      }

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      ninetyDaysAgo.setHours(0, 0, 0, 0);

      if (selectedDate < ninetyDaysAgo) {
        newErrors.date = "Cannot record activities older than 90 days";
      }
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    } else {
      const duration = parseFloat(formData.duration);
      if (isNaN(duration)) {
        newErrors.duration = "Duration must be a valid number";
      } else if (duration <= 0) {
        newErrors.duration = "Duration must be greater than 0";
      } else if (duration > 24) {
        newErrors.duration = "Duration cannot exceed 24 hours";
      } else if (duration < 0.25) {
        newErrors.duration = "Minimum duration is 0.25 hours (15 minutes)";
      }
    }

    if (userRole === "staff") {
      if (!formData.studentId.trim()) {
        newErrors.studentId = "Student name/ID is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    const draftData = {
      ...formData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("activityDraft", JSON.stringify(draftData));
  };

  const [customMessage, setCustomMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!validateForm()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    setIsSubmitting(true);
    setNetworkError(false);

    // Prepare data for Supabase
    const newActivity = {
      activity_name: formData.activityName,
      activity_type: formData.activityType,
      date: formData.date,
      duration: parseFloat(formData.duration),
      remark: formData.remarks,
      // ✅ FIX: Use userId here to ensure correct ID is saved for student activities
      student_id: userRole === "staff" ? formData.studentId : userId,
      recorded_by: userRole === "staff" ? studentName : "self",
      status: "Pending",
      recorded_date: new Date().toISOString(),
    };

    // Insert into Supabase
    const { error } = await supabase
      .from("recorded_activities")
      .insert([newActivity]);

    if (error) {
      console.error("Supabase Error:", error);
      setIsSubmitting(false);
      setNetworkError(true);
      return;
    }

    // Success → remove draft + navigate back
    localStorage.removeItem("activityDraft");
    setCustomMessage("Activity recorded successfully!");
    setShowSuccess(true);
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    const hasData =
      formData.activityName ||
      formData.activityType ||
      formData.date ||
      formData.duration ||
      formData.remarks;
    if (hasData) {
      setShowCancelDialog(true);
    } else {
      onNavigate("activity-main");
    }
  };

  const confirmCancel = (saveAsDraft: boolean) => {
    if (saveAsDraft) handleSaveDraft();
    else localStorage.removeItem("activityDraft");
    setShowCancelDialog(false);
    onNavigate("activity-main");
  };

  const handleRetry = () => {
    setNetworkError(false);
    handleSubmit();
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header (now same style as ActivityHistoryScreen) */}
      <div
        className="sticky top-0 z-40 bg-white px-6 py-6 border-b"
        style={{ borderColor: "#E5E5E5" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("activity-main")}
            style={{ color: "#7A0019" }}
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1
            style={{
              color: "#1A1A1A",
              fontWeight: "600",
              fontSize: "20px",
            }}
          >
            Record New Activity
          </h1>
        </div>
      </div>

      {/* Success Message Dialog */}
      {showSuccess && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div
            className="bg-white p-6 rounded-lg shadow-lg"
            style={{ width: "300px" }}
          >
            <h2
              style={{
                color: "#065F46",
                fontWeight: "600",
                fontSize: "18px",
                marginBottom: "8px",
              }}
            >
              Success
            </h2>
            <p
              style={{
                color: "#065F46",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "16px",
              }}
            >
              {customMessage}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  onNavigate("activity-main");
                }}
                className="w-24 h-10"
                style={{
                  backgroundColor: "#7A0019",
                  color: "#FFFFFF",
                  borderRadius: "8px",
                  fontWeight: "500",
                  fontSize: "15px",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && Object.keys(errors).length > 0 && (
        <div
          className="mx-6 mt-6 p-4 border"
          style={{
            backgroundColor: "#FEF2F2",
            borderColor: "#FCA5A5",
            borderRadius: "8px",
          }}
        >
          <p
            style={{
              color: "#991B1B",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Please complete all required fields
          </p>
        </div>
      )}

      {/* Form */}
      <div className="px-6 pt-6 space-y-6">
        {/* Activity Name */}
        <div>
          <label
            style={{
              color: "#1A1A1A",
              fontWeight: "500",
              fontSize: "14px",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Activity Name *
          </label>
          <input
            type="text"
            value={formData.activityName}
            onChange={(e) =>
              setFormData({ ...formData, activityName: e.target.value })
            }
            placeholder="e.g., Morning Badminton Session"
            className="w-full h-12 px-4 border"
            style={{
              borderColor: errors.activityName ? "#FCA5A5" : "#E5E5E5",
              borderRadius: "8px",
              fontSize: "15px",
              color: "#1A1A1A",
            }}
          />
          {errors.activityName && (
            <p
              style={{
                color: "#991B1B",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              {errors.activityName}
            </p>
          )}
        </div>

        {/* Activity Type */}
        <div>
          <label
            style={{
              color: "#1A1A1A",
              fontWeight: "500",
              fontSize: "14px",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Activity Type *
          </label>

          <div className="relative">
            <select
              value={formData.activityType}
              onChange={(e) =>
                setFormData({ ...formData, activityType: e.target.value })
              }
              className="w-full h-12 px-4 pr-10 border appearance-none"
              style={{
                borderColor: errors.activityType ? "#FCA5A5" : "#E5E5E5",
                borderRadius: "8px",
                fontSize: "15px",
                color: formData.activityType ? "#1A1A1A" : "#6A6A6A",
              }}
            >
              <option value="">Select activity type</option>
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* custom arrow, pulled in from the edge */}
            <svg
              className="w-5 h-5 text-[#6A6A6A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {errors.activityType && (
            <p
              style={{
                color: "#991B1B",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              {errors.activityType}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label
            style={{
              color: "#1A1A1A",
              fontWeight: "500",
              fontSize: "14px",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full h-12 px-4 border"
            style={{
              borderColor: errors.date ? "#FCA5A5" : "#E5E5E5",
              borderRadius: "8px",
              fontSize: "15px",
              color: "#1A1A1A",
            }}
          />
          {errors.date && (
            <p
              style={{
                color: "#991B1B",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              {errors.date}
            </p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label
            style={{
              color: "#1A1A1A",
              fontWeight: "500",
              fontSize: "14px",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Duration (hours) *
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            placeholder="e.g., 1.5"
            className="w-full h-12 px-4 border"
            style={{
              borderColor: errors.duration ? "#FCA5A5" : "#E5E5E5",
              borderRadius: "8px",
              fontSize: "15px",
              color: "#1A1A1A",
            }}
          />
          {errors.duration && (
            <p
              style={{
                color: "#991B1B",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              {errors.duration}
            </p>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label
            style={{
              color: "#1A1A1A",
              fontWeight: "500",
              fontSize: "14px",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Remarks (Optional)
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
            placeholder="Add any additional notes about this activity..."
            rows={4}
            className="w-full px-4 py-3 border"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "8px",
              fontSize: "15px",
              color: "#1A1A1A",
              resize: "none",
            }}
          />
        </div>

        {/* Student ID/Name */}
        {userRole === "staff" && (
          <div>
            <label
              style={{
                color: "#1A1A1A",
                fontWeight: "500",
                fontSize: "14px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Student Name/ID *
            </label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) =>
                setFormData({ ...formData, studentId: e.target.value })
              }
              placeholder="e.g., John Doe or 12345"
              className="w-full h-12 px-4 border"
              style={{
                borderColor: errors.studentId ? "#FCA5A5" : "#E5E5E5",
                borderRadius: "8px",
                fontSize: "15px",
                color: "#1A1A1A",
              }}
            />
            {errors.studentId && (
              <p
                style={{
                  color: "#991B1B",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {errors.studentId}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="px-6 mt-8 space-y-3">
        <button
          onClick={handleSubmit}
          className="w-full h-12"
          style={{
            backgroundColor: "#7A0019",
            color: "#FFFFFF",
            borderRadius: "8px",
            fontWeight: "500",
            fontSize: "15px",
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Activity"}
        </button>
        <button
          onClick={handleCancel}
          className="w-full h-12 border"
          style={{
            borderColor: "#E5E5E5",
            color: "#6A6A6A",
            borderRadius: "8px",
            fontWeight: "500",
            fontSize: "15px",
            backgroundColor: "#FFFFFF",
          }}
        >
          Cancel
        </button>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div
            className="bg-white p-6 rounded-lg shadow-lg"
            style={{ width: "300px" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2
                style={{
                  color: "#1A1A1A",
                  fontWeight: "600",
                  fontSize: "18px",
                }}
              >
                Confirm Cancel
              </h2>
            </div>
            <p
              style={{
                color: "#6A6A6A",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              Are you sure you want to cancel? You can save this as a draft if
              you want to complete it later.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => confirmCancel(false)}
                className="w-24 h-10"
                style={{
                  backgroundColor: "#E5E5E5",
                  color: "#6A6A6A",
                  borderRadius: "8px",
                  fontWeight: "500",
                  fontSize: "15px",
                }}
              >
                Discard
              </button>
              <button
                onClick={() => confirmCancel(true)}
                className="w-24 h-10"
                style={{
                  backgroundColor: "#7A0019",
                  color: "#FFFFFF",
                  borderRadius: "8px",
                  fontWeight: "500",
                  fontSize: "15px",
                }}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network Error Dialog */}
      {networkError && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div
            className="bg-white p-6 rounded-lg shadow-lg"
            style={{ width: "300px" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2
                style={{
                  color: "#1A1A1A",
                  fontWeight: "600",
                  fontSize: "18px",
                }}
              >
                Network Error
              </h2>
            </div>
            <p
              style={{
                color: "#6A6A6A",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              There was a network error. Please check your connection and try
              again.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setNetworkError(false)}
                className="w-24 h-10"
                style={{
                  backgroundColor: "#E5E5E5",
                  color: "#6A6A6A",
                  borderRadius: "8px",
                  fontWeight: "500",
                  fontSize: "15px",
                }}
              >
                Close
              </button>
              <button
                onClick={handleRetry}
                className="w-24 h-10"
                style={{
                  backgroundColor: "#7A0019",
                  color: "#FFFFFF",
                  borderRadius: "8px",
                  fontWeight: "500",
                  fontSize: "15px",
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
