import { Download, Clock, Activity, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Pie, Bar } from "react-chartjs-2";
// 1. Import the global preferences hook
import { useUserPreferences } from "../../lib/UserPreferencesContext";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface ActivityReportScreenProps {
  onNavigate: (screen: string) => void;
}

interface ActivitySummary {
  totalActivities: number;
  totalHours: number;
  validatedActivities: number;
  pendingActivities: number;
  rejectedActivities: number;
}

interface ActivityCategory {
  category: string;
  count: number;
  hours: number;
}

interface MonthlyActivity {
  month: string;
  hours: number;
}

interface ActivityReportData {
  summary: ActivitySummary;
  byCategory: ActivityCategory[];
  byMonth: MonthlyActivity[];
}

export function ActivityReportScreen({ onNavigate }: ActivityReportScreenProps) {
  // 2. Consume global theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ActivityReportData | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  // Use dynamic primary color for charts
  const COLORS = [theme.primary, "#0369A1", "#059669", "#7C3AED", "#DC2626"];

  const getDateRange = () => {
    const today = new Date();
    const to = today.toISOString().split("T")[0];
    let from = new Date(today);

    switch (dateRange) {
      case "week": from.setDate(today.getDate() - 7); break;
      case "month": from.setMonth(today.getMonth() - 1); break;
      case "year": from.setFullYear(today.getFullYear() - 1); break;
    }

    return { from: from.toISOString().split("T")[0], to };
  };

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const { from, to } = getDateRange();

      const { data, error } = await supabase
        .from("recorded_activities")
        .select("*")
        .gte("date", from)
        .lte("date", to);

      if (error) throw error;

      const validatedActivities = data?.filter((a: any) => a.status?.toLowerCase() === "validated").length || 0;
      const pendingActivities = data?.filter((a: any) => a.status?.toLowerCase() === "pending").length || 0;
      const rejectedActivities = data?.filter((a: any) => a.status?.toLowerCase() === "canceled").length || 0;

      const categoryMap: Record<string, { count: number; hours: number }> = {};
      data?.forEach((act: any) => {
        const type = act.activity_type || "Other";
        const hours = Number(act.duration) || 0;

        if (!categoryMap[type]) categoryMap[type] = { count: 0, hours: 0 };
        categoryMap[type].count += 1;
        categoryMap[type].hours += hours;
      });

      const byCategory = Object.entries(categoryMap).map(([category, val]) => ({
        category,
        count: val.count,
        hours: val.hours
      }));

      const monthMap: Record<string, number> = {};
      data?.forEach((act: any) => {
        const d = new Date(act.date);
        // Format month name based on language preference
        const locale = preferences.language_code === 'ms' ? 'ms-MY' : 'en-US';
        const monthLabel = d.toLocaleString(locale, { month: "short" }) + " " + d.getFullYear();
        const hours = Number(act.duration) || 0;

        if (!monthMap[monthLabel]) monthMap[monthLabel] = 0;
        monthMap[monthLabel] += hours;
      });

      const byMonth = Object.entries(monthMap).map(([month, hours]) => ({
        month,
        hours
      }));

      setReportData({
        summary: {
          totalActivities: data?.length || 0,
          totalHours: data?.reduce((sum: number, a: any) => sum + (Number(a.duration) || 0), 0),
          validatedActivities,
          pendingActivities,
          rejectedActivities
        },
        byCategory,
        byMonth
      });
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!reportData) return;
    const { summary, byCategory } = reportData;
    const text = `
UTMGo+ ${t("activity_report")}
Period: ${getDateRange().from} to ${getDateRange().to}

${t("nav_activity")}: ${summary.totalActivities}
${t("stat_total_hours")}: ${summary.totalHours}
${t("stat_validated")}: ${summary.validatedActivities}
${t("stat_pending")}: ${summary.pendingActivities}
${t("stat_rejected")}: ${summary.rejectedActivities}

By Category:
${byCategory.map(c => `${c.category}: ${c.count} activities, ${c.hours} hours`).join("\n")}
    `.trim();

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange, preferences.language_code]);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 py-6 border-b transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("activity-main")} style={{ color: theme.primary }}>
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <div>
            <h2 className="text-[20px] font-semibold" style={{ color: theme.text }}>
              {preferences.language_code === 'ms' ? 'Laporan Aktiviti' : 'Activity Report'}
            </h2>
            <p className="text-sm mt-1" style={{ lineHeight: "1.6", color: theme.textSecondary }}>
              {t("track_desc")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              className="flex-1 py-2 rounded-lg font-medium transition-all border"
              style={{ 
                backgroundColor: dateRange === range ? theme.primary : theme.cardBg,
                borderColor: dateRange === range ? theme.primary : theme.border,
                color: dateRange === range ? "#FFFFFF" : theme.textSecondary
              }}
              onClick={() => setDateRange(range as any)}
            >
              {range === 'week' ? t("popular_tag") : range === 'month' ? t("widget_upcoming") : t("default")}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        {reportData && !isLoading && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-xl flex flex-col items-start shadow-sm border transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <Activity className="w-5 h-5 mb-1" style={{ color: theme.primary }} />
                <div className="text-xl font-bold" style={{ color: theme.text }}>{reportData.summary.totalActivities}</div>
                <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>{t("nav_activity")}</div>
              </div>
              <div className="p-4 rounded-xl flex flex-col items-start shadow-sm border transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <Clock className="w-5 h-5 mb-1" style={{ color: theme.primary }} />
                <div className="text-xl font-bold" style={{ color: theme.text }}>{reportData.summary.totalHours}</div>
                <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>{t("stat_total_hours")}</div>
              </div>
            </div>

            {/* Charts Section */}
            {reportData.byCategory.length > 0 && (
              <div
                className="p-5 border shadow-sm transition-colors"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: "16px" }}
              >
                <h3 className="text-sm font-bold mb-4" style={{ color: theme.text }}>
                  {preferences.language_code === 'ms' ? 'Agihan Aktiviti Mengikut Kategori' : 'Activity Distribution by Category'}
                </h3>
                <Pie
                  data={{
                    labels: reportData.byCategory.map((c) => c.category),
                    datasets: [
                      {
                        label: "Activities",
                        data: reportData.byCategory.map((c) => c.count),
                        backgroundColor: COLORS,
                        borderWidth: preferences.theme_mode === 1 ? 0 : 1,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { labels: { color: theme.text, font: { size: 11 } } }
                    }
                  }}
                />
              </div>
            )}

            {reportData.byMonth && reportData.byMonth.length > 0 && (
              <div
                className="p-5 border shadow-sm transition-colors"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: "16px", marginTop: "20px" }}
              >
                <h3 className="text-sm font-bold mb-4" style={{ color: theme.text }}>
                  {preferences.language_code === 'ms' ? 'Jumlah Jam Aktiviti Bulanan' : 'Monthly Activity Hours'}
                </h3>
                <Bar
                  data={{
                    labels: reportData.byMonth.map((m) => m.month),
                    datasets: [
                      {
                        label: t("stat_total_hours"),
                        data: reportData.byMonth.map((m) => m.hours),
                        backgroundColor: theme.primary,
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: { ticks: { color: theme.textSecondary }, grid: { color: theme.border }, beginAtZero: true },
                      x: { ticks: { color: theme.textSecondary }, grid: { display: false } }
                    },
                    plugins: {
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            )}

            {/* List breakdown */}
            <div className="p-4 border rounded-2xl mb-4 shadow-sm transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border, marginTop: "20px" }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: theme.text }}>{t("interface_settings")}</h3>
              <div className="space-y-3">
                {reportData.byCategory.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-2 border-b last:border-0" style={{ borderColor: theme.border }}>
                    <span className="flex items-center gap-2 text-sm" style={{ color: theme.text }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      {cat.category}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: theme.text }}>{cat.count}</div>
                      <div className="text-[10px]" style={{ color: theme.textSecondary }}>{cat.hours}h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all"
              style={{ backgroundColor: theme.primary }}
              onClick={handleDownload}
            >
              <div className="flex items-center justify-center gap-2">
                <Download size={20} />
                {preferences.language_code === 'ms' ? 'Muat Turun Laporan' : 'Download Report'}
              </div>
            </button>
          </>
        )}
      </div>

      {isLoading && <p className="text-center py-10" style={{ color: theme.textSecondary }}>{t("view_all")}...</p>}
    </div>
  );
}