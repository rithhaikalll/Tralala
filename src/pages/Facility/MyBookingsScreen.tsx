import { Calendar, Clock, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
// 1. Import global preferences context
import { useUserPreferences } from "../../lib/UserPreferencesContext";

export function MyBookingsScreenHeader({ onBack }: { onBack: () => void }) {
  // 2. Consume theme context for Header
  const { theme, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b transition-colors duration-300"
      style={{ backgroundColor: theme.cardBg, borderColor: theme.border, transform: "none" }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} style={{ color: theme.primary }}>
          <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <h2 style={{ color: theme.text, fontWeight: 600, fontSize: "20px" }}>
          {isMs ? "Tempahan Saya" : "My Bookings"}
        </h2>
      </div>
    </div>
  );
}

type BookingRow = {
  id: string;
  date_label: string;
  time_label: string;
  status: string;
  reference_code: string | null;
  checkInCode: string | null;
  facilities: {
    name: string;
    location: string | null;
  } | null;
};

// Helper function to parse booking date/time remains the same
function parseBookingDateTime(dateLabel: string, timeLabel: string): number {
  try {
    const cleaned = dateLabel.replace(",", "");
    const parts = cleaned.split(" ");
    if (parts.length < 3) return Number.MAX_SAFE_INTEGER;
    const [, month, day] = parts;
    const year = new Date().getFullYear();
    const startTime = timeLabel.split("-")[0].trim();
    const dt = new Date(`${month} ${day} ${year} ${startTime}`);
    const ts = dt.getTime();
    return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

export function MyBookingsScreen() {
  // 3. Consume context for dynamic styles and language
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setBookings([]); setLoading(false); return; }

      const { data, error } = await supabase
        .from("facility_bookings")
        .select(`id, date_label, time_label, status, reference_code, check_in_code, facilities ( name, location )`)
        .eq("user_id", user.id);

      if (!error && data) {
        const mapped: BookingRow[] = data.map((row: any) => ({
          id: row.id,
          date_label: row.date_label,
          time_label: row.time_label,
          status: row.status,
          reference_code: row.reference_code,
          checkInCode: row.check_in_code,
          facilities: row.facilities
        }));

        const now = Date.now();
        const active = mapped.filter((b) => {
          const s = b.status?.toLowerCase();
          if (s === "cancelled" || s === "completed") return false;
          return parseBookingDateTime(b.date_label, b.time_label) >= now;
        }).sort((a, b) => parseBookingDateTime(a.date_label, a.time_label) - parseBookingDateTime(b.date_label, b.time_label));

        setBookings(active);
      }
      setLoading(false);
    };
    load();
  }, []);

  const confirmCancel = async () => {
    if (!selectedBookingId) return;
    const { error } = await supabase.from("facility_bookings").update({ status: "cancelled" }).eq("id", selectedBookingId);
    if (!error) {
      setBookings((prev) => prev.filter((b) => b.id !== selectedBookingId));
    }
    setShowCancelDialog(false);
  };

  return (
    <div className="h-full transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <div className="px-6 pt-6 pb-24 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin mr-2" style={{ color: theme.primary }} />
            <p className="text-sm" style={{ color: theme.textSecondary }}>{t("view_all")}...</p>
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <p className="text-sm text-center py-10" style={{ color: theme.textSecondary }}>
            {isMs ? "Anda tidak mempunyai tempahan akan datang." : "You have no upcoming bookings."}
          </p>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusLower = booking.status.toLowerCase();
            const isCancelled = statusLower === "cancelled";

            return (
              <div
                key={booking.id}
                className="border p-4 transition-colors shadow-sm"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: "14px" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 style={{ color: theme.text, fontWeight: 600, fontSize: "16px" }}>
                      {booking.facilities?.name || "Facility"}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={14} style={{ color: theme.textSecondary }} />
                      <span className="text-xs" style={{ color: theme.textSecondary }}>
                        {booking.facilities?.location || "Campus Facility"}
                      </span>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 text-[10px] font-bold uppercase rounded-full"
                    style={{
                      backgroundColor: theme.primary + '15',
                      color: theme.primary,
                      border: `1px solid ${theme.primary}30`
                    }}
                  >
                    {isMs ? "Disahkan" : "Confirmed"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: theme.text }}>
                    <Calendar size={14} style={{ color: theme.primary }} />
                    <span>{booking.date_label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: theme.text }}>
                    <Clock size={14} style={{ color: theme.primary }} />
                    <span>{booking.time_label}</span>
                  </div>
                </div>

                {/* Big Check-In Code Section */}
                {booking.checkInCode && (
                  <div className="mt-2 pt-3 border-t text-center" style={{ borderColor: theme.border }}>
                    <p className="text-[10px] mb-2 uppercase font-bold tracking-widest" style={{ color: theme.textSecondary }}>
                      {isMs ? "Kod Daftar Masuk" : "Check-In Code"}
                    </p>
                    <div className="inline-block px-8 py-3 border border-dashed" style={{ borderRadius: "16px", borderColor: theme.primary, backgroundColor: theme.primary + '08' }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: "6px", fontSize: "24px", color: theme.primary }}>
                        {booking.checkInCode}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setSelectedBookingId(booking.id); setShowCancelDialog(true); }}
                  className="w-full h-11 mt-4 rounded-xl border font-bold text-sm transition-all active:scale-95"
                  style={{ borderColor: theme.primary, color: theme.primary }}
                >
                  {isMs ? "Batalkan Tempahan" : "Cancel Booking"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="w-full max-w-sm p-6 shadow-2xl transition-colors" style={{ backgroundColor: theme.cardBg, borderRadius: "24px" }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>
              {isMs ? "Batalkan Tempahan?" : "Cancel Booking?"}
            </h3>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary, lineHeight: "1.6" }}>
              {isMs 
                ? "Adakah anda pasti mahu membatalkan tempahan ini? Tindakan ini tidak boleh diundurkan." 
                : "Are you sure you want to cancel this booking? This action cannot be undone."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 h-12 border font-bold rounded-xl"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                {isMs ? "Kekalkan" : "Keep It"}
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 h-12 text-white font-bold rounded-xl shadow-lg"
                style={{ backgroundColor: theme.primary }}
              >
                {isMs ? "Ya, Batal" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}