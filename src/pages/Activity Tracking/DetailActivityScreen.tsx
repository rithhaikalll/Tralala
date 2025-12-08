// DetailActivityScreen.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

interface DetailActivityScreenProps {
  activityId: string;
  onNavigate?: (screen: string) => void;
}

export default function DetailActivityScreen({
  activityId,
}: DetailActivityScreenProps) {
  const navigate = useNavigate();

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch logged-in user
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    }
    fetchUser();
  }, []);

  // Fetch activity by id
  useEffect(() => {
    async function fetchActivity() {
      if (!activityId) return;

      const { data, error } = await supabase
        .from("recorded_activities")
        .select("*")
        .eq("id", activityId)
        .single();

      if (!error) setActivity(data);
      setLoading(false);
    }

    fetchActivity();
  }, [activityId]);

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (!activity) return <p className="p-6 text-red-500">Activity not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h1 className="text-xl font-semibold">Activity Details</h1>
        </div>
      </div>

      {/* Activity Card */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-100">
          <DetailRow label="Activity Name" value={activity.activity_name} />
          <DetailRow label="Activity Type" value={activity.activity_type} />
          <DetailRow label="Date" value={activity.date} />
          <DetailRow label="Duration" value={`${activity.duration} hours`} />
          <DetailRow label="Remark" value={activity.remark || "—"} />
          <DetailRow label="Status" value={activity.status} />
          <DetailRow label="Recorded By" value={activity.recorded_by} />
          <DetailRow
            label="Recorded At"
            value={
              activity.recorded_date
                ? new Date(activity.recorded_date).toLocaleDateString()
                : "N/A"
            }
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-start border-b pb-3 last:border-none">
      <p className="text-gray-500 font-medium">{label}</p>
      <p className="text-gray-800 font-semibold text-right max-w-[60%]">
        {value}
      </p>
    </div>
  );
}
