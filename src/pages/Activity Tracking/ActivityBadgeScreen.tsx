import {
  Plus,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowLeft,
  XCircle,
  Award
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

interface BadgeCollectionScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points?: number;
  description?: string;
  criteria?: string;
}

interface StudentBadge {
  badgeId: string;
  badge: Badge;
  status: "earned" | "pending" | "locked";
  earnedAt?: string;
  progress?: number;
  currentCount?: number;
  totalRequired?: number;
}

export function BadgeCollectionScreen({ onNavigate }: BadgeCollectionScreenProps) {
  const [badges, setBadges] = useState<StudentBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] =
    useState<"all" | "earned" | "pending" | "locked">("all");
  const [selectedBadge, setSelectedBadge] = useState<StudentBadge | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    earned: 0,
    pending: 0,
    locked: 0,
    totalPoints: 0
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setIsLoading(true);

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // ✅ Fetch ALL badges, LEFT JOIN student_badges
      const { data, error } = await supabase
        .from("badges")
        .select(`
          id,
          name,
          icon,
          rarity,
          points,
          description,
          criteria,
          student_badges (
            status,
            earned_at,
            progress,
            current_count,
            total_required
          )
        `)
        .eq("student_badges.student_id", user.id);

      if (error) throw error;

      const allBadges: StudentBadge[] = (data || []).map((b: any) => {
        const sb = b.student_badges?.[0]; // may be undefined

        return {
          badgeId: b.id,
          badge: {
            id: b.id,
            name: b.name,
            icon: b.icon || "🏅",
            rarity: b.rarity,
            points: b.points,
            description: b.description,
            criteria: b.criteria
          },
          status: sb?.status ?? "locked",
          earnedAt: sb?.earned_at,
          progress: sb?.progress ?? 0,
          currentCount: sb?.current_count ?? 0,
          totalRequired: sb?.total_required ?? 1
        };
      });

      setBadges(allBadges);

      // 📊 Stats
      setStats({
        total: allBadges.length,
        earned: allBadges.filter(b => b.status === "earned").length,
        pending: allBadges.filter(b => b.status === "pending").length,
        locked: allBadges.filter(b => b.status === "locked").length,
        totalPoints: allBadges.reduce(
          (sum, b) => sum + (b.status === "earned" ? b.badge.points ?? 0 : 0),
          0
        )
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load badges");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBadges =
    selectedFilter === "all"
      ? badges
      : badges.filter(b => b.status === selectedFilter);

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "";

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case "common":
        return {
          bg: "bg-gray-100",
          border: "border-gray-300",
          text: "text-gray-700"
        };
      case "rare":
        return {
          bg: "bg-blue-50",
          border: "border-blue-300",
          text: "text-blue-700"
        };
      case "epic":
        return {
          bg: "bg-purple-50",
          border: "border-purple-300",
          text: "text-purple-700"
        };
      case "legendary":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-300",
          text: "text-yellow-700"
        };
      default:
        return {
          bg: "bg-gray-100",
          border: "border-gray-300",
          text: "text-gray-700"
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7A0019] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f6] pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("activity-main")}>
            <ArrowLeft className="w-6 h-6 text-[#7A0019]" />
          </button>
          <div>
            <h2 className="text-[20px] font-semibold">Badge Collection</h2>
            <p className="text-[#6A6A6A] text-sm mt-1">
              Earn badges by completing activities
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="max-w-6xl mx-auto px-4 py-4">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white text-[#7A0019] rounded-lg p-3 shadow shadow-red-300">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs opacity-90">Points</span>
              </div>
              <div className="text-2xl">{stats.totalPoints}</div>
            </div>
            <div className="bg-white shadow shadow-green-300 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700">Earned</span>
              </div>
              <div className="text-2xl text-green-900">{stats.earned}</div>
            </div>
            <div className="bg-white shadow shadow-gray-400 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-700">Locked</span>
              </div>
              <div className="text-2xl text-gray-900">{stats.locked}</div>
            </div>
            <div className="bg-white shadow shadow-blue-300 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-700">Progress</span>
              </div>
              <div className="text-2xl text-blue-900">
                {stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-1 grid grid-cols-3 gap-2">
        {["all", "earned", "locked"].map(f => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f as any)}
            className={`px-4 py-2 rounded-lg ${
              selectedFilter === f
                ? "bg-[#7A0019] text-white"
                : "bg-white shadow"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.map(b => {
          const style = getRarityStyle(b.badge.rarity);
          const locked = b.status === "locked";

          return (
            <button
              key={b.badgeId}
              onClick={() => setSelectedBadge(b)}
              className={`border-2 rounded-xl p-4 bg-white text-center ${style.border} ${
                locked ? "opacity-60" : ""
              }`}
            >
              <div
                className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-4xl ${style.bg}`}
              >
                {locked ? <XCircle className="w-8 h-8 text-gray-400" /> : b.badge.icon}
              </div>

              <h3 className="text-sm font-medium">{b.badge.name}</h3>
              <div className={`text-xs mt-1 ${style.text}`}>
                {b.badge.rarity.charAt(0).toUpperCase() + b.badge.rarity.slice(1)}
              </div>

              {b.status === "earned" && b.earnedAt && (
                <div className="text-xs text-green-600 mt-1">
                  Earned {formatDate(b.earnedAt)}
                </div>
              )}

              {b.status === "locked" && (
                <div className="text-xs mt-2 text-gray-600">
                  {b.currentCount} / {b.totalRequired}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 bg-black/50 flex p-6 items-center justify-center"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-center mb-2">
              {selectedBadge.badge.name}
            </h2>
            <p className="text-sm text-gray-600 text-center">
              {selectedBadge.badge.description}
            </p>

            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-6 w-full bg-red-900 text-white py-2 rounded-lg "
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
