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
// Accessing global preferences
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
  // Consume theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  
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
          student_badges ( status, earned_at, progress, current_count, total_required )
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

  // Formatting date based on language_code
  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString(preferences.language_code === 'ms' ? 'ms-MY' : 'en-US', {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "";

  const getRarityStyle = (rarity: string) => {
    const isDark = preferences.theme_mode === 1;
    switch (rarity) {
      case "common":
        return { bg: isDark ? "bg-gray-800" : "bg-gray-100", border: isDark ? "border-gray-700" : "border-gray-300", text: isDark ? "text-gray-400" : "text-gray-700" };
      case "rare":
        return { bg: isDark ? "bg-blue-900/30" : "bg-blue-50", border: isDark ? "border-blue-800" : "border-blue-300", text: "text-blue-500" };
      case "epic":
        return { bg: isDark ? "bg-purple-900/30" : "bg-purple-50", border: isDark ? "border-purple-800" : "border-purple-300", text: "text-purple-500" };
      case "legendary":
        return { bg: isDark ? "bg-yellow-900/30" : "bg-yellow-50", border: isDark ? "border-yellow-800" : "border-yellow-300", text: "text-yellow-600" };
      default:
        return { bg: isDark ? "bg-gray-800" : "bg-gray-100", border: isDark ? "border-gray-700" : "border-gray-300", text: "text-gray-400" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme.primary }} />
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
              {/* Manual translation for missing key */}
              {preferences.language_code === 'ms' ? 'Koleksi Lencana' : 'Badge Collection'}
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              {t("track_desc")}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg p-3 border transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4" style={{ color: theme.primary }} />
              <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>{t("stat_total_hours")}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.text }}>{stats.totalPoints}</div>
          </div>
          
          <div className="rounded-lg p-3 border transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">{t("stat_validated")}</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.earned}</div>
          </div>

          <div className="rounded-lg p-3 border transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500 font-medium">{t("stat_rejected")}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.text }}>{stats.locked}</div>
          </div>

          <div className="rounded-lg p-3 border transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-500 font-medium">{t("stat_pending")}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.text }}>
              {stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0}%
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
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 border"
            style={{ 
                backgroundColor: selectedFilter === f ? theme.primary : theme.cardBg,
                borderColor: selectedFilter === f ? theme.primary : theme.border,
                color: selectedFilter === f ? "#FFFFFF" : theme.text
            }}
          >
            {f === 'all' ? t('view_all') : f === 'earned' ? t('stat_validated') : t('stat_rejected')}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredBadges.map(b => {
          const style = getRarityStyle(b.badge.rarity);
          const locked = b.status === "locked";

          return (
            <button
              key={b.badgeId}
              onClick={() => setSelectedBadge(b)}
              className={`border-2 rounded-xl p-4 text-center transition-all active:scale-95 ${style.border} ${
                locked ? "opacity-50 grayscale" : ""
              }`}
              style={{ backgroundColor: theme.cardBg }}
            >
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-4xl shadow-inner ${style.bg}`}>
                {locked ? <XCircle className="w-8 h-8" style={{ color: theme.textSecondary }} /> : b.badge.icon}
              </div>

              <h3 className="text-sm font-bold" style={{ color: theme.text }}>{b.badge.name}</h3>
              <div className={`text-[10px] font-black uppercase tracking-wider mt-1 ${style.text}`}>
                {b.badge.rarity}
              </div>

              {b.status === "earned" && b.earnedAt && (
                <div className="text-[10px] text-green-600 mt-2 font-bold py-1 rounded">
                  {t("stat_validated")} {formatDate(b.earnedAt)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex p-6 items-center justify-center z-50 animate-in fade-in"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="rounded-2xl p-8 max-w-md w-full shadow-2xl border"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-6xl" style={{ backgroundColor: theme.background }}>
                {selectedBadge.status === "locked" ? <XCircle className="w-12 h-12" style={{ color: theme.textSecondary }} /> : selectedBadge.badge.icon}
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: theme.text }}>
              {selectedBadge.badge.name}
            </h2>
            <p className="text-sm text-center leading-relaxed" style={{ color: theme.textSecondary }}>
              {selectedBadge.badge.description}
            </p>

            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-8 w-full py-3 rounded-xl font-bold text-white transition-transform active:scale-95"
              style={{ backgroundColor: theme.primary }}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}