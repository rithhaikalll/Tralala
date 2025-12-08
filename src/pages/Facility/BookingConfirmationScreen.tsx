// src/pages/BookingConfirmationScreen.tsx
import { Calendar, Clock, MapPin, Info } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

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
  const handleConfirm = async () => {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to book.");
      return;
    }

    // Reference ID (can stay alphanumeric)
    const referenceCode =
      "UTM" + Math.random().toString(36).substr(2, 9).toUpperCase();

    // 🔢 6-digit NUMERIC check-in code (000000 – 999999)
    const checkInCode = String(Math.floor(Math.random() * 1_000_000)).padStart(
      6,
      "0"
    );

    // Insert booking + store check_in_code
    const { data, error } = await supabase
      .from("facility_bookings")
      .insert({
        facility_id: bookingData.facilityId,
        user_id: user.id,
        date_label: bookingData.date,
        time_label: bookingData.time,
        status: "confirmed",
        reference_code: referenceCode,
        check_in_code: checkInCode, // 👈 NEW
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Booking failed", error);
      alert("Failed to confirm booking. Please try again.");
      return;
    }

    // Activity log (unchanged, still uses returned row id)
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

    // ⬇️ Pass both ref + 6-digit code to SuccessScreen
    onNavigate("success", {
      ...bookingData,
      referenceCode,
      checkInCode,
    });
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-6 py-6 bg-white border-b"
        style={{ borderColor: "#E5E5E5" }}
      >
        <h2 style={{ color: "#1A1A1A", fontWeight: 600, fontSize: "20px" }}>
          Booking Details
        </h2>
      </div>

      {/* Content */}
      <div
        className="px-6 py-4"
        style={{
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px) + 60px)",
        }}
      >
        <div className="space-y-8">
          {/* Booking Summary Card */}
          <div
            className="border bg-white p-5"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h3
              className="mb-5"
              style={{
                color: "#1A1A1A",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              Booking Summary
            </h3>

            <div className="space-y-5">
              {/* Facility Name */}
              <div className="flex items-start gap-3">
                <MapPin
                  className="w-5 h-5 mt-0.5 shrink-0"
                  style={{ color: "#7A0019" }}
                  strokeWidth={1.5}
                />
                <div>
                  <div className="text-xs mb-1" style={{ color: "#888888" }}>
                    Facility
                  </div>
                  <div
                    style={{
                      color: "#1A1A1A",
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                  >
                    {bookingData.facilityName}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar
                  className="w-5 h-5 mt-0.5 shrink-0"
                  style={{ color: "#7A0019" }}
                  strokeWidth={1.5}
                />
                <div>
                  <div className="text-xs mb-1" style={{ color: "#888888" }}>
                    Date
                  </div>
                  <div
                    style={{
                      color: "#1A1A1A",
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                  >
                    {bookingData.date}
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <Clock
                  className="w-5 h-5 mt-0.5 shrink-0"
                  style={{ color: "#7A0019" }}
                  strokeWidth={1.5}
                />
                <div>
                  <div className="text-xs mb-1" style={{ color: "#888888" }}>
                    Time
                  </div>
                  <div
                    style={{
                      color: "#1A1A1A",
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                  >
                    {bookingData.time}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div
            className="flex gap-3 p-4 border bg-white"
            style={{ borderColor: "#E5E5E5", borderRadius: "14px" }}
          >
            <Info
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "#888888" }}
              strokeWidth={1.5}
            />
            <div>
              <h4
                className="mb-1"
                style={{
                  color: "#1A1A1A",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              >
                Important Notice
              </h4>
              <p
                className="text-xs"
                style={{ color: "#555555", lineHeight: "1.6" }}
              >
                Please arrive 10 minutes before your scheduled time. Late
                arrivals may result in reduced session time. Cancellations must
                be made at least 2 hours in advance.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Footer Buttons */}
        <div
          className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t px-4 py-4 z-50"
          style={{ borderColor: "#E5E5E5" }}
        >
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate("time-slot")}
              className="flex-1 h-12 flex items-center justify-center border"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "8px",
                color: "#555555",
                fontWeight: 500,
                fontSize: "16px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 h-12 flex items-center justify-center"
              style={{
                backgroundColor: "#7A0019",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontWeight: 500,
                fontSize: "16px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
              }}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
