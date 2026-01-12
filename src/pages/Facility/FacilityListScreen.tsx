import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { supabase } from "../../lib/supabaseClient";
// 1. Import global preferences context
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface FacilityListScreenProps {
  onNavigate: (screen: string, data?: string) => void;
}

type Facility = {
  id: string;
  name: string;
  location: string | null;
  image_url: string | null;
};

export function BookListHeader() {
  // 2. Consume theme context for Header
  const { theme, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b transition-colors duration-300 lg:hidden"
      style={{ backgroundColor: theme.cardBg, borderColor: theme.border, transform: "none" }}
    >
      <h2 style={{ color: theme.text, fontWeight: 600, fontSize: "20px" }}>
        {isMs ? "Tempah Fasiliti" : "Book Facility"}
      </h2>
      <p
        className="text-sm mt-1"
        style={{ color: theme.textSecondary, lineHeight: "1.6" }}
      >
        {isMs ? "Pilih sukan pilihan anda" : "Choose your preferred sport"}
      </p>
    </div>
  );
}

export function FacilityListScreen({ onNavigate }: FacilityListScreenProps) {
  // 3. Consume context for dynamic styles and language
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  const [query, setQuery] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadFacilities = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("facilities")
        .select("id, name, location, image_url")
        .order("name", { ascending: true });

      if (error) {
        setErrorMsg(error.message);
        setFacilities([]);
      } else {
        setFacilities(data || []);
      }
      setLoading(false);
    };

    loadFacilities();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return facilities;
    return facilities.filter((f) => {
      const loc = (f.location || "").toLowerCase();
      return f.name.toLowerCase().includes(q) || loc.includes(q);
    });
  }, [query, facilities]);

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const onEnterBlur: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
  };

  return (
    <div className="h-full transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <div className="h-10 lg:hidden" />

      <div className="container-dashboard lg:pt-8">
        <div
          className="px-6 py-2 space-y-6"
          style={{
            paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px) + 60px)",
          }}
        >
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.textSecondary }}
              strokeWidth={1.5}
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onEnterBlur}
              placeholder={isMs ? "Cari fasiliti..." : "Search facilities…"}
              className="w-full h-12 pl-12 pr-10 border transition-colors outline-none focus:ring-1"
              aria-label="Search facilities"
              inputMode="search"
              autoCorrect="off"
              spellCheck={false}
              style={{
                borderColor: theme.border,
                backgroundColor: theme.cardBg,
                borderRadius: "14px",
                fontSize: "15px",
                color: theme.text,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
            />
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                aria-label="Clear search"
                style={{ color: theme.textSecondary }}
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Loading / error states */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin mr-2" style={{ color: theme.primary }} />
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                {t("view_all")}...
              </p>
            </div>
          )}
          
          {errorMsg && (
            <p className="text-sm text-red-500 text-center py-8">
              {isMs ? "Gagal memuatkan fasiliti" : "Failed to load facilities"}: {errorMsg}
            </p>
          )}

          {/* Facilities List */}
          <div className="space-y-4 pb-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {!loading && !errorMsg && filtered.length === 0 ? (
              <div
                className="text-sm text-center py-12 lg:col-span-2"
                style={{ color: theme.textSecondary }}
              >
                {isMs ? `Tiada fasiliti sepadan dengan "${query}"` : `No facilities match "${query}".`}
              </div>
            ) : (
              filtered.map((facility) => (
                <button
                  key={facility.id}
                  onClick={() => onNavigate("facility-details", facility.id)}
                  className="w-full border overflow-hidden text-left transition-all active:scale-[0.98] shadow-sm"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                    borderRadius: "14px",
                  }}
                >
                  {facility.image_url ? (
                    <div className="w-full h-48">
                      <ImageWithFallback
                        src={facility.image_url}
                        alt={facility.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center" style={{ backgroundColor: theme.background }}>
                       <p className="text-xs" style={{ color: theme.textSecondary }}>{isMs ? "Tiada imej" : "No image"}</p>
                    </div>
                  )}
                  <div className="p-4">
                    <h4
                      className="mb-1"
                      style={{
                        color: theme.text,
                        fontWeight: 600,
                        fontSize: "16px",
                      }}
                    >
                      {facility.name}
                    </h4>
                    <p
                      className="text-sm"
                      style={{ color: theme.textSecondary, lineHeight: "1.6" }}
                    >
                      {facility.location}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}