import { ArrowLeft, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface PrivateChatListScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  currentUserId: string;
}

export function PrivateChatListScreen({
  onNavigate,
  currentUserId
}: PrivateChatListScreenProps) {
  const { theme, t } = useUserPreferences();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buddy' | 'marketplace'>('buddy');

  useEffect(() => {
    fetchChats();

    const channel = supabase
      .channel('public:chats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chats' }, // Listen to all events on chats
        (payload: any) => {
          // Check if this chat involves current user
          if (payload.new && payload.new.participant_ids && payload.new.participant_ids.includes(currentUserId)) {
            fetchChats();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      // 1. Fetch chats where current user is a participant
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .contains('participant_ids', [currentUserId])
        .order('last_message_time', { ascending: false });

      if (error) throw error;

      if (!chatsData || chatsData.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      // 2. Identify other users to fetch their profiles
      const otherUserIds = new Set<string>();
      chatsData.forEach((checkChat: any) => {
        const otherId = checkChat.participant_ids.find((pid: string) => pid !== currentUserId);
        if (otherId) otherUserIds.add(otherId);
      });

      // 3. Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(otherUserIds));

      const profilesMap = new Map();
      profilesData?.forEach((p: any) => {
        profilesMap.set(p.id, p);
      });

      // 4. Map chats to include other user details
      const mappedChats = chatsData.map((c: any) => {
        const otherId = c.participant_ids.find((pid: string) => pid !== currentUserId);
        const profile = profilesMap.get(otherId);

        // Fallback title logic:
        // Use profile name if available, otherwise use chat title, otherwise "User"
        let displayTitle = c.title || "Chat";
        if (c.type === 'buddy' && profile?.full_name) {
          displayTitle = profile.full_name;
        } else if (c.type === 'marketplace') {
          // For marketplace, keeps the item title usually, but let's append user name if needed
          // or just trust the stored title.
          // If title is missing, use profile name
          if (!c.title) displayTitle = profile?.full_name || "Seller";
        }

        return {
          ...c,
          otherUserId: otherId,
          otherUserName: displayTitle,
          otherUserAvatar: profile?.avatar_url
        };
      });

      setChats(mappedChats);

    } catch (err) {
      console.error("Error fetching chats:", err);
      // setChats([]); 
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(c => {
    return c.type === activeTab || (!c.type && activeTab === 'buddy');
  });

  return (
    <div className="min-h-screen pb-20 transition-colors" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b transition-colors" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("community")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" style={{ color: theme.text }} strokeWidth={2} />
            </button>
            <h2 style={{ color: theme.text, fontWeight: "600", fontSize: "18px" }}>{t('chat_title')}</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 gap-6">
          <button
            onClick={() => setActiveTab('buddy')}
            className={`pb-3 text-sm font-medium transition-colors relative`}
            style={{ color: activeTab === 'buddy' ? theme.primary : theme.textSecondary }}
          >
            {t('chat_tab_buddy')}
            {activeTab === 'buddy' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: theme.primary }} />
            )}
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`pb-3 text-sm font-medium transition-colors relative`}
            style={{ color: activeTab === 'marketplace' ? theme.primary : theme.textSecondary }}
          >
            {t('chat_tab_market')}
            {activeTab === 'marketplace' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: theme.primary }} />
            )}
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="px-6 py-4">
        {loading ? (
          <p className="text-center mt-10" style={{ color: theme.textSecondary }}>{t('chat_loading')}</p>
        ) : filteredChats.length === 0 ? (
          <div className="text-center mt-10">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: theme.mode === 1 ? "#333" : "#F5F5F5" }}
            >
              <MessageCircle className="w-8 h-8" style={{ color: theme.textSecondary }} />
            </div>
            <p style={{ color: theme.textSecondary }}>
              {activeTab === 'buddy' ? t('chat_no_buddy') : t('chat_no_market')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChats.map((chat) => {
              const otherUserId = chat.otherUserId;
              const otherUserName = chat.otherUserName;
              const otherUserAvatar = chat.otherUserAvatar;

              return (
                <button
                  key={chat.id}
                  onClick={() => onNavigate("private-chat", { chat, chatType: chat.type })}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border transition-colors active:scale-95"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                >
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-lg"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {otherUserAvatar ? (
                        <img src={otherUserAvatar} alt={otherUserName} className="w-full h-full object-cover" />
                      ) : (
                        (otherUserName || "?").charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold" style={{ color: theme.text }}>{otherUserName}</h3>
                      <span className="text-xs" style={{ color: theme.textSecondary }}>
                        {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-1" style={{ color: theme.textSecondary }}>
                      {chat.last_message}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}