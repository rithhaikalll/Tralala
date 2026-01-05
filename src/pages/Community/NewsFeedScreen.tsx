// src/pages/News/NewsFeedScreen.tsx
import { Calendar, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";


interface NewsFeedScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  userRole?: "student" | "staff";
}

interface NewsPost {
  id: string;
  title: string;
  category: string;
  content: string; // We'll derive excerpt from this
  created_at: string;
  author_name: string;
  image_url: string | null;
}

export function NewsFeedScreen({ onNavigate, userRole }: NewsFeedScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newsData, setNewsData] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["all", "Facilities", "Events", "Maintenance", "Features", "Announcements"];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNewsData(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = selectedCategory === "all"
    ? newsData
    : newsData.filter(news => news.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Facilities":
        return { bg: "#F0F9FF", text: "#0369A1" };
      case "Events":
        return { bg: "#FFF7ED", text: "#C2410C" };
      case "Maintenance":
        return { bg: "#FEF2F2", text: "#991B1B" };
      case "Features":
        return { bg: "#F0FDF4", text: "#15803D" };
      case "Announcements":
        return { bg: "#F5F3FF", text: "#6D28D9" };
      default:
        return { bg: "#F5F5F5", text: "#6A6A6A" };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
  <div className="min-h-screen bg-white pb-20">
    {/* Updated Header with Create Button */}
    <div className="sticky top-0 z-40 bg-white px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="mb-1"
            style={{
              color: "#7A0019",
              fontWeight: "600",
              fontSize: "20px",
              letterSpacing: "-0.01em"
            }}
          >
            News Feed
          </h1>
          <p
            className="text-sm"
            style={{ color: "#555555", lineHeight: "1.6" }}
          >
            Latest updates and announcements
          </p>
        </div>

        {/* --- NEW BUTTON ADDED HERE (Staff Only) --- */}
        
          <button
            onClick={() => onNavigate("create-news-post")}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "#7A0019",
              boxShadow: "0 2px 8px rgba(122, 0, 25, 0.2)",
            }}
          >
            <Plus
              className="w-5 h-5"
              style={{ color: "#FFFFFF" }}
              strokeWidth={2}
            />
          </button>
        
      </div>
    </div>

      {/* Category Filter */}
      <div className="px-6 py-4 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 whitespace-nowrap transition-all"
                style={{
                  backgroundColor: isActive ? "#7A0019" : "#F5F5F5",
                  color: isActive ? "#FFFFFF" : "#6A6A6A",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- ADD BOX FOR STAFF --- */}
      {userRole === "staff" && (
        <div className="px-6 pb-2">
          <button
            onClick={() => onNavigate("create-news-post")}
            className="w-full flex items-center gap-3 p-4 border transition-all active:scale-[0.99]"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
            }}
          >
            <div 
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{ backgroundColor: "#FFF0F3" }}
            >
              <Plus className="w-5 h-5" style={{ color: "#7A0019" }} strokeWidth={2.5} />
            </div>
            <div className="flex-1 text-left">
              <span 
                className="block"
                style={{ color: "#6A6A6A", fontSize: "15px", fontWeight: "500" }}
              >
                Create a new announcement...
              </span>
            </div>
          </button>
        </div>
      )}

      {/* News List */}
      <div className="px-6 pb-6 space-y-4 pt-2">
        {loading ? (
          <div className="text-center py-12" style={{ color: "#6A6A6A" }}>
            <p>Loading news...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12" style={{ color: "#6A6A6A" }}>
            <p>No updates available.</p>
          </div>
        ) : (
          filteredNews.map((news) => {
            const categoryStyle = getCategoryColor(news.category);
            // Create a simple excerpt from content
            const excerpt = news.content.length > 100 
              ? news.content.substring(0, 100) + "..." 
              : news.content;

            return (
              <div
                key={news.id}
                onClick={() => onNavigate("news-detail", news.id)}
                className="border bg-white overflow-hidden cursor-pointer transition-all hover:shadow-md"
                style={{
                  borderColor: "#E5E5E5",
                  borderRadius: "14px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
                }}
              >
                {/* Image */}
                {news.image_url && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  {/* Category Badge */}
                  <div
                    className="inline-block px-3 py-1 mb-3"
                    style={{
                      backgroundColor: categoryStyle.bg,
                      color: categoryStyle.text,
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    {news.category}
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-2"
                    style={{
                      color: "#1A1A1A",
                      fontWeight: "600",
                      fontSize: "16px",
                      lineHeight: "1.4"
                    }}
                  >
                    {news.title}
                  </h3>

                  {/* Excerpt */}
                  <p
                    className="mb-4"
                    style={{
                      color: "#6A6A6A",
                      fontSize: "14px",
                      lineHeight: "1.6"
                    }}
                  >
                    {excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          className="w-4 h-4"
                          style={{ color: "#888888" }}
                          strokeWidth={1.5}
                        />
                        <span
                          style={{
                            color: "#888888",
                            fontSize: "13px"
                          }}
                        >
                          {formatDate(news.created_at)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className="w-5 h-5"
                      style={{ color: "#888888" }}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (Staff Only) - Secondary */}
      {userRole === "staff" && (
        <button
          onClick={() => onNavigate("create-news-post")}
          className="fixed bottom-24 right-6 w-14 h-14 flex items-center justify-center shadow-lg transition-transform active:scale-95"
          style={{
            backgroundColor: "#7A0019",
            borderRadius: "14px",
            boxShadow: "0 4px 12px rgba(122, 0, 25, 0.3)"
          }}
        >
          <Plus className="w-6 h-6" style={{ color: "#FFFFFF" }} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}