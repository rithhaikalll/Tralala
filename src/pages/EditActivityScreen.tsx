import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface EditActivityScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  activityId: string;
  userRole?: "student" | "staff";
  userId: string;
}

export function EditActivityScreen({
  onNavigate,
  activityId,
  userRole = "student",
  userId,
}: EditActivityScreenProps) {
  const [formData, setFormData] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customMessage, setCustomMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  useEffect(() => {
    const fetchActivity = async () => {
      const { data, error } = await supabase
        .from("recorded_activities")
        .select("*")
        .eq("id", activityId)
        .single();

      if (error || !data) {
        setCustomMessage("Failed to fetch activity data.");
        return;
      }

      const mappedData = {
        activity_name: data.activity_name,
        activity_type: data.activity_type,
        activity_date: data.date,
        duration_hours: data.duration,
        remarks: data.remark,
        student_id: data.student_id,
        status: data.status,
      };

      setFormData(mappedData);
      setInitialData(mappedData);

      // Permission check
      const isOwner = data.student_id?.toString() === userId?.toString();
      const isPending = (data.status || "").toLowerCase() === "pending";

      let canEdit = false;
      if (userRole === "staff") canEdit = true;
      else if (userRole === "student" && isOwner && isPending) canEdit = true;

      setShowPermissionError(!canEdit);
    };

    fetchActivity();
  }, [activityId, userRole, userId]);

  useEffect(() => {
    if (!formData || !initialData) return;
    setHasChanges(JSON.stringify(formData) !== JSON.stringify(initialData));
  }, [formData, initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.activity_name?.trim())
      newErrors.activity_name = "Activity name required";
    if (!formData.activity_type)
      newErrors.activity_type = "Select activity type";
    if (!formData.activity_date) newErrors.date = "Date required";

    const duration = parseFloat(formData.duration_hours);
    if (!formData.duration_hours?.toString().trim())
      newErrors.duration = "Duration required";
    else if (isNaN(duration) || duration <= 0 || duration > 24)
      newErrors.duration = "Duration must be 0.25 - 24 hours";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (showPermissionError) return; // prevent save if no permission
    if (!formData) return;

    if (!hasChanges) {
      setCustomMessage("No changes made.");
      setTimeout(() => onNavigate("activity-main"), 1000);
      return;
    }

    if (!validateForm()) {
      setCustomMessage("Please fix errors before saving.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure correct types and column names match your Supabase table
      const updatePayload: any = {
        activity_name: formData.activity_name,
        activity_type: formData.activity_type,
        date: formData.activity_date
          ? new Date(formData.activity_date).toISOString()
          : null,
        duration: Number(formData.duration_hours) || 0, // must be number
        remark: formData.remarks || "",
        recorded_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("recorded_activities")
        .update(updatePayload)
        .eq("id", activityId);

      setIsSubmitting(false);

      if (error) {
        console.error("Supabase update error:", error);
        setCustomMessage(`Failed to update activity: ${error.message}`);
      } else {
        setCustomMessage("Activity updated successfully!");
        setTimeout(() => onNavigate("activity-main"), 1000);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setIsSubmitting(false);
      setCustomMessage("An unexpected error occurred.");
    }
  };

  const handleCancel = () => {
    onNavigate("activity-main");
  };

  if (!formData) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header = same style as ActivityHistoryScreen */}
      <div
        className="sticky top-0 z-40 bg-white px-6 py-6 border-b"
        style={{ borderColor: "#E5E5E5" }}
      >
        <div className="flex items-center gap-3">
          <button onClick={handleCancel} style={{ color: "#7A0019" }}>
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1
            style={{
              color: "#1A1A1A",
              fontWeight: 600,
              fontSize: "20px",
            }}
          >
            Edit Activity
          </h1>
        </div>
      </div>

      {/* Permission message */}
      {showPermissionError && (
        <div className="mx-6 mt-6 p-4 border rounded bg-yellow-100 border-yellow-400">
          <p className="text-yellow-700 font-medium text-sm">
            You do not have permission to edit this activity. You can view it,
            but cannot save changes.
          </p>
        </div>
      )}

      {/* Form */}
      <div className="px-6 pt-6 space-y-6">
        {/* Activity Name */}
        <div>
          <label className="block mb-1 font-medium text-sm">
            Activity Name *
          </label>
          <input
            type="text"
            value={formData.activity_name}
            onChange={(e) =>
              setFormData({ ...formData, activity_name: e.target.value })
            }
            className="w-full h-12 px-4 border rounded"
            style={{
              borderColor: errors.activity_name ? "#FCA5A5" : "#E5E5E5",
            }}
            disabled={showPermissionError}
          />
          {errors.activity_name && (
            <p className="text-red-700 text-xs mt-1">{errors.activity_name}</p>
          )}
        </div>

        {/* Activity Type */}
        <div>
          <label className="block mb-1 font-medium text-sm">
            Activity Type *
          </label>
          <select
            value={formData.activity_type}
            onChange={(e) =>
              setFormData({ ...formData, activity_type: e.target.value })
            }
            className="w-full h-12 px-4 border rounded"
            style={{
              borderColor: errors.activity_type ? "#FCA5A5" : "#E5E5E5",
            }}
            disabled={showPermissionError}
          >
            <option value="">Select type</option>
            {activityTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.activity_type && (
            <p className="text-red-700 text-xs mt-1">{errors.activity_type}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-medium text-sm">Date *</label>
          <input
            type="date"
            value={formData.activity_date}
            onChange={(e) =>
              setFormData({ ...formData, activity_date: e.target.value })
            }
            className="w-full h-12 px-4 border rounded"
            style={{ borderColor: errors.date ? "#FCA5A5" : "#E5E5E5" }}
            disabled={showPermissionError}
          />
          {errors.date && (
            <p className="text-red-700 text-xs mt-1">{errors.date}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block mb-1 font-medium text-sm">
            Duration (hours) *
          </label>
          <input
            type="number"
            step="0.25"
            value={formData.duration_hours}
            onChange={(e) =>
              setFormData({ ...formData, duration_hours: e.target.value })
            }
            className="w-full h-12 px-4 border rounded"
            style={{ borderColor: errors.duration ? "#FCA5A5" : "#E5E5E5" }}
            disabled={showPermissionError}
          />
          {errors.duration && (
            <p className="text-red-700 text-xs mt-1">{errors.duration}</p>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label className="block mb-1 font-medium text-sm">Remarks</label>
          <textarea
            value={formData.remarks || ""}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
            className="w-full px-4 py-3 border rounded"
            rows={4}
            disabled={showPermissionError}
          />
        </div>

        {/* Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleSave}
            disabled={isSubmitting || showPermissionError}
            className="w-full h-12 bg-[#7A0019] text-white rounded font-medium"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleCancel}
            className="w-full h-12 border border-[#E5E5E5] text-[#6A6A6A] rounded font-medium"
          >
            Cancel
          </button>
        </div>

        {/* Custom message */}
        {customMessage && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {customMessage}
          </p>
        )}
      </div>
    </div>
  );
}
