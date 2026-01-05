import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface CreateDiscussionScreenProps {
  onNavigate: (screen: string) => void;
  studentName: string;
}

export function CreateDiscussionScreen({
  onNavigate,
  studentName,
}: CreateDiscussionScreenProps) {
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
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-6 py-6 bg-white border-b"
        style={{ borderColor: "#E5E5E5" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("discussion")}
              style={{ color: "#7A0019" }}
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <h2
              style={{ color: "#000000", fontWeight: "600", fontSize: "20px" }}
            >
              New Discussion
            </h2>
          </div>
          <button
            onClick={handlePost}
            disabled={!title.trim() || !content.trim() || loading}
            className="px-5 h-9 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#7A0019",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "14px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            {loading ? "Posting..." : "Post"}
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
              backgroundColor: "#F5F5F5",
              color: "#7A0019",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {studentName.charAt(0)}
          </div>
          <div>
            <div
              style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px" }}
            >
              {studentName}
            </div>
            <div className="text-xs" style={{ color: "#888888" }}>
              Posting as yourself
            </div>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block mb-2 text-sm"
            style={{ color: "#1A1A1A", fontWeight: "500" }}
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="What would you like to discuss?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 border bg-white"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              fontSize: "15px",
              color: "#1A1A1A",
            }}
          />
        </div>

        {/* Content Textarea */}
        <div>
          <label
            htmlFor="content"
            className="block mb-2 text-sm"
            style={{ color: "#1A1A1A", fontWeight: "500" }}
          >
            Content
          </label>
          <textarea
            id="content"
            placeholder="Share your thoughts with the community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border bg-white resize-none"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              fontSize: "15px",
              color: "#1A1A1A",
              lineHeight: "1.6",
            }}
          />
        </div>

        {/* Guidelines Card */}
        <div
          className="border bg-white p-4"
          style={{ borderColor: "#E5E5E5", borderRadius: "14px" }}
        >
          <h4
            className="mb-2"
            style={{ color: "#1A1A1A", fontWeight: "500", fontSize: "14px" }}
          >
            Community Guidelines
          </h4>
          <ul
            className="space-y-1.5 text-xs"
            style={{ color: "#555555", lineHeight: "1.6" }}
          >
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>Be respectful and courteous to others</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>Keep discussions relevant to sports and facilities</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>No spam, harassment, or inappropriate content</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>Report any violations to administrators</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
