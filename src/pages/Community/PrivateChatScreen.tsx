// src/pages/Community/PrivateChatScreen.tsx
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface PrivateChatScreenProps {
  chat: any;
  chatType: "buddy" | "marketplace";
  currentUserId: string;
  onNavigate: (screen: string) => void;
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

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!chat?.id) return;

    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    };
    fetchMessages();

    // 2. Subscribe to NEW messages in this chat room
    const channel = supabase
      .channel(`room_${chat.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `chat_id=eq.${chat.id}` 
      }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
        setTimeout(scrollToBottom, 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chat?.id]);

  const handleSend = async (text: string = message, type: string = 'text') => {
    if (!text.trim()) return;
    setMessage("");

    try {
      // 1. Insert Message
      const { error } = await supabase.from('messages').insert({
        chat_id: chat.id,
        sender_id: currentUserId,
        content: text,
        message_type: type
      });

      if (error) throw error;

      // 2. Update Chat List preview
      await supabase.from('chats').update({
        last_message: type === 'location' ? '📍 Shared a location' : text,
        last_message_time: new Date().toISOString()
      }).eq('id', chat.id);

    } catch (err) {
      console.error("Failed to send:", err);
      setMessage(text); // Restore text on error
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 pb-20">
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
                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
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