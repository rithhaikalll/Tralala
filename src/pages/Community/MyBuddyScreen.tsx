import { ArrowLeft, MessageCircle, UserMinus, User } from "lucide-react";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface MyBuddiesScreenProps {
  onNavigate: (screen: string) => void;
  studentId: string;
  connectedBuddies: any[];
  onRemoveBuddy: (buddyId: string) => void;
  onChat: (buddyId: string, buddyName: string) => void; // <--- The trigger function prop
}

export function MyBuddiesScreen({
  onNavigate,
  connectedBuddies,
  onRemoveBuddy,
  onChat
}: MyBuddiesScreenProps) {
  const { theme, t } = useUserPreferences();

  return (
    <div className="min-h-screen pb-20 transition-colors" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b transition-colors" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => onNavigate("buddy")}
            className="-ml-2 p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: theme.text }} strokeWidth={2} />
          </button>
          <h2 className="text-lg font-bold" style={{ color: theme.text }}>{t('buddy_my_title')}</h2>
        </div>
      </div>

      {/* Buddy List */}
      <div className="px-6 py-6 space-y-4">
        {connectedBuddies.length === 0 ? (
          <div className="text-center py-12" style={{ color: theme.textSecondary }}>
            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{t('buddy_empty_list')}</p>
          </div>
        ) : (
          connectedBuddies.map((buddy) => (
            <div
              key={buddy.id}
              className="p-4 border rounded-2xl shadow-sm flex items-center gap-4 transition-colors"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              {/* Avatar Circle */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: theme.mode === 1 ? "#3D2B00" : "#FFF0F0",
                  color: theme.primary
                }}
              >
                {buddy.name ? buddy.name.charAt(0) : "U"}
              </div>

              {/* Name & Faculty Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate" style={{ color: theme.text }}>{buddy.name}</h3>
                <p className="text-xs truncate" style={{ color: theme.textSecondary }}>{buddy.faculty}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* The Message Button */}
                <button
                  onClick={() => onChat(buddy.id, buddy.name)}
                  className="p-3 text-white rounded-xl shadow-md transition-transform active:scale-95"
                  style={{ backgroundColor: theme.primary }}
                  aria-label={t('buddy_message')}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>

                {/* The Remove/User Button */}
                <button
                  onClick={() => onRemoveBuddy(buddy.userId)}
                  className="p-3 rounded-xl transition-colors"
                  style={{
                    backgroundColor: theme.mode === 1 ? "#333333" : "#F3F4F6",
                    color: theme.textSecondary
                  }}
                  aria-label={t('buddy_remove')}
                >
                  <UserMinus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}