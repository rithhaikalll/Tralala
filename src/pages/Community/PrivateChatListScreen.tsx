import { ArrowLeft, MessageCircle, ShoppingBag, Users } from "lucide-react";
import { useState } from "react";

interface PrivateChatListScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  buddyChats: any[];
  marketplaceChats: any[];
}

export function PrivateChatListScreen({ 
  onNavigate, 
  buddyChats,
  marketplaceChats 
}: PrivateChatListScreenProps) {
  const [activeTab, setActiveTab] = useState<"buddy" | "marketplace">("buddy");

  const handleOpenChat = (chat: any, type: "buddy" | "marketplace") => {
    onNavigate("private-chat", { chat, chatType: type });
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="px-6 py-4 flex items-center gap-3">
          <button onClick={() => onNavigate("community")} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" style={{ color: "#1A1A1A" }} strokeWidth={2} />
          </button>
          <div>
            <h2 style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "18px" }}>Chats</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t" style={{ borderColor: "#E5E5E5" }}>
          <button
            onClick={() => setActiveTab("buddy")}
            className="flex-1 px-4 py-3 flex items-center justify-center gap-2 relative"
            style={{
              color: activeTab === "buddy" ? "#7A0019" : "#6A6A6A",
              backgroundColor: activeTab === "buddy" ? "#FFFFFF" : "transparent"
            }}
          >
            <Users className="w-4 h-4" strokeWidth={2} />
            <span style={{ fontSize: "14px", fontWeight: activeTab === "buddy" ? "600" : "500" }}>
              Buddy Chats
            </span>
            {buddyChats.length > 0 && (
              <span 
                className="ml-1 px-2 py-0.5 text-xs"
                style={{ 
                  backgroundColor: activeTab === "buddy" ? "#7A0019" : "#E5E5E5",
                  color: activeTab === "buddy" ? "#FFFFFF" : "#6A6A6A",
                  borderRadius: "10px",
                  fontWeight: "600"
                }}
              >
                {buddyChats.length}
              </span>
            )}
            {activeTab === "buddy" && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: "#7A0019" }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("marketplace")}
            className="flex-1 px-4 py-3 flex items-center justify-center gap-2 relative"
            style={{
              color: activeTab === "marketplace" ? "#7A0019" : "#6A6A6A",
              backgroundColor: activeTab === "marketplace" ? "#FFFFFF" : "transparent"
            }}
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
            <span style={{ fontSize: "14px", fontWeight: activeTab === "marketplace" ? "600" : "500" }}>
              Marketplace
            </span>
            {marketplaceChats.length > 0 && (
              <span 
                className="ml-1 px-2 py-0.5 text-xs"
                style={{ 
                  backgroundColor: activeTab === "marketplace" ? "#7A0019" : "#E5E5E5",
                  color: activeTab === "marketplace" ? "#FFFFFF" : "#6A6A6A",
                  borderRadius: "10px",
                  fontWeight: "600"
                }}
              >
                {marketplaceChats.length}
              </span>
            )}
            {activeTab === "marketplace" && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: "#7A0019" }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {/* Buddy Chats */}
        {activeTab === "buddy" && (
          <div>
            {buddyChats.length === 0 ? (
              <div className="text-center py-12">
                <div 
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: "#F5F5F5", borderRadius: "50%" }}
                >
                  <Users className="w-8 h-8" style={{ color: "#6A6A6A" }} strokeWidth={1.5} />
                </div>
                <p style={{ color: "#6A6A6A", fontSize: "15px" }}>
                  No buddy chats yet
                </p>
                <p className="text-sm mt-1" style={{ color: "#999999" }}>
                  Connect with buddies to start chatting
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {buddyChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleOpenChat(chat, "buddy")}
                    className="w-full p-4 border bg-white text-left"
                    style={{
                      borderColor: "#E5E5E5",
                      borderRadius: "14px",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#F5F5F5", color: "#7A0019", fontWeight: "600" }}
                      >
                        {chat.buddyName.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}>
                            {chat.buddyName}
                          </div>
                          <div className="text-xs" style={{ color: "#6A6A6A" }}>
                            {chat.lastMessageTime}
                          </div>
                        </div>
                        <div className="text-sm truncate" style={{ color: "#6A6A6A" }}>
                          {chat.lastMessage}
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div 
                          className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "#7A0019", borderRadius: "50%", color: "#FFFFFF", fontSize: "11px", fontWeight: "600" }}
                        >
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Marketplace Chats */}
        {activeTab === "marketplace" && (
          <div>
            {marketplaceChats.length === 0 ? (
              <div className="text-center py-12">
                <div 
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: "#F5F5F5", borderRadius: "50%" }}
                >
                  <ShoppingBag className="w-8 h-8" style={{ color: "#6A6A6A" }} strokeWidth={1.5} />
                </div>
                <p style={{ color: "#6A6A6A", fontSize: "15px" }}>
                  No marketplace chats yet
                </p>
                <p className="text-sm mt-1" style={{ color: "#999999" }}>
                  Start a conversation with a seller
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {marketplaceChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleOpenChat(chat, "marketplace")}
                    className="w-full p-4 border bg-white text-left"
                    style={{
                      borderColor: "#E5E5E5",
                      borderRadius: "14px",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#F5F5F5", color: "#7A0019", fontWeight: "600" }}
                      >
                        {chat.sellerName.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}>
                            {chat.sellerName}
                          </div>
                          <div className="text-xs" style={{ color: "#6A6A6A" }}>
                            {chat.lastMessageTime}
                          </div>
                        </div>
                        <div className="text-xs mb-1" style={{ color: "#7A0019", fontWeight: "500" }}>
                          {chat.itemTitle}
                        </div>
                        <div className="text-sm truncate" style={{ color: "#6A6A6A" }}>
                          {chat.lastMessage}
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div 
                          className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "#7A0019", borderRadius: "50%", color: "#FFFFFF", fontSize: "11px", fontWeight: "600" }}
                        >
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}