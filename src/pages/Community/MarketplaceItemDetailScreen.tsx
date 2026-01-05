import { ArrowLeft, MessageCircle, User, MapPin, Calendar, Tag, Heart } from "lucide-react";

interface MarketplaceItemDetailScreenProps {
  item: any;
  onNavigate: (screen: string, data?: any) => void;
  isFavourite: boolean;
  onToggleFavourite: (itemId: string) => void;
  isOwner: boolean;
  onMarkAsSold?: (itemId: string) => void;
  onCreateMarketplaceChat: (chatData: any) => void;
}

export function MarketplaceItemDetailScreen({ 
  item, 
  onNavigate,
  isFavourite,
  onToggleFavourite,
  isOwner,
  onMarkAsSold,
  onCreateMarketplaceChat
}: MarketplaceItemDetailScreenProps) {

  const handleContactSeller = () => {
    // Basic Chat Data structure
    const chatData = {
      id: `marketplace_${item.id}_${Date.now()}`,
      sellerId: item.seller_id || item.sellerId, // Handle both casing
      sellerName: item.seller_name || item.sellerName,
      itemTitle: item.title,
      itemId: item.id,
      lastMessage: "",
      lastMessageTime: "Just now",
      unreadCount: 0
    };
    
    onCreateMarketplaceChat(chatData);
    onNavigate("private-chat", { chat: chatData });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <button onClick={() => onNavigate("marketplace")} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" style={{ color: "#1A1A1A" }} strokeWidth={2} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => onToggleFavourite(item.id)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart 
                className="w-5 h-5" 
                fill={isFavourite ? "#FF4500" : "none"}
                style={{ color: isFavourite ? "#FF4500" : "#1A1A1A" }} 
                strokeWidth={2} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-6">
        {/* Item Image */}
        <div 
          className="w-full aspect-square flex items-center justify-center overflow-hidden bg-gray-50 border-b border-[#E5E5E5]"
        >
          {item.image && item.image.startsWith('http') ? (
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span style={{ fontSize: "100px" }}>{item.image || "🏅"}</span>
          )}
        </div>

        <div className="px-6 py-6">
          {/* Tag & Price */}
          <div className="flex justify-between items-start mb-2">
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: "#FFF0F0", color: "#7A0019" }}
            >
              {item.category}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(item.created_at || item.createdAt)}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-gray-900 leading-tight">{item.title}</h1>
          
          <div className="text-3xl font-bold text-[#7A0019] mb-6">
            {item.price === 0 ? "Free" : `RM ${item.price}`}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="p-3 bg-gray-50 rounded-xl">
               <div className="flex items-center gap-2 mb-1 text-gray-500 text-xs">
                 <Tag className="w-3.5 h-3.5" /> Condition
               </div>
               <div className="font-semibold text-gray-900">{item.condition}</div>
             </div>
             <div className="p-3 bg-gray-50 rounded-xl">
               <div className="flex items-center gap-2 mb-1 text-gray-500 text-xs">
                 <MapPin className="w-3.5 h-3.5" /> Location
               </div>
               <div className="font-semibold text-gray-900 truncate">{item.location}</div>
             </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          {/* Seller Info */}
          <div className="border-t border-gray-100 pt-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Seller Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{item.seller_name || item.sellerName}</div>
                <div className="text-xs text-gray-500">Member since 2023</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex gap-3">
          {isOwner ? (
             <button
              className="w-full py-4 bg-gray-100 text-gray-900 rounded-xl font-semibold text-base"
             >
               Edit Listing
             </button>
          ) : (
            <>
              <button
                onClick={handleContactSeller}
                className="flex-1 py-4 flex items-center justify-center gap-2 bg-[#7A0019] text-white rounded-xl font-semibold text-base shadow-lg shadow-[#7A0019]/20 active:scale-[0.98] transition-all"
              >
                <MessageCircle className="w-5 h-5" strokeWidth={2} />
                Chat
              </button>

              <button
                className="flex-1 py-4 border border-[#7A0019] text-[#7A0019] rounded-xl font-semibold text-base active:bg-[#FFF9F5] transition-colors"
              >
                Make Offer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}