import { ArrowLeft, X, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface CreateListingScreenProps {
  onNavigate: (screen: string) => void;
  studentId: string;
  studentName: string;
}

export function CreateListingScreen({
  onNavigate,
  studentId,
  studentName
}: CreateListingScreenProps) {
  const { theme, t } = useUserPreferences();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Badminton");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Like New");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("UTM Johor Bahru - Sports Center");
  const [listingType, setListingType] = useState<"sale" | "loan">("sale");

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["Badminton", "Futsal", "Running", "Gym", "Volleyball", "Tennis", "Basketball", "Swimming"];
  const conditions = ["New", "Like New", "Good", "Fair"];
  const locations = [
    "UTM Johor Bahru - Sports Center",
    "UTM Johor Bahru - Sports Complex",
    "UTM Johor Bahru - Fitness Center",
    "UTM Johor Bahru - Residential College",
    "UTM Johor Bahru - Tennis Court",
    "UTM Johor Bahru - Volleyball Court"
  ];

  // Fallback emoji logic
  const getCategoryEmoji = (cat: string) => {
    const emojiMap: Record<string, string> = {
      "Badminton": "🏸",
      "Futsal": "⚽",
      "Running": "👟",
      "Gym": "🧤",
      "Volleyball": "🏐",
      "Tennis": "🎾",
      "Basketball": "🏀",
      "Swimming": "🏊"
    };
    return emojiMap[cat] || "🏅";
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('mkt_upload_error'));
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !description) {
      toast.error(t('mkt_fill_error'));
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = getCategoryEmoji(category); // Default to emoji if no image

      // 1. Upload Image to Supabase Storage if a file is selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${studentId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Make sure you created the 'marketplace-images' bucket in Supabase!
        const { error: uploadError } = await supabase.storage
          .from('marketplace-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('marketplace-images')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      // 2. Insert Listing Data
      const { error } = await supabase.from('marketplace_listings').insert({
        title,
        category,
        price: parseFloat(price),
        condition,
        description,
        location,
        listing_type: listingType,
        seller_id: studentId,
        seller_name: studentName,
        image: finalImageUrl, // Stores either URL or Emoji
        status: "Available"
      });

      if (error) throw error;

      toast.success(t('mkt_success'));
      onNavigate("marketplace");

    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast.error(t('mkt_fail') + ": " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 transition-colors" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b transition-colors" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("marketplace")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" style={{ color: theme.text }} strokeWidth={2} />
            </button>
            <h2 style={{ color: theme.text, fontWeight: "600", fontSize: "18px" }}>{t('mkt_create')}</h2>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-6">
        {/* Listing Type */}
        <div className="mb-6">
          <label className="block mb-3" style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
            {t('mkt_type')} *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setListingType("sale")}
              className="p-4 border text-center transition-colors"
              style={{
                borderColor: listingType === "sale" ? theme.primary : theme.border,
                borderRadius: "14px",
                backgroundColor: listingType === "sale" ? `${theme.primary}10` : theme.cardBg,
                color: listingType === "sale" ? theme.primary : theme.text,
                fontWeight: listingType === "sale" ? "600" : "500"
              }}
            >
              {t('mkt_type_sale')}
            </button>
            <button
              onClick={() => setListingType("loan")}
              className="p-4 border text-center transition-colors"
              style={{
                borderColor: listingType === "loan" ? theme.primary : theme.border,
                borderRadius: "14px",
                backgroundColor: listingType === "loan" ? `${theme.primary}10` : theme.cardBg,
                color: listingType === "loan" ? theme.primary : theme.text,
                fontWeight: listingType === "loan" ? "600" : "500"
              }}
            >
              {t('mkt_type_loan')}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
            {t('mkt_item_name')} *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Yonex Badminton Racket"
            className="w-full px-4 py-3 border transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              fontSize: "15px",
              outline: "none",
              color: theme.text
            }}
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
            {t('mkt_category')} *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              fontSize: "15px",
              outline: "none",
              color: theme.text
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
            {listingType === "sale" ? t('mkt_price') : `${t('mkt_loan_terms')}`} *
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={listingType === "sale" ? "e.g., 150" : "e.g., 0 for free"}
            className="w-full px-4 py-3 border transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              fontSize: "15px",
              outline: "none",
              color: theme.text
            }}
          />
        </div>

        {/* Condition */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
            {t('mkt_condition')} *
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-4 py-3 border transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              fontSize: "15px",
              outline: "none",
              color: theme.text
            }}
          >
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
            {t('mkt_meetup')} *
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 border transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              fontSize: "15px",
              outline: "none",
              color: theme.text
            }}
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
            {t('mkt_desc')} *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item..."
            rows={5}
            className="w-full px-4 py-3 border resize-none transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              fontSize: "15px",
              outline: "none",
              color: theme.text
            }}
          />
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>
            {t('mkt_photo')}
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
            accept="image/*"
          />

          {imagePreview ? (
            <div className="relative w-full h-48 rounded-[14px] overflow-hidden border" style={{ borderColor: theme.border }}>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 z-10"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed flex flex-col items-center gap-2 hover:bg-opacity-50 transition-colors"
              style={{
                borderColor: theme.border,
                borderRadius: "14px",
                color: theme.textSecondary,
                backgroundColor: theme.mode === 1 ? "#2A2A2A" : "#FAFAFA"
              }}
            >
              <ImageIcon className="w-8 h-8" strokeWidth={1.5} />
              <span style={{ fontSize: "14px" }}>{t('mkt_upload_ph')}</span>
              <span className="text-xs">{t('mkt_upload_sub')}</span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{
            backgroundColor: theme.primary,
            color: "#FFFFFF",
            borderRadius: "14px",
            fontWeight: "600",
            fontSize: "16px",
            boxShadow: `0 2px 8px ${theme.primary}33`
          }}
        >
          {loading ? t('mkt_publishing') : t('mkt_publish')}
        </button>
      </div>
    </div>
  );
}
