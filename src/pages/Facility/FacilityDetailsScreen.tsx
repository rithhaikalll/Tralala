// src/pages/FacilityDetailsScreen.tsx
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Clock, Users, Info } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { supabase } from "../../lib/supabaseClient";

interface FacilityDetailsScreenProps {
  facilityId: string;
  onNavigate: (screen: string, data?: string) => void;
}

export function FacilityDetailsHeader({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-white px-6 py-6 border-b"
      style={{ borderColor: "#E5E5E5", transform: "none" }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} style={{ color: "#7A0019" }}>
          <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <h2 style={{ color: "#1A1A1A", fontWeight: 600, fontSize: 20 }}>
          Facility Details
        </h2>
      </div>
    </div>
  );
}

type FacilityRow = {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  open_hours: string | null;
  amenities: string[] | null; // text[] in Postgres
  capacity: string | null;
};

export function FacilityDetailsScreen({
  facilityId,
  onNavigate,
}: FacilityDetailsScreenProps) {
  const [facility, setFacility] = useState<FacilityRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadFacility = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("facilities")
        .select(
          "id, name, location, description, image_url, open_hours, amenities, capacity"
        )
        .eq("id", facilityId)
        .maybeSingle();

      if (error) {
        console.error("Failed to load facility", error);
        setErrorMsg("Failed to load facility details.");
        setFacility(null);
      } else {
        setFacility(data as FacilityRow | null);
      }

      setLoading(false);
    };

    if (facilityId) {
      loadFacility();
    }
  }, [facilityId]);

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <p className="text-sm" style={{ color: "#888888" }}>
          Loading facility…
        </p>
      </div>
    );
  }

  if (!facility || errorMsg) {
    return (
      <div className="h-screen bg-white flex items-center justify-center px-6 text-center">
        <p className="text-sm" style={{ color: "#888888", lineHeight: 1.6 }}>
          {errorMsg || "Facility not found."}
        </p>
      </div>
    );
  }

  const amenities = facility.amenities ?? [];

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Scrollable content */}
      <div
        className="flex-1 overflow-auto min-h-0 px-6 pb-6 pt-0 overscroll-contain"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Full-bleed banner */}
        <div className="-mx-6 w-screen max-w-none h-48 shrink-0">
          {facility.image_url ? (
            <ImageWithFallback
              src={facility.image_url}
              alt={facility.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: "#F5F5F5", color: "#888888" }}
            >
              No image available
            </div>
          )}
        </div>

        <div className="pt-6 space-y-6">
          {/* Name + location */}
          <div>
            <h1
              style={{
                color: "#1A1A1A",
                fontWeight: 600,
                fontSize: 24,
                marginBottom: 8,
              }}
            >
              {facility.name}
            </h1>
            {facility.location && (
              <div className="flex items-center gap-2">
                <MapPin
                  className="w-4 h-4"
                  style={{ color: "#888888" }}
                  strokeWidth={1.5}
                />
                <span
                  className="text-sm"
                  style={{ color: "#555555", lineHeight: 1.6 }}
                >
                  {facility.location}
                </span>
              </div>
            )}
          </div>

          {/* Operating hours + capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="border bg-white p-4"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: 14,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <Clock
                className="w-5 h-5 mb-2"
                style={{ color: "#7A0019" }}
                strokeWidth={1.5}
              />
              <div className="text-xs mb-1" style={{ color: "#888888" }}>
                Operating Hours
              </div>
              <div
                className="text-sm"
                style={{ color: "#1A1A1A", fontWeight: 500, lineHeight: 1.4 }}
              >
                {facility.open_hours || "Refer to facility schedule"}
              </div>
            </div>

            <div
              className="border bg-white p-4"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: 14,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <Users
                className="w-5 h-5 mb-2"
                style={{ color: "#7A0019" }}
                strokeWidth={1.5}
              />
              <div className="text-xs mb-1" style={{ color: "#888888" }}>
                Capacity
              </div>
              <div
                className="text-sm"
                style={{ color: "#1A1A1A", fontWeight: 500, lineHeight: 1.4 }}
              >
                {facility.capacity || "Refer to facility guidelines"}
              </div>
            </div>
          </div>

          {/* About */}
          {facility.description && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Info
                  className="w-5 h-5"
                  style={{ color: "#7A0019" }}
                  strokeWidth={1.5}
                />
                <h3 style={{ color: "#1A1A1A", fontWeight: 600, fontSize: 16 }}>
                  About
                </h3>
              </div>
              <p
                className="text-sm"
                style={{ color: "#555555", lineHeight: 1.7 }}
              >
                {facility.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h3
                className="mb-3"
                style={{ color: "#1A1A1A", fontWeight: 600, fontSize: 16 }}
              >
                Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 border bg-white text-sm"
                    style={{
                      borderColor: "#E5E5E5",
                      borderRadius: 14,
                      color: "#555555",
                      fontSize: 13,
                    }}
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t px-6 py-4 z-50"
        style={{ borderColor: "#E5E5E5" }}
      >
        <button
          onClick={() => onNavigate("time-slot", facilityId)}
          className="w-full h-12 flex items-center justify-center"
          style={{
            backgroundColor: "#7A0019",
            color: "#FFFFFF",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 16,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          Book This Facility
        </button>
      </div>
    </div>
  );
}
