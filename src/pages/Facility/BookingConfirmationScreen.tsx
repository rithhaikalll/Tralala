import { Calendar, Clock, MapPin, Info } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
// 1. Import global preferences context
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface BookingConfirmationScreenProps {
  bookingData: {
    facilityId: string;
    facilityName: string;
    date: string; // label, e.g. "Sun, Nov 16"
    time: string; // label, e.g. "8:00 AM - 9:00 AM"
  };
  onNavigate: (screen: string, data?: any) => void;
}

export function BookingConfirmationScreen({
  bookingData,
  onNavigate,
}: BookingConfirmationScreenProps) {
  // 2. Consume theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  const handleConfirm = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert(isMs ? "Anda mesti log masuk untuk menempah." : "You must be logged in to book.");
      return;
    }

    const referenceCode = "UTM" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const checkInCode = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");

    const { data, error } = await supabase
      .from("facility_bookings")
      .insert({
        facility_id: bookingData.facilityId,
        user_id: user.id,
        date_label: bookingData.date,
        time_label: bookingData.time,
        status: "confirmed",
        reference_code: referenceCode,
        check_in_code: checkInCode,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Booking failed", error);
      alert(isMs ? "Gagal mengesahkan tempahan. Sila cuba lagi." : "Failed to confirm booking. Please try again.");
      return;
    }

    try {
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        booking_id: data.id,
        action_type: "created",
        description: `Booking created for ${bookingData.facilityName} on ${bookingData.date} at ${bookingData.time}`,
        changes: {
          status: { old: "Available", new: "Booked" },
          timeSlot: { old: null, new: bookingData.time },
          date: { old: null, new: bookingData.date },
          facility_name: bookingData.facilityName,
        },
        metadata: {
          device: typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
      });
    } catch (e) {
      console.error("Failed to log activity", e);
    }

    onNavigate("success", {
      ...bookingData,
      referenceCode,
      checkInCode,
    });
  };

  return (
    <div className="h-full transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-6 py-6 border-b transition-colors"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
      >
        <h2 style={{ color: theme.text, fontWeight: 600, fontSize: "20px" }}>
          {isMs ? "Butiran Tempahan" : "Booking Details"}
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-4" style={{ paddingBottom: "120px" }}>
        <div className="space-y-8">
          {/* Booking Summary Card */}
          <div
            className="border p-5 transition-colors shadow-sm"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
            }}
          >
            <h3
              className="mb-5"
              style={{
                color: theme.text,
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              {isMs ? "Ringkasan Tempahan" : "Booking Summary"}
            </h3>

            <div className="space-y-5">
              {/* Facility Name */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: theme.primary }} strokeWidth={1.5} />
                <div>
                  <div className="text-xs mb-1" style={{ color: theme.textSecondary }}>
                    {isMs ? "Fasiliti" : "Facility"}
                  </div>
                  <div style={{ color: theme.text, fontWeight: 500, fontSize: "15px" }}>
                    {bookingData.facilityName}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 mt-0.5 shrink-0" style={{ color: theme.primary }} strokeWidth={1.5} />
                <div>
                  <div className="text-xs mb-1" style={{ color: theme.textSecondary }}>
                    {t("date") || (isMs ? "Tarikh" : "Date")}
                  </div>
                  <div style={{ color: theme.text, fontWeight: 500, fontSize: "15px" }}>
                    {bookingData.date}
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 mt-0.5 shrink-0" style={{ color: theme.primary }} strokeWidth={1.5} />
                <div>
                  <div className="text-xs mb-1" style={{ color: theme.textSecondary }}>
                    {isMs ? "Masa" : "Time"}
                  </div>
                  <div style={{ color: theme.text, fontWeight: 500, fontSize: "15px" }}>
                    {bookingData.time}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div
            className="flex gap-3 p-4 border transition-colors"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: "14px" }}
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: theme.textSecondary }} strokeWidth={1.5} />
            <div>
              <h4 className="mb-1" style={{ color: theme.text, fontWeight: 600, fontSize: "14px" }}>
                {isMs ? "Notis Penting" : "Important Notice"}
              </h4>
              <p className="text-xs" style={{ color: theme.textSecondary, lineHeight: "1.6" }}>
                {isMs 
                  ? "Sila tiba 10 minit sebelum waktu dijadualkan. Ketibaan lewat mungkin menyebabkan pengurangan masa sesi. Pembatalan mestilah dibuat sekurang-kurangnya 2 jam awal."
                  : "Please arrive 10 minutes before your scheduled time. Late arrivals may result in reduced session time. Cancellations must be made at least 2 hours in advance."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Footer Buttons */}
        <div
          className="fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t px-4 py-4 z-50 transition-colors"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate("time-slot")}
              className="flex-1 h-12 flex items-center justify-center border transition-all active:scale-95"
              style={{
                borderColor: theme.border,
                borderRadius: "12px",
                color: theme.textSecondary,
                fontWeight: 600,
                fontSize: "16px",
                backgroundColor: theme.background,
              }}
            >
              {t("cancel") || (isMs ? "Batal" : "Cancel")}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 h-12 flex items-center justify-center transition-all active:scale-95 shadow-lg"
              style={{
                backgroundColor: theme.primary,
                color: "#FFFFFF",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "16px",
              }}
            >
              {isMs ? "Sahkan Tempahan" : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}