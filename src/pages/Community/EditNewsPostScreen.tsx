// src/pages/News/EditNewsPostScreen.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export function EditNewsPostScreen({
  postId,
  onNavigate,
}: {
  postId: string;
  onNavigate: (screen: string, data?: string) => void;
}) {
  const { theme, t } = useUserPreferences();
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
      toast.success(t('news_update_success'));
      onNavigate("news-detail", postId);
    } else {
      console.error("Update failed", error);
      toast.error(t('news_update_fail'));
    }
  };

  return (
    <div className="p-6 min-h-screen transition-colors" style={{ backgroundColor: theme.background }}>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => onNavigate("news-detail", postId)}
          style={{ color: theme.primary }}
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="text-xl font-semibold" style={{ color: theme.text }}>{t('news_edit_title')}</h1>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-3 rounded mb-4"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text
        }}
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-3 rounded h-40"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text
        }}
      />

      <button
        onClick={handleSave}
        className="mt-6 w-full h-12 text-white rounded transition-colors"
        style={{ backgroundColor: theme.primary }}
      >
        {t('news_save_changes')}
      </button>
    </div>
  );
}
