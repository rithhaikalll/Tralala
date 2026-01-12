import { ArrowLeft, MessageCircle, UserMinus, User, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

// Internal Modal (Keep as is)
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Delete", isDelete = true }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl w-full max-w-xs p-6 shadow-xl transform transition-all scale-100">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className={`w-6 h-6 ${isDelete ? "text-red-500" : "text-blue-500"}`} />
          <h3 className={`text-lg font-bold ${isDelete ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`py-2.5 px-4 rounded-xl text-white font-semibold shadow-md active:scale-95 transition-transform ${isDelete ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface MyBuddiesScreenProps {
  onNavigate: (screen: string) => void;
  studentId: string;
  connectedBuddies: any[];
  onRemoveBuddy: (buddyId: string) => void;
  onChat: (buddyId: string, buddyName: string) => void;
}

export function MyBuddiesScreen({
  onNavigate,
  connectedBuddies,
  onRemoveBuddy,
  onChat
}: MyBuddiesScreenProps) {
  const { theme, t } = useUserPreferences();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<{ id: string, name: string } | null>(null);

  const handleRemoveClick = (buddyId: string, buddyName: string) => {
    setSelectedBuddy({ id: buddyId, name: buddyName });
    setIsModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (selectedBuddy) onRemoveBuddy(selectedBuddy.id);
  };

  return (
    <div className="min-h-screen pb-20 transition-colors" style={{ backgroundColor: theme.background }}>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Remove Buddy?"
        message={`Are you sure you want to remove ${selectedBuddy?.name || "this user"}?`}
        confirmLabel="Remove"
      />

      <div className="sticky top-0 z-40 border-b transition-colors" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="px-6 py-4 flex items-center gap-3">
          <button onClick={() => onNavigate("buddy")} className="-ml-2 p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" style={{ color: theme.text }} strokeWidth={2} />
          </button>
          <h2 className="text-lg font-bold" style={{ color: theme.text }}>{t('buddy_my_title')}</h2>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {connectedBuddies.length === 0 ? (
          <div className="text-center py-12" style={{ color: theme.textSecondary }}>
            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{t('buddy_empty_list')}</p>
          </div>
        ) : (
          connectedBuddies.map((buddy) => (
            <div key={buddy.id} className="p-4 border rounded-2xl shadow-sm flex items-center gap-4 transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
              
              {/* Profile Picture Logic */}
              <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-lg" style={{ backgroundColor: theme.mode === 1 ? "#3D2B00" : "#FFF0F0", color: theme.primary }}>
                {buddy.profilePicture ? (
                  <img src={buddy.profilePicture} alt={buddy.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{buddy.name ? buddy.name.charAt(0) : "U"}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate" style={{ color: theme.text }}>{buddy.name}</h3>
                <p className="text-xs truncate" style={{ color: theme.textSecondary }}>{buddy.faculty}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onChat(buddy.id, buddy.name)} className="p-3 text-white rounded-xl shadow-md transition-transform active:scale-95" style={{ backgroundColor: theme.primary }}>
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button onClick={() => handleRemoveClick(buddy.id, buddy.name)} className="p-3 rounded-xl transition-colors active:scale-95" style={{ backgroundColor: theme.mode === 1 ? "#333333" : "#F3F4F6", color: theme.textSecondary }}>
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