import { ArrowLeft, MessageCircle, Heart, MapPin, Tag } from "lucide-react";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface MarketplaceItemDetailScreenProps {
  item: any;
  onNavigate: (screen: string, data?: any) => void;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  isOwner: boolean;
  onCreateMarketplaceChat: () => void;
}

export function MarketplaceItemDetailScreen({
  item,
  onNavigate,
  isFavourite,
  onToggleFavourite,
  isOwner,
  onCreateMarketplaceChat
}: MarketplaceItemDetailScreenProps) {
  const { theme, t } = useUserPreferences();

  if (!item) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-24 transition-colors" style={{ backgroundColor: theme.background }}>
      {/* 1. Image Header */}
      <div className="relative h-72" style={{ backgroundColor: theme.mode === 1 ? "#333333" : "#E5E5E5" }}>
        {item.image && item.image.startsWith('http') ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-lg" style={{ color: theme.textSecondary }}>
            {item.image || t('mkt_no_items')}
          </div>
        )}

        <button
          onClick={() => onNavigate("marketplace")}
          className="absolute top-4 left-4 p-2 rounded-full shadow-sm backdrop-blur-sm transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#1A1A1A" }} />
        </button>

        <button
          onClick={onToggleFavourite}
          className="absolute top-4 right-4 p-2 rounded-full shadow-sm backdrop-blur-sm active:scale-90 transition-transform"
          style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
        >
          <Heart className={`w-5 h-5 ${isFavourite ? "fill-red-500 text-red-500" : "text-gray-900"}`} />
        </button>
      </div>

      {/* 2. Content */}
      <div className="flex-1 -mt-6 rounded-t-3xl px-6 py-8 shadow-lg z-10 transition-colors" style={{ backgroundColor: theme.cardBg }}>
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold flex-1 mr-4" style={{ color: theme.text }}>{item.title}</h1>
          <span className="text-xl font-bold whitespace-nowrap" style={{ color: theme.primary }}>
            {item.price === 0 ? t('mkt_free') : formatCurrency(item.price)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <div className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1" style={{ backgroundColor: theme.mode === 1 ? "#333" : "#F3F4F6", color: theme.textSecondary }}>
            <Tag className="w-3 h-3" /> {item.category || "General"}
          </div>
          <div className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1" style={{ backgroundColor: theme.mode === 1 ? "#333" : "#F3F4F6", color: theme.textSecondary }}>
            <MapPin className="w-3 h-3" /> {item.location || "UTM Campus"}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 transition-colors" style={{ backgroundColor: theme.mode === 1 ? "#333" : "#F9FAFB" }}>
          <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: theme.primary }}>
            {item.seller_name ? item.seller_name.charAt(0) : "S"}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: theme.text }}>{item.seller_name || t('mkt_unknown_seller')}</p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>{t('mkt_seller')}</p>
          </div>
        </div>

        <h3 className="font-bold mb-2" style={{ color: theme.text }}>{t('mkt_desc')}</h3>
        <p className="text-sm leading-relaxed mb-8" style={{ color: theme.textSecondary }}>
          {item.description || t('mkt_no_desc')}
        </p>
      </div>

      {/* 3. Bottom Action Bar (The Button) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t safe-area-bottom z-50 transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex gap-3">
          {isOwner ? (
            <button className="flex-1 py-3 rounded-xl font-bold cursor-not-allowed transition-colors" style={{ backgroundColor: theme.mode === 1 ? "#333" : "#F3F4F6", color: theme.textSecondary }}>
              {t('mkt_your_listing')}
            </button>
          ) : (
            <button
              onClick={onCreateMarketplaceChat}
              className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              style={{ backgroundColor: theme.primary, boxShadow: `0 10px 15px -3px ${theme.primary}4D` }}
            >
              <MessageCircle className="w-5 h-5" />
              {t('mkt_chat_seller')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

