import { ArrowLeft, AlertCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface RecordActivityScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  userRole: "student" | "staff"; // role comes from signed-in user
  studentId?: string; // staff can select a student
  studentName: string; // for student, their own name
}

export function RecordActivityScreen({ onNavigate, userRole, studentId, studentName }: RecordActivityScreenProps) {
  const [formData, setFormData] = useState({
    studentName: "",
    activityName: "",
    activityType: "",
    date: "",
    duration: "",
    remarks: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

    if (!formData.studentName.trim() && userRole === "staff")
      newErrors.studentName = "Student name is required";

    if (!formData.activityName.trim())
      newErrors.activityName = "Activity name is required";
    else if (formData.activityName.length > 100)
      newErrors.activityName = "Activity name must be less than 100 characters";

    if (!formData.activityType) newErrors.activityType = "Please select an activity type";

    if (!formData.date) newErrors.date = "Date is required";
    else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today)
        newErrors.date = "Cannot record activities for future dates";

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      ninetyDaysAgo.setHours(0, 0, 0, 0);

      if (selectedDate < ninetyDaysAgo)
        newErrors.date = "Cannot record activities older than 90 days";
    }

    if (!formData.duration.trim()) newErrors.duration = "Duration is required";
    else {
      const duration = parseFloat(formData.duration);
      if (isNaN(duration)) newErrors.duration = "Duration must be a valid number";
      else if (duration <= 0) newErrors.duration = "Duration must be greater than 0";
      else if (duration > 24) newErrors.duration = "Duration cannot exceed 24 hours";
      else if (duration < 0.25)
        newErrors.duration = "Minimum duration is 0.25 hours (15 minutes)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    setIsSubmitting(true);
    setNetworkError(false);

    try {
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("User not signed in or session expired", sessionError);
        setNetworkError(true);
        setIsSubmitting(false);
        return;
      }

      // Get Supabase user ID (UUID)
      const userId = session.user.id;

      // Determine which student_id to use
      const studentIdToUse = userRole === "student" ? userId : studentId;

      const newActivity = {
        activity_name: formData.activityName,
        activity_type: formData.activityType,
        date: formData.date,
        duration: parseFloat(formData.duration),
        remark: formData.remarks,
        student_id: studentIdToUse, // UUID for RLS
        recorded_by: studentName,
        role: userRole,              // <-- Added role
        status: "Pending",
        recorded_date: new Date().toISOString(),
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from("recorded_activities")
        .insert([newActivity])
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        setNetworkError(true);
        setIsSubmitting(false);
        return;
      }

      console.log("Activity recorded:", data);
      setShowSuccess(true);
    } catch (err) {
      console.error("Unexpected error:", err);
      setNetworkError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setNetworkError(false);
    handleSubmit();
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("activity-main")} style={{ color: "#7A0019" }}>
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1 style={{ color: "#1A1A1A", fontWeight: 600, fontSize: 20 }}>Record New Activity</h1>
        </div>
      </div>

      {/* Error Message */}
      {showError && Object.keys(errors).length > 0 && (
        <div className="mx-6 mt-6 p-4 border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FCA5A5", borderRadius: 8 }}>
          <p style={{ color: "#991B1B", fontSize: 14, fontWeight: 500 }}>Please complete all required fields</p>
        </div>
      )}

      {/* Form */}
      <div className="px-6 pt-6 space-y-6">
        {userRole === "staff" && (
          <div>
            <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: 500, fontSize: 14 }}>Student Name *</label>
            <input
              type="text"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              placeholder="Enter student name"
              className="w-full h-12 px-4 border rounded-lg"
              style={{ borderColor: errors.studentName ? "#FCA5A5" : "#E5E5E5", fontSize: 15, color: "#1A1A1A" }}
            />
            {errors.studentName && <p className="mt-1" style={{ color: "#991B1B", fontSize: 13 }}>{errors.studentName}</p>}
          </div>
        )}

        <div>
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: 500, fontSize: 14 }}>Activity Name *</label>
          <input
            type="text"
            value={formData.activityName}
            onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
            placeholder="Enter activity name"
            className="w-full h-12 px-4 border rounded-lg"
            style={{ borderColor: errors.activityName ? "#FCA5A5" : "#E5E5E5", fontSize: 15, color: "#1A1A1A" }}
          />
          {errors.activityName && <p className="mt-1" style={{ color: "#991B1B", fontSize: 13 }}>{errors.activityName}</p>}
        </div>

        <div>
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: 500, fontSize: 14 }}>Activity Type *</label>
          <select
            value={formData.activityType}
            onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
            className="w-full h-12 px-4 border rounded-lg"
            style={{ borderColor: errors.activityType ? "#FCA5A5" : "#E5E5E5", fontSize: 15, color: formData.activityType ? "#1A1A1A" : "#6A6A6A" }}
          >
            <option value="">Select activity type</option>
            {activityTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.activityType && <p className="mt-1" style={{ color: "#991B1B", fontSize: 13 }}>{errors.activityType}</p>}
        </div>

        <div>
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: 500, fontSize: 14 }}>Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full h-12 px-4 border rounded-lg"
            style={{ borderColor: errors.date ? "#FCA5A5" : "#E5E5E5", fontSize: 15, color: "#1A1A1A" }}
          />
          {errors.date && <p className="mt-1" style={{ color: "#991B1B", fontSize: 13 }}>{errors.date}</p>}
        </div>

        <div>
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: 500, fontSize: 14 }}>Duration (hours) *</label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g., 1.5"
            className="w-full h-12 px-4 border rounded-lg"
            style={{ borderColor: errors.duration ? "#FCA5A5" : "#E5E5E5", fontSize: 15, color: "#1A1A1A" }}
          />
          {errors.duration && <p className="mt-1" style={{ color: "#991B1B", fontSize: 13 }}>{errors.duration}</p>}
        </div>

        <div>
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: 500, fontSize: 14 }}>Remarks (Optional)</label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="Add any additional notes..."
            rows={4}
            className="w-full px-4 py-3 border rounded-lg"
            style={{ borderColor: "#E5E5E5", fontSize: 15, color: "#1A1A1A", resize: "none" }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 mt-8 space-y-3">
        <button
          onClick={handleSubmit}
          className="w-full h-12"
          style={{ backgroundColor: "#7A0019", color: "#FFFFFF", borderRadius: 8, fontWeight: 500, fontSize: 15 }}
        >
          {isSubmitting ? "Submitting..." : "Submit Activity"}
        </button>
        <button
          onClick={() => onNavigate("activity-main")}
          className="w-full h-12 border"
          style={{ borderColor: "#E5E5E5", color: "#6A6A6A", borderRadius: 8, fontWeight: 500, fontSize: 15, backgroundColor: "#FFFFFF" }}
        >
          Cancel
        </button>
      </div>

      {/* Success Dialog */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg" style={{ width: 300 }}>
            <h2 style={{ color: "#065F46", fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Success</h2>
            <p style={{ color: "#065F46", fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Activity recorded successfully!</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  onNavigate("activity-main");
                }}
                className="w-24 h-10"
                style={{ backgroundColor: "#7A0019", color: "#FFFFFF", borderRadius: 8, fontWeight: 500, fontSize: 15 }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network Error Dialog */}
      {networkError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg" style={{ width: 300 }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 style={{ color: "#1A1A1A", fontWeight: 600, fontSize: 18 }}>Network Error</h2>
            </div>
            <p style={{ color: "#6A6A6A", fontWeight: 500, fontSize: 14 }}>Please check your connection and try again.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setNetworkError(false)}
                className="w-24 h-10"
                style={{ backgroundColor: "#E5E5E5", color: "#6A6A6A", borderRadius: 8, fontWeight: 500, fontSize: 15 }}
              >
                Close
              </button>
              <button
                onClick={handleRetry}
                className="w-24 h-10"
                style={{ backgroundColor: "#7A0019", color: "#FFFFFF", borderRadius: 8, fontWeight: 500, fontSize: 15 }}
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
