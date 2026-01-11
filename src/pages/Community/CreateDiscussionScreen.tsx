import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface CreateDiscussionScreenProps {
  onNavigate: (screen: string) => void;
  studentName: string;
}

export function CreateDiscussionScreen({
  onNavigate,
  studentName,
}: CreateDiscussionScreenProps) {
  const { theme, t } = useUserPreferences();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false); // ✅ has setter now

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;

    // ✅ ignore extra clicks while posting
    if (loading) return;

    setLoading(true);

    try {
      // get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        alert("You must be logged in to post.");
        return;
      }

      // get full_name from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
      }

      const authorName = profile?.full_name || "Student";

      const { error: insertError } = await supabase.from("discussions").insert({
        title: title.trim(),
        content: content.trim(),
        author_id: user.id,
        author_name: authorName,
      });

      if (insertError) {
        console.error(insertError);
        alert("Failed to create discussion.");
        return;
      }

      // navigate back to list
      onNavigate("discussion");
    } finally {
      setLoading(false); // ✅ always reset
    }
  };

  return (
    <div className="min-h-screen pb-20 transition-colors" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-6 py-6 border-b transition-colors"
        style={{ backgroundColor: theme.background, borderColor: theme.border }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("discussion")}
              style={{ color: theme.primary }}
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <h2
              style={{ color: theme.text, fontWeight: "600", fontSize: "20px" }}
            >
              {t('disc_create_title')}
            </h2>
          </div>
          <button
            onClick={handlePost}
            disabled={!title.trim() || !content.trim() || loading}
            className="px-5 h-9 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            style={{
              backgroundColor: theme.primary,
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "14px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            {loading ? t('disc_posting') : t('disc_post_btn')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-5">
        {/* Author Info */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: theme.mode === 1 ? "#333333" : "#F5F5F5",
              color: theme.primary,
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {studentName.charAt(0)}
          </div>
          <div>
            <div
              style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}
            >
              {studentName}
            </div>
            <div className="text-xs" style={{ color: theme.textSecondary }}>
              Posting as yourself
            </div>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block mb-2 text-sm"
            style={{ color: theme.text, fontWeight: "500" }}
          >
            {t('disc_input_title')}
          </label>
          <input
            id="title"
            type="text"
            placeholder={t('disc_input_title_ph')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 border transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              fontSize: "15px",
              color: theme.text,
            }}
          />
        </div>

        {/* Content Textarea */}
        <div>
          <label
            htmlFor="content"
            className="block mb-2 text-sm"
            style={{ color: theme.text, fontWeight: "500" }}
          >
            {t('disc_input_content')}
          </label>
          <textarea
            id="content"
            placeholder={t('disc_input_content_ph')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border resize-none transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              fontSize: "15px",
              color: theme.text,
              lineHeight: "1.6",
            }}
          />
        </div>

        {/* Guidelines Card */}
        <div
          className="border p-4 transition-colors"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            borderRadius: "14px"
          }}
        >
          <h4
            className="mb-2"
            style={{ color: theme.text, fontWeight: "500", fontSize: "14px" }}
          >
            {t('disc_guidelines_title')}
          </h4>
          <ul
            className="space-y-1.5 text-xs"
            style={{ color: theme.textSecondary, lineHeight: "1.6" }}
          >
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>{t('disc_guideline_1')}</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>{t('disc_guideline_2')}</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>{t('disc_guideline_3')}</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>{t('disc_guideline_4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
