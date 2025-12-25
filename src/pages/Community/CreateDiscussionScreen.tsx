import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
// Access global preferences
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface CreateDiscussionScreenProps {
  onNavigate: (screen: string) => void;
  studentName: string;
}

export function CreateDiscussionScreen({
  onNavigate,
  studentName,
}: CreateDiscussionScreenProps) {
  // Consume theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const isMs = preferences.language_code === 'ms';

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    if (loading) return;

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        alert(isMs ? "Anda mesti log masuk untuk menghantar." : "You must be logged in to post.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
      }

      const authorName = profile?.full_name || studentName || "Student";

      const { error: insertError } = await supabase.from("discussions").insert({
        title: title.trim(),
        content: content.trim(),
        author_id: user.id,
        author_name: authorName,
      });

      if (insertError) {
        console.error(insertError);
        alert(isMs ? "Gagal mencipta perbincangan." : "Failed to create discussion.");
        return;
      }

      onNavigate("discussion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-6 py-6 border-b transition-colors"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
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
              {isMs ? "Perbincangan Baharu" : "New Discussion"}
            </h2>
          </div>
          <button
            onClick={handlePost}
            disabled={!title.trim() || !content.trim() || loading}
            className="px-5 h-9 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
            style={{
              backgroundColor: theme.primary,
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: `0 1px 2px ${theme.primary}40`,
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              isMs ? "Hantar" : "Post"
            )}
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
              backgroundColor: theme.background,
              color: theme.primary,
              fontWeight: "600",
              fontSize: "16px",
              border: `1px solid ${theme.border}`
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
              {isMs ? "Menghantar sebagai diri sendiri" : "Posting as yourself"}
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
            {isMs ? "Tajuk" : "Title"}
          </label>
          <input
            id="title"
            type="text"
            placeholder={isMs ? "Apa yang anda ingin bincangkan?" : "What would you like to discuss?"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 border transition-colors outline-none focus:ring-1"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.cardBg,
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
            {isMs ? "Kandungan" : "Content"}
          </label>
          <textarea
            id="content"
            placeholder={isMs ? "Kongsi fikiran anda dengan komuniti..." : "Share your thoughts with the community..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border transition-colors outline-none resize-none"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.cardBg,
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
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: "14px" }}
        >
          <h4
            className="mb-2"
            style={{ color: theme.text, fontWeight: "600", fontSize: "14px" }}
          >
            {isMs ? "Garis Panduan Komuniti" : "Community Guidelines"}
          </h4>
          <ul
            className="space-y-1.5 text-xs"
            style={{ color: theme.textSecondary, lineHeight: "1.6" }}
          >
            {[
              isMs ? "Bersikap sopan dan menghormati orang lain" : "Be respectful and courteous to others",
              isMs ? "Pastikan perbincangan relevan dengan sukan dan fasiliti" : "Keep discussions relevant to sports and facilities",
              isMs ? "Tiada spam, gangguan, atau kandungan yang tidak sesuai" : "No spam, harassment, or inappropriate content",
              isMs ? "Laporkan sebarang pelanggaran kepada pentadbir" : "Report any violations to administrators"
            ].map((text, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}