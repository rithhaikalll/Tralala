import { Plus, Clock, CheckCircle, Edit2, TrendingUp, FileText, XCircle, Award, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
// Accessing global preferences
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface ActivityMainScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  studentName?: string;
  userRole?: "student" | "staff";
  userId?: string;
}

export function ActivityMainScreen({
  onNavigate,
  userRole,
  userId,
}: ActivityMainScreenProps) {
  // Consume theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  
  const [activities, setActivities] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "Pending" | "Validated" | "Rejected">("all");
  const [loading, setLoading] = useState(true);

  // Dynamic status colors based on theme
  const getStatusColor = (status: string) => {
    const isDark = preferences.theme_mode === 1;
    switch (status?.toLowerCase()) {
      case "validated":
        return { bg: isDark ? "#064e3b" : "#F0F9FF", text: isDark ? "#34d399" : "#0369A1", icon: CheckCircle };
      case "pending":
        return { bg: isDark ? "#7c2d12" : "#FFF7ED", text: isDark ? "#fb923c" : "#C2410C", icon: Clock };
      case "rejected":
        return { bg: isDark ? "#7f1d1d" : "#FEF2F2", text: isDark ? "#f87171" : "#991B1B", icon: XCircle };
      default:
        return { bg: theme.border, text: theme.textSecondary, icon: Clock };
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    let query = supabase.from("recorded_activities").select("*").order("date", { ascending: false });

    if (userRole === "student" && userId) {
      query = query.eq("student_id", userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error loading activities:", error);
      setActivities([]);
    } else {
      setActivities(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!userRole) return;
    loadActivities();
  }, [userRole, userId]);

  const filteredActivities = filterStatus === "all"
    ? activities
    : activities.filter((a) => a.status?.toLowerCase() === filterStatus.toLowerCase());

  const totalHours = activities
    .filter((a) => a.status?.toLowerCase() === "validated")
    .reduce((sum, a) => sum + Number(a.duration), 0);

  const pendingCount = activities.filter((a) => a.status?.toLowerCase() === "pending").length;
  const validatedCount = activities.filter((a) => a.status?.toLowerCase() === "validated").length;

  const renderActivityCard = (activity: any) => {
    const colors = getStatusColor(activity.status);
    const isOwner = userRole === "student" && activity.student_id?.toString() === userId?.toString();
    const isPending = activity.status?.toLowerCase() === "pending";

    return (
      <div
        key={activity.id}
        className="border p-5 rounded-lg cursor-pointer transition-colors"
        style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
        onClick={() =>
          onNavigate(
            userRole === "staff" ? "staff-activity-detail" : "detailactivity",
            activity.id
          )
        }
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-[16px] mb-2" style={{ color: theme.text }}>{activity.activity_name}</h3>
          </div>

          {(userRole === "student" && isPending && isOwner) || (userRole === "staff") ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("edit-activity", activity.id);
              }}
              className="p-2 rounded-lg transition-colors shadow-sm"
              style={{ backgroundColor: theme.background }}
            >
              <Edit2 className="w-4 h-4" style={{ color: theme.textSecondary }} />
            </button>
          ) : null}
        </div>

        <div className="flex gap-2 mb-2">
          <span className="px-2 py-1 text-xs rounded inline-flex items-center gap-1" style={{ backgroundColor: colors.bg, color: colors.text}}>
            <colors.icon size={12} color={colors.text}/>
            {activity.status === "Validated" ? t("stat_validated") : activity.status === "Pending" ? t("stat_pending") : t("stat_rejected")}
          </span>
          <span className="text-sm" style={{ color: theme.textSecondary }}>{activity.activity_type}</span>
        </div>

        <div className="space-y-1 text-sm mb-3">
          {userRole === "staff" && activity.recorded_by && (
            <div className="flex justify-between">
              <span style={{ color: theme.textSecondary }}>Submitted by</span>
              <span style={{ color: theme.text }}>{activity.recorded_by}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span style={{ color: theme.textSecondary }}>{t("date") || "Date"}</span>
            <span style={{ color: theme.text }}>
              {new Date(activity.date).toLocaleDateString(preferences.language_code === 'ms' ? 'ms-MY' : 'en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: theme.textSecondary }}>{t("duration") || "Duration"}</span>
            <span style={{ color: theme.text }}>{activity.duration}h</span>
          </div>

          {activity.status?.toLowerCase() === "rejected" && activity.rejection_reason && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-200/20 text-red-700 rounded text-sm">
              <span className="font-medium">Reason:</span> {activity.rejection_reason}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 transition-colors" 
        style={{ 
          backgroundColor: 
          preferences.theme_mode === 1
          ? theme.background
          : "#f9fafb" 
        }}
      >
      {/* Header */}
      <div className="px-6 py-6 border-b" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
        <h2 className="text-[20px] font-semibold" style={{ color: theme.text }}>
          {userRole === "staff" ? "Activity Verification" : "Activity Tracking"}
        </h2>
        <p className="text-sm mt-1" style={{ lineHeight: "1.6", color: theme.textSecondary }}>
          {userRole === "staff"
            ? "Review and validate student submissions"
            : "Record and track your sports activities"}
        </p>
      </div>

      {userRole === "student" && (
      <>
      {/* Stats */}
      <div className="px-6 pt-6 pb-4 grid grid-cols-3 gap-3">
        <div className="p-4 shadow rounded-lg" style={{ backgroundColor: theme.cardBg }}>
          <TrendingUp className="w-5 h-5 mb-2" style={{ color: theme.primary }} />
          <div className="text-lg font-semibold" style={{ color: theme.text }}>{totalHours}</div>
          <div className="text-xs" style={{ color: theme.textSecondary }}>{t("stat_total_hours")}</div>
        </div>
        <div className="p-4 shadow rounded-lg" style={{ backgroundColor: theme.cardBg }}>
          <Clock className="w-5 h-5 mb-2" style={{ color: "#C2410C" }} />
          <div className="text-lg font-semibold" style={{ color: theme.text }}>{pendingCount}</div>
          <div className="text-xs" style={{ color: "#C2410C" }}>{t("stat_pending")}</div>
        </div>
        <div className="p-4 shadow rounded-lg" style={{ backgroundColor: theme.cardBg }}>
          <CheckCircle className="w-5 h-5 mb-2" style={{ color: "#0369A1" }} />
          <div className="text-lg font-semibold" style={{ color: theme.text }}>{validatedCount}</div>
          <div className="text-xs" style={{ color: "#0369A1" }}>{t("stat_validated")}</div>
        </div>
      </div>

      {/* Record Button */}
      <div className="px-6 pb-3">
        <button
          onClick={() => onNavigate("activity-record")}
          className="w-full h-12 text-white rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          style={{ backgroundColor: theme.primary }}
        >
          <Plus className="w-5 h-5" /> {preferences.language_code === 'ms' ? 'Rekod Aktiviti Baharu' : 'Record New Activity'}
        </button>
      </div>

      <div className="px-6 pb-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => onNavigate("activity-events")}
          className="border rounded-lg p-3 text-center transition-colors"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <CalendarDays className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <p className="text-xs" style={{ color: theme.text }}>{preferences.language_code === 'ms' ? 'Acara' : 'Event'}</p>
        </button>
        <button
          onClick={() => onNavigate("badges")}
          className="border rounded-lg p-3 text-center transition-colors"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <Award className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <p className="text-xs" style={{ color: theme.text }}>{preferences.language_code === 'ms' ? 'Lencana' : 'Badges'}</p>
        </button>
        <button
          onClick={() => onNavigate("activity-report")}
          className="border rounded-lg p-3 text-center transition-colors"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <FileText className="w-5 h-5 mx-auto mb-1" style={{ color: theme.textSecondary }} />
          <p className="text-xs" style={{ color: theme.text }}>{preferences.language_code === 'ms' ? 'Laporan' : 'Report'}</p>
        </button>
      </div>

      {/* Event Reminders Section - Quick Access */}
      <div className="px-6 pb-3">
        <button
          onClick={() => onNavigate("event-reminders")}
          className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          <CalendarDays className="w-5 h-5" />
          <span>View Activity Reminders</span>
        </button>
      </div>
      </>
      )}

      {userRole === "staff" && (
      <>
      <div className="px-6 pb-4 grid grid-cols-1 gap-2 mt-5">
        <button
          onClick={() => onNavigate("activity-events")}
          className="border rounded-lg p-3 text-center transition-colors"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <CalendarDays className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <p className="text-xs" style={{ color: theme.text }}>{preferences.language_code === 'ms' ? 'Acara' : 'Event'}</p>
        </button>
      </div>
      </>
      )}

      {/* Filters */}
      <div className="px-6 py-2 pb-4 grid gap-2 grid-cols-4">
        {["all", "Pending", "Validated", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab as any)}
            className="px-4 py-2 rounded-md text-sm font-medium border transition-all flex items-center justify-center text-center"
            style={{
              backgroundColor: filterStatus === tab ? theme.primary : theme.cardBg,
              color: filterStatus === tab ? "#FFF" : theme.textSecondary,
              borderColor: filterStatus === tab ? theme.primary : theme.border,
            }}
          >
            {tab === "all" ? t("view_all") : tab === "Pending" ? t("stat_pending") : tab === "Validated" ? t("stat_validated") : t("stat_rejected")}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="px-6 space-y-3">
        {loading && <p className="text-center py-6" style={{ color: theme.textSecondary }}>{t("view_all")}...</p>}
        {filteredActivities.map((activity) => renderActivityCard(activity))}
      </div>
    </div>
  );
}