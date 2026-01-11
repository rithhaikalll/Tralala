import { useEffect, useState } from "react";
import { ArrowLeft, UserPlus, UserMinus, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";
import { toast } from "sonner";

export default function EventDetailScreen({ eventId, userId, userRole, onNavigate }: { eventId: string; userId: string; userRole: "student" | "staff"; onNavigate: (screen: string) => void; }) {
  const { theme, t, preferences } = useUserPreferences();
  const [participants, setParticipants] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  // Generic Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => { } });

  const fetchEvent = async () => {
    if (!eventId) return;
    setLoading(true);

    const { data, error } = await supabase.from("activity_events").select("*").eq("id", Number(eventId)).single();

    if (!error) setEvent(data);

    // Fetch participants if staff
    if (userRole === "staff") {
      const { data: regData } = await supabase
        .from("registrations")
        .select("user_id, full_name")
        .eq("event_id", Number(eventId))
      setParticipants(regData || []);
    }

    // Check if student is already registered
    if (userRole === "student") {
      const { data: studentReg } = await supabase
        .from("registrations")
        .select("*")
        .eq("event_id", Number(eventId))
        .eq("user_id", userId)
        .maybeSingle();
      setIsRegistered(!!studentReg);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId, userId, userRole]);

  // Logic functions
  const executeToggleStatus = async () => {
    if (!event) return;
    const newStatus = event.status?.toLowerCase() === "open" ? "closed" : "open";

    const { error } = await supabase
      .from("activity_events")
      .update({ status: newStatus })
      .eq("id", Number(eventId));

    if (!error) {
      setEvent((prev: any) => ({ ...prev, status: newStatus }));
      toast.success(preferences.language_code === 'ms' ? 'Status acara dikemaskini' : 'Event status updated');
    } else {
      toast.error(preferences.language_code === 'ms' ? 'Gagal mengemaskini status' : 'Failed to update status');
    }
  };

  const executeUnregister = async () => {
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("event_id", Number(eventId))
      .eq("user_id", userId);

    if (!error) {
      setIsRegistered(false);
      toast.success(preferences.language_code === 'ms' ? 'Penyertaan dibatalkan' : 'Unregistered successfully');
      await fetchEvent();
    } else {
      toast.error(preferences.language_code === 'ms' ? 'Gagal membatalkan' : 'Failed to unregister');
    }
  };

  const executeRegister = async () => {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error(profileError);
      toast.error("Error fetching profile");
      return;
    }

    const full_name = profileData?.full_name || "Unknown";

    const { error } = await supabase
      .from("registrations")
      .insert([{ event_id: Number(eventId), user_id: userId, full_name }]);

    if (!error) {
      setIsRegistered(true);
      toast.success(preferences.language_code === 'ms' ? 'Berjaya mendaftar' : 'Registered successfully');
      await fetchEvent();
    } else {
      toast.error(preferences.language_code === 'ms' ? 'Gagal mendaftar' : 'Failed to register');
    }
  };

  const toggleEventStatus = () => {
    if (!event) return;
    const newStatus = event.status?.toLowerCase() === "open" ? "closed" : "open";

    setConfirmModal({
      show: true,
      title: preferences.language_code === "ms" ? "Tukar Status?" : "Change Status?",
      message: preferences.language_code === "ms"
        ? `Tukar status acara kepada ${newStatus.toUpperCase()}?`
        : `Change event status to ${newStatus.toUpperCase()}?`,
      onConfirm: executeToggleStatus
    });
  };

  const handleRegister = () => {
    if (!userId || !eventId) return;

    if (userRole === "student" && event.status?.toLowerCase() !== "open") {
      toast.error(
        preferences.language_code === "ms"
          ? "Acara ini tidak dibuka untuk pendaftaran."
          : "This event is not open for registration."
      );
      return;
    }

    if (isRegistered) {
      setConfirmModal({
        show: true,
        title: preferences.language_code === "ms" ? "Batal Penyertaan?" : "Unregister?",
        message: preferences.language_code === "ms"
          ? "Adakah anda pasti mahu membatalkan penyertaan?"
          : "Are you sure you want to unregister from this event?",
        onConfirm: executeUnregister
      });
    } else {
      setConfirmModal({
        show: true,
        title: preferences.language_code === "ms" ? "Daftar Acara?" : "Register Event?",
        message: preferences.language_code === "ms"
          ? "Adakah anda pasti mahu mendaftar untuk acara ini?"
          : "Are you sure you want to register for this event?",
        onConfirm: executeRegister
      });
    }
  };

  if (loading) return <p className="p-6" style={{ color: theme.textSecondary }}>{t("view_all")}...</p>;
  if (!event) return <p className="p-6 text-red-500">{t("no_upcoming")}</p>;

  const DetailRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between items-start border-b py-4 last:border-none" style={{ borderColor: theme.border }}>
      <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>{label}</p>
      <p className="text-sm font-semibold text-right max-w-[60%]" style={{ color: theme.text }}>{value}</p>
    </div>
  );

  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString(preferences.language_code === 'ms' ? 'ms-MY' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    : "-";

  function formatTime(time24: string) {
    if (!time24) return "-";
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12; // midnight or noon
    return `${hour}:${minute} ${ampm}`;
  }

  return (
    <div className="min-h-screen transition-colors duration-300 relative" style={{ backgroundColor: theme.background }}>
      <div className="px-6 py-6 border-b transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("activity-events")}
            className="w-10 h-10 flex items-center justify-center rounded-full transition"
            style={{ backgroundColor: theme.background }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} style={{ color: theme.primary }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: theme.text }}>
            {preferences.language_code === 'ms' ? 'Butiran Acara' : 'Event Details'}
          </h1>
        </div>
      </div>

      <div className="p-6">
        <div
          className="rounded-2xl shadow-sm p-6 space-y-1 border transition-colors"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <DetailRow
            label={preferences.language_code === 'ms' ? 'Nama Acara' : 'Event Title'}
            value={event.title}
          />
          <DetailRow
            label={preferences.language_code === 'ms' ? 'Butiran Acara' : 'Event Description'}
            value={event.description}
          />
          <DetailRow
            label={preferences.language_code === 'ms' ? 'Kategori' : 'Category'}
            value={event.category}
          />
          <DetailRow
            label={preferences.language_code === 'ms' ? 'Lokasi' : 'Location'}
            value={event.location}
          />
          <DetailRow
            label={t("eventDate") || "Event Date"}
            value={formattedDate}
          />
          <DetailRow
            label={preferences.language_code === 'ms' ? 'Masa Mula' : 'Start Time'}
            value={formatTime(event.start_time)}
          />
          <DetailRow
            label={preferences.language_code === 'ms' ? 'Masa Tamat' : 'End Time'}
            value={formatTime(event.end_time)}
          />
          <DetailRow
            label={preferences.language_code === 'ms' ? 'Kapasiti' : 'Capacity'}
            value={`${event.capacity} seats`}
          />
          <DetailRow
            label={preferences.language_code === 'ms' ? 'Perserta Berdafter' : 'Current Participants'}
            value={event.current_participants}
          />

          <DetailRow
            label={preferences.language_code === 'ms' ? 'Dianjurkan oleh' : 'Organized by'}
            value={event.created_by}
          />

          <div className="flex justify-between items-start pt-4">
            <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>{t("status") || "Status"}</p>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor:
                  event.status?.toLowerCase() === "open"
                    ? "#d1fae5"
                    : event.status?.toLowerCase() === "closed"
                      ? "#fef3c7"
                      : event.status?.toLowerCase() === "full"
                        ? "#fee2e2"
                        : "#e5e7eb",
                color:
                  event.status?.toLowerCase() === "open"
                    ? "#065f46"
                    : event.status?.toLowerCase() === "closed"
                      ? "#78350f"
                      : event.status?.toLowerCase() === "full"
                        ? "#991b1b"
                        : "#374151",
                border: `1px solid ${event.status?.toLowerCase() === "open"
                    ? "#10b981"
                    : event.status?.toLowerCase() === "closed"
                      ? "#f59e0b"
                      : event.status?.toLowerCase() === "full"
                        ? "#f87171"
                        : "#9ca3af"
                  }`
              }}
            >
              {event.status?.toLowerCase() === "open"
                ? t("open")
                : event.status?.toLowerCase() === "closed"
                  ? t("closed")
                  : event.status?.toLowerCase() === "full"
                    ? t("full")
                    : t("unknown")}
            </span>
          </div>

          {/* Role-specific */}
          {userRole === "student" && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleRegister}
                disabled={!isRegistered && event.status?.toLowerCase() !== "open"}
                className={`px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2 ${(!isRegistered && event.status?.toLowerCase() !== "open")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
                style={{
                  backgroundColor: isRegistered ? "#6b7280" : theme.primary
                }}
              >
                {isRegistered ? <UserMinus size={18} /> : <UserPlus size={18} />}
                {isRegistered ? t("unregister") : t("register")}
              </button>
            </div>
          )}

          {userRole === "staff" && (
            <div className="mt-6 space-y-6">
              {/* Status toggle button */}
              <div className="flex justify-center">
                <button
                  onClick={toggleEventStatus}
                  className="px-6 py-2 rounded-lg text-sm font-bold text-white transition"
                  style={{
                    backgroundColor:
                      event.status?.toLowerCase() === "open" ? "#dc2626" : "#16a34a"
                  }}
                >
                  {event.status?.toLowerCase() === "open"
                    ? preferences.language_code === "ms"
                      ? "Tutup Pendaftaran"
                      : "Close Registration"
                    : preferences.language_code === "ms"
                      ? "Buka Pendaftaran"
                      : "Open Registration"}
                </button>
              </div>

              {/* Participant list */}
              <div>
                <h2 className="font-bold mb-2">
                  {preferences.language_code === "ms"
                    ? "Senarai Peserta"
                    : "Registered Students"}
                </h2>

                {participants.length === 0 ? (
                  <p className="text-sm opacity-70">
                    {t("no_participants") || "No participants"}
                  </p>
                ) : (
                  <ol className="list-decimal list-inside space-y-1">
                    {participants.map((p) => (
                      <li key={p.user_id}>{p.full_name}</li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => onNavigate("activity-events")}
            className="px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: "#3b82f6" }}
          >
            {t("cancel")}
          </button>
        </div>
      </div>

      {/* Generic Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: theme.cardBg }}
          >
            <h3 className="text-xl font-bold text-center mb-2" style={{ color: theme.text }}>
              {confirmModal.title}
            </h3>

            <p className="text-center mb-8" style={{ color: theme.textSecondary }}>
              {confirmModal.message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                className="flex-1 h-12 rounded-xl font-bold transition-transform active:scale-95"
                style={{ backgroundColor: theme.border, color: theme.text }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, show: false }));
                }}
                className="flex-1 h-12 rounded-xl font-bold text-white transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
                style={{ backgroundColor: theme.primary }}
              >
                {t('confirm') || (preferences.language_code === 'ms' ? "Sahkan" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}