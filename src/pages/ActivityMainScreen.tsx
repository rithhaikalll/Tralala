import { Plus, Clock, CheckCircle, Edit2, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

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
  const [activities, setActivities] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "Pending" | "Validated" | "Rejected">("all");
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "validated":
        return { bg: "#F0F9FF", text: "#0369A1" };
      case "pending":
        return { bg: "#FFF7ED", text: "#C2410C" };
      case "rejected":
        return { bg: "#FEF2F2", text: "#991B1B" };
      default:
        return { bg: "#F5F5F5", text: "#6A6A6A" };
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
    loadActivities();
  }, []);

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

    // check if student is owner
    const isOwner = 
      userRole === "student" && 
      activity.student_id?.toString() === userId?.toString();
    const isPending = activity.status?.toLowerCase() === "pending";

    return (
      <div
        key={activity.id}
        className="border bg-white p-5 rounded-lg cursor-pointer"
        style={{ borderColor: "#E5E5E5" }}
        onClick={() =>
          onNavigate(
            userRole === "staff" ? "staff-activity-detail" : "detailactivity",
            activity.id
          )
        }
      >
        <h3 className="font-semibold text-[16px] mb-2">{activity.activity_name}</h3>
        <div className="flex gap-2 mb-2">
          <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: colors.bg, color: colors.text }}>
            {activity.status}
          </span>
          <span className="text-[#6A6A6A] text-sm">{activity.activity_type}</span>
        </div>

        <div className="text-sm text-[#444] mb-2">
          {new Date(activity.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>

        {/* Edit button for pending activities of student owner */}
        {userRole === "student" &&
        isPending &&
        isOwner && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("edit-activity", activity.id); // navigate to edit screen
            }}
            className="w-full h-10 border rounded text-[#6A6A6A] flex items-center justify-center mt-2"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit Activity
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "#E5E5E5", transform: "none"}}>
        <h2 className="text-[20px] font-semibold">
          {userRole === "staff" ? "Activity Validation" : "Activity Tracking"}
        </h2>
        <p className="text-[#6A6A6A] text-sm mt-1" style={{lineHeight: "1.6"}}>
          {userRole === "staff"
            ? "Review and validate student submissions"
            : "Record and track your sports activities"}
        </p>
      </div>

      {/* Stats */}
      <div className="px-6 pt-6 pb-4 grid grid-cols-3 gap-3">
        <div className="p-4 border rounded-lg bg-[#FFF7ED]">
          <Clock className="w-5 h-5 mb-2 text-[#C2410C]" />
          <div className="text-lg font-semibold">{pendingCount}</div>
          <div className="text-xs text-[#C2410C]">Pending</div>
        </div>
        <div className="p-4 border rounded-lg bg-[#F0F9FF]">
          <CheckCircle className="w-5 h-5 mb-2 text-[#0369A1]" />
          <div className="text-lg font-semibold">{validatedCount}</div>
          <div className="text-xs text-[#0369A1]">Validated</div>
        </div>
        <div className="p-4 border rounded-lg bg-[#FAFAFA]">
          <TrendingUp className="w-5 h-5 mb-2 text-[#7A0019]" />
          <div className="text-lg font-semibold">{totalHours}</div>
          <div className="text-xs text-[#6A6A6A]">Total Hours</div>
        </div>
      </div>

      {/* Record Button */}
      <div className="px-6 pb-5">
        <button
          onClick={() => onNavigate("activity-record")}
          className="w-full h-12 bg-[#7A0019] text-white rounded-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Record New Activity
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 pb-4 flex gap-2 overflow-auto">
        {["all", "Pending", "Validated", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab as any)}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: filterStatus === tab ? "#7A0019" : "#FFF",
              color: filterStatus === tab ? "#FFF" : "#6A6A6A",
              border: filterStatus === tab ? "none" : "1px solid #E5E5E5",
            }}
          >
            {tab === "all" ? (userRole === "staff" ? "All Submissions" : "All Activities") : tab}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="px-6 space-y-4">
        {loading && <p className="text-center text-[#888] py-6">Loading...</p>}
        {filteredActivities.map((activity) => renderActivityCard(activity))}
      </div>
    </div>
  );
}
