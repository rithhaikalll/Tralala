import { ArrowLeft, Search, Users, User } from "lucide-react";

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
  // Count incoming pending requests
  const pendingCount = buddyRequests.filter(r => r.isIncoming && r.status === "Pending").length;

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="sticky top-0 z-40 bg-white px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("community")} style={{ color: "#7A0019" }}>
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "20px" }}>Buddy Hub</h2>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Search Bar Trigger */}
        <button
          onClick={() => onNavigate("find-buddy")}
          className="w-full h-12 flex items-center px-4 border bg-white text-left"
          style={{ borderColor: "#E5E5E5", borderRadius: "12px", color: "#888888" }}
        >
          <Search className="w-5 h-5 mr-3" />
          <span>Search by User ID...</span>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate("buddy-requests")}
            className="p-4 border bg-white text-left relative"
            style={{ borderColor: "#E5E5E5", borderRadius: "14px" }}
          >
            {pendingCount > 0 && (
              <div className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-[#7A0019] text-white text-xs font-bold">
                {pendingCount}
              </div>
            )}
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#FFF9F5] mb-3">
              <Users className="w-5 h-5" style={{ color: "#7A0019" }} />
            </div>
            <p className="font-semibold text-[#1A1A1A]">Requests</p>
            <p className="text-xs text-gray-500">{pendingCount} pending</p>
          </button>

          <button
            onClick={() => onNavigate("my-buddies")}
            className="p-4 border bg-white text-left"
            style={{ borderColor: "#E5E5E5", borderRadius: "14px" }}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#F0FDF4] mb-3">
              <User className="w-5 h-5" style={{ color: "#16A34A" }} />
            </div>
            <p className="font-semibold text-[#1A1A1A]">My Buddies</p>
            <p className="text-xs text-gray-500">{connectedBuddies.length} connections</p>
          </button>
        </div>

        {/* Recent Buddies List (Real Data) */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Your Buddies</h3>
          {connectedBuddies.length === 0 ? (
            <p className="text-sm text-gray-500">No buddies yet. Find someone to connect!</p>
          ) : (
            <div className="space-y-3">
              {connectedBuddies.slice(0, 3).map((buddy) => (
                <div key={buddy.id} className="border bg-white p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                    {(buddy.name || "U").charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{buddy.name}</p>
                    <p className="text-xs text-gray-500">{buddy.faculty}</p>
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