import { ArrowLeft, Send, MapPin, Paperclip, Check, CheckCheck, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface PrivateChatScreenProps {
  chat: any;
  chatType: "buddy" | "marketplace";
  onNavigate: (screen: string) => void;
  currentUserId: string;
  onSendMessage?: (chatId: string, messageText: string, messageType?: "text" | "location") => void;
}

export function PrivateChatScreen({ 
  chat, 
  chatType,
  onNavigate,
  currentUserId,
  onSendMessage
}: PrivateChatScreenProps) {
  const [message, setMessage] = useState("");
  const [showLocationShare, setShowLocationShare] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // Use messages from chat prop or default mock messages
  const messages = chat.messages && chat.messages.length > 0 ? chat.messages : (chatType === "buddy" ? [
    {
      id: "1",
      sender: chat.buddyId,
      text: "Hey! Are you free for badminton tomorrow?",
      timestamp: "10:30 AM",
      status: "read"
    },
    {
      id: "2",
      sender: currentUserId,
      text: "Yes! What time works for you?",
      timestamp: "10:32 AM",
      status: "read"
    },
    {
      id: "3",
      sender: chat.buddyId,
      text: "How about 4 PM at Court 2?",
      timestamp: "10:35 AM",
      status: "read"
    },
    {
      id: "4",
      sender: currentUserId,
      text: "Perfect! See you there",
      timestamp: "10:36 AM",
      status: "delivered"
    }
  ] : [
    {
      id: "1",
      sender: currentUserId,
      text: "Hi! Is this item still available?",
      timestamp: "10:30 AM",
      status: "read"
    },
    {
      id: "2",
      sender: chat.sellerId,
      text: "Yes, it's still available! Would you like to see it?",
      timestamp: "10:32 AM",
      status: "read"
    },
    {
      id: "3",
      sender: currentUserId,
      text: "Great! Can we meet at the sports center?",
      timestamp: "10:35 AM",
      status: "delivered"
    },
    {
      id: "4",
      sender: chat.sellerId,
      text: "Sure! How about tomorrow at 3 PM?",
      timestamp: "10:36 AM",
      status: "sent"
    }
  ]);

  const campusLocations = [
    "Sports Center - Main Building",
    "Sports Complex - Field Area",
    "Fitness Center",
    "Badminton Court 1-4",
    "Futsal Field A",
    "Futsal Field B",
    "Tennis Court",
    "Basketball Court",
    "Residential College - Block A",
    "Library Entrance"
  ];

  const handleSend = () => {
    if (message.trim()) {
      // In real app, send message via API
      if (onSendMessage) {
        onSendMessage(chat.id, message.trim());
      }
      setMessage("");
    }
  };

  const handleShareLocation = (location: string) => {
    // In real app, send location as a message
    if (onSendMessage) {
      onSendMessage(chat.id, location, "location");
    }
    setShowLocationShare(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3" strokeWidth={2} />;
      case "delivered":
        return <CheckCheck className="w-3 h-3" strokeWidth={2} />;
      case "read":
        return <CheckCheck className="w-3 h-3" strokeWidth={2} style={{ color: "#7A0019" }} />;
      case "failed":
        return <AlertCircle className="w-3 h-3" strokeWidth={2} style={{ color: "#DC2626" }} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("private-chat-list")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" style={{ color: "#1A1A1A" }} strokeWidth={2} />
            </button>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#F5F5F5", color: "#7A0019", fontWeight: "600" }}
            >
              {(chatType === "buddy" ? chat.buddyName : chat.sellerName).substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "16px" }}>
                {chatType === "buddy" ? chat.buddyName : chat.sellerName}
              </div>
              <div className="text-xs" style={{ color: "#6A6A6A" }}>
                {chatType === "buddy" ? `ID: ${chat.buddyId}` : `ID: ${chat.sellerId}`}
              </div>
            </div>
          </div>
          
          {/* Item Reference for Marketplace Chat */}
          {chatType === "marketplace" && (
            <div className="p-3 border mt-3 ml-12" style={{ borderColor: "#E5E5E5", borderRadius: "10px", backgroundColor: "#FAFAFA" }}>
              <div className="text-xs mb-1" style={{ color: "#7A0019", fontWeight: "500" }}>
                Discussing:
              </div>
              <div className="text-sm" style={{ color: "#1A1A1A", fontWeight: "500" }}>
                {chat.itemTitle}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {/* Chat Type Badge */}
          <div className="text-center mb-4">
            <span 
              className="inline-block px-3 py-1 text-xs"
              style={{
                backgroundColor: "#F5F5F5",
                color: "#6A6A6A",
                borderRadius: "12px",
                fontWeight: "500"
              }}
            >
              {chatType === "buddy" ? "Buddy Chat" : "Marketplace Chat"}
            </span>
          </div>

          {messages.map((msg) => {
            const isCurrentUser = msg.sender === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[75%] px-4 py-3"
                  style={{
                    backgroundColor: isCurrentUser ? "#7A0019" : "#F5F5F5",
                    color: isCurrentUser ? "#FFFFFF" : "#1A1A1A",
                    borderRadius: isCurrentUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    fontSize: "15px",
                    lineHeight: "1.5"
                  }}
                >
                  <div>{msg.text}</div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span
                      className="text-xs"
                      style={{
                        color: isCurrentUser ? "rgba(255, 255, 255, 0.7)" : "#6A6A6A"
                      }}
                    >
                      {msg.timestamp}
                    </span>
                    {isCurrentUser && (
                      <div style={{ color: msg.status === "read" ? "#7A0019" : "rgba(255, 255, 255, 0.7)" }}>
                        {getStatusIcon(msg.status)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Location Share Modal */}
      {showLocationShare && (
        <div 
          className="absolute inset-0 z-50 flex items-end"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowLocationShare(false)}
        >
          <div 
            className="w-full bg-white p-6 max-h-[70vh] overflow-y-auto"
            style={{ borderRadius: "14px 14px 0 0" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "18px" }}>
              Share Campus Location
            </h3>
            <div className="space-y-2">
              {campusLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleShareLocation(location)}
                  className="w-full p-4 border bg-white text-left flex items-center gap-3"
                  style={{
                    borderColor: "#E5E5E5",
                    borderRadius: "14px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
                  }}
                >
                  <MapPin className="w-5 h-5" style={{ color: "#7A0019" }} strokeWidth={1.5} />
                  <span style={{ color: "#1A1A1A", fontSize: "15px" }}>{location}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t px-6 py-4" style={{ borderColor: "#E5E5E5", backgroundColor: "#FFFFFF" }}>
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowLocationShare(true)}
            className="p-2.5 border"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "10px",
              color: "#6A6A6A"
            }}
          >
            <MapPin className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          <button
            className="p-2.5 border"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "10px",
              color: "#6A6A6A"
            }}
          >
            <Paperclip className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 border resize-none"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "14px",
                fontSize: "15px",
                outline: "none",
                maxHeight: "100px"
              }}
              onFocus={(e) => e.target.style.borderColor = "#7A0019"}
              onBlur={(e) => e.target.style.borderColor = "#E5E5E5"}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-3"
            style={{
              backgroundColor: message.trim() ? "#7A0019" : "#E5E5E5",
              color: "#FFFFFF",
              borderRadius: "10px",
              opacity: message.trim() ? 1 : 0.5
            }}
          >
            <Send className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}