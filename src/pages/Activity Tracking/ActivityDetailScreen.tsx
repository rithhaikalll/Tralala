import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface ActivityDetailScreenProps {
  activityId: string;
  onNavigate: (screen: string) => void;
}

export function ActivityDetailHeader({ onBack }: { onBack: () => void }) {
  const { theme, t } = useUserPreferences();
  return (
    <div className="px-6 py-6 border-b" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
      <div className="flex items-center gap-3">
        <button onClick={onBack} style={{ color: theme.primary }}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 style={{ color: theme.text, fontWeight: 600, fontSize: "20px" }}>
          {t("activity_history")}
        </h1>
      </div>
    </div>
  );
}

export function ActivityDetailScreen({ activityId, onNavigate }: ActivityDetailScreenProps) {
  const { theme, t, preferences } = useUserPreferences();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const { data } = await supabase.from("activity_logs").select("*").eq("id", activityId).single();
      setActivity(data);
      setLoading(false);
    };
    if (activityId) fetchDetail();
  }, [activityId]);

  if (loading) return <div className="p-10 text-center" style={{ color: theme.textSecondary }}>{t("view_all")}...</div>;

  // Mapping label ke fungsi t() agar terjemahan diterapkan
  const dataRows = [
    { label: t("activity_name"), value: activity?.metadata?.activity_name || "Running 5KM" },
    { label: t("activity_type"), value: activity?.action_type || "Running" },
    { label: t("date"), value: activity?.created_at ? new Date(activity.created_at).toLocaleDateString(preferences.language_code === 'ms' ? 'ms-MY' : 'en-US') : "2025-12-15" },
    { label: t("duration"), value: activity?.metadata?.duration || "2 hours" },
    { label: t("remark"), value: activity?.description || "—" },
    { label: t("status"), value: activity?.changes?.status?.new || "Pending" },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <div className="px-6 pt-6">
        <div 
          className="border p-4 shadow-sm" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: "16px" }}
        >
          {dataRows.map((row, idx) => (
            <div 
              key={idx} 
              className="flex justify-between py-4 border-b last:border-0" 
              style={{ borderColor: theme.border }}
            >
              <span style={{ color: theme.textSecondary, fontSize: "14px" }}>{row.label}</span>
              <span style={{ color: theme.text, fontWeight: 500, fontSize: "14px" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Footer Button - Memperbaiki error 'onNavigate' */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => onNavigate("activity-history")}
            className="px-6 py-2 rounded-lg font-medium transition-all active:scale-95"
            style={{ border: `1px solid ${theme.primary}`, color: theme.primary }}
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}