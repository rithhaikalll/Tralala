// src/pages/News/NewsPostDetailScreen.tsx
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
    return <p className="p-6 text-sm text-gray-500">Loading…</p>;
  }

  if (!post) {
    return (
      <div className="p-6">
        <button onClick={() => onNavigate("news-feed")}>
          <ArrowLeft />
        </button>
        <p>Post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-6 border-b flex justify-between items-center">
        <button
          onClick={() => onNavigate("news-feed")}
          className="text-[#7A0019]"
        >
          <ArrowLeft />
        </button>

        {userRole === "staff" && (
          <div className="flex gap-3">
            <button onClick={() => onNavigate("edit-news-post", postId)}>
              <Edit />
            </button>
            <button onClick={handleDelete}>
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
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        <p className="mt-4 text-gray-700">{post.content}</p>
      </div>
    </div>
  );
}
