import {
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowLeft,
  XCircle,
  Award
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

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
  // --- 1. SINKRONISASI TEMA & BAHASA ---
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';
  const isDark = preferences.theme_mode === 1;

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("badges")
        .select(`
          id, name, icon, rarity, points, description, criteria,
          student_badges (
            status, earned_at, progress, current_count, total_required
          )
        `)
        .eq("student_badges.student_id", user.id);

      if (error) throw error;

      const allBadges: StudentBadge[] = (data || []).map((b: any) => {
        const sb = b.student_badges?.[0];
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
      ? new Date(date).toLocaleDateString(isMs ? "ms-MY" : "en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "";

  // --- 2. GAYA RARITY DINAMIK MENGIKUT TEMA ---
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case "common":
        return {
          bg: isDark ? "rgba(113, 113, 122, 0.1)" : "bg-gray-100",
          border: isDark ? "border-zinc-700" : "border-gray-300",
          text: isDark ? "text-zinc-400" : "text-gray-700"
        };
      case "rare":
        return {
          bg: isDark ? "rgba(59, 130, 246, 0.1)" : "bg-blue-50",
          border: isDark ? "border-blue-900/50" : "border-blue-300",
          text: "text-blue-500"
        };
      case "epic":
        return {
          bg: isDark ? "rgba(168, 85, 247, 0.1)" : "bg-purple-50",
          border: isDark ? "border-purple-900/50" : "border-purple-300",
          text: "text-purple-500"
        };
      case "legendary":
        return {
          bg: isDark ? "rgba(234, 179, 8, 0.1)" : "bg-yellow-50",
          border: isDark ? "border-yellow-900/50" : "border-yellow-300",
          text: "text-yellow-600"
        };
      default:
        return {
          bg: isDark ? "rgba(113, 113, 122, 0.1)" : "bg-gray-100",
          border: "border-gray-300",
          text: "text-gray-700"
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="w-8 h-8 border-4 animate-spin rounded-full" style={{ borderColor: theme.primary, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 py-6 border-b" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("activity-main")}>
            <ArrowLeft className="w-6 h-6" style={{ color: theme.primary }} />
          </button>
          <div>
            <h2 className="text-[20px] font-semibold" style={{ color: theme.text }}>
              {isMs ? "Koleksi Lencana" : "Badge Collection"}
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              {isMs ? "Kumpul lencana dengan melengkapkan aktiviti" : "Earn badges by completing activities"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg p-3 border shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4" style={{ color: theme.primary }} />
              <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>{isMs ? "Mata" : "Points"}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.text }}>{stats.totalPoints}</div>
          </div>
          
          <div className="rounded-lg p-3 border shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>{isMs ? "Diterima" : "Earned"}</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.earned}</div>
          </div>

          <div className="rounded-lg p-3 border shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>{isMs ? "Terkunci" : "Locked"}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.text }}>{stats.locked}</div>
          </div>

          <div className="rounded-lg p-3 border shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>Progress</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {["all", "earned", "locked"].map(f => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f as any)}
              className="px-4 py-2 rounded-lg font-medium transition-all border"
              style={{
                backgroundColor: selectedFilter === f ? theme.primary : theme.cardBg,
                color: selectedFilter === f ? "#FFFFFF" : theme.textSecondary,
                borderColor: selectedFilter === f ? theme.primary : theme.border
              }}
            >
              {f === 'all' ? (isMs ? "Semua" : "All") : 
               f === 'earned' ? (isMs ? "Diterima" : "Earned") : 
               (isMs ? "Terkunci" : "Locked")}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBadges.map(b => {
            const style = getRarityStyle(b.badge.rarity);
            const locked = b.status === "locked";

            return (
              <button
                key={b.badgeId}
                onClick={() => setSelectedBadge(b)}
                className={`border-2 rounded-xl p-4 text-center transition-all active:scale-95 ${style.border}`}
                style={{ 
                    backgroundColor: theme.cardBg, 
                    opacity: locked ? 0.5 : 1 
                }}
              >
                <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-4xl border ${style.bg} ${style.border}`}>
                  {locked ? <XCircle className="w-8 h-8 text-zinc-500" /> : b.badge.icon}
                </div>

                <h3 className="text-sm font-bold" style={{ color: theme.text }}>{b.badge.name}</h3>
                <div className={`text-[10px] font-black uppercase mt-1 ${style.text}`}>
                  {b.badge.rarity}
                </div>

                {b.status === "earned" && b.earnedAt && (
                  <div className="text-[10px] text-green-500 font-bold mt-1">
                    {isMs ? "Diterima" : "Earned"} {formatDate(b.earnedAt)}
                  </div>
                )}

                {locked && (
                  <div className="text-[10px] mt-2 font-bold" style={{ color: theme.textSecondary }}>
                    {b.currentCount} / {b.totalRequired}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal Detail */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/60 flex p-6 items-center justify-center z-[60] backdrop-blur-sm" onClick={() => setSelectedBadge(null)}>
          <div 
            className="rounded-2xl p-6 max-w-sm w-full border animate-in zoom-in-95" 
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            onClick={e => e.stopPropagation()}
          >
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-5xl ${getRarityStyle(selectedBadge.badge.rarity).bg}`}>
              {selectedBadge.status === 'locked' ? "🔒" : selectedBadge.badge.icon}
            </div>
            <h2 className="text-xl font-bold text-center mb-2" style={{ color: theme.text }}>
              {selectedBadge.badge.name}
            </h2>
            <p className="text-sm text-center mb-6" style={{ color: theme.textSecondary }}>
              {selectedBadge.badge.description || (isMs ? "Tiada penerangan." : "No description available.")}
            </p>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{ backgroundColor: theme.primary }}
            >
              {isMs ? "Tutup" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}