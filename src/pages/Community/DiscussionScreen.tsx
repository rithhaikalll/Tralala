// src/pages/DiscussionScreen.tsx
import { useEffect, useState } from "react";
import { Plus, MessageCircle, Heart, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import { useNavigate } from "react-router-dom"; // Added useNavigate
import { supabase } from "../../lib/supabaseClient";
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
  const { theme, t } = useUserPreferences();
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b transition-colors"
      style={{ backgroundColor: theme.background, borderColor: theme.border, transform: "none" }}
    >
      <div className="flex items-center justify-between">
        
        {/* Left Side: Back Button + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="-ml-2 p-2 rounded-full hover:bg-black/5 transition-colors"
            style={{ color: theme.primary }}
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </button>

          <div>
            <h2 style={{ color: theme.text, fontWeight: 600, fontSize: "20px" }}>
              {t('disc_title')}
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: theme.textSecondary, lineHeight: "1.6" }}
            >
              {t('disc_subtitle')}
            </p>
          </div>
        </div>

        {/* Right Side: Create Button */}
        <button
          onClick={() => onNavigate("create-discussion")}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{
            backgroundColor: theme.primary,
            boxShadow: `0 4px 12px ${theme.primary}4D`, // 30% opacity
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
  const { theme, t } = useUserPreferences();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoading(true);
      setErrorMsg(null);

      // assumes FK: discussion_comments.discussion_id -> discussions.id
      // and     FK: discussion_likes.discussion_id     -> discussions.id
      const { data, error } = await supabase
        .from("discussions")
        .select(
          `
          id,
          title,
          content,
          created_at,
          author_name,
          discussion_comments(count),
          discussion_likes(count)
        `
        )
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
    <div className="h-full transition-colors" style={{ backgroundColor: theme.background }}>
      {/* spacer reserved by app-level header */}
      <div className="h-24" />

      {/* Content */}
      <div
        className="px-6 py-2 space-y-3"
        style={{
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px) + 60px)",
        }}
      >
        {loading && (
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {t('disc_loading')}
          </p>
        )}

        {errorMsg && (
          <p className="text-sm text-red-500">
            {t('disc_failed')}: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && discussions.length === 0 && (
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {t('disc_no_posts')}
          </p>
        )}

        {discussions.map((post) => (
          <button
            key={post.id}
            onClick={() => onNavigate("discussion-detail", post.id)}
            className="w-full p-4 border text-left transition-colors active:bg-gray-50/5"
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
                  backgroundColor: theme.mode === 1 ? "#333333" : "#F5F5F5",
                  color: theme.primary,
                  fontWeight: 600,
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
                    {post.author_name || t('disc_anonymous')}
                  </span>
                  <span className="text-xs" style={{ color: theme.textSecondary }}>
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
                <p
                  className="text-sm mb-2"
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
                    {t('disc_comments')}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    style={{ color: theme.textSecondary }}
                  >
                    <Heart className="w-3 h-3" /> {post.likesCount} {t('disc_likes')}
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