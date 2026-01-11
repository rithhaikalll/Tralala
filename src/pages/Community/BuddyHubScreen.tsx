import { ArrowLeft, Search, Users, User } from "lucide-react";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface BuddyHubScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onSearch: (userId: string) => void;
  buddyRequests: any[];
  connectedBuddies: any[]; // Receiving real data
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  buddyChats: any[];
}

export function BuddyHubScreen({
  onNavigate,
  buddyRequests,
  connectedBuddies,
}: BuddyHubScreenProps) {
  const { theme, t } = useUserPreferences();

  // Count incoming pending requests
  const pendingCount = buddyRequests.filter(r => r.isIncoming && r.status === "Pending").length;

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: theme.background }}>
      <div className="sticky top-0 z-40 px-6 py-6 border-b" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("community")} style={{ color: theme.primary }}>
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: theme.text, fontWeight: "600", fontSize: "20px" }}>{t('buddy_hub_title')}</h2>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Search Bar Trigger */}
        <button
          onClick={() => onNavigate("find-buddy")}
          className="w-full h-12 flex items-center px-4 border text-left"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            borderRadius: "12px",
            color: theme.textSecondary
          }}
        >
          <Search className="w-5 h-5 mr-3" />
          <span>{t('buddy_search_placeholder')}</span>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate("buddy-requests")}
            className="p-4 border text-left relative transition-colors active:scale-95"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px"
            }}
          >
            {pendingCount > 0 && (
              <div className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-[#7A0019] text-white text-xs font-bold shadow-md">
                {pendingCount}
              </div>
            )}
            <div
              className="w-10 h-10 flex items-center justify-center rounded-lg mb-3"
              style={{ backgroundColor: theme.mode === 1 ? "#3A1E14" : "#FFF9F5" }}
            >
              <Users className="w-5 h-5" style={{ color: theme.mode === 1 ? "#FF8A65" : "#7A0019" }} />
            </div>
            <p className="font-semibold" style={{ color: theme.text }}>{t('buddy_requests')}</p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>{pendingCount} {t('buddy_pending_videos')}</p>
          </button>

          <button
            onClick={() => onNavigate("my-buddies")}
            className="p-4 border text-left transition-colors active:scale-95"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px"
            }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-lg mb-3"
              style={{ backgroundColor: theme.mode === 1 ? "#102E29" : "#F0FDF4" }}
            >
              <User className="w-5 h-5" style={{ color: theme.mode === 1 ? "#4DB6AC" : "#16A34A" }} />
            </div>
            <p className="font-semibold" style={{ color: theme.text }}>{t('buddy_my_buddies')}</p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>{connectedBuddies.length} {t('buddy_connections')}</p>
          </button>
        </div>

        {/* Recent Buddies List (Real Data) */}
        <div>
          <h3 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>{t('buddy_your_buddies')}</h3>
          {connectedBuddies.length === 0 ? (
            <p className="text-sm" style={{ color: theme.textSecondary }}>{t('buddy_no_buddies')}</p>
          ) : (
            <div className="space-y-3">
              {connectedBuddies.slice(0, 3).map((buddy) => (
                <div key={buddy.id} className="border p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: theme.background, color: theme.textSecondary }}>
                    {(buddy.name || "U").charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: theme.text }}>{buddy.name}</p>
                    <p className="text-xs" style={{ color: theme.textSecondary }}>{buddy.faculty}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
