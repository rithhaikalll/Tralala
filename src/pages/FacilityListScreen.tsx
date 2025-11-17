// src/pages/FacilityListScreen.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { supabase } from "../lib/supabaseClient";

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
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-white px-6 py-6 border-b"
      style={{ borderColor: "#E5E5E5", transform: "none" }}
    >
      <h2 style={{ color: "#1A1A1A", fontWeight: 600, fontSize: "20px" }}>
        Book Facility
      </h2>
      <p
        className="text-sm mt-1"
        style={{ color: "#555555", lineHeight: "1.6" }}
      >
        Choose your preferred sport
      </p>
    </div>
  );
}

export function FacilityListScreen({ onNavigate }: FacilityListScreenProps) {
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
        .select("id, name, location, image_url") // no category
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading facilities", error);
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
    <div className="h-full bg-white">
      {/* spacer reserved by app-level header (same as DiscussionScreen) */}
      <div className="h-10" />

      {/* Content – same padding pattern as DiscussionScreen */}
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
            style={{ color: "#888888" }}
            strokeWidth={1.5}
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onEnterBlur}
            placeholder="Search facilities…"
            className="w-full h-12 pl-12 pr-10 border bg-white"
            aria-label="Search facilities"
            inputMode="search"
            autoCorrect="off"
            spellCheck={false}
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              fontSize: "15px",
              color: "#1A1A1A",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
              aria-label="Clear search"
              style={{ color: "#888888" }}
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Loading / error */}
        {loading && (
          <p className="text-sm" style={{ color: "#888888" }}>
            Loading facilities…
          </p>
        )}
        {errorMsg && (
          <p className="text-sm text-red-500">
            Failed to load facilities: {errorMsg}
          </p>
        )}

        {/* Facilities List */}
        <div className="space-y-4 pb-4">
          {!loading && !errorMsg && filtered.length === 0 ? (
            <div
              className="text-sm text-center py-8"
              style={{ color: "#888888" }}
            >
              No facilities match “{query}”.
            </div>
          ) : (
            filtered.map((facility) => (
              <button
                key={facility.id}
                onClick={() => onNavigate("facility-details", facility.id)}
                className="w-full border bg-white overflow-hidden text-left"
                style={{
                  borderColor: "#E5E5E5",
                  borderRadius: "14px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
              >
                {facility.image_url && (
                  <div className="w-full h-48">
                    <ImageWithFallback
                      src={facility.image_url}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h4
                    className="mb-1"
                    style={{
                      color: "#1A1A1A",
                      fontWeight: 600,
                      fontSize: "16px",
                    }}
                  >
                    {facility.name}
                  </h4>
                  <p
                    className="text-sm"
                    style={{ color: "#555555", lineHeight: "1.6" }}
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
  );
}
