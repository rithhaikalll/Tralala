// src/pages/TimeSlotSelectionScreen.tsx
import { Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface TimeSlotSelectionScreenProps {
  facilityId: string;
  onNavigate: (screen: string, data?: any) => void;
}

type TimeSlot = {
  id: string;
  label: string; // "8:00 AM - 9:00 AM"
};

// 🔹 Build dynamic date labels: today, +1 day, +2 days
const buildDates = (): string[] => {
  const today = new Date();

  const format = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short", // Sun, Mon, Tue
      month: "short", // Nov
      day: "numeric", // 16
    });

  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return format(d); // e.g. "Sun, Nov 16"
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
  // 🔹 Generate dates once per mount
  const dates = useMemo(() => buildDates(), []);

  const [selectedDate, setSelectedDate] = useState<string>(dates[0]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookedSlotLabels, setBookedSlotLabels] = useState<Set<string>>(
    () => new Set()
  );
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ Facility name from DB
  const [facilityName, setFacilityName] = useState<string>("Facility");

  // Load facility name for this facilityId
  useEffect(() => {
    const fetchFacility = async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("name")
        .eq("id", facilityId)
        .maybeSingle();

      if (!error && data?.name) {
        setFacilityName(data.name as string);
      } else {
        console.error("Failed to load facility name", error);
      }
    };

    if (facilityId) {
      fetchFacility();
    }
  }, [facilityId]);

  // Load bookings for this facility + date (for ALL users)
  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingSlots(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("facility_bookings")
        .select("time_label, status")
        .eq("facility_id", facilityId)
        .eq("date_label", selectedDate)
        .neq("status", "cancelled"); // ignore cancelled bookings

      if (error) {
        console.error("Error loading bookings", error);
        setErrorMsg("Failed to load time slots.");
        setBookedSlotLabels(new Set());
      } else {
        const taken = new Set<string>();
        (data || []).forEach((row: any) => {
          if (row.time_label && row.status === "confirmed") {
            taken.add(row.time_label as string);
          }
        });
        setBookedSlotLabels(taken);
      }

      setLoadingSlots(false);
    };

    fetchBookings();
  }, [facilityId, selectedDate]);

  const handleConfirm = () => {
    if (!selectedSlotId) return;
    const slot = TIME_SLOTS.find((s) => s.id === selectedSlotId);
    if (!slot) return;

    onNavigate("booking-confirmation", {
      facilityId,
      facilityName, // ✅ real name from DB
      date: selectedDate, // label, e.g. "Sun, Nov 16"
      time: slot.label, // label, e.g. "8:00 AM - 9:00 AM"
    });
  };

  return (
    <div className="h-full bg-white">
      {/* spacer reserved by app-level header */}
      <div className="h-5" />

      {/* Content */}
      <div
        className="px-6 py-2 space-y-8"
        style={{
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px) + 80px)",
        }}
      >
        {/* Date Selector */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar
              className="w-5 h-5"
              style={{ color: "#7A0019" }}
              strokeWidth={1.5}
            />
            <h3
              style={{
                color: "#1A1A1A",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              Select Date
            </h3>
          </div>
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedSlotId(null);
                }}
                className="shrink-0 px-4 py-3 border bg-white"
                style={{
                  borderColor: selectedDate === date ? "#7A0019" : "#E5E5E5",
                  borderWidth: selectedDate === date ? "2px" : "1px",
                  borderRadius: "14px",
                  color: selectedDate === date ? "#7A0019" : "#555555",
                  fontWeight: selectedDate === date ? "500" : "400",
                  fontSize: "14px",
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
          <h3
            className="mb-4"
            style={{ color: "#1A1A1A", fontWeight: 600, fontSize: "16px" }}
          >
            Available Time Slots
          </h3>

          {loadingSlots && (
            <p className="text-sm" style={{ color: "#888888" }}>
              Loading time slots…
            </p>
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
                  className="w-full p-4 border bg-white flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    borderColor: isSelected ? "#7A0019" : "#E5E5E5",
                    borderWidth: isSelected ? "2px" : "1px",
                    borderRadius: "14px",
                    boxShadow: isSelected
                      ? "0 1px 3px rgba(0, 0, 0, 0.04)"
                      : "none",
                  }}
                >
                  <span
                    style={{
                      color: isBooked
                        ? "#888888"
                        : isSelected
                        ? "#7A0019"
                        : "#1A1A1A",
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: "15px",
                    }}
                  >
                    {slot.label}
                  </span>
                  <span
                    className="px-3 py-1 border text-xs"
                    style={{
                      borderColor: "#E5E5E5",
                      borderRadius: "12px",
                      color: isBooked ? "#888888" : "#7A0019",
                      backgroundColor: isBooked ? "#FAFAFA" : "#F5F5F5",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {isBooked ? "Booked" : "Available"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Footer Button */}
      <div
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t px-4 py-4 z-50"
        style={{ borderColor: "#E5E5E5" }}
      >
        <button
          onClick={handleConfirm}
          disabled={!selectedSlotId}
          className="w-full h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "#7A0019",
            color: "#FFFFFF",
            borderRadius: "8px",
            fontWeight: 500,
            fontSize: "16px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
          }}
        >
          Continue to Booking
        </button>
      </div>
    </div>
  );
}
