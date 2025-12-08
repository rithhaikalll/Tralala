// src/pages/DiscussionScreen.tsx
import { useEffect, useState } from "react";
import { Plus, MessageCircle, Heart } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

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
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-white px-6 py-6 border-b"
      style={{ borderColor: "#E5E5E5", transform: "none" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: "#000000", fontWeight: 600, fontSize: "20px" }}>
            Community Discussion
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "#555555", lineHeight: "1.6" }}
          >
            Connect with fellow sports enthusiasts
          </p>
        </div>
        <button
          onClick={() => onNavigate("create-discussion")}
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
  );
}

export function DiscussionScreen({ onNavigate }: DiscussionScreenProps) {
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
    <div className="h-full bg-white">
      {/* spacer reserved by app-level header */}
      <div className="h-10" />

      {/* Content */}
      <div
        className="px-6 py-2 space-y-3"
        style={{
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px) + 60px)",
        }}
      >
        {loading && (
          <p className="text-sm" style={{ color: "#888888" }}>
            Loading discussions…
          </p>
        )}

        {errorMsg && (
          <p className="text-sm text-red-500">
            Failed to load discussions: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && discussions.length === 0 && (
          <p className="text-sm" style={{ color: "#555555" }}>
            No discussions yet. Be the first to start one!
          </p>
        )}

        {discussions.map((post) => (
          <button
            key={post.id}
            onClick={() => onNavigate("discussion-detail", post.id)}
            className="w-full p-4 border bg-white text-left"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "#F5F5F5",
                  color: "#7A0019",
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
                      color: "#1A1A1A",
                      fontWeight: 600,
                      fontSize: "15px",
                    }}
                  >
                    {post.author_name || "Anonymous"}
                  </span>
                  <span className="text-xs" style={{ color: "#888888" }}>
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
                <p
                  className="text-sm mb-2"
                  style={{ color: "#1A1A1A", lineHeight: "1.6" }}
                >
                  {post.title}
                </p>
                <p
                  className="text-sm line-clamp-2"
                  style={{ color: "#555555", lineHeight: "1.6" }}
                >
                  {post.content}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span
                    className="flex items-center gap-1"
                    style={{ color: "#888888" }}
                  >
                    <MessageCircle className="w-3 h-3" /> {post.commentsCount}{" "}
                    comments
                  </span>
                  <span
                    className="flex items-center gap-1"
                    style={{ color: "#888888" }}
                  >
                    <Heart className="w-3 h-3" /> {post.likesCount} likes
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
