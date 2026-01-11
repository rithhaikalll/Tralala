// src/pages/News/NewsPostDetailScreen.tsx
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface Props {
  postId: string;
  userRole?: "student" | "staff";
  onNavigate: (screen: string, data?: string) => void;
}

export function NewsPostDetailScreen({
  postId,
  userRole,
  onNavigate,
}: Props) {
  const { theme, t } = useUserPreferences();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) {
        console.error("Error loading post", error);
        setPost(null);
      } else {
        setPost(data);
      }

      setLoading(false);
    };

    load();
  }, [postId]);

  const handleDelete = async () => {
    const { error } = await supabase
      .from("news_posts")
      .delete()
      .eq("id", postId);

    if (!error) {
      onNavigate("news-feed");
    } else {
      console.error("Delete failed", error);
    }
  };

  if (loading) {
    return <p className="p-6 text-sm" style={{ color: theme.textSecondary }}>{t('loading')}</p>;
  }

  if (!post) {
    return (
      <div className="p-6 transition-colors" style={{ backgroundColor: theme.background }}>
        <button onClick={() => onNavigate("news-feed")}>
          <ArrowLeft style={{ color: theme.text }} />
        </button>
        <p style={{ color: theme.text }}>{t('news_post_not_found')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: theme.background }}>
      <div className="px-6 py-6 border-b flex justify-between items-center" style={{ borderColor: theme.border }}>
        <button
          onClick={() => onNavigate("news-feed")}
          style={{ color: theme.primary }}
        >
          <ArrowLeft />
        </button>

        {userRole === "staff" && (
          <div className="flex gap-3">
            <button onClick={() => onNavigate("edit-news-post", postId)} style={{ color: theme.text }}>
              <Edit />
            </button>
            <button onClick={handleDelete} style={{ color: theme.text }}>
              <Trash2 />
            </button>
          </div>
        )}
      </div>

      {post.image_url && (
        <img
          src={post.image_url}
          className="w-full h-64 object-cover"
        />
      )}

      <div className="px-6 py-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold" style={{ color: theme.text }}>{post.title}</h1>
        <p className="mt-4" style={{ color: theme.textSecondary, lineHeight: "1.6" }}>{post.content}</p>
      </div>
    </div>
  );
}

