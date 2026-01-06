// src/pages/Community/PrivateChatListScreen.tsx
import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingBag, Users, User } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface PrivateChatListScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  currentUserId: string;
}

export function PrivateChatListScreen({ 
  onNavigate,
  currentUserId
}: PrivateChatListScreenProps) {
  const [activeTab, setActiveTab] = useState<"buddy" | "marketplace">("buddy");
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    if (!currentUserId) return;
    
    // Fetch chats where currentUserId is inside the participant_ids array
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('participant_ids', [currentUserId]) 
      .order('last_message_time', { ascending: false });

    if (error) console.error("Error fetching chats:", error);
    if (data) setChats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChats();

    // Subscribe to updates (so if a new message comes in, the list updates)
    const channel = supabase
      .channel('chat_list_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
        fetchChats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  const filteredChats = chats.filter(c => c.type === activeTab);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center gap-3">
          <button onClick={() => onNavigate("community")} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-gray-900" strokeWidth={2} />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex border-t border-gray-200">
          {["buddy", "marketplace"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium relative ${
                activeTab === tab ? "text-[#7A0019]" : "text-gray-500"
              }`}
            >
              {tab === "buddy" ? <Users className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              <span className="capitalize">{tab}</span>
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7A0019]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="px-6 py-4">
        {loading ? (
           <div className="text-center mt-10 text-gray-400">Loading...</div>
        ) : filteredChats.length === 0 ? (
           <div className="text-center mt-10 text-gray-400">No {activeTab} chats yet.</div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onNavigate("private-chat", { chat, chatType: chat.type })}
                className="w-full p-4 border border-gray-100 bg-white rounded-xl shadow-sm hover:bg-gray-50 text-left transition-colors flex items-start gap-3"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${chat.type === 'buddy' ? 'bg-[#FFF0F0] text-[#7A0019]' : 'bg-blue-50 text-blue-700'}`}>
                  {chat.title ? chat.title.charAt(0).toUpperCase() : <User />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900 truncate">{chat.title}</span>
                    <span className="text-xs text-gray-500">{formatTime(chat.last_message_time)}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.last_message}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}