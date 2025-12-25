import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react";
// 1. Import global preferences context
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface SuccessScreenProps {
  bookingData: {
    facilityName: string;
    date: string;
    time: string;
    referenceCode: string;
    checkInCode: string; // 6-digit code
  };
  onNavigate: (screen: string) => void;
}

export function SuccessScreen({ bookingData, onNavigate }: SuccessScreenProps) {
  // 2. Consume theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  return (
    <div className="h-full transition-colors duration-300 flex flex-col" style={{ backgroundColor: theme.background }}>
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Success Icon */}
        <div className="mb-8 scale-110">
          <CheckCircle
            className="w-20 h-20"
            style={{ color: theme.primary }}
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h1
          className="mb-3 text-center"
          style={{ color: theme.text, fontWeight: "700", fontSize: "24px" }}
        >
          {isMs ? "Tempahan Disahkan" : "Booking Confirmed"}
        </h1>

        {/* Reference + Check-In Code Section */}
        <div className="mb-8 text-center w-full max-w-xs">
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: theme.textSecondary }}>
            {isMs ? "ID Rujukan" : "Reference ID"}
          </p>
          <p
            className="text-sm font-mono"
            style={{
              color: theme.text,
              fontWeight: "600",
              letterSpacing: "0.5px",
            }}
          >
            {bookingData.referenceCode}
          </p>

          <p className="text-[10px] uppercase font-bold tracking-widest mt-6 mb-2" style={{ color: theme.textSecondary }}>
            {isMs ? "Kod Daftar Masuk" : "Check-In Code"}
          </p>
          <div className="flex justify-center">
            <div
              className="px-8 py-4 border border-dashed transition-colors"
              style={{
                borderRadius: "20px",
                borderColor: theme.primary,
                backgroundColor: theme.primary + '08', // 8% opacity of primary color
              }}
            >
              <span
                style={{
                  color: theme.primary,
                  fontWeight: 800,
                  fontSize: "28px",
                  letterSpacing: "8px",
                  fontFamily: "monospace",
                }}
              >
                {bookingData.checkInCode}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Details Card */}
        <div
          className="w-full border p-5 mb-8 transition-colors shadow-sm"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            borderRadius: "18px",
          }}
        >
          <div className="space-y-5">
            {/* Facility */}
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: theme.primary + '10' }}>
                <MapPin className="w-5 h-5 shrink-0" style={{ color: theme.primary }} strokeWidth={2} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold" style={{ color: theme.textSecondary }}>
                  {isMs ? "Fasiliti" : "Facility"}
                </div>
                <div style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
                  {bookingData.facilityName}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: theme.primary + '10' }}>
                <Calendar className="w-5 h-5 shrink-0" style={{ color: theme.primary }} strokeWidth={2} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold" style={{ color: theme.textSecondary }}>
                  {t("date") || (isMs ? "Tarikh" : "Date")}
                </div>
                <div style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
                  {bookingData.date}
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: theme.primary + '10' }}>
                <Clock className="w-5 h-5 shrink-0" style={{ color: theme.primary }} strokeWidth={2} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold" style={{ color: theme.textSecondary }}>
                  {isMs ? "Masa" : "Time"}
                </div>
                <div style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
                  {bookingData.time}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p
          className="text-xs text-center mb-10"
          style={{ color: theme.textSecondary, lineHeight: "1.7", maxWidth: "280px" }}
        >
          {isMs 
            ? "Emel pengesahan telah dihantar. Sila tunjukkan kod rujukan dan kod daftar masuk anda di fasiliti nanti."
            : "A confirmation email has been sent. Please show your reference ID and check-in code at the facility."}
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pb-6">
          <button
            onClick={() => onNavigate("my-bookings")}
            className="w-full h-12 flex items-center justify-center transition-all active:scale-95 shadow-lg"
            style={{
              backgroundColor: theme.primary,
              color: "#FFFFFF",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "16px",
            }}
          >
            {isMs ? "Lihat Tempahan Saya" : "View My Bookings"}
          </button>

          <button
            onClick={() => onNavigate("home")}
            className="w-full h-12 border flex items-center justify-center transition-all active:scale-95"
            style={{
              borderColor: theme.border,
              borderRadius: "12px",
              color: theme.text,
              fontWeight: "600",
              fontSize: "16px",
              backgroundColor: theme.cardBg,
            }}
          >
            {isMs ? "Kembali ke Utama" : "Back to Home"}
          </button>
        </div>
      </div>
    </div>
  );
}