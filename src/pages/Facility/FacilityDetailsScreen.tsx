import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Clock, Users, Info, Loader2 } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { supabase } from "../../lib/supabaseClient";
// 1. Import global preferences context
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface FacilityDetailsScreenProps {
  facilityId: string;
  onNavigate: (screen: string, data?: string) => void;
}

export function FacilityDetailsHeader({ onBack }: { onBack: () => void }) {
  // 2. Consume theme and translation tools
  const { theme, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b transition-colors duration-300 lg:hidden"
      style={{ backgroundColor: theme.cardBg, borderColor: theme.border, transform: "none" }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} style={{ color: theme.primary }}>
          <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <h2 style={{ color: theme.text, fontWeight: 600, fontSize: 20 }}>
          {isMs ? "Butiran Fasiliti" : "Facility Details"}
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
  amenities: string[] | null;
  capacity: string | null;
};

export function FacilityDetailsScreen({
  facilityId,
  onNavigate,
}: FacilityDetailsScreenProps) {
  // 3. Consume context for dynamic styles and language
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  const [facility, setFacility] = useState<FacilityRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadFacility = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("facilities")
        .select("id, name, location, description, image_url, open_hours, amenities, capacity")
        .eq("id", facilityId)
        .maybeSingle();

      if (error) {
        setErrorMsg(isMs ? "Gagal memuatkan butiran fasiliti." : "Failed to load facility details.");
      } else {
        setFacility(data as FacilityRow | null);
      }
      setLoading(false);
    };

    if (facilityId) loadFacility();
  }, [facilityId, isMs]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center transition-colors" style={{ backgroundColor: theme.background }}>
        <Loader2 className="animate-spin" style={{ color: theme.primary }} />
      </div>
    );
  }

  if (!facility || errorMsg) {
    return (
      <div className="h-screen flex items-center justify-center px-6 text-center transition-colors" style={{ backgroundColor: theme.background }}>
        <p className="text-sm" style={{ color: theme.textSecondary, lineHeight: 1.6 }}>
          {errorMsg || (isMs ? "Fasiliti tidak dijumpai." : "Facility not found.")}
        </p>
      </div>
    );
  }

  const amenities = facility.amenities ?? [];

  return (
    <div className="h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <div className="container-form lg:pt-8">
        <div
          className="flex-1 overflow-auto min-h-0 px-6 pb-24 pt-0 overscroll-contain"
          style={{ paddingBottom: "120px", WebkitOverflowScrolling: "touch" }}
        >
          {/* Full-bleed banner */}
          <div className="-mx-6 w-screen max-w-none h-48 shrink-0 lg:mx-0 lg:w-full lg:rounded-2xl lg:overflow-hidden">
            {facility.image_url ? (
              <ImageWithFallback
                src={facility.image_url}
                alt={facility.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: theme.cardBg, color: theme.textSecondary }}
              >
                {isMs ? "Tiada imej" : "No image available"}
              </div>
            )}
          </div>

          <div className="pt-6 space-y-6">
            {/* Name + location */}
            <div>
              <h1 style={{ color: theme.text, fontWeight: 600, fontSize: 24, marginBottom: 8 }}>
                {facility.name}
              </h1>
              {facility.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: theme.textSecondary }} strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: theme.textSecondary, lineHeight: 1.6 }}>
                    {facility.location}
                  </span>
                </div>
              )}
            </div>

            {/* Operating hours + capacity cards */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="border p-4 transition-colors shadow-sm"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: 14 }}
              >
                <Clock className="w-5 h-5 mb-2" style={{ color: theme.primary }} strokeWidth={1.5} />
                <div className="text-[10px] uppercase font-bold mb-1" style={{ color: theme.textSecondary, letterSpacing: '0.05em' }}>
                  {isMs ? "Waktu Operasi" : "Operating Hours"}
                </div>
                <div className="text-sm" style={{ color: theme.text, fontWeight: 600, lineHeight: 1.4 }}>
                  {facility.open_hours || (isMs ? "Rujuk jadual" : "Refer to schedule")}
                </div>
              </div>

              <div
                className="border p-4 transition-colors shadow-sm"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: 14 }}
              >
                <Users className="w-5 h-5 mb-2" style={{ color: theme.primary }} strokeWidth={1.5} />
                <div className="text-[10px] uppercase font-bold mb-1" style={{ color: theme.textSecondary, letterSpacing: '0.05em' }}>
                  {isMs ? "Kapasiti" : "Capacity"}
                </div>
                <div className="text-sm" style={{ color: theme.text, fontWeight: 600, lineHeight: 1.4 }}>
                  {facility.capacity || (isMs ? "Rujuk garis panduan" : "Refer to guidelines")}
                </div>
              </div>
            </div>

            {/* About Section */}
            {facility.description && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5" style={{ color: theme.primary }} strokeWidth={1.5} />
                  <h3 style={{ color: theme.text, fontWeight: 600, fontSize: 16 }}>
                    {isMs ? "Tentang" : "About"}
                  </h3>
                </div>
                <p className="text-sm" style={{ color: theme.textSecondary, lineHeight: 1.7 }}>
                  {facility.description}
                </p>
              </div>
            )}

            {/* Amenities Section */}
            {amenities.length > 0 && (
              <div>
                <h3 className="mb-3" style={{ color: theme.text, fontWeight: 600, fontSize: 16 }}>
                  {isMs ? "Kemudahan" : "Amenities"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 border transition-colors text-sm"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: theme.cardBg,
                        borderRadius: 14,
                        color: theme.textSecondary,
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

        {/* Bottom CTA Button */}
        <div
          className="fixed bottom-0 left-0 right-0 border-t px-6 py-4 z-50 transition-colors duration-300 lg:static lg:border-0 lg:pt-0"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <button
            onClick={() => onNavigate("time-slot", facilityId)}
            className="w-full h-12 flex items-center justify-center transition-all active:scale-95 shadow-lg"
            style={{
              backgroundColor: theme.primary,
              color: "#FFFFFF",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {isMs ? "Tempah Sekarang" : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}