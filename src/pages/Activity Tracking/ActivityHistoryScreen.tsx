// src/pages/ActivityHistoryScreen.tsx
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface ActivityHistoryScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

type ActivityRow = {
  id: string;
  action: string;
  facility: string;
  location: string;
  date: string;
  time: string;
  type: "created" | "cancelled" | "updated" | string;
};

export function ActivityHistoryScreen({
  onNavigate,
}: ActivityHistoryScreenProps) {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("activity_logs")
        .select(
          `
          id,
          action_type,
          description,
          changes,
          created_at,
          facility_bookings:booking_id (
            facilities (
              name,
              location
            )
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading activity history", error);
        setErrorMsg("Failed to load activities.");
        setActivities([]);
        setLoading(false);
        return;
      }

      const mapped: ActivityRow[] = (data || []).map((row: any) => {
        const fb = row.facility_bookings;
        const fac = fb?.facilities;

        const facilityName =
          fac?.name ?? row.changes?.facility_name ?? "Facility";
        const location =
          fac?.location ?? row.changes?.facility_location ?? "Campus Facility";

        const createdAt = row.created_at ? new Date(row.created_at) : null;

        const date = createdAt
          ? createdAt.toLocaleDateString("en-MY", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "-";

        const time = createdAt
          ? createdAt.toLocaleTimeString("en-MY", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "-";

        const type: ActivityRow["type"] = row.action_type;

        const actionLabel =
          row.action_type === "created"
            ? "Booking Created"
            : row.action_type === "cancelled"
            ? "Booking Cancelled"
            : row.action_type === "updated"
            ? "Booking Updated"
            : row.action_type;

        return {
          id: row.id,
          action: actionLabel,
          facility: facilityName,
          location,
          date,
          time,
          type,
        };
      });

      setActivities(mapped);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header - Static/Sticky */}
      <div
        className="sticky top-0 z-40 bg-white px-6 py-6 border-b"
        style={{ borderColor: "#E5E5E5" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("profile")}
            style={{ color: "#7A0019" }}
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1
            style={{
              color: "#1A1A1A",
              fontWeight: "600",
              fontSize: "20px",
            }}
          >
            Activity History
          </h1>
        </div>
      </div>

      {/* Activity List */}
      <div className="px-6 py-4 space-y-4">
        {loading && (
          <p className="text-sm" style={{ color: "#888888" }}>
            Loading activities…
          </p>
        )}

        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

        {!loading && !errorMsg && activities.length === 0 && (
          <p className="text-sm" style={{ color: "#555555" }}>
            No activities recorded yet.
          </p>
        )}

        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onNavigate("activity-detail", activity.id)}
            className="w-full border bg-white p-4 text-left"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Icon and Action */}
            <div className="flex items-start gap-3 mb-2">
              {activity.type === "created" ? (
                <CheckCircle
                  className="w-5 h-5 shrink-0 mt-0.5"
                  strokeWidth={1.5}
                  style={{ color: "#7A0019" }}
                />
              ) : activity.type === "cancelled" ? (
                <XCircle
                  className="w-5 h-5 shrink-0 mt-0.5"
                  strokeWidth={1.5}
                  style={{ color: "#7A0019" }}
                />
              ) : (
                <CheckCircle
                  className="w-5 h-5 shrink-0 mt-0.5"
                  strokeWidth={1.5}
                  style={{ color: "#7A0019" }}
                />
              )}
              <div className="flex-1">
                <h3
                  className="mb-1"
                  style={{
                    color: "#1A1A1A",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  {activity.action}
                </h3>
                <p
                  className="text-sm mb-2"
                  style={{ color: "#6A6A6A", lineHeight: "1.5" }}
                >
                  {activity.facility} — {activity.location}
                </p>
                <p className="text-sm" style={{ color: "#888888" }}>
                  {activity.date} • {activity.time}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
