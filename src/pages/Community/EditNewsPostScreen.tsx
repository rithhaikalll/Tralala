// src/pages/News/EditNewsPostScreen.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function EditNewsPostScreen({
  postId,
  onNavigate,
}: {
  postId: string;
  onNavigate: (screen: string, data?: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("title, content")
        .eq("id", postId)
        .single();

      if (data) {
        setTitle(data.title);
        setContent(data.content);
      }
    };

    load();
  }, [postId]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("news_posts")
      .update({ title, content })
      .eq("id", postId);

    if (!error) {
      onNavigate("news-detail", postId);
    } else {
      console.error("Update failed", error);
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-xl font-semibold mb-4">Edit News</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-3 rounded mb-4"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-3 rounded h-40"
      />

      <button
        onClick={handleSave}
        className="mt-6 w-full h-12 bg-[#7A0019] text-white rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
