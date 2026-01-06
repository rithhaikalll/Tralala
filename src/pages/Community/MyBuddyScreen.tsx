import { ArrowLeft, MessageCircle, UserMinus, User } from "lucide-react";

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
  
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center gap-3">
          <button onClick={() => onNavigate("buddy")} className="-ml-2 p-2 rounded-full hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-900" strokeWidth={2} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">My Buddies</h2>
        </div>
      </div>

      {/* Buddy List */}
      <div className="px-6 py-6 space-y-4">
        {connectedBuddies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>You haven't added any buddies yet.</p>
          </div>
        ) : (
          connectedBuddies.map((buddy) => (
            <div 
              key={buddy.id} 
              className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4"
            >
              {/* Avatar Circle */}
              <div className="w-12 h-12 rounded-full bg-[#FFF0F0] flex items-center justify-center text-[#7A0019] font-bold text-lg">
                {buddy.name ? buddy.name.charAt(0) : "U"}
              </div>

              {/* Name & Faculty Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{buddy.name}</h3>
                <p className="text-xs text-gray-500 truncate">{buddy.faculty}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* 👇 THE MESSAGE BUTTON FROM YOUR IMAGE 👇 */}
                <button
  onClick={() => onChat(buddy.id, buddy.name)}
  className="p-3 bg-[#7A0019] text-white rounded-xl shadow-md..."
>
  <MessageCircle className="w-5 h-5" />
</button>
                
                {/* The Remove/User Button */}
                <button
                  onClick={() => onRemoveBuddy(buddy.userId)}
                  className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200"
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