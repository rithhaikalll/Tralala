import { Download, Clock, CheckCircle, Activity, BarChart3, ArrowLeft} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Pie, Bar } from "react-chartjs-2";
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
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ActivityReportData | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  const COLORS = ["#7A0019", "#0369A1", "#059669", "#7C3AED", "#DC2626"];

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

      const totalActivities = data?.length || 0;
      // Status summary
      const validatedActivities = data?.filter((a: any) => a.status?.toLowerCase() === "validated").length || 0;
      const pendingActivities = data?.filter((a: any) => a.status?.toLowerCase() === "pending").length || 0;
      const rejectedActivities = data?.filter((a: any) => a.status?.toLowerCase() === "canceled").length || 0;

      // Category summary
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

      // --- Monthly Hours Summary ---
      const monthMap: Record<string, number> = {};

      data?.forEach((act: any) => {
        const d = new Date(act.date);
        const monthLabel = d.toLocaleString("default", { month: "short" }) + " " + d.getFullYear();
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
UTMGo+ Activity Report
Period: ${getDateRange().from} to ${getDateRange().to}

Total Activities: ${summary.totalActivities}
Total Hours: ${summary.totalHours}
Validated: ${summary.validatedActivities}
Pending: ${summary.pendingActivities}
Rejected: ${summary.rejectedActivities}

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
  }, [dateRange]);

  return (
    <div className="min-h-screen bg-[#f7f7f6] pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("activity-main")} style={{ color: "#7A0019" }}>
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <div>
            <h2 className="text-[20px] font-semibold">Activity Report</h2>
            <p className="text-[#6A6A6A] text-sm mt-1" style={{lineHeight: "1.6"}}>Generate comprehensive activity summary</p>
          </div>
        </div>
      </div>

      <div className="min-h-screen p-6 space-y-6">
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["week", "month", "year"].map((range) => (
          <button
            key={range}
            className={`flex-1 py-2 rounded-lg ${dateRange === range ? "bg-[#7A0019] text-white" : "bg-white border border-gray-200 text-gray-700"}`}
            onClick={() => setDateRange(range as any)}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary */}
      {reportData && !isLoading && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-4 bg-white rounded-lg flex flex-col items-start shadow">
              <Activity className="w-5 h-5 mb-1 text-[#7A0019]" />
              <div className="text-xl font-semibold">{reportData.summary.totalActivities}</div>
              <div className="text-gray-500 text-sm">Total Activities</div>
            </div>
            <div className="p-4 bg-white rounded-lg flex flex-col items-start shadow">
              <Clock className="w-5 h-5 mb-1 text-[#7A0019]" />
              <div className="text-xl font-semibold">{reportData.summary.totalHours}</div>
              <div className="text-gray-500 text-sm">Total Hours</div>
            </div>
            <div className="p-4 bg-white rounded-lg flex flex-col items-start shadow">
              <CheckCircle className="w-5 h-5 mb-1 text-blue-600" />
              <div className="text-xl font-semibold">{reportData.summary.validatedActivities}</div>
              <div className="text-blue-600 text-sm">Validated</div>
            </div>
          </div>

          {/* Charts Section */}
          {reportData.byCategory.length > 0 && (
            <div
              className="p-5 border bg-white shadow"
              style={{ borderColor: "#E5E5E5", borderRadius: "12px" }}
            >
              <h3
                style={{
                  color: "#1A1A1A",
                  fontWeight: "600",
                  fontSize: "16px",
                  marginBottom: "16px",
                }}
              >
                Activity Distribution by Category
              </h3>

              <Pie
                data={{
                  labels: reportData.byCategory.map((c) => c.category),
                  datasets: [
                    {
                      label: "Activities",
                      data: reportData.byCategory.map((c) => c.count),
                      backgroundColor: ["#7A0019", "#0369A1", "#059669", "#7C3AED", "#DC2626"],
                      borderWidth: 1,
                    },
                  ],
                }}
              />
            </div>
          )}

          {reportData.byMonth && reportData.byMonth.length > 0 && (
            <div
              className="p-5 border bg-white shadow"
              style={{ borderColor: "#E5E5E5", borderRadius: "12px", marginTop: "20px" }}
            >
              <h3
                style={{
                  color: "#1A1A1A",
                  fontWeight: "600",
                  fontSize: "16px",
                  marginBottom: "16px",
                }}
              >
                Monthly Activity Hours
              </h3>

              <Bar
                data={{
                  labels: reportData.byMonth.map((m) => m.month),
                  datasets: [
                    {
                      label: "Hours",
                      data: reportData.byMonth.map((m) => m.hours),
                      backgroundColor: "#7A0019",
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          )}

          {/* Category Breakdown */}
          <div className="p-4 border rounded mb-4 bg-white shadow" style={{ borderColor: "#E5E5E5", borderRadius: "12px", marginTop: "20px" }}>
            <h3 className="font-semibold mb-2">Activity Types</h3>
            {reportData.byCategory.map((cat, idx) => (
              <div key={idx} className="flex justify-between mb-1">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {cat.category}
                </span>
                <div className="text-right">
                  <div style={{ color: "#1A1A1A", fontSize: "14px", fontWeight: "600" }}>
                    {cat.count} activities
                  </div>
                  <div style={{ color: "#6A6A6A", fontSize: "12px" }}>
                    {cat.hours} hours
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="w-full py-2 border bg-[#7A0019] border-[#7A0019] text-white rounded flex items-center justify-center gap-2"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5" /> Download Report
          </button>
        </>
      )}
      </div>

      {isLoading && <p className="text-center text-gray-500">Loading report...</p>}
      {!reportData && !isLoading && <p className="text-center text-gray-400">No report data available</p>}
    </div>
  );
}
