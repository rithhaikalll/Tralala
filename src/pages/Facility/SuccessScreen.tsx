// src/pages/Facility/SuccessScreen.tsx
import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react";

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
  return (
    // ⬇️ ONLY CHANGE IS HERE: h-full instead of min-h-screen
    <div className="h-full bg-white flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Success Icon */}
        <div className="mb-8">
          <CheckCircle
            className="w-20 h-20"
            style={{ color: "#7A0019" }}
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h1
          className="mb-3 text-center"
          style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "24px" }}
        >
          Booking Confirmed
        </h1>

        {/* Reference + Check-In Code */}
        <div className="mb-8 text-center">
          <p className="text-xs mb-1" style={{ color: "#888888" }}>
            Reference ID
          </p>
          <p
            className="text-sm"
            style={{
              color: "#1A1A1A",
              fontWeight: "600",
              letterSpacing: "0.5px",
            }}
          >
            {bookingData.referenceCode}
          </p>

          <p className="text-xs mt-4 mb-1" style={{ color: "#888888" }}>
            Check-In Code
          </p>
          <div className="flex justify-center">
            <div
              className="px-6 py-3 border border-dashed"
              style={{
                borderRadius: "16px",
                borderColor: "#F4A7B5",
                backgroundColor: "#FFF7FA",
              }}
            >
              <span
                style={{
                  color: "#B3003B",
                  fontWeight: 700,
                  fontSize: "24px",
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
          className="w-full border bg-white p-5 mb-8"
          style={{
            borderColor: "#E5E5E5",
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="space-y-5">
            {/* Facility */}
            <div className="flex items-center gap-3">
              <MapPin
                className="w-5 h-5 shrink-0"
                style={{ color: "#7A0019" }}
                strokeWidth={1.5}
              />
              <div>
                <div className="text-xs mb-0.5" style={{ color: "#888888" }}>
                  Facility
                </div>
                <div
                  style={{
                    color: "#1A1A1A",
                    fontWeight: "500",
                    fontSize: "15px",
                  }}
                >
                  {bookingData.facilityName}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <Calendar
                className="w-5 h-5 shrink-0"
                style={{ color: "#7A0019" }}
                strokeWidth={1.5}
              />
              <div>
                <div className="text-xs mb-0.5" style={{ color: "#888888" }}>
                  Date
                </div>
                <div
                  style={{
                    color: "#1A1A1A",
                    fontWeight: "500",
                    fontSize: "15px",
                  }}
                >
                  {bookingData.date}
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <Clock
                className="w-5 h-5 shrink-0"
                style={{ color: "#7A0019" }}
                strokeWidth={1.5}
              />
              <div>
                <div className="text-xs mb-0.5" style={{ color: "#888888" }}>
                  Time
                </div>
                <div
                  style={{
                    color: "#1A1A1A",
                    fontWeight: "500",
                    fontSize: "15px",
                  }}
                >
                  {bookingData.time}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p
          className="text-sm text-center mb-10"
          style={{ color: "#555555", lineHeight: "1.7", maxWidth: "300px" }}
        >
          A confirmation email has been sent to your registered email address.
          Please show your reference ID and check-in code at the facility.
        </p>

        {/* Buttons */}
        <div className="w-full space-y-3 pb-6">
          <button
            onClick={() => onNavigate("my-bookings")}
            className="w-full h-12 flex items-center justify-center"
            style={{
              backgroundColor: "#7A0019",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "16px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            View My Bookings
          </button>

          <button
            onClick={() => onNavigate("home")}
            className="w-full h-12 border flex items-center justify-center"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "8px",
              color: "#555555",
              fontWeight: "500",
              fontSize: "16px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
