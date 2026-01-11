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
      .channel('public:private_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'private_messages' },
        (_payload: any) => {
          fetchChats();
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
      // Fetch chats logic - simplified for now as schema is not fully clear
      // We'll emulate fetching a list of chats
      const { data, error } = await supabase
        .from('private_chats')
        .select('*')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .order('last_message_time', { ascending: false });

      if (!error && data) {
        setChats(data);
      } else {
        // If table doesn't exist, just empty list
        setChats([]);
      }
    } catch (err) {
      console.error(err);
      setChats([]);
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
              const otherUserId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
              const otherUserName = chat.other_user_name || "User";
              const otherUserAvatar = chat.other_user_avatar;

              return (
                <button
                  key={chat.id}
                  onClick={() => onNavigate("private-chat", { chatId: chat.id, otherUserId, otherUserName })}
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
                        otherUserName.charAt(0).toUpperCase()
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
                      {chat.last_message_content || t('chat_say_hello')}
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