import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface CreateEventScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  staffName?: string;
}

export function CreateEventScreen({ onNavigate, staffName }: CreateEventScreenProps) {
  const { theme, t, preferences } = useUserPreferences();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Event",
    location: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    capacity: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = ["Event", "Tournament", "Workshop", "Training", "Competition"];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const isMs = preferences.language_code === 'ms';

    if (!formData.title.trim())
      newErrors.title = isMs ? "Tajuk acara diperlukan" : "Event title is required";

    if (!formData.description.trim())
      newErrors.description = isMs ? "Deskripsi diperlukan" : "Description is required";

    if (!formData.eventDate)
      newErrors.eventDate = isMs ? "Tarikh acara diperlukan" : "Event date is required";
    else {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today)
        newErrors.eventDate = isMs ? "Tarikh acara tidak boleh lewat daripada hari ini" : "Event date cannot be in the past";
    }

    if (!formData.startTime)
      newErrors.startTime = isMs ? "Masa mula diperlukan" : "Start time is required";

    if (!formData.endTime)
      newErrors.endTime = isMs ? "Masa tamat diperlukan" : "End time is required";

    if (formData.startTime && formData.endTime) {
      const [startHour, startMin] = formData.startTime.split(":").map(Number);
      const [endHour, endMin] = formData.endTime.split(":").map(Number);
      if (endHour < startHour || (endHour === startHour && endMin <= startMin))
        newErrors.endTime = isMs ? "Masa tamat mesti selepas masa mula" : "End time must be after start time";
    }

    if (!formData.location.trim())
      newErrors.location = isMs ? "Lokasi diperlukan" : "Location is required";

    if (!formData.capacity)
      newErrors.capacity = isMs ? "Kapasiti diperlukan" : "Capacity is required";
    else if (parseInt(formData.capacity) < 1)
      newErrors.capacity = isMs ? "Kapasiti mestilah sekurang-kurangnya 1" : "Capacity must be at least 1";

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
    setErrorMessage("");

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        setNetworkError(true);
        setErrorMessage(sessionError?.message || "No active session");
        setIsSubmitting(false);
        return;
      }

      const newEvent = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        event_date: formData.eventDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        capacity: parseInt(formData.capacity),
        created_at: new Date().toISOString(),
        created_by: staffName,
        status: "open",
      };

      const { error } = await supabase.from("activity_events").insert([newEvent]);

      if (error) {
        console.error("Error creating event:", error);
        setNetworkError(true);
        setErrorMessage(error.message || "Unknown error occurred");
        setIsSubmitting(false);
        return;
      }

      setShowSuccess(true);
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setNetworkError(true);
      setErrorMessage(err.message || "Unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b px-6 py-6 transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("staff-validation")} style={{ color: theme.primary }}>
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1 style={{ color: theme.text, fontWeight: 600, fontSize: 20 }}>
            {preferences.language_code === 'ms' ? 'Cipta Acara Baharu' : 'Create New Event'}
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
        {/* Event Title */}
        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
            {preferences.language_code === 'ms' ? 'Tajuk Acara *' : 'Event Title *'}
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={preferences.language_code === 'ms' ? 'Masukkan tajuk acara' : 'Enter event title'}
            className="w-full h-12 px-4 border rounded-lg transition-colors"
            style={{ borderColor: errors.title ? "#FCA5A5" : theme.border, color: theme.text, backgroundColor: theme.cardBg }}
          />
          {errors.title && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
            {preferences.language_code === 'ms' ? 'Kategori' : 'Category'}
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-12 px-4 border rounded-lg transition-colors"
            style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.cardBg }}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
            {preferences.language_code === 'ms' ? 'Deskripsi *' : 'Description *'}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder={preferences.language_code === 'ms' ? 'Berikan deskripsi acara...' : 'Provide event description...'}
            className="w-full px-4 py-3 border rounded-lg transition-colors resize-none"
            style={{ borderColor: errors.description ? "#FCA5A5" : theme.border, color: theme.text, backgroundColor: theme.cardBg }}
          />
          {errors.description && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.description}</p>}
        </div>

        {/* Event Date */}
        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
            {preferences.language_code === 'ms' ? 'Tarikh Acara *' : 'Event Date *'}
          </label>
          <input
            type="date"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            min={today}
            className="w-full h-12 px-4 border rounded-lg transition-colors"
            style={{ borderColor: errors.eventDate ? "#FCA5A5" : theme.border, color: theme.text, backgroundColor: theme.cardBg }}
          />
          {errors.eventDate && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.eventDate}</p>}
        </div>

        {/* Start/End Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
              {preferences.language_code === 'ms' ? 'Masa Mula *' : 'Start Time *'}
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full h-12 px-4 border rounded-lg transition-colors"
              style={{ borderColor: errors.startTime ? "#FCA5A5" : theme.border, color: theme.text, backgroundColor: theme.cardBg }}
            />
            {errors.startTime && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.startTime}</p>}
          </div>
          <div>
            <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
              {preferences.language_code === 'ms' ? 'Masa Tamat *' : 'End Time *'}
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full h-12 px-4 border rounded-lg transition-colors"
              style={{ borderColor: errors.endTime ? "#FCA5A5" : theme.border, color: theme.text, backgroundColor: theme.cardBg }}
            />
            {errors.endTime && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.endTime}</p>}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
            {preferences.language_code === 'ms' ? 'Lokasi *' : 'Location *'}
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full h-12 px-4 border rounded-lg transition-colors"
            style={{ borderColor: errors.location ? "#FCA5A5" : theme.border, color: theme.text, backgroundColor: theme.cardBg }}
          />
          {errors.location && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.location}</p>}
        </div>

        {/* Capacity */}
        <div>
          <label className="block mb-2" style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
            {preferences.language_code === 'ms' ? 'Kapasiti Maksimum *' : 'Maximum Capacity *'}
          </label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            min={1}
            className="w-full h-12 px-4 border rounded-lg transition-colors"
            style={{ borderColor: errors.capacity ? "#FCA5A5" : theme.border, color: theme.text, backgroundColor: theme.cardBg }}
          />
          {errors.capacity && <p className="mt-1" style={{ color: "#ef4444", fontSize: 13 }}>{errors.capacity}</p>}
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 mt-8 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12 transition-all active:scale-95 shadow-md"
          style={{ backgroundColor: theme.primary, color: "#FFFFFF", borderRadius: 12, fontWeight: 700, fontSize: 16, opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? (preferences.language_code === 'ms' ? "Mencipta..." : "Creating...") : (preferences.language_code === 'ms' ? "Cipta Acara" : "Create Event")}
        </button>
        <button
          onClick={() => onNavigate("staff-validation")}
          className="w-full h-12 border transition-all active:scale-95"
          style={{ borderColor: theme.border, color: theme.textSecondary, borderRadius: 12, fontWeight: 600, fontSize: 16, backgroundColor: theme.cardBg }}
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
              {preferences.language_code === 'ms' ? 'Acara berjaya dicipta!' : 'Event created successfully!'}
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                onNavigate("staff-validation");
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
                {preferences.language_code === 'ms' ? 'Ralat' : 'Error'}
              </h2>
            </div>
            <p className="mb-8" style={{ color: theme.textSecondary }}>
              {errorMessage || (preferences.language_code === 'ms' ? 'Sila periksa sambungan anda dan cuba lagi.' : 'Please check your connection and try again.')}
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
