import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Search,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

/* ================= TYPES ================= */

export interface ActivityEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentParticipants: number;
  status: "open" | "full" | "closed";
  category: string;
  isJoined?: boolean;
}

/* ================= COMPONENT ================= */

interface ActivityEventsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  userRole?: "student" | "staff";
}

export function ActivityEventsScreen({
  onNavigate,
  userRole = "student",
}: ActivityEventsScreenProps) {
  const { theme, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';
  const isDark = preferences.theme_mode === 1;

  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  /* ================= LOAD EVENTS ================= */

  const loadEvents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("activity_events")
      .select("*")
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error loading events:", error);
      setEvents([]);
    } else {
      const normalized = (data || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        location: e.location,
        eventDate: e.event_date,
        startTime: e.start_time,
        endTime: e.end_time,
        capacity: e.capacity,
        currentParticipants: e.current_participants,
        status: e.status,
        category: e.category,
        isJoined: false,
      }));

      setEvents(normalized);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  /* ================= FILTERING ================= */

  useEffect(() => {
    let list = [...events];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((e) => e.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      list = list.filter((e) => e.category === categoryFilter);
    }

    setFilteredEvents(list);
  }, [events, searchQuery, statusFilter, categoryFilter]);

  /* ================= STATUS COLORS ================= */

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return {
          bg: isDark ? "#064e3b" : "#F0FDF4",
          text: isDark ? "#34d399" : "#15803D",
        };
      case "full":
        return {
          bg: isDark ? "#7f1d1d" : "#FEF2F2",
          text: isDark ? "#f87171" : "#991B1B",
        };
      default:
        return {
          bg: theme.border,
          text: theme.textSecondary,
        };
    }
  };

  /* ================= UI ================= */

  return (
    <div
      className="min-h-screen pb-20 transition-colors"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 py-6 border-b" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("activity-main")}>
            <ArrowLeft className="w-6 h-6" style={{ color: theme.primary }} />
          </button>
          <div>
            <h2 className="text-[20px] font-semibold" style={{ color: theme.text }}>
              {isMs ? "Acara Aktiviti" : "Activity Events"}
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              {isMs ? "Cari dan sertai acara akan datang" : "Browse and join upcoming events"}
            </p>
          </div>
        </div>
      </div>

        {userRole === "staff" && (
        <>
        <div className="px-6 pb-3 mt-5">
            <button
            onClick={() => onNavigate("create-event")}
            className="w-full h-12 text-white rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            style={{ backgroundColor: theme.primary }}
            >
            <Plus className="w-5 h-5" /> {preferences.language_code === 'ms' ? 'Rekod Acara Baharu' : 'Create Activity Event'}
            </button>
        </div>
        </>
        )}

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: theme.textSecondary }}
          />
          <input
            className="w-full pl-12 pr-4 py-3 rounded-lg outline-none"
            placeholder={isMs ? "Cari acara..." : "Search events.."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>
      </div>

      {/* Event List */}
      <div className="px-6 space-y-4">
        {loading ? (
          <p className="text-center" style={{ color: theme.textSecondary }}>
            {isMs ? "Memuatkan acara.." : "Loading event.."}
          </p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center" style={{ color: theme.textSecondary }}>
            {isMs ? "Tiada acara tersedia." : "No events found."}
          </p>
        ) : (
          filteredEvents.map((event) => {
            const colors = getStatusColor(event.status);

            return (
              <button
                key={event.id}
                onClick={() =>
                  onNavigate("event-detail", { eventId: event.id })
                }
                className="w-full text-left"
              >
                <div
                  className="p-4 rounded-xl border transition-all hover:shadow-md"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                  }}
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold" style={{ color: theme.text }}>
                      {event.title}
                    </h3>
                    <span
                      className="px-3 py-1 text-xs rounded-full"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {event.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span style={{ color: theme.textSecondary }}>
                        {event.eventDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span style={{ color: theme.textSecondary }}>
                        {event.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span style={{ color: theme.textSecondary }}>
                        {event.currentParticipants}/{event.capacity}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex justify-between items-center mt-3 pt-3 border-t"
                    style={{ borderColor: theme.border }}
                  >
                    <span style={{ color: theme.primary }}>
                        {isMs ? "Maklumat Lanjut" : "View Deatils"}
                    </span>
                    <ChevronRight style={{ color: theme.primary }} />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
