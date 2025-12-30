import { Download, Clock, Activity, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Pie, Bar } from "react-chartjs-2";
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
  const { theme, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';
  const isDark = preferences.theme_mode === 1;
  
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ActivityReportData | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

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
      const { data, error } = await supabase.from("recorded_activities").select("*").gte("date", from).lte("date", to);
      if (error) throw error;

      const categoryMap: Record<string, { count: number; hours: number }> = {};
      data?.forEach((act: any) => {
        const type = act.activity_type || "Other";
        const hours = Number(act.duration) || 0;
        if (!categoryMap[type]) categoryMap[type] = { count: 0, hours: 0 };
        categoryMap[type].count += 1;
        categoryMap[type].hours += hours;
      });

      const monthMap: Record<string, number> = {};
      data?.forEach((act: any) => {
        const d = new Date(act.date);
        const locale = isMs ? 'ms-MY' : 'en-US';
        const monthLabel = d.toLocaleString(locale, { month: "short" }) + " " + d.getFullYear();
        if (!monthMap[monthLabel]) monthMap[monthLabel] = 0;
        monthMap[monthLabel] += Number(act.duration) || 0;
      });

      setReportData({
        summary: {
          totalActivities: data?.length || 0,
          totalHours: data?.reduce((sum: number, a: any) => sum + (Number(a.duration) || 0), 0) || 0,
          validatedActivities: data?.filter((a: any) => a.status?.toLowerCase() === "validated").length || 0,
          pendingActivities: data?.filter((a: any) => a.status?.toLowerCase() === "pending").length || 0,
          rejectedActivities: data?.filter((a: any) => a.status?.toLowerCase() === "canceled").length || 0,
        },
        byCategory: Object.entries(categoryMap).map(([category, val]) => ({ category, count: val.count, hours: val.hours })),
        byMonth: Object.entries(monthMap).map(([month, hours]) => ({ month, hours }))
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!reportData) return;
    const { summary, byCategory } = reportData;
    const text = `UTMGo+ Activity Report\nPeriod: ${getDateRange().from} to ${getDateRange().to}\n\nTotal Hours: ${summary.totalHours}\nValidated: ${summary.validatedActivities}\n\nBy Category:\n${byCategory.map(c => `${c.category}: ${c.hours} hours`).join("\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
  };

  useEffect(() => { fetchReport(); }, [dateRange, preferences.language_code]);

  return (
    <div className="min-h-screen transition-colors duration-300" 
      style={{ 
          backgroundColor: 
          preferences.theme_mode === 1
          ? theme.background
          : "#f9fafb" 
        }}
      >
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 py-6 border-b" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("activity-main")} style={{ color: theme.primary }}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-[20px] font-semibold" style={{ color: theme.text }}>{isMs ? "Laporan Aktiviti" : "Activity Report"}</h2>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>{isMs ? "Jana komprehensif ringkasan aktiviti" : "Generate comprehensive activity summary"}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 pb-32"> 
        <div className="flex gap-2">
          {["week", "month", "year"].map((range) => (
            <button key={range} className="flex-1 py-2 rounded-lg font-medium border"
              style={{ backgroundColor: dateRange === range ? theme.primary : theme.cardBg, borderColor: theme.border, color: dateRange === range ? "#FFF" : theme.textSecondary }}
              onClick={() => setDateRange(range as any)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {reportData && !isLoading && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl shadow-sm border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <Activity className="w-5 h-5 mb-1" style={{ color: theme.primary }} />
                <div className="text-xl font-bold" style={{ color: theme.text }}>{reportData.summary.totalActivities}</div>
                <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>{isMs ? "Jumlah Aktiviti" : "Total Activities"}</div>
              </div>
              <div className="p-4 rounded-xl shadow-sm border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <Clock className="w-5 h-5 mb-1" style={{ color: theme.primary }} />
                <div className="text-xl font-bold" style={{ color: theme.text }}>{reportData.summary.totalHours}</div>
                <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>{isMs ? "Jumlah Jam" : "Total Hours"}</div>
              </div>
            </div>

            {reportData.byCategory.length > 0 && (
              <div className="p-5 border shadow-sm rounded-2xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: theme.text }}>{isMs ? "Agihan Aktiviti berdasarkan Kategori" : "Activity Distribution by Category"}</h3>
                <Pie data={{ labels: reportData.byCategory.map(c => c.category), datasets: [{ data: reportData.byCategory.map(c => c.count), backgroundColor: COLORS, borderWidth: isDark ? 0 : 1 }] }} 
                  options={{ plugins: { legend: { position: 'bottom', labels: { color: theme.text, boxWidth: 10 } } } }} />
              </div>
            )}

            {reportData.byMonth.length > 0 && (
              <div className="p-5 border shadow-sm rounded-2xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: theme.text }}>{isMs ? "Jam Aktiviti Bulanan" : "Monthly Activity Hours"}</h3>
                <Bar data={{ labels: reportData.byMonth.map(m => m.month), datasets: [{ label: "Hours", data: reportData.byMonth.map(m => m.hours), backgroundColor: theme.primary, borderRadius: 6 }] }}
                  options={{ scales: { y: { beginAtZero: true, ticks: { color: theme.textSecondary } }, x: { ticks: { color: theme.textSecondary } } }, plugins: { legend: { display: false } } }} />
              </div>
            )}

            <div className="p-4 border rounded-xl shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: theme.text }}>{isMs ? "Pecahan Aktiviti" : "Activity Types"}</h3>
              <div className="space-y-3">
                {reportData.byCategory.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-2 border-b last:border-0" style={{ borderColor: theme.border }}>
                    <span className="text-sm" style={{ color: theme.text }}>{cat.category}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: theme.text }}>{cat.count}</div>
                      <div className="text-[10px]" style={{ color: theme.textSecondary }}>{cat.hours}h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all"
              style={{ backgroundColor: theme.primary }} onClick={handleDownload}>
              <div className="flex items-center justify-center gap-2">
                <Download size={20} />
                {isMs ? 'Muat Turun Laporan' : 'Download Report'}
              </div>
            </button>
          </>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme.primary, borderTopColor: 'transparent' }} />
        </div>
      )}
    </div>
  );
}