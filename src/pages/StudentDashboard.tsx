// src/pages/HomeScreen.tsx
import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Megaphone,
  TrendingUp,
  Plus,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { supabase } from "../lib/supabaseClient";

interface HomeScreenProps {
  studentName: string;
  onNavigate: (screen: string, data?: string) => void;
}

export function HomeScreenHeader({ studentName }: { studentName: string }) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-white px-6 py-6 border-b"
      style={{ borderColor: "#E5E5E5", transform: "none" }}
    >
      <h1
        className="mb-1"
        style={{
          color: "#7A0019",
          fontWeight: 600,
          fontSize: "20px",
          letterSpacing: "-0.01em",
        }}
      >
        UTMGo+
      </h1>
      <p className="text-sm" style={{ color: "#555555", lineHeight: "1.6" }}>
        Welcome back, {studentName}
      </p>
    </div>
  );
}

type RecommendedFacility = {
  id: string;
  name: string;
  location: string | null;
  image_url: string | null;
};

type UpcomingBooking = {
  id: string;
  date_label: string;
  time_label: string;
  status: string;
  facilities: {
    name: string;
    location: string | null;
  } | null;
};

export function HomeScreen({ studentName, onNavigate }: HomeScreenProps) {
  const [recommended, setRecommended] = useState<RecommendedFacility | null>(
    null
  );
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    validated: 0,
    pending: 0,
  });

  const [upcomingBooking, setUpcomingBooking] =
    useState<UpcomingBooking | null>(null);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  // Activity stats
  useEffect(() => {
    const loadActivityStats = async () => {
      const { data, error } = await supabase
        .from("recorded_activities")
        .select("status, duration");

      if (!error && data) {
        const validatedCount = data.filter(
          (a) => a.status === "Validated"
        ).length;
        const pendingCount = data.filter((a) => a.status === "Pending").length;
        const totalHours = data
          .filter((a) => a.status === "Validated")
          .reduce((sum, a) => sum + Number(a.duration), 0);

        setStats({
          total: totalHours,
          validated: validatedCount,
          pending: pendingCount,
        });
      } else {
        console.error("Error fetching activity stats:", error);
      }
    };

    loadActivityStats();
  }, []);

  // Recommended facility
  useEffect(() => {
    const loadRecommended = async () => {
      setLoadingRecommended(true);

      const { data, error } = await supabase
        .from("facilities")
        .select("id, name, location, image_url")
        .order("name", { ascending: true })
        .limit(1);

      if (!error && data && data.length > 0) {
        setRecommended(data[0] as RecommendedFacility);
      } else {
        setRecommended(null);
      }

      setLoadingRecommended(false);
    };

    loadRecommended();
  }, []);

  // Upcoming booking (for current user)
  useEffect(() => {
    const loadUpcoming = async () => {
      setLoadingUpcoming(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUpcomingBooking(null);
        setLoadingUpcoming(false);
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
    facilities (
      name,
      location
    )
  `
        )
        .eq("user_id", user.id)
        .in("status", ["pending", "approved", "confirmed", "checked_in"]);

      if (error) {
        console.error("Error loading upcoming booking", error);
        setUpcomingBooking(null);
        setLoadingUpcoming(false);
        return;
      }

      const bookings = data || [];

      if (bookings.length === 0) {
        setUpcomingBooking(null);
        setLoadingUpcoming(false);
        return;
      }

      // Helper to parse "Tue, Nov 18" + "10:00 AM - 11:00 AM" into a Date
      const toStartDate = (dateLabel: string, timeLabel: string) => {
        try {
          if (!dateLabel || !timeLabel) return null;

          // dateLabel: "Tue, Nov 18"
          const parts = dateLabel.split(" "); // ["Tue,", "Nov", "18"]
          if (parts.length < 3) return null;

          const monthStr = parts[1].replace(",", ""); // "Nov"
          const dayStr = parts[2]; // "18"

          const monthMap: Record<string, number> = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
          };

          const month = monthMap[monthStr as keyof typeof monthMap];
          const day = parseInt(dayStr, 10);
          if (month === undefined || isNaN(day)) return null;

          // timeLabel: "10:00 AM - 11:00 AM"
          const [startTime] = timeLabel.split(" - ");
          const [timePart, ampm] = startTime.split(" "); // "10:00", "AM"
          const [hourStr, minuteStr] = timePart.split(":");
          let hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);
          if (isNaN(hour) || isNaN(minute) || !ampm) return null;

          if (ampm.toUpperCase() === "PM" && hour < 12) hour += 12;
          if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;

          const year = new Date().getFullYear();
          return new Date(year, month, day, hour, minute);
        } catch {
          return null;
        }
      };

      // Attach parsed startAt date to each booking
      const withStart = bookings.map((row: any) => ({
        ...row,
        startAt: toStartDate(row.date_label, row.time_label),
      }));

      const now = new Date();

      // keep only future (or undated) bookings
      const upcomingOnly = withStart.filter((b: any) => {
        if (!b.startAt) return true; // if parsing failed, keep it just in case
        return (b.startAt as Date).getTime() >= now.getTime();
      });

      // Sort by startAt (earliest first)
      upcomingOnly.sort((a: any, b: any) => {
        if (!a.startAt && !b.startAt) return 0;
        if (!a.startAt) return 1;
        if (!b.startAt) return -1;
        return (a.startAt as Date).getTime() - (b.startAt as Date).getTime();
      });

      const first = upcomingOnly[0];

      if (!first) {
        setUpcomingBooking(null);
        setLoadingUpcoming(false);
        return;
      }

      setUpcomingBooking({
        id: first.id,
        date_label: first.date_label,
        time_label: first.time_label,
        status: first.status,
        facilities: first.facilities
          ? {
              name: first.facilities.name as string,
              location: (first.facilities.location as string) ?? null,
            }
          : null,
      });

      setLoadingUpcoming(false);
    };

    loadUpcoming();
  }, []);

  const newsItems = [
    {
      id: "n1",
      title: "Inter-Faculty Futsal Tournament 2025",
      body: "Register your team by 15 March. Limited slots for each faculty.",
      date: "10 March 2025",
    },
    {
      id: "n2",
      title: "New Booking Rules for Peak Hours",
      body: "Each student can book up to 2 slots per week between 7–10 PM.",
      date: "8 March 2025",
    },
  ];

  return (
    <div className="h-full bg-white">
      {/* spacer reserved by app-level header */}
      <div className="h-10" />

      <div
        className="px-6 py-2 space-y-8"
        style={{
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px) + 60px)",
        }}
      >
        {/* ===== Upcoming booking banner (replacing TODAY'S RECOMMENDATION) ===== */}
        <section
          className="border bg-white p-4"
          style={{
            borderColor: "#E5E5E5",
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <p
            className="text-xs mb-1"
            style={{
              color: "#7A0019",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            UPCOMING BOOKING
          </p>

          {loadingUpcoming ? (
            <p className="text-sm" style={{ color: "#888888" }}>
              Checking your upcoming booking…
            </p>
          ) : upcomingBooking ? (
            <>
              <h2
                className="mb-2"
                style={{
                  color: "#1A1A1A",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                {upcomingBooking.facilities?.name ?? "Facility Booking"}
              </h2>
              <div className="flex items-center gap-3 text-sm mb-1">
                <Calendar className="w-4 h-4" style={{ color: "#555555" }} />
                <span style={{ color: "#555555" }}>
                  {upcomingBooking.date_label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm mb-1">
                <Clock className="w-4 h-4" style={{ color: "#555555" }} />
                <span style={{ color: "#555555" }}>
                  {upcomingBooking.time_label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs mb-3">
                <MapPin className="w-3.5 h-3.5" style={{ color: "#888888" }} />
                <span style={{ color: "#555555" }}>
                  {upcomingBooking.facilities?.location ?? "Campus Facility"}
                </span>
              </div>
            </>
          ) : (
            <>
              <h2
                className="mb-2"
                style={{
                  color: "#1A1A1A",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                No upcoming bookings yet
              </h2>
              <p className="text-sm mb-3" style={{ color: "#555555" }}>
                Once you make a booking, it will appear here.
              </p>
            </>
          )}

          {/* ✅ Only one button now */}
          <button
            onClick={() => onNavigate("my-bookings")}
            className="w-full h-10 flex items-center justify-center text-sm"
            style={{
              backgroundColor: "#7A0019",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: 500,
              marginTop: "8px",
            }}
          >
            My Bookings
          </button>
        </section>

        {/* Recommended facility (single card) */}
        <section className="space-y-4">
          <h3
            className="mb-1"
            style={{ color: "#1A1A1A", fontWeight: 600, fontSize: "17px" }}
          >
            Recommended for you
          </h3>
          <p className="text-xs mb-2" style={{ color: "#6A6A6A" }}>
            Based on what students often book around this time.
          </p>

          {loadingRecommended && (
            <p className="text-xs" style={{ color: "#888888" }}>
              Loading recommendation…
            </p>
          )}

          {!loadingRecommended && !recommended && (
            <p className="text-xs" style={{ color: "#888888" }}>
              No recommendation available right now.
            </p>
          )}

          {recommended && (
            <button
              onClick={() => onNavigate("facility-details", recommended.id)}
              className="w-full border bg-white overflow-hidden text-left"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div className="w-full h-40">
                <ImageWithFallback
                  src={
                    recommended.image_url ??
                    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80"
                  }
                  alt={recommended.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    style={{
                      color: "#1A1A1A",
                      fontWeight: 600,
                      fontSize: "16px",
                    }}
                  >
                    {recommended.name}
                  </h4>
                  <span
                    className="text-[11px] px-2 py-0.5"
                    style={{
                      borderRadius: "999px",
                      backgroundColor: "#FFF4F6",
                      color: "#7A0019",
                      fontWeight: 500,
                    }}
                  >
                    Popular this week
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3 h-3" style={{ color: "#888888" }} />
                  <span style={{ color: "#555555" }}>
                    {recommended.location ?? "Campus Facility"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3" style={{ color: "#888888" }} />
                  <span style={{ color: "#555555" }}>
                    Good availability today
                  </span>
                </div>
              </div>
            </button>
          )}
        </section>

        {/* ===== Activity Tracking Section ===== */}
        <section>
          <div>
            <h3
              className="mb-4"
              style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "17px" }}
            >
              Activity Tracking
            </h3>
            <div
              className="border bg-white p-5"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: "#FFF5F7",
                    borderRadius: "10px",
                  }}
                >
                  <TrendingUp
                    className="w-6 h-6"
                    style={{ color: "#7A0019" }}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1">
                  <h4
                    style={{
                      color: "#1A1A1A",
                      fontWeight: "600",
                      fontSize: "16px",
                      marginBottom: "4px",
                    }}
                  >
                    Track Your Sports Activities
                  </h4>
                  <p
                    style={{
                      color: "#6A6A6A",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    Record activities and earn validated hours for your
                    achievements
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div
                  className="p-3 text-center"
                  style={{ backgroundColor: "#FAFAFA", borderRadius: "10px" }}
                >
                  <div
                    style={{
                      color: "#7A0019",
                      fontWeight: "600",
                      fontSize: "18px",
                      marginBottom: "2px",
                    }}
                  >
                    {stats.total}
                  </div>
                  <div style={{ color: "#6A6A6A", fontSize: "11px" }}>
                    Total Hours
                  </div>
                </div>

                <div
                  className="p-3 text-center"
                  style={{ backgroundColor: "#FAFAFA", borderRadius: "10px" }}
                >
                  <div
                    style={{
                      color: "#0369A1",
                      fontWeight: "600",
                      fontSize: "18px",
                      marginBottom: "2px",
                    }}
                  >
                    {stats.validated}
                  </div>
                  <div style={{ color: "#6A6A6A", fontSize: "11px" }}>
                    Validated
                  </div>
                </div>

                <div
                  className="p-3 text-center"
                  style={{ backgroundColor: "#FAFAFA", borderRadius: "10px" }}
                >
                  <div
                    style={{
                      color: "#C2410C",
                      fontWeight: "600",
                      fontSize: "18px",
                      marginBottom: "2px",
                    }}
                  >
                    {stats.pending}
                  </div>
                  <div style={{ color: "#6A6A6A", fontSize: "11px" }}>
                    Pending
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate("activity-record")}
                  className="flex-1 h-10 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#7A0019",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  Record
                </button>
                <button
                  onClick={() => onNavigate("activity-main")}
                  className="flex-1 h-10 flex items-center justify-center"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#7A0019",
                    border: "1px solid #7A0019",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* News / announcements */}
        <section className="pb-4">
          <h3
            className="mb-3"
            style={{ color: "#1A1A1A", fontWeight: 600, fontSize: "17px" }}
          >
            Campus sports news
          </h3>
          <div className="space-y-3">
            {newsItems.map((item) => (
              <div
                key={item.id}
                className="border bg-white p-3 flex gap-3"
                style={{
                  borderColor: "#E5E5E5",
                  borderRadius: "12px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                }}
              >
                <div className="mt-1">
                  <Megaphone
                    className="w-5 h-5"
                    style={{ color: "#7A0019" }}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs mb-1" style={{ color: "#888888" }}>
                    {item.date}
                  </p>
                  <h4
                    className="mb-1"
                    style={{
                      color: "#1A1A1A",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="text-xs"
                    style={{ color: "#555555", lineHeight: "1.5" }}
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
