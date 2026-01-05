import { ArrowLeft, User, Users, UserMinus } from "lucide-react";
import { useState } from "react";

interface MyBuddiesScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  studentId: string;
  connectedBuddies: any[]; // Receiving real objects
  onRemoveBuddy?: (buddyId: string) => void;
}

export function MyBuddiesScreen({
  onNavigate,
  connectedBuddies,
  onRemoveBuddy
}: MyBuddiesScreenProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);

  const handleRemoveBuddy = (buddyId: string) => {
    if (onRemoveBuddy) {
      onRemoveBuddy(buddyId);
    }
    setShowRemoveConfirm(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="sticky top-0 z-40 bg-white px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("buddy")} style={{ color: "#7A0019" }}>
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "20px" }}>My Buddies</h2>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats */}
        <div className="border bg-white p-4 mb-6 rounded-xl bg-[#FFF9F5]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-[#7A0019] rounded-lg">
              <Users className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Connections</p>
              <p className="text-2xl font-semibold text-[#1A1A1A]">{connectedBuddies.length}</p>
            </div>
          </div>
        </div>

        {/* Buddies List */}
        {connectedBuddies.length === 0 ? (
          <div className="border p-12 text-center rounded-xl bg-[#F5F5F5]">
            <Users className="w-16 h-16 mx-auto mb-4 text-[#CCCCCC]" strokeWidth={1.5} />
            <p className="mb-2 font-semibold text-[#1A1A1A]">No Buddies Yet</p>
            <p className="text-sm mb-4 text-gray-500">Start connecting with other students!</p>
            <button onClick={() => onNavigate("find-buddy")} className="h-10 px-6 bg-[#7A0019] text-white rounded-lg font-medium">
              Find Buddies
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {connectedBuddies.map((buddy) => (
              <div key={buddy.id} className="border bg-white p-5 rounded-xl shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 flex items-center justify-center bg-[#FFF9F5] rounded-xl border-2 border-[#E5E5E5]">
                    <User className="w-7 h-7 text-[#7A0019]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A1A1A] text-lg mb-1">{buddy.name}</h3>
                    <p className="text-sm text-[#7A0019] font-medium mb-1">{buddy.userId}</p>
                    <p className="text-sm text-gray-500">{buddy.faculty}</p>
                    <p className="text-xs text-gray-400 mt-1">Connected since {formatDate(buddy.connectedSince)}</p>
                  </div>
                </div>

                {buddy.favoriteSports && buddy.favoriteSports.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {buddy.favoriteSports.map((sport: string) => (
                      <span key={sport} className="px-2 py-1 text-xs bg-[#FFF9F5] text-[#7A0019] rounded-md font-medium">
                        {sport}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowRemoveConfirm(buddy.id)} // Pass UUID
                    className="h-10 px-6 flex items-center gap-2 border border-[#E5E5E5] text-[#DC2626] rounded-lg font-medium"
                  >
                    <UserMinus className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Remove Confirmation */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowRemoveConfirm(null)}>
          <div className="w-full max-w-md bg-white p-6 m-4 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 font-semibold text-lg">Remove Buddy?</h3>
            <p className="text-sm mb-6 text-gray-500">Are you sure? You'll need to send a new request to reconnect.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowRemoveConfirm(null)} className="h-11 bg-gray-100 rounded-lg font-medium">Cancel</button>
              <button onClick={() => handleRemoveBuddy(showRemoveConfirm)} className="h-11 bg-red-600 text-white rounded-lg font-medium">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}