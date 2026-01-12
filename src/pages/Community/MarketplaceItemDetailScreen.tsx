import { ArrowLeft, MessageCircle, Heart, MapPin, Tag, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useUserPreferences } from "../../lib/UserPreferencesContext";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

// --- INTERNAL MODAL COMPONENT ---
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Delete", isDelete = true }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl w-full max-w-xs p-6 shadow-xl transform transition-all scale-100">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className={`w-6 h-6 ${isDelete ? "text-red-500" : "text-blue-500"}`} />
          <h3 className={`text-lg font-bold ${isDelete ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`py-2.5 px-4 rounded-xl text-white font-semibold shadow-md active:scale-95 transition-transform ${isDelete ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN SCREEN ---
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!item) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.success("Listing deleted successfully");
      onNavigate("marketplace");
    } catch (err: any) {
      console.error("Error deleting item:", err);
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-24 transition-colors" style={{ backgroundColor: theme.background }}>
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Listing?"
        message="This action will permanently delete your listing. This cannot be undone."
        confirmLabel="Delete"
      />

      {/* 1. Image Header */}
      <div className="relative h-72" style={{ backgroundColor: theme.mode === 1 ? "#333333" : "#E5E5E5" }}>
        {item.image && item.image.startsWith('http') ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-lg" style={{ color: theme.textSecondary }}>
            {item.image || t('mkt_no_items')}
          </div>
        )}
        <button onClick={() => onNavigate("marketplace")} className="absolute top-4 left-4 p-2 rounded-full shadow-sm backdrop-blur-sm transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#1A1A1A" }} />
        </button>
        <button onClick={onToggleFavourite} className="absolute top-4 right-4 p-2 rounded-full shadow-sm backdrop-blur-sm active:scale-90 transition-transform" style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
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

      {/* 3. Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t safe-area-bottom z-50 transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex gap-3">
          {isOwner ? (
            <button onClick={() => setIsDeleteModalOpen(true)} className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2" style={{ backgroundColor: "#DC2626", boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)" }}>
              <Trash2 className="w-5 h-5" />
              Delete Listing
            </button>
          ) : (
            <button onClick={onCreateMarketplaceChat} className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2" style={{ backgroundColor: theme.primary, boxShadow: `0 10px 15px -3px ${theme.primary}4D` }}>
              <MessageCircle className="w-5 h-5" />
              {t('mkt_chat_seller')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}