import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

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
  type: string;
};

export function ActivityHistoryScreen({ onNavigate }: ActivityHistoryScreenProps) {
  // Access global preferences, theme styles, and translation function
  const { theme, t, preferences } = useUserPreferences();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setActivities([]); setLoading(false); return; }

      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          id, action_type, description, changes, created_at,
          facility_bookings:booking_id ( facilities ( name, location ) )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(t("no_upcoming")); // Using translation for error fallback
        setActivities([]);
      } else {
        const mapped: ActivityRow[] = (data || []).map((row: any) => {
          const fac = row.facility_bookings?.facilities;
          const createdAt = row.created_at ? new Date(row.created_at) : null;
          
          // Apply locale based on language preference
          const locale = preferences.language_code === 'ms' ? 'ms-MY' : 'en-MY';
          
          return {
            id: row.id,
            action: row.action_type.replace("_", " ").toUpperCase(),
            facility: fac?.name ?? row.changes?.facility_name ?? t("book_facility"),
            location: fac?.location ?? row.changes?.facility_location ?? "Campus Facility",
            date: createdAt ? createdAt.toLocaleDateString(locale) : "-",
            time: createdAt ? createdAt.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" }) : "-",
            type: row.action_type,
          };
        });
        setActivities(mapped);
      }
      setLoading(false);
    };
    load();
  }, [preferences.language_code, t]); // Reload if language changes

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300" style={{ backgroundColor: theme.background, color: theme.text }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 py-6 border-b transition-colors duration-300" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("profile")} style={{ color: theme.primary }}>
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h1 style={{ fontWeight: 600, fontSize: "20px", color: theme.text }}>{t("activity_history")}</h1>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {loading && <p className="text-sm" style={{ color: theme.textSecondary }}>{t("view_all")}...</p>}
        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
        {!loading && !errorMsg && activities.length === 0 && (
          <p className="text-sm" style={{ color: theme.textSecondary }}>{t("no_upcoming")}</p>
        )}

        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onNavigate("activity-detail", activity.id)}
            className="w-full border p-4 text-left rounded-xl shadow-sm transition-all active:scale-[0.98]"
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.border 
            }}
          >
            <div className="flex items-start gap-3 mb-2">
              {activity.type === "cancelled" ? (
                <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" strokeWidth={1.5} />
              ) : (
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.5} style={{ color: theme.primary }} />
              )}
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-[16px]" style={{ color: theme.text }}>{activity.action}</h3>
                <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
                  {activity.facility} — {activity.location}
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
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