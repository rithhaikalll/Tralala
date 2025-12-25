import { Calendar, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
// 1. Import global preferences context
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface TimeSlotSelectionScreenProps {
  facilityId: string;
  onNavigate: (screen: string, data?: any) => void;
}

type TimeSlot = {
  id: string;
  label: string; // "8:00 AM - 9:00 AM"
};

// Build dynamic date labels based on language
const buildDates = (languageCode: string): string[] => {
  const today = new Date();
  const locale = languageCode === 'ms' ? 'ms-MY' : 'en-US';

  const format = (d: Date) =>
    d.toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return format(d);
  });
};

const TIME_SLOTS: TimeSlot[] = [
  { id: "1", label: "8:00 AM - 9:00 AM" },
  { id: "2", label: "9:00 AM - 10:00 AM" },
  { id: "3", label: "10:00 AM - 11:00 AM" },
  { id: "4", label: "11:00 AM - 12:00 PM" },
  { id: "5", label: "12:00 PM - 1:00 PM" },
  { id: "6", label: "1:00 PM - 2:00 PM" },
  { id: "7", label: "2:00 PM - 3:00 PM" },
  { id: "8", label: "3:00 PM - 4:00 PM" },
  { id: "9", label: "4:00 PM - 5:00 PM" },
];

export function TimeSlotSelectionScreen({
  facilityId,
  onNavigate,
}: TimeSlotSelectionScreenProps) {
  // 2. Consume context for dynamic styles and language
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  const dates = useMemo(() => buildDates(preferences.language_code), [preferences.language_code]);

  const [selectedDate, setSelectedDate] = useState<string>(dates[0]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookedSlotLabels, setBookedSlotLabels] = useState<Set<string>>(() => new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [facilityName, setFacilityName] = useState<string>("Facility");

  // Load facility name
  useEffect(() => {
    const fetchFacility = async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("name")
        .eq("id", facilityId)
        .maybeSingle();

      if (!error && data?.name) {
        setFacilityName(data.name as string);
      }
    };
    if (facilityId) fetchFacility();
  }, [facilityId]);

  // Load bookings for this facility + date
  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingSlots(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("facility_bookings")
        .select("time_label, status")
        .eq("facility_id", facilityId)
        .eq("date_label", selectedDate)
        .neq("status", "cancelled");

      if (error) {
        setErrorMsg(isMs ? "Gagal memuatkan slot masa." : "Failed to load time slots.");
        setBookedSlotLabels(new Set());
      } else {
        const taken = new Set<string>();
        (data || []).forEach((row: any) => {
          if (row.time_label && (row.status === "confirmed" || row.status === "checked_in")) {
            taken.add(row.time_label as string);
          }
        });
        setBookedSlotLabels(taken);
      }
      setLoadingSlots(false);
    };

    fetchBookings();
  }, [facilityId, selectedDate, isMs]);

  const handleConfirm = () => {
    if (!selectedSlotId) return;
    const slot = TIME_SLOTS.find((s) => s.id === selectedSlotId);
    if (!slot) return;

    onNavigate("booking-confirmation", {
      facilityId,
      facilityName,
      date: selectedDate,
      time: slot.label,
    });
  };

  return (
    <div className="h-full transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <div className="h-5" />

      <div
        className="px-6 py-2 space-y-8"
        style={{ paddingBottom: "120px" }}
      >
        {/* Date Selector */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" style={{ color: theme.primary }} strokeWidth={2} />
            <h3 style={{ color: theme.text, fontWeight: 600, fontSize: "16px" }}>
              {isMs ? "Pilih Tarikh" : "Select Date"}
            </h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedSlotId(null);
                }}
                className="shrink-0 px-4 py-3 border transition-all"
                style={{
                  borderColor: selectedDate === date ? theme.primary : theme.border,
                  backgroundColor: selectedDate === date ? theme.primary + '10' : theme.cardBg,
                  borderWidth: selectedDate === date ? "2px" : "1px",
                  borderRadius: "14px",
                  color: selectedDate === date ? theme.primary : theme.textSecondary,
                  fontWeight: selectedDate === date ? "700" : "500",
                  minWidth: "120px",
                }}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <h3 className="mb-4" style={{ color: theme.text, fontWeight: 600, fontSize: "16px" }}>
            {isMs ? "Slot Masa Tersedia" : "Available Time Slots"}
          </h3>

          {loadingSlots && (
            <div className="flex items-center py-4">
              <Loader2 className="animate-spin mr-2" style={{ color: theme.primary }} size={20} />
              <p className="text-sm" style={{ color: theme.textSecondary }}>{t("view_all")}...</p>
            </div>
          )}

          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

          <div className="space-y-3">
            {TIME_SLOTS.map((slot) => {
              const isBooked = bookedSlotLabels.has(slot.label);
              const isSelected = selectedSlotId === slot.id;

              return (
                <button
                  key={slot.id}
                  onClick={() => !isBooked && setSelectedSlotId(slot.id)}
                  disabled={isBooked}
                  className="w-full p-4 border flex items-center justify-between transition-all disabled:opacity-40 active:scale-[0.98]"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: isSelected ? theme.primary : theme.border,
                    borderWidth: isSelected ? "2px" : "1px",
                    borderRadius: "16px",
                  }}
                >
                  <span style={{
                    color: isBooked ? theme.textSecondary : isSelected ? theme.primary : theme.text,
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: "15px",
                  }}>
                    {slot.label}
                  </span>
                  <span
                    className="px-3 py-1 border text-[10px] font-bold uppercase"
                    style={{
                      borderColor: theme.border,
                      borderRadius: "10px",
                      color: isBooked ? theme.textSecondary : theme.primary,
                      backgroundColor: isBooked ? theme.background : theme.primary + '10',
                    }}
                  >
                    {isBooked ? (isMs ? "Ditempah" : "Booked") : (isMs ? "Kosong" : "Available")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Footer Button */}
      <div
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t px-6 py-4 z-50 transition-colors"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
      >
        <button
          onClick={handleConfirm}
          disabled={!selectedSlotId}
          className="w-full h-12 flex items-center justify-center transition-all active:scale-95 shadow-lg disabled:opacity-50"
          style={{
            backgroundColor: theme.primary,
            color: "#FFFFFF",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          {isMs ? "Teruskan Tempahan" : "Continue to Booking"}
        </button>
      </div>
    </div>
  );
}