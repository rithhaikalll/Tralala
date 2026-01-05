import { ArrowLeft, X, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

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
        toast.error("Image size must be less than 5MB");
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
      toast.error("Please fill in all required fields");
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

      toast.success("Listing published successfully!");
      onNavigate("marketplace");
      
    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast.error("Failed to create listing: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("marketplace")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" style={{ color: "#1A1A1A" }} strokeWidth={2} />
            </button>
            <h2 style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "18px" }}>Create Listing</h2>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-6">
        {/* Listing Type */}
        <div className="mb-6">
          <label className="block mb-3" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}>
            Listing Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setListingType("sale")}
              className="p-4 border text-center transition-colors"
              style={{
                borderColor: listingType === "sale" ? "#7A0019" : "#E5E5E5",
                borderRadius: "14px",
                backgroundColor: listingType === "sale" ? "#FFF9F5" : "#FFFFFF",
                color: listingType === "sale" ? "#7A0019" : "#1A1A1A",
                fontWeight: listingType === "sale" ? "600" : "500"
              }}
            >
              For Sale
            </button>
            <button
              onClick={() => setListingType("loan")}
              className="p-4 border text-center transition-colors"
              style={{
                borderColor: listingType === "loan" ? "#7A0019" : "#E5E5E5",
                borderRadius: "14px",
                backgroundColor: listingType === "loan" ? "#FFF9F5" : "#FFFFFF",
                color: listingType === "loan" ? "#7A0019" : "#1A1A1A",
                fontWeight: listingType === "loan" ? "600" : "500"
              }}
            >
              For Loan
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}>
            Item Name *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Yonex Badminton Racket"
            className="w-full px-4 py-3 border focus:border-[#7A0019] transition-colors"
            style={{ borderColor: "#E5E5E5", borderRadius: "14px", fontSize: "15px", outline: "none" }}
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}>
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border focus:border-[#7A0019] transition-colors"
            style={{ borderColor: "#E5E5E5", borderRadius: "14px", fontSize: "15px", outline: "none" }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}>
            {listingType === "sale" ? "Price (RM) *" : "Loan Terms *"}
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={listingType === "sale" ? "e.g., 150" : "e.g., 0 for free"}
            className="w-full px-4 py-3 border focus:border-[#7A0019] transition-colors"
            style={{ borderColor: "#E5E5E5", borderRadius: "14px", fontSize: "15px", outline: "none" }}
          />
        </div>

        {/* Condition */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}>
            Condition *
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-4 py-3 border focus:border-[#7A0019] transition-colors"
            style={{ borderColor: "#E5E5E5", borderRadius: "14px", fontSize: "15px", outline: "none" }}
          >
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}>
            Meetup Location *
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 border focus:border-[#7A0019] transition-colors"
            style={{ borderColor: "#E5E5E5", borderRadius: "14px", fontSize: "15px", outline: "none" }}
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}>
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item..."
            rows={5}
            className="w-full px-4 py-3 border resize-none focus:border-[#7A0019] transition-colors"
            style={{ borderColor: "#E5E5E5", borderRadius: "14px", fontSize: "15px", outline: "none" }}
          />
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block mb-2" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}>
            Photo (Optional)
          </label>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden" 
            accept="image/*"
          />

          {imagePreview ? (
            <div className="relative w-full h-48 rounded-[14px] overflow-hidden border border-[#E5E5E5]">
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
              className="w-full p-8 border-2 border-dashed flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "14px",
                color: "#6A6A6A"
              }}
            >
              <ImageIcon className="w-8 h-8" strokeWidth={1.5} />
              <span style={{ fontSize: "14px" }}>Click to upload photo</span>
              <span className="text-xs">Max 5MB</span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{
            backgroundColor: "#7A0019",
            color: "#FFFFFF",
            borderRadius: "14px",
            fontWeight: "600",
            fontSize: "16px",
            boxShadow: "0 2px 8px rgba(122, 0, 25, 0.2)"
          }}
        >
          {loading ? "Publishing..." : "Publish Listing"}
        </button>
      </div>
    </div>
  );
}