import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
// Accessing global preferences
import { useUserPreferences } from "../../lib/UserPreferencesContext";

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
  // Consume theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  
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
        setCustomMessage(preferences.language_code === 'ms' ? "Gagal mengambil data aktiviti." : "Failed to fetch activity data.");
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
        rejection_reason: data.rejection_reason || "",
      };

      setFormData(mappedData);
      setInitialData(mappedData);

      const isOwner = data.student_id?.toString() === userId?.toString();
      const isPending = (data.status || "").toLowerCase() === "pending";

      let canEdit = false;
      if (userRole === "staff") canEdit = true;
      else if (userRole === "student" && isOwner && isPending) canEdit = true;

      setShowPermissionError(!canEdit);
    };

    fetchActivity();
  }, [activityId, userRole, userId, preferences.language_code]);

  useEffect(() => {
    if (!formData || !initialData) return;
    setHasChanges(JSON.stringify(formData) !== JSON.stringify(initialData));
  }, [formData, initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.activity_name?.trim())
      newErrors.activity_name = t("activity_name") + " " + (preferences.language_code === 'ms' ? 'diperlukan' : 'required');
    if (!formData.activity_type)
      newErrors.activity_type = preferences.language_code === 'ms' ? "Pilih jenis aktiviti" : "Select activity type";
    if (!formData.activity_date) newErrors.date = t("date") + " " + (preferences.language_code === 'ms' ? 'diperlukan' : 'required');

    const duration = parseFloat(formData.duration_hours);
    if (!formData.duration_hours?.toString().trim())
      newErrors.duration = t("duration") + " " + (preferences.language_code === 'ms' ? 'diperlukan' : 'required');
    else if (isNaN(duration) || duration <= 0 || duration > 24)
      newErrors.duration = preferences.language_code === 'ms' ? "Tempoh mestilah 0.25 - 24 jam" : "Duration must be 0.25 - 24 hours";

    if (userRole === "staff" && formData.status === "Rejected") {
      if (!formData.rejection_reason?.trim()) {
        newErrors.rejection_reason = preferences.language_code === 'ms' ? "Sebab penolakan diperlukan" : "Rejection reason required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (showPermissionError || !formData) return;

    if (!hasChanges) {
        setCustomMessage(preferences.language_code === 'ms' ? "Tiada perubahan dibuat." : "No changes made.");
        setTimeout(() => onNavigate("activity-main"), 1000);
        return;
    }

    if (!validateForm()) {
        setCustomMessage(preferences.language_code === 'ms' ? "Sila betulkan ralat sebelum menyimpan." : "Please fix errors before saving.");
        return;
    }

    setIsSubmitting(true);

    try {
        const updatePayload: any = {
          activity_name: formData.activity_name,
          activity_type: formData.activity_type,
          date: formData.activity_date ? new Date(formData.activity_date).toISOString() : null,
          duration: Number(formData.duration_hours) || 0,
          remark: formData.remarks || "",
          recorded_date: new Date().toISOString(),
        };

        if (userRole === "staff") {
          updatePayload.status = formData.status;
          updatePayload.rejection_reason = formData.rejection_reason || null;
        }

        const { error } = await supabase
        .from("recorded_activities")
        .update(updatePayload)
        .eq("id", activityId);

        setIsSubmitting(false);

        if (error) {
          setCustomMessage(preferences.language_code === 'ms' ? `Gagal mengemas kini aktiviti: ${error.message}` : `Failed to update activity: ${error.message}`);
        } else {
          setCustomMessage(preferences.language_code === 'ms' ? "Aktiviti berjaya dikemas kini!" : "Activity updated successfully!");
          setTimeout(() => onNavigate("activity-main"), 1000);
        }
    } catch (err) {
        setIsSubmitting(false);
        setCustomMessage(preferences.language_code === 'ms' ? "Ralat tidak dijangka berlaku." : "An unexpected error occurred.");
    }
  };

  const handleCancel = () => {
    onNavigate("activity-main");
  };

  if (!formData) return <p className="p-6" style={{ color: theme.textSecondary }}>{t("view_all")}...</p>;

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleCancel}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            style={{ backgroundColor: theme.background }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} style={{ color: theme.primary }} />
          </button>
          <h1 className="text-[20px] font-semibold" style={{ color: theme.text }}>
            {preferences.language_code === 'ms' ? 'Edit Aktiviti' : 'Edit Activity'}
          </h1>
        </div>
      </div>

      {/* Permission message */}
      {showPermissionError && (
        <div className="mx-6 mt-6 p-4 border rounded bg-yellow-100 dark:bg-yellow-900/20 border-yellow-400">
          <p className="text-yellow-700 dark:text-yellow-400 font-medium text-sm">
            {preferences.language_code === 'ms' 
              ? 'Anda tidak mempunyai kebenaran untuk mengedit aktiviti ini. Anda boleh melihatnya, tetapi tidak boleh menyimpan perubahan.' 
              : 'You do not have permission to edit this activity. You can view it, but cannot save changes.'}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="px-6 pt-6 space-y-6">
        {/* Activity Name */}
        <div>
          <label className="block mb-1 font-medium text-sm" style={{ color: theme.textSecondary }}>
            {preferences.language_code === 'ms' ? 'Nama Aktiviti *' : 'Activity Name *'}
          </label>
          <input
            type="text"
            value={formData.activity_name}
            onChange={(e) =>
              setFormData({ ...formData, activity_name: e.target.value })
            }
            className="w-full h-12 px-4 border rounded transition-colors"
            style={{ 
              borderColor: errors.activity_name ? "#FCA5A5" : theme.border,
              backgroundColor: theme.cardBg,
              color: theme.text 
            }}
            disabled={showPermissionError}
          />
          {errors.activity_name && (
            <p className="text-red-500 text-xs mt-1">{errors.activity_name}</p>
          )}
        </div>

        {/* Activity Type */}
        <div>
          <label className="block mb-1 font-medium text-sm" style={{ color: theme.textSecondary }}>
            {preferences.language_code === 'ms' ? 'Jenis Aktiviti *' : 'Activity Type *'}
          </label>
          <select
            value={formData.activity_type}
            onChange={(e) =>
              setFormData({ ...formData, activity_type: e.target.value })
            }
            className="w-full h-12 px-4 border rounded transition-colors"
            style={{ 
              borderColor: errors.activity_type ? "#FCA5A5" : theme.border,
              backgroundColor: theme.cardBg,
              color: theme.text 
            }}
            disabled={showPermissionError}
          >
            <option value="">{preferences.language_code === 'ms' ? 'Pilih jenis' : 'Select type'}</option>
            {activityTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.activity_type && (
            <p className="text-red-500 text-xs mt-1">{errors.activity_type}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-medium text-sm" style={{ color: theme.textSecondary }}>
            {t("date")} *
          </label>
          <input
            type="date"
            value={formData.activity_date}
            onChange={(e) =>
              setFormData({ ...formData, activity_date: e.target.value })
            }
            className="w-full h-12 px-4 border rounded transition-colors"
            style={{ 
              borderColor: errors.date ? "#FCA5A5" : theme.border,
              backgroundColor: theme.cardBg,
              color: theme.text 
            }}
            disabled={showPermissionError}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Duration */}
        <div>
          <label className="block mb-1 font-medium text-sm" style={{ color: theme.textSecondary }}>
            {t("duration")} ({preferences.language_code === 'ms' ? 'jam' : 'hours'}) *
          </label>
          <input
            type="number"
            step="0.25"
            value={formData.duration_hours}
            onChange={(e) =>
              setFormData({ ...formData, duration_hours: e.target.value })
            }
            className="w-full h-12 px-4 border rounded transition-colors"
            style={{ 
              borderColor: errors.duration ? "#FCA5A5" : theme.border,
              backgroundColor: theme.cardBg,
              color: theme.text 
            }}
            disabled={showPermissionError}
          />
          {errors.duration && (
            <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label className="block mb-1 font-medium text-sm" style={{ color: theme.textSecondary }}>
            {preferences.language_code === 'ms' ? 'Catatan' : 'Remarks'}
          </label>
          <textarea
            value={formData.remarks || ""}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
            className="w-full px-4 py-3 border rounded transition-colors"
            style={{ 
              borderColor: theme.border,
              backgroundColor: theme.cardBg,
              color: theme.text 
            }}
            rows={4}
            disabled={showPermissionError}
          />
        </div>

        {/* Staff Section */}
        {userRole === "staff" && (
          <div className="space-y-4">
            <label className="block mb-1 font-medium text-sm" style={{ color: theme.textSecondary }}>Status *</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value, rejection_reason: "" })
              }
              className="w-full h-12 px-4 border rounded transition-colors"
              style={{ 
                borderColor: theme.border,
                backgroundColor: theme.cardBg,
                color: theme.text 
              }}
            >
              <option value="Pending">{t("stat_pending")}</option>
              <option value="Validated">{t("stat_validated")}</option>
              <option value="Rejected">{t("stat_rejected")}</option>
            </select>
            {formData.status === "Rejected" && (
              <div>
                <label className="block mb-1 font-medium text-sm" style={{ color: theme.textSecondary }}>
                  {preferences.language_code === 'ms' ? 'Sebab Penolakan *' : 'Rejection Reason *'}
                </label>
                <textarea
                  value={formData.rejection_reason}
                  onChange={(e) =>
                    setFormData({ ...formData, rejection_reason: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded transition-colors"
                  style={{ 
                    borderColor: errors.rejection_reason ? "#FCA5A5" : theme.border,
                    backgroundColor: theme.cardBg,
                    color: theme.text 
                  }}
                  rows={3}
                />
                {errors.rejection_reason && (
                  <p className="text-red-500 text-xs mt-1">{errors.rejection_reason}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleSave}
            disabled={isSubmitting || showPermissionError}
            className="w-full h-12 text-white rounded font-bold shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: theme.primary, opacity: (isSubmitting || showPermissionError) ? 0.7 : 1 }}
          >
            {isSubmitting ? (preferences.language_code === 'ms' ? "Menyimpan..." : "Saving...") : (preferences.language_code === 'ms' ? "Simpan Perubahan" : "Save Changes")}
          </button>
          
          <button
            onClick={handleCancel}
            className="w-full h-12 border rounded font-medium transition-colors"
            style={{ borderColor: theme.border, color: theme.textSecondary, backgroundColor: theme.cardBg }}
          >
            {t("cancel")}
          </button>
        </div>

        {!showPermissionError && (
          <button
            onClick={async () => {
              const confirmText = preferences.language_code === 'ms' 
                ? "Adakah anda pasti mahu memadamkan aktiviti ini? Ini tidak boleh diundurkan." 
                : "Are you sure you want to delete this activity? This cannot be undone.";
              if (!confirm(confirmText)) return;

              try {
                const { error } = await supabase
                  .from("recorded_activities")
                  .delete()
                  .eq("id", activityId);

                if (error) {
                  setCustomMessage(preferences.language_code === 'ms' ? `Gagal memadam aktiviti: ${error.message}` : `Failed to delete activity: ${error.message}`);
                } else {
                  setCustomMessage(preferences.language_code === 'ms' ? "Aktiviti berjaya dipadamkan!" : "Activity deleted successfully!");
                  setTimeout(() => onNavigate("activity-main"), 1000);
                }
              } catch (err) {
                setCustomMessage(preferences.language_code === 'ms' ? "Ralat tidak dijangka berlaku." : "An unexpected error occurred.");
              }
            }}
            className="w-full h-12 bg-red-600 text-white rounded font-bold shadow-md transition-transform active:scale-95"
          >
            {preferences.language_code === 'ms' ? 'Padam Aktiviti' : 'Delete Activity'}
          </button>
        )}

        {customMessage && (
          <p className="mt-4 text-center text-sm font-medium" style={{ color: theme.textSecondary }}>{customMessage}</p>
        )}
      </div>
    </div>
  );
}