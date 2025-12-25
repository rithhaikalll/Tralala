import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

export default function DetailActivityScreen({ activityId, onNavigate }: { activityId: string; onNavigate: (screen: string) => void; }) {
  // Mengambil theme, t (fungsi translasi), dan preferences dari Context
  const { theme, t, preferences } = useUserPreferences();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      if (!activityId) return;
      const { data, error } = await supabase.from("recorded_activities").select("*").eq("id", activityId).single();
      if (!error) setActivity(data);
      setLoading(false);
    }
    fetchActivity();
  }, [activityId]);

  // Menggunakan teks dari kamus translasi
  if (loading) return <p className="p-6" style={{ color: theme.textSecondary }}>{t("view_all")}...</p>;
  if (!activity) return <p className="p-6 text-red-500">{t("no_upcoming")}</p>;

  const DetailRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between items-start border-b py-4 last:border-none" style={{ borderColor: theme.border }}>
      <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>{label}</p>
      <p className="text-sm font-semibold text-right max-w-[60%]" style={{ color: theme.text }}>{value}</p>
    </div>
  );

  // Lokalisasi format tanggal
  const formattedDate = activity.date 
    ? new Date(activity.date).toLocaleDateString(preferences.language_code === 'ms' ? 'ms-MY' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : "-";

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Header Berwarna Dinamis */}
      <div className="px-6 py-6 border-b transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate("activity-main")} 
            className="w-10 h-10 flex items-center justify-center rounded-full transition"
            style={{ backgroundColor: theme.background }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} style={{ color: theme.primary }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: theme.text }}>
            {/* Menggunakan kunci dari translations.ts */}
            {preferences.language_code === 'ms' ? 'Butiran Aktiviti' : 'Activity Details'}
          </h1>
        </div>
      </div>

      <div className="p-6">
        <div 
          className="rounded-2xl shadow-sm p-6 space-y-1 border transition-colors" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          {/* Mapping label menggunakan fungsi t() */}
          <DetailRow 
            label={preferences.language_code === 'ms' ? 'Nama Aktiviti' : 'Activity Name'} 
            value={activity.activity_name} 
          />
          <DetailRow 
            label={preferences.language_code === 'ms' ? 'Jenis Aktiviti' : 'Activity Type'} 
            value={activity.activity_type} 
          />
          <DetailRow 
            label={t("date") || "Date"} 
            value={formattedDate} 
          />
          <DetailRow 
            label={t("duration") || "Duration"} 
            value={`${activity.duration}h`} 
          />
          <DetailRow 
            label={preferences.language_code === 'ms' ? 'Catatan' : 'Remark'} 
            value={activity.remark || "—"} 
          />
          
          <div className="flex justify-between items-start pt-4">
            <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>{t("status") || "Status"}</p>
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ 
                backgroundColor: activity.status?.toLowerCase() === 'validated' ? '#064e3b20' : '#7c2d1220',
                color: activity.status?.toLowerCase() === 'validated' ? '#34d399' : '#fb923c',
                border: `1px solid ${activity.status?.toLowerCase() === 'validated' ? '#34d399' : '#fb923c'}`
              }}
            >
              {activity.status === "Validated" ? t("stat_validated") : activity.status === "Pending" ? t("stat_pending") : t("stat_rejected")}
            </span>
          </div>

          {activity.status?.toLowerCase() === "rejected" && activity.rejection_reason && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
              <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">REJECTION REASON</p>
              <p className="text-sm text-red-700 dark:text-red-300">{activity.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Tombol Kembali yang mengikuti tema warna */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => onNavigate("activity-main")}
            className="px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: theme.primary }}
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}