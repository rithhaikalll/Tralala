// src/pages/ActivityDetailScreen.tsx
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface ActivityDetailScreenProps {
  activityId: string;
  onNavigate: (screen: string) => void;
}

type ActivityLogRow = {
  id: string;
  user_id: string | null;
  action_type: string;
  description: string | null;
  changes: any | null;
  metadata: any | null;
  created_at: string;
  facility_bookings?: {
    facilities?: {
      name: string;
      location: string | null;
    } | null;
  } | null;
};

/** 🔹 Header Component */
export function ActivityDetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="px-6 py-6 border-b bg-white"
      style={{ borderColor: "#E5E5E5" }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} style={{ color: "#7A0019" }}>
          <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>

        <h1
          style={{
            color: "#1A1A1A",
            fontWeight: 600,
            fontSize: "20px",
          }}
        >
          Activity Details
        </h1>
      </div>
    </div>
  );
}

/** 🔹 Main Screen Component */
export function ActivityDetailScreen({
  activityId,
}: ActivityDetailScreenProps) {
  const [activity, setActivity] = useState<ActivityLogRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("activity_logs")
        .select(
          `
          id,
          user_id,
          action_type,
          description,
          changes,
          metadata,
          created_at,
          facility_bookings:booking_id (
            facilities (
              name,
              location
            )
          )
        `
        )
        .eq("id", activityId)
        .single();

      if (error) {
        console.error("Error loading activity detail", error);
        setErrorMsg("Failed to load activity details.");
        setActivity(null);
      } else {
        setActivity(data as ActivityLogRow);
      }

      setLoading(false);
    };

    if (activityId) load();
  }, [activityId]);

  // Fallback-friendly extracted fields
  const facilityName =
    activity?.facility_bookings?.facilities?.name ??
    activity?.changes?.facility_name ??
    "Facility";

  const facilityLocation =
    activity?.facility_bookings?.facilities?.location ??
    activity?.changes?.facility_location ??
    "Campus Facility";

  const userName =
    activity?.metadata?.user_name ?? activity?.metadata?.student_name ?? "User";

  const userStudentId =
    activity?.metadata?.student_id ?? activity?.user_id ?? "";

  const createdAt = activity?.created_at ? new Date(activity.created_at) : null;

  const timestampLabel = createdAt
    ? createdAt.toLocaleString("en-MY", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "-";

  const statusOld = activity?.changes?.status?.old ?? null;
  const statusNew = activity?.changes?.status?.new ?? null;
  const timeNew =
    activity?.changes?.timeSlot?.new ?? activity?.changes?.time?.new ?? null;
  const dateNew = activity?.changes?.date?.new ?? null;

  const device = activity?.metadata?.device ?? "-";
  const ip = activity?.metadata?.ip ?? "-";

  const actionLabel =
    activity?.action_type === "created"
      ? "Booking Created"
      : activity?.action_type === "cancelled"
      ? "Booking Cancelled"
      : activity?.action_type === "updated"
      ? "Booking Updated"
      : activity?.action_type ?? "";

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pb-20">
        {/* Loading */}
        {loading && (
          <p className="text-sm" style={{ color: "#888888" }}>
            Loading activity details…
          </p>
        )}

        {/* Error */}
        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

        {/* Not Found */}
        {!loading && !errorMsg && !activity && (
          <p className="text-sm" style={{ color: "#555555" }}>
            Activity not found.
          </p>
        )}

        {/* Main Card */}
        {!loading && !errorMsg && activity && (
          <div
            className="border bg-white p-6"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* User */}
            <div className="mb-6">
              <label
                className="block text-sm mb-1"
                style={{ color: "#6A6A6A", fontWeight: "500" }}
              >
                User
              </label>
              <p
                className="text-base"
                style={{ color: "#1A1A1A", fontWeight: "500" }}
              >
                {userName}
              </p>
              {userStudentId && (
                <p className="text-sm" style={{ color: "#888888" }}>
                  {userStudentId}
                </p>
              )}
            </div>

            {/* Action */}
            <div className="mb-6">
              <label
                className="block text-sm mb-1"
                style={{ color: "#6A6A6A", fontWeight: "500" }}
              >
                Action
              </label>
              <p
                className="text-base"
                style={{ color: "#1A1A1A", fontWeight: "500" }}
              >
                {actionLabel}
              </p>
              {activity.description && (
                <p
                  className="text-sm mt-1"
                  style={{ color: "#6A6A6A", lineHeight: "1.5" }}
                >
                  {activity.description}
                </p>
              )}
            </div>

            {/* Facility */}
            <div className="mb-6">
              <label
                className="block text-sm mb-1"
                style={{ color: "#6A6A6A", fontWeight: "500" }}
              >
                Facility
              </label>
              <p
                className="text-base"
                style={{ color: "#1A1A1A", fontWeight: "500" }}
              >
                {facilityName}
              </p>
              <p className="text-sm" style={{ color: "#888888" }}>
                {facilityLocation}
              </p>
            </div>

            {/* Timestamp */}
            <div className="mb-6">
              <label
                className="block text-sm mb-1"
                style={{ color: "#6A6A6A", fontWeight: "500" }}
              >
                Timestamp
              </label>
              <p className="text-base" style={{ color: "#1A1A1A" }}>
                {timestampLabel}
              </p>
            </div>

            {/* Changes */}
            {(statusOld || statusNew || timeNew || dateNew) && (
              <div
                className="mb-6 pb-6 border-b"
                style={{ borderColor: "#E5E5E5" }}
              >
                <label
                  className="block text-sm mb-3"
                  style={{ color: "#6A6A6A", fontWeight: "500" }}
                >
                  Changes Made
                </label>

                {/* Status */}
                {(statusOld || statusNew) && (
                  <div className="mb-3">
                    <p className="text-sm mb-1" style={{ color: "#888888" }}>
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      {statusOld && (
                        <span
                          className="text-sm px-3 py-1 border"
                          style={{
                            borderColor: "#E5E5E5",
                            borderRadius: "6px",
                            color: "#6A6A6A",
                            backgroundColor: "#F9F9F9",
                          }}
                        >
                          {statusOld}
                        </span>
                      )}

                      {statusOld && statusNew && (
                        <span style={{ color: "#888888" }}>→</span>
                      )}

                      {statusNew && (
                        <span
                          className="text-sm px-3 py-1"
                          style={{
                            borderRadius: "6px",
                            color: "#FFFFFF",
                            backgroundColor: "#7A0019",
                            fontWeight: "500",
                          }}
                        >
                          {statusNew}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Time */}
                {timeNew && (
                  <div className="mb-3">
                    <p className="text-sm mb-1" style={{ color: "#888888" }}>
                      Time Slot
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "#1A1A1A", fontWeight: "500" }}
                    >
                      {timeNew}
                    </p>
                  </div>
                )}

                {/* Date */}
                {dateNew && (
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#888888" }}>
                      Date
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "#1A1A1A", fontWeight: "500" }}
                    >
                      {dateNew}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div>
              <label
                className="block text-sm mb-3"
                style={{ color: "#6A6A6A", fontWeight: "500" }}
              >
                Additional Information
              </label>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm" style={{ color: "#888888" }}>
                    Device
                  </p>
                  <p className="text-sm" style={{ color: "#1A1A1A" }}>
                    {device}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm" style={{ color: "#888888" }}>
                    IP Address
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "#1A1A1A", fontFamily: "monospace" }}
                  >
                    {ip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-6 mb-8">
          <p
            className="text-sm text-center"
            style={{ color: "#888888", lineHeight: "1.6" }}
          >
            This is a read-only view for audit purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
