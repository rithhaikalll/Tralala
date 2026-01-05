import { ArrowLeft, Plus, Search, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

interface MarketplaceScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  currentUserId: string;
}

export function MarketplaceScreen({ 
  onNavigate, 
  currentUserId
}: MarketplaceScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [listings, setListings] = useState<any[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    try {
      // 1. Get Listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'Available')
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // 2. Get User Favorites
      const { data: favData, error: favError } = await supabase
        .from('marketplace_favorites')
        .select('listing_id')
        .eq('user_id', currentUserId);

      if (favError) throw favError;

      setListings(listingsData || []);
      setFavourites(favData?.map(f => f.listing_id) || []);

    } catch (err) {
      console.error("Error loading marketplace:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavourite = async (listingId: string) => {
    const isFav = favourites.includes(listingId);

    // Optimistic Update
    if (isFav) {
      setFavourites(prev => prev.filter(id => id !== listingId));
      await supabase.from('marketplace_favorites').delete().eq('user_id', currentUserId).eq('listing_id', listingId);
    } else {
      setFavourites(prev => [...prev, listingId]);
      await supabase.from('marketplace_favorites').insert({ user_id: currentUserId, listing_id: listingId });
    }
  };

  // Filter Logic
  const filteredListings = listings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("community")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" style={{ color: "#1A1A1A" }} strokeWidth={2} />
            </button>
            <div>
              <h2 style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "18px" }}>Marketplace</h2>
            </div>
          </div>
          <button
            onClick={() => onNavigate("create-listing")}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95"
            style={{ backgroundColor: "#7A0019", boxShadow: "0 2px 8px rgba(122, 0, 25, 0.2)" }}
          >
            <Plus className="w-5 h-5" style={{ color: "#FFFFFF" }} strokeWidth={2} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              style={{ color: "#6A6A6A" }} 
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-12 pr-4 py-3 border focus:border-[#7A0019] transition-colors"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "14px",
                fontSize: "15px",
                outline: "none"
              }}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {["All", "Badminton", "Futsal", "Running", "Gym"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="px-4 py-2 flex-shrink-0 transition-colors"
              style={{
                backgroundColor: category === selectedCategory ? "#7A0019" : "#F5F5F5",
                color: category === selectedCategory ? "#FFFFFF" : "#1A1A1A",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="px-6 py-4">
        {loading ? (
            <p className="text-center text-gray-500 mt-10">Loading marketplace...</p>
        ) : filteredListings.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No items found.</p>
        ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="border bg-white text-left overflow-hidden relative group"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
              }}
            >
              {/* Favourite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavourite(item.id);
                }}
                className="absolute top-2 right-2 p-2 z-10 transition-transform active:scale-95"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "50%"
                }}
              >
                <Heart
                  className="w-5 h-5"
                  fill={favourites.includes(item.id) ? "#FF4500" : "none"}
                  style={{ color: favourites.includes(item.id) ? "#FF4500" : "#6A6A6A" }}
                  strokeWidth={2}
                />
              </button>

              {/* Clickable Card */}
              <button
                onClick={() => onNavigate("marketplace-item-detail", { item })}
                className="w-full text-left"
              >
                {/* Image Placeholder */}
                <div 
                  className="w-full aspect-square flex items-center justify-center bg-gray-50 overflow-hidden"
                >
                  {item.image && item.image.startsWith('http') ? (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span style={{ fontSize: "48px" }}>{item.image || "🏅"}</span>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <div className="text-xs mb-1" style={{ color: "#7A0019", fontWeight: "500" }}>
                    {item.category}
                  </div>
                  <h3 className="mb-1 line-clamp-2" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "14px", lineHeight: "1.3" }}>
                    {item.title}
                  </h3>
                  <div className="text-xs mb-2" style={{ color: "#6A6A6A" }}>
                    {item.condition}
                  </div>
                  <div style={{ color: "#7A0019", fontWeight: "600", fontSize: "16px" }}>
                    {item.price === 0 ? "Free" : `RM ${item.price}`}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}