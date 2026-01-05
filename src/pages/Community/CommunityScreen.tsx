import React from "react";
import { 
  MessageCircle, 
  Newspaper, 
  UserPlus, 
  ShoppingBag, 
  MessageSquare 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Helper component for the cards
const MenuCard = ({ title, description, icon: Icon, bgClass, iconClass, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-start p-5 bg-white border border-gray-200 rounded-[20px] shadow-sm text-left hover:bg-gray-50 transition-colors w-full"
  >
    <div className={`p-3 rounded-[18px] ${bgClass} mb-4`}>
      <Icon className={iconClass} size={24} strokeWidth={2} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 leading-tight">{description}</p>
  </button>
);

// Helper for activity stats
const ActivityStat = ({ count, label }: any) => (
  <div className="flex flex-col items-center">
    <span className="text-xl font-bold text-[#8B1E3F]">{count}</span>
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

export function CommunityScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-32">
      {/* Header */}
      <div className="mb-6 pt-2">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <p className="text-gray-600 mt-1">Connect, share, and engage with UTM sports community</p>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <MenuCard 
          title="Discussion" 
          description="Join community conversations"
          icon={MessageCircle}
          bgClass="bg-[#FEF3EC]" 
          iconClass="text-[#D96C47]"
          onClick={() => navigate('/community/discussion')} 
        />
        <MenuCard 
          title="News Feed" 
          description="Latest updates and announcements"
          icon={Newspaper}
          bgClass="bg-[#ECF6FC]" 
          iconClass="text-[#3D8BB3]"
          // UPDATED: Now navigates to the news route
          onClick={() => navigate('/community/news')}
        />
        <MenuCard 
          title="Find Buddy" 
          description="Connect with other players"
          icon={UserPlus}
          bgClass="bg-[#FEF2F4]" 
          iconClass="text-[#BD3E63]"
          onClick={() => console.log("Find Buddy clicked")}
        />
        <MenuCard 
          title="Marketplace" 
          description="Buy and sell sports items"
          icon={ShoppingBag}
          bgClass="bg-[#F0FDFA]" 
          iconClass="text-[#4A9D8F]"
          onClick={() => console.log("Marketplace clicked")}
        />
         <MenuCard 
          title="Chats" 
          description="Message buddies and sellers"
          icon={MessageSquare}
          bgClass="bg-[#FEF2F4]" 
          iconClass="text-[#BD3E63]"
          onClick={() => console.log("Chats clicked")}
        />
      </div>

      {/* Community Activity Footer */}
      <div className="bg-white p-5 rounded-[20px] border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Community Activity</h3>
        <div className="flex justify-around items-center">
            <ActivityStat count={4} label="New Posts" />
            <div className="h-8 w-[1px] bg-gray-200"></div>
            <ActivityStat count={1} label="Buddies" />
            <div className="h-8 w-[1px] bg-gray-200"></div>
            <ActivityStat count={6} label="Items" />
        </div>
      </div>
    </div>
  );
}