import { ArrowLeft, MapPin, Clock, Users, Info } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

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

export function FacilityDetailsScreen({
  facilityId,
  onNavigate,
}: FacilityDetailsScreenProps) {
  const facilities: { [key: string]: any } = {
    "1": {
      name: "Badminton Court",
      location: "Indoor Sports Complex, Block A",
      image:
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
      description:
        "Professional-grade indoor badminton courts with quality flooring and lighting.",
      capacity: "2-4 players",
      openHours: "8:00 AM - 10:00 PM",
      amenities: [
        "Air Conditioning",
        "Lockers",
        "Shower Facilities",
        "Equipment Rental",
      ],
    },
    "2": {
      name: "Futsal Field",
      location: "Outdoor Sports Arena",
      image:
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
      description:
        "Full-size outdoor futsal field with artificial turf and floodlights.",
      capacity: "10-12 players",
      openHours: "6:00 AM - 11:00 PM",
      amenities: ["Floodlights", "Benches", "Scoreboard", "Ball Storage"],
    },
    "3": {
      name: "Ping Pong Table",
      location: "Recreation Center",
      image:
        "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&q=80",
      description:
        "Indoor table tennis facilities with quality tables and equipment.",
      capacity: "2-4 players",
      openHours: "8:00 AM - 10:00 PM",
      amenities: ["Equipment Rental", "Air Conditioning", "Seating Area"],
    },
    "4": {
      name: "Volleyball Court",
      location: "Beach Sports Area",
      image:
        "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
      description:
        "Professional outdoor volleyball court with sand and beach facilities.",
      capacity: "12-14 players",
      openHours: "8:00 AM - 9:00 PM",
      amenities: [
        "Beach Facilities",
        "Seating",
        "Changing Rooms",
        "Water Station",
      ],
    },
    "5": {
      name: "Fitness Gym",
      location: "Sports Complex Level 2",
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      description:
        "Fully-equipped fitness gym with cardio machines, weights, and personal training available.",
      capacity: "50+ members",
      openHours: "6:00 AM - 10:00 PM",
      amenities: [
        "Cardio Equipment",
        "Weight Training",
        "Lockers",
        "Personal Training",
      ],
    },
  };

  const facility = facilities[facilityId] || facilities["1"];

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Content area: use flex-1 overflow-auto so it only scrolls when needed. Add bottom padding so last item isn't hidden by footer. */}
      {/* Content: remove top padding so banner sits flush under header. */}
      <div
        className="flex-1 overflow-auto min-h-0 px-6 pb-6 pt-0 overscroll-contain"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Full-bleed banner: negate the parent's horizontal padding so image spans edge-to-edge */}
        <div className="-mx-6 w-screen max-w-none h-48 shrink-0">
          <ImageWithFallback
            src={facility.image}
            alt={facility.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="pt-6 space-y-6">
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
          </div>

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
                {facility.openHours}
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
                {facility.capacity}
              </div>
            </div>
          </div>

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

          <div>
            <h3
              className="mb-3"
              style={{ color: "#1A1A1A", fontWeight: 600, fontSize: 16 }}
            >
              Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {facility.amenities.map((amenity: string, index: number) => (
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
        </div>
      </div>

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
