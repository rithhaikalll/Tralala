// src/pages/HomeScreen.tsx
import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Megaphone } from "lucide-react";
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

export function HomeScreen({ studentName, onNavigate }: HomeScreenProps) {
  const [recommended, setRecommended] = useState<RecommendedFacility | null>(
    null
  );
  const [loadingRecommended, setLoadingRecommended] = useState(true);

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
        {/* Next booking / recommendation banner */}
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
            TODAY&apos;S RECOMMENDATION
          </p>
          <h2
            className="mb-2"
            style={{
              color: "#1A1A1A",
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            Book your next game, {studentName.split(" ")[0]}!
          </h2>
          <div className="flex items-center gap-3 text-sm mb-3">
            <Calendar className="w-4 h-4" style={{ color: "#555555" }} />
            <span style={{ color: "#555555" }}>Try an evening slot today</span>
          </div>
          <button
            onClick={() => onNavigate("book")}
            className="w-full h-10 flex items-center justify-center text-sm"
            style={{
              backgroundColor: "#7A0019",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: 500,
            }}
          >
            Browse Facilities
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
