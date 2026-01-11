import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, MapPin, ShoppingBag, Users, User, Check, CheckCheck } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

// ==========================================
// 1. HELPER FUNCTIONS
// ==========================================
const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ==========================================
// 2. CHAT LIST SCREEN
// ==========================================
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

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUserId) return;

      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .contains('participant_ids', [currentUserId]) // Only my chats
        .order('last_message_time', { ascending: false });

      if (error) console.error("Error fetching chats:", error);
      if (data) setChats(data);
      setLoading(false);
    };

    fetchChats();

    const channel = supabase
      .channel('chat_list_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => fetchChats())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  const filteredChats = chats.filter(c => c.type === activeTab);

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

        {/* Tabs */}
        <div className="flex border-t border-gray-200">
          {["buddy", "marketplace"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium relative ${activeTab === tab ? "text-[#7A0019]" : "text-gray-500"
                }`}
            >
              {tab === "buddy" ? <Users className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              <span className="capitalize">{tab}</span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7A0019]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="text-center mt-10 text-gray-400">Loading chats...</div>
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
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0
                  ${chat.type === 'buddy' ? 'bg-[#FFF0F0] text-[#7A0019]' : 'bg-blue-50 text-blue-700'}`}>
                  {chat.title ? chat.title.charAt(0).toUpperCase() : <User />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900 truncate">{chat.title}</span>
                    <span className="text-xs text-gray-500">{formatTime(chat.last_message_time)}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.last_message || "Start chatting..."}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. CHAT ROOM SCREEN
// ==========================================
interface PrivateChatScreenProps {
  chat: any;
  chatType: "buddy" | "marketplace";
  currentUserId: string;
  onNavigate: (screen: string) => void;
  onSendMessage?: any; // kept for compatibility
}

export function PrivateChatScreen({
  chat,
  chatType,
  currentUserId,
  onNavigate
}: PrivateChatScreenProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chat?.id) return;

    // Load initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room_${chat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chat.id}` },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new]);
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string = message, type: string = 'text') => {
    if (!text.trim()) return;
    setMessage("");

    try {
      const { error } = await supabase.from('messages').insert({
        chat_id: chat.id,
        sender_id: currentUserId,
        content: text,
        message_type: type
      });
      if (error) throw error;

      await supabase.from('chats').update({
        last_message: type === 'location' ? '📍 Shared a location' : text,
        last_message_time: new Date().toISOString()
      }).eq('id', chat.id);

    } catch (err) {
      console.error("Failed to send:", err);
      setMessage(text);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 sticky top-0 bg-white z-10">
        <button onClick={() => onNavigate("private-chat-list")} className="-ml-2 p-2">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <div>
          <h2 className="font-bold text-gray-900">{chat.title || "Chat"}</h2>
          <span className="text-xs text-gray-500 capitalize">{chatType} Chat</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 pb-20">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">Say hello! 👋</div>
        )}
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-[15px] shadow-sm
                ${isMe ? "bg-[#7A0019] text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"}`}>

                {msg.message_type === 'location' ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> <span>{msg.content}</span>
                  </div>
                ) : (
                  msg.content
                )}

                <div className={`text-[10px] mt-1 text-right ${isMe ? "text-white/70" : "text-gray-400"}`}>
                  {formatTime(msg.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex gap-2 items-end">
          <button
            onClick={() => handleSend("📍 Shared Location: Library", "location")}
            className="p-3 text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50">
            <MapPin className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7A0019]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#7A0019] text-white rounded-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}