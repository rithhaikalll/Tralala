import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
// Accessing global preferences
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface RecordActivityScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  userRole: "student" | "staff";
  studentId?: string;
  studentName: string;
}

export function RecordActivityScreen({ onNavigate, userRole, studentId, studentName }: RecordActivityScreenProps) {
  // Consume theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  
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
    "Badminton", "Futsal", "Volleyball", "Ping Pong", "Gym",
    "Basketball", "Running", "Swimming", "Other",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const isMs = preferences.language_code === 'ms';

    if (!formData.studentName.trim() && userRole === "staff")
      newErrors.studentName = isMs ? "Nama pelajar diperlukan" : "Student name is required";

    if (!formData.activityName.trim())
      newErrors.activityName = isMs ? "Nama aktiviti diperlukan" : "Activity name is required";
    else if (formData.activityName.length > 100)
      newErrors.activityName = isMs ? "Nama aktiviti mestilah kurang dari 100 aksara" : "Activity name must be less than 100 characters";

    if (!formData.activityType) 
      newErrors.activityType = isMs ? "Sila pilih jenis aktiviti" : "Please select an activity type";

    if (!formData.date) newErrors.date = isMs ? "Tarikh diperlukan" : "Date is required";
    else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today)
        newErrors.date = isMs ? "Tidak boleh merekod aktiviti untuk tarikh masa hadapan" : "Cannot record activities for future dates";

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      ninetyDaysAgo.setHours(0, 0, 0, 0);

      if (selectedDate < ninetyDaysAgo)
        newErrors.date = isMs ? "Tidak boleh merekod aktiviti lebih dari 90 hari" : "Cannot record activities older than 90 days";
    }

    if (!formData.duration.trim()) newErrors.duration = isMs ? "Tempoh diperlukan" : "Duration is required";
    else {
      const duration = parseFloat(formData.duration);
      if (isNaN(duration)) newErrors.duration = isMs ? "Tempoh mestilah nombor yang sah" : "Duration must be a valid number";
      else if (duration <= 0) newErrors.duration = isMs ? "Tempoh mestilah lebih dari 0" : "Duration must be greater than 0";
      else if (duration > 24) newErrors.duration = isMs ? "Tempoh tidak boleh melebihi 24 jam" : "Duration cannot exceed 24 hours";
      else if (duration < 0.25)
        newErrors.duration = isMs ? "Tempoh minimum ialah 0.25 jam (15 minit)" : "Minimum duration is 0.25 hours (15 minutes)";
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        setNetworkError(true);
        setIsSubmitting(false);
        return;
      }

      const userIdFromSession = session.user.id;
      const studentIdToUse = userRole === "student" ? userIdFromSession : studentId;

      const newActivity = {
        activity_name: formData.activityName,
        activity_type: formData.activityType,
        date: formData.date,
        duration: parseFloat(formData.duration),
        remark: formData.remarks,
        student_id: studentIdToUse,
        recorded_by: studentName,
        role: userRole,
        status: "Pending",
        recorded_date: new Date().toISOString(),
      };

      const { error } = await supabase.from("recorded_activities").insert([newActivity]);

      if (error) {
        setNetworkError(true);
        setIsSubmitting(false);
        return;
      }

      setShowSuccess(true);
    } catch (err) {
      setNetworkError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b px-6 py-6 transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("activity-main")} style={{ color: theme.primary }}>
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1 style={{ color: theme.text, fontWeight: 600, fontSize: 20 }}>
            {preferences.language_code === 'ms' ? 'Rekod Aktiviti Baharu' : 'Record New Activity'}
          </h1>
        </div>
      </div>

      {/* Error Message */}
      {showError && Object.keys(errors).length > 0 && (
        <div className="mx-6 mt-6 p-4 border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FCA5A5", borderRadius: 8 }}>
          <p style={{ color: "#991B1B", fontSize: 14, fontWeight: 500 }}>
            {preferences.language_code === 'ms' ? 'Sila lengkapkan semua medan yang diperlukan' : 'Please complete all required fields'}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="px-6 pt-6 space-y-6">
        {userRole === "staff" && (
          <div>
            <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
              {preferences.language_code === 'ms' ? 'Nama Pelajar *' : 'Student Name *'}
            </label>
            <input
              type="text"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              placeholder={preferences.language_code === 'ms' ? 'Masukkan nama pelajar' : 'Enter student name'}
              className="w-full h-12 px-4 border rounded-lg transition-colors"
              style={{ 
                borderColor: errors.studentName ? "#FCA5A5" : theme.border, 
                fontSize: 15, 
                color: theme.text,
                backgroundColor: theme.cardBg 
              }}
            />
            {errors.studentName && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.studentName}</p>}
          </div>
        )}

        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
            {preferences.language_code === 'ms' ? 'Nama Aktiviti *' : 'Activity Name *'}
          </label>
          <input
            type="text"
            value={formData.activityName}
            onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
            placeholder={preferences.language_code === 'ms' ? 'Masukkan nama aktiviti' : 'Enter activity name'}
            className="w-full h-12 px-4 border rounded-lg transition-colors"
            style={{ 
              borderColor: errors.activityName ? "#FCA5A5" : theme.border, 
              fontSize: 15, 
              color: theme.text,
              backgroundColor: theme.cardBg 
            }}
          />
          {errors.activityName && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.activityName}</p>}
        </div>

        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
            {preferences.language_code === 'ms' ? 'Jenis Aktiviti *' : 'Activity Type *'}
          </label>
          <select
            value={formData.activityType}
            onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
            className="w-full h-12 px-4 border rounded-lg transition-colors"
            style={{ 
              borderColor: errors.activityType ? "#FCA5A5" : theme.border, 
              fontSize: 15, 
              color: formData.activityType ? theme.text : theme.textSecondary,
              backgroundColor: theme.cardBg 
            }}
          >
            <option value="">{preferences.language_code === 'ms' ? 'Pilih jenis aktiviti' : 'Select activity type'}</option>
            {activityTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.activityType && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.activityType}</p>}
        </div>

        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>{t("date")} *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full h-12 px-4 border rounded-lg transition-colors"
            style={{ 
              borderColor: errors.date ? "#FCA5A5" : theme.border, 
              fontSize: 15, 
              color: theme.text,
              backgroundColor: theme.cardBg 
            }}
          />
          {errors.date && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.date}</p>}
        </div>

        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
            {t("duration")} ({preferences.language_code === 'ms' ? 'jam' : 'hours'}) *
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g., 1.5"
            className="w-full h-12 px-4 border rounded-lg transition-colors"
            style={{ 
              borderColor: errors.duration ? "#FCA5A5" : theme.border, 
              fontSize: 15, 
              color: theme.text,
              backgroundColor: theme.cardBg 
            }}
          />
          {errors.duration && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.duration}</p>}
        </div>

        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
            {preferences.language_code === 'ms' ? 'Catatan (Pilihan)' : 'Remarks (Optional)'}
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder={preferences.language_code === 'ms' ? 'Tambah nota tambahan...' : 'Add any additional notes...'}
            rows={4}
            className="w-full px-4 py-3 border rounded-lg transition-colors"
            style={{ 
              borderColor: theme.border, 
              fontSize: 15, 
              color: theme.text, 
              backgroundColor: theme.cardBg,
              resize: "none" 
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 mt-8 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12 transition-all active:scale-95 shadow-md"
          style={{ 
            backgroundColor: theme.primary, 
            color: "#FFFFFF", 
            borderRadius: 12, 
            fontWeight: 700, 
            fontSize: 16,
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? 
            (preferences.language_code === 'ms' ? "Menghantar..." : "Submitting...") : 
            (preferences.language_code === 'ms' ? "Hantar Aktiviti" : "Submit Activity")
          }
        </button>
        <button
          onClick={() => onNavigate("activity-main")}
          className="w-full h-12 border transition-all active:scale-95"
          style={{ 
            borderColor: theme.border, 
            color: theme.textSecondary, 
            borderRadius: 12, 
            fontWeight: 600, 
            fontSize: 16, 
            backgroundColor: theme.cardBg 
          }}
        >
          {t("cancel")}
        </button>
      </div>

      {/* Success Dialog */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <div className="rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center" style={{ backgroundColor: theme.cardBg }}>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
              {preferences.language_code === 'ms' ? 'Berjaya' : 'Success'}
            </h2>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              {preferences.language_code === 'ms' ? 'Aktiviti berjaya direkodkan!' : 'Activity recorded successfully!'}
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                onNavigate("activity-main");
              }}
              className="w-full h-12 shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: theme.primary, color: "#FFFFFF", borderRadius: 12, fontWeight: 700 }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Network Error Dialog */}
      {networkError && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="rounded-2xl p-8 max-w-sm w-full shadow-2xl" style={{ backgroundColor: theme.cardBg }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                {preferences.language_code === 'ms' ? 'Ralat Rangkaian' : 'Network Error'}
              </h2>
            </div>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              {preferences.language_code === 'ms' ? 'Sila periksa sambungan anda dan cuba lagi.' : 'Please check your connection and try again.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setNetworkError(false)}
                className="flex-1 h-12 border font-bold"
                style={{ borderColor: theme.border, color: theme.textSecondary, borderRadius: 12, backgroundColor: theme.background }}
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 h-12 text-white font-bold shadow-lg"
                style={{ backgroundColor: theme.primary, borderRadius: 12 }}
              >
                {preferences.language_code === 'ms' ? 'Cuba Lagi' : 'Retry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}