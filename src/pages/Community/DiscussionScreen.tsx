import { useEffect, useState } from "react";
import { Plus, MessageCircle, Heart } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
// 1. Import the global preferences hook
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_name?: string | null;
  commentsCount: number;
  likesCount: number;
}

interface DiscussionScreenProps {
  onNavigate: (screen: string, data?: string) => void;
}

export function DiscussionScreenHeader({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) {
  // 2. Consume global theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b transition-colors duration-300"
      style={{ 
        borderColor: theme.border, 
        backgroundColor: theme.cardBg,
        transform: "none" 
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: theme.text, fontWeight: 600, fontSize: "20px" }}>
            {isMs ? "Perbincangan Komuniti" : "Community Discussion"}
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: theme.textSecondary, lineHeight: "1.6" }}
          >
            {isMs ? "Berhubung dengan peminat sukan lain" : "Connect with fellow sports enthusiasts"}
          </p>
        </div>
        <button
          onClick={() => onNavigate("create-discussion")}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{
            backgroundColor: theme.primary,
            boxShadow: `0 2px 8px ${theme.primary}40`,
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
  );
}

export function DiscussionScreen({ onNavigate }: DiscussionScreenProps) {
  const { theme, t, preferences } = useUserPreferences();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("discussions")
        .select(`
          id,
          title,
          content,
          created_at,
          author_name,
          discussion_comments(count),
          discussion_likes(count)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading discussions", error);
        setErrorMsg(error.message);
        setDiscussions([]);
      } else {
        const mapped: Discussion[] = (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          content: row.content,
          created_at: row.created_at,
          author_name: row.author_name,
          commentsCount: row.discussion_comments?.[0]?.count ?? 0,
          likesCount: row.discussion_likes?.[0]?.count ?? 0,
        }));
        setDiscussions(mapped);
      }
      setLoading(false);
    };

    fetchDiscussions();
  }, []);

  return (
    <div className="h-full transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <div className="h-10" />

      <div
        className="px-6 py-2 space-y-3"
        style={{
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px) + 60px)",
        }}
      >
        {loading && (
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {t("view_all")}...
          </p>
        )}

        {errorMsg && (
          <p className="text-sm text-red-500">
            {preferences.language_code === 'ms' ? 'Gagal memuatkan perbincangan' : 'Failed to load discussions'}: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && discussions.length === 0 && (
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {preferences.language_code === 'ms' ? 'Tiada perbincangan lagi. Jadi yang pertama!' : 'No discussions yet. Be the first to start one!'}
          </p>
        )}

        {discussions.map((post) => (
          <button
            key={post.id}
            onClick={() => onNavigate("discussion-detail", post.id)}
            className="w-full p-4 border text-left transition-all active:scale-[0.98]"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: theme.background,
                  color: theme.primary,
                  fontWeight: 600,
                  border: `1px solid ${theme.border}`
                }}
              >
                {(post.author_name || "U").charAt(0)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    style={{
                      color: theme.text,
                      fontWeight: 600,
                      fontSize: "15px",
                    }}
                  >
                    {post.author_name || "Anonymous"}
                  </span>
                  <span className="text-[10px]" style={{ color: theme.textSecondary }}>
                    {new Date(post.created_at).toLocaleString(preferences.language_code === 'ms' ? 'ms-MY' : 'en-US')}
                  </span>
                </div>
                <p
                  className="text-sm mb-2 font-bold"
                  style={{ color: theme.text, lineHeight: "1.6" }}
                >
                  {post.title}
                </p>
                <p
                  className="text-sm line-clamp-2"
                  style={{ color: theme.textSecondary, lineHeight: "1.6" }}
                >
                  {post.content}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span
                    className="flex items-center gap-1"
                    style={{ color: theme.textSecondary }}
                  >
                    <MessageCircle className="w-3 h-3" /> {post.commentsCount}{" "}
                    {preferences.language_code === 'ms' ? 'komen' : 'comments'}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    style={{ color: theme.textSecondary }}
                  >
                    <Heart className="w-3 h-3" /> {post.likesCount} {preferences.language_code === 'ms' ? 'suka' : 'likes'}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}