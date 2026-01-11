import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface PrivateChatScreenProps {
  chat: any;
  chatType: "buddy" | "marketplace";
  currentUserId: string;
  onNavigate: (screen: string) => void;
  // Fallback if chat is just an ID or incomplete
  chatId?: string;
  otherUserId?: string;
  otherUserName?: string;
}

export function PrivateChatScreen({
  chat,
  chatType,
  currentUserId,
  onNavigate,
  chatId,
  // otherUserId,
  otherUserName
}: PrivateChatScreenProps) {
  const { theme, t } = useUserPreferences();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Normalize ID
  const activeChatId = chat?.id || chatId;
  const activeTitle = chat?.title || otherUserName || "Chat";

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!activeChatId) return;

    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeChatId)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    };
    fetchMessages();

    // 2. Subscribe to NEW messages in this chat room
    const channel = supabase
      .channel(`room_${activeChatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${activeChatId}`
      },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new]);
          setTimeout(scrollToBottom, 100);
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChatId]);

  const handleSend = async (text: string = message, type: string = 'text') => {
    if (!text.trim()) return;
    setMessage("");

    try {
      // 1. Insert Message
      const { error } = await supabase.from('messages').insert({
        chat_id: activeChatId,
        sender_id: currentUserId,
        content: text,
        message_type: type
      });

      if (error) throw error;

      // 2. Update Chat List preview (using 'chats' table based on prior code)
      // Note: If 'chats' table doesn't exist or differs, this might fail silently or error.
      await supabase.from('chats').update({
        last_message: type === 'location' ? t('chat_shared_loc') : text,
        last_message_time: new Date().toISOString()
      }).eq('id', activeChatId);

    } catch (err) {
      console.error("Failed to send:", err);
      setMessage(text); // Restore text on error
    }
  };

  return (
    <div className="flex flex-col h-screen transition-colors" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center gap-3 sticky top-0 z-10 transition-colors" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <button onClick={() => onNavigate("private-chat-list")} className="-ml-2 p-2">
          <ArrowLeft className="w-5 h-5" style={{ color: theme.text }} />
        </button>
        <div>
          <h2 className="font-bold" style={{ color: theme.text }}>{activeTitle}</h2>
          <span className="text-xs capitalize" style={{ color: theme.textSecondary }}>{chatType} {t('chat_title')}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 transition-colors" style={{ backgroundColor: theme.mode === 1 ? "#1A1A1A" : "#F9FAFB" }}>
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-[15px] shadow-sm transition-colors
                ${isMe ? "rounded-br-none" : "rounded-bl-none"}`}
                style={{
                  backgroundColor: isMe ? theme.primary : theme.cardBg,
                  color: isMe ? "#FFFFFF" : theme.text,
                  border: isMe ? "none" : `1px solid ${theme.border}`
                }}
              >

                {msg.message_type === 'location' ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> <span>{msg.content}</span>
                  </div>
                ) : (
                  msg.content
                )}

                <div
                  className="text-[10px] mt-1 text-right"
                  style={{ color: isMe ? "rgba(255,255,255,0.7)" : theme.textSecondary }}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t safe-area-bottom transition-colors" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="flex gap-2 items-end">
          <button
            onClick={() => handleSend(`${t('chat_shared_loc_prefix')} Library`, "location")}
            className="p-3 border rounded-xl hover:bg-opacity-50 transition-colors"
            style={{ borderColor: theme.border, backgroundColor: theme.cardBg, color: theme.textSecondary }}
          >
            <MapPin className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat_type_ph')}
              className="w-full pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:ring-1 transition-colors"
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text,
                "--tw-ring-color": theme.primary
              } as any}
            />
            <button
              onClick={() => handleSend()}
              disabled={!message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: theme.primary, color: "#FFFFFF" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}