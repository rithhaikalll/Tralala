import { ArrowLeft, MessageCircle, Heart, MapPin, Tag } from "lucide-react";

interface MarketplaceItemDetailScreenProps {
  item: any;
  onNavigate: (screen: string, data?: any) => void;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  isOwner: boolean;
  onCreateMarketplaceChat: () => void; // <--- Make sure this is here
}

export function MarketplaceItemDetailScreen({
  item,
  onNavigate,
  isFavourite,
  onToggleFavourite,
  isOwner,
  onCreateMarketplaceChat
}: MarketplaceItemDetailScreenProps) {
  
  if (!item) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative pb-24">
      {/* 1. Image Header */}
      <div className="relative h-72 bg-gray-200">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
        
        <button 
          onClick={() => onNavigate("marketplace")}
          className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>

        <button 
          onClick={onToggleFavourite}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white active:scale-90 transition-transform"
        >
          <Heart className={`w-5 h-5 ${isFavourite ? "fill-red-500 text-red-500" : "text-gray-900"}`} />
        </button>
      </div>

      {/* 2. Content */}
      <div className="flex-1 -mt-6 bg-white rounded-t-3xl px-6 py-8 shadow-lg z-10">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900 flex-1 mr-4">{item.title}</h1>
          <span className="text-xl font-bold text-[#7A0019] whitespace-nowrap">
            {formatCurrency(item.price)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium flex items-center gap-1">
            <Tag className="w-3 h-3" /> {item.category || "General"}
          </div>
          <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {item.location || "UTM Campus"}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
          <div className="w-10 h-10 rounded-full bg-[#7A0019] text-white flex items-center justify-center font-bold">
            {item.seller_name ? item.seller_name.charAt(0) : "S"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{item.seller_name || "Unknown Seller"}</p>
            <p className="text-xs text-gray-500">Seller</p>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 mb-2">Description</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          {item.description || "No description provided."}
        </p>
      </div>

      {/* 3. Bottom Action Bar (The Button) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-bottom z-50">
        <div className="flex gap-3">
          {isOwner ? (
            <button className="flex-1 py-3 bg-gray-100 text-gray-400 rounded-xl font-bold cursor-not-allowed">
              This is your listing
            </button>
          ) : (
            <button 
              onClick={onCreateMarketplaceChat} 
              className="flex-1 py-3 bg-[#7A0019] text-white rounded-xl font-bold shadow-lg shadow-red-900/10 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with Seller
            </button>
          )}
        </div>
      </div>
    </div>
  );
}