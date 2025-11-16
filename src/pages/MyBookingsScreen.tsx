// src/pages/MyBookingsScreen.tsx
import { Calendar, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function MyBookingsScreenHeader() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-white px-6 py-6 border-b"
      style={{ borderColor: "#E5E5E5", transform: "none" }}
    >
      <h2 style={{ color: "#1A1A1A", fontWeight: 600, fontSize: "20px" }}>
        My Bookings
      </h2>
    </div>
  );
}

type BookingRow = {
  id: string;
  date_label: string;
  time_label: string;
  status: string;
  reference_code: string | null;
  facilities: {
    name: string;
    location: string | null;
  } | null;
};

export function MyBookingsScreen() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("facility_bookings")
        .select(
          `
          id,
          date_label,
          time_label,
          status,
          reference_code,
          facilities (
            name,
            location
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading bookings", error);
        setBookings([]);
      } else {
        const mapped: BookingRow[] = (data || []).map((row: any) => ({
          id: row.id,
          date_label: row.date_label,
          time_label: row.time_label,
          status: row.status,
          reference_code: row.reference_code ?? null,
          facilities: row.facilities
            ? {
                name: row.facilities.name as string,
                location: (row.facilities.location as string) ?? null,
              }
            : null,
        }));
        setBookings(mapped);
      }

      setLoading(false);
    };

    load();
  }, []);

  const handleCancelClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    if (!selectedBookingId) return;

    // Find booking in state so we can log details later
    const booking = bookings.find((b) => b.id === selectedBookingId);

    // 1) Update booking status
    const { error } = await supabase
      .from("facility_bookings")
      .update({ status: "cancelled" })
      .eq("id", selectedBookingId);

    if (error) {
      console.error("Failed to cancel booking", error);
      alert("Failed to cancel booking.");
    } else {
      // Update UI
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBookingId ? { ...b, status: "cancelled" } : b
        )
      );

      // 2) Log activity in activity_logs
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && booking) {
          await supabase.from("activity_logs").insert({
            user_id: user.id,
            booking_id: booking.id,
            action_type: "cancelled",
            description: `Booking cancelled for ${
              booking.facilities?.name ?? "Facility"
            }`,
            changes: {
              status: { old: "Booked", new: "Cancelled" },
              timeSlot: { old: booking.time_label, new: null },
              date: { old: booking.date_label, new: null },
              facility_name: booking.facilities?.name ?? null,
              facility_location: booking.facilities?.location ?? null,
            },
            metadata: {
              device:
                typeof navigator !== "undefined" ? navigator.userAgent : null,
            },
          });
        }
      } catch (e) {
        console.error("Failed to log cancel activity", e);
      }
    }

    setShowCancelDialog(false);
    setSelectedBookingId(null);
  };

  return (
    <div className="h-full bg-white">
      {/* spacer for header */}
      <div className="h-4" />

      <div
        className="px-6 py-2 space-y-4"
        style={{
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px) + 60px)",
        }}
      >
        {loading && (
          <p className="text-sm" style={{ color: "#888888" }}>
            Loading bookings…
          </p>
        )}

        {!loading && bookings.length === 0 && (
          <p className="text-sm" style={{ color: "#555555" }}>
            You have no upcoming bookings.
          </p>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => {
            const facilityName = booking.facilities?.name || "Facility";
            const location = booking.facilities?.location || "Campus Facility";

            const isCancelled = booking.status === "cancelled";

            return (
              <div
                key={booking.id}
                className="border bg-white p-4"
                style={{
                  borderColor: "#E5E5E5",
                  borderRadius: "14px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3
                      style={{
                        color: "#1A1A1A",
                        fontWeight: 600,
                        fontSize: "16px",
                        marginBottom: "4px",
                      }}
                    >
                      {facilityName}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        className="w-3.5 h-3.5"
                        style={{ color: "#888888" }}
                        strokeWidth={1.5}
                      />
                      <span className="text-xs" style={{ color: "#555555" }}>
                        {location}
                      </span>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 border text-xs"
                    style={{
                      borderColor: isCancelled ? "#E5E5E5" : "#F4A7B5",
                      borderRadius: "12px",
                      color: isCancelled ? "#888888" : "#B3003B",
                      backgroundColor: isCancelled ? "#F5F5F5" : "#FDECEF",
                      fontWeight: 500,
                    }}
                  >
                    {isCancelled ? "Cancelled" : "Confirmed"}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: "#888888" }}
                      strokeWidth={1.5}
                    />
                    <span className="text-sm" style={{ color: "#555555" }}>
                      {booking.date_label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock
                      className="w-4 h-4"
                      style={{ color: "#888888" }}
                      strokeWidth={1.5}
                    />
                    <span className="text-sm" style={{ color: "#555555" }}>
                      {booking.time_label}
                    </span>
                  </div>
                  {booking.reference_code && (
                    <p className="text-xs" style={{ color: "#888888" }}>
                      Ref: {booking.reference_code}
                    </p>
                  )}
                </div>

                {!isCancelled && (
                  <button
                    onClick={() => handleCancelClick(booking.id)}
                    className="w-full h-12 border flex items-center justify-center mt-2"
                    style={{
                      borderWidth: "1.5px",
                      borderColor: "#7A0019",
                      borderRadius: "8px",
                      color: "#7A0019",
                      fontWeight: 500,
                      fontSize: "15px",
                      backgroundColor: "transparent",
                    }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div
            className="bg-white w-full max-w-sm border"
            style={{
              borderRadius: "14px",
              borderColor: "#E5E5E5",
              padding: "24px",
            }}
          >
            <h3
              className="mb-2"
              style={{
                color: "#1A1A1A",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              Cancel Booking?
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "#555555", lineHeight: "1.6" }}
            >
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 h-12 border flex items-center justify-center"
                style={{
                  borderWidth: "1.5px",
                  borderColor: "#7A0019",
                  borderRadius: "8px",
                  color: "#7A0019",
                  fontWeight: 500,
                  fontSize: "15px",
                  backgroundColor: "#FFFFFF",
                }}
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 h-12 flex items-center justify-center"
                style={{
                  backgroundColor: "#7A0019",
                  color: "#FFFFFF",
                  borderRadius: "8px",
                  fontWeight: 500,
                  fontSize: "15px",
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
