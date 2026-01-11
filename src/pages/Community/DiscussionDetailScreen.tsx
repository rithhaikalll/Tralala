import { ArrowLeft, Heart, MessageCircle, Trash2, Flag } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface DiscussionDetailScreenProps {
  postId: string;
  onNavigate: (screen: string) => void;
  studentName: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author_id?: string;
  author_name: string;
  created_at: string;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export function DiscussionDetailScreen({
  postId,
  onNavigate,
  studentName,
}: DiscussionDetailScreenProps) {
  const { theme, t } = useUserPreferences();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "post" | "comment";
    id: string;
  } | null>(null);

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const [reported, setReported] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState<
    "spam" | "harassment" | "false_info" | "other"
  >("spam");

  const [loading, setLoading] = useState(true);

  // Load post + comments + like/report state
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ----- POST -----
      const { data: postRow, error: postError } = await supabase
        .from("discussions")
        .select("id, title, content, author_id, author_name, created_at")
        .eq("id", postId)
        .maybeSingle();

      if (postError) {
        console.error("Error loading post", postError);
        setLoading(false);
        return;
      }

      if (postRow) {
        let displayName = postRow.author_name as string;

        if (postRow.author_id) {
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", postRow.author_id)
            .maybeSingle();
          if (profileRow?.full_name) displayName = profileRow.full_name;
        }

        setPost({
          id: postRow.id,
          title: postRow.title,
          content: postRow.content,
          author_id: postRow.author_id,
          author_name: displayName,
          created_at: postRow.created_at,
        });
      }

      // ----- COMMENTS (latest first) -----
      const { data: commentRows, error: commentsError } = await supabase
        .from("discussion_comments")
        .select("id, author_id, author_name, content, created_at")
        .eq("discussion_id", postId)
        .order("created_at", { ascending: false });

      if (commentsError) {
        console.error("Error loading comments", commentsError);
      } else {
        const rows = (commentRows || []) as (Comment & {
          author_id?: string;
        })[];

        const authorIds = Array.from(
          new Set(rows.map((r) => r.author_id).filter(Boolean))
        );
        let profilesMap: Record<string, string> = {};

        if (authorIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", authorIds as string[]);

          if (profiles) {
            profilesMap = Object.fromEntries(
              profiles.map((p: any) => [p.id, p.full_name])
            );
          }
        }

        const normalizedComments: Comment[] = rows.map((r) => ({
          id: r.id,
          author_name: profilesMap[r.author_id || ""] || r.author_name,
          content: r.content,
          created_at: r.created_at,
        }));

        setComments(normalizedComments);
      }

      // ----- LIKES -----
      const { count, error: likesError } = await supabase
        .from("discussion_likes")
        .select("id", { count: "exact", head: true })
        .eq("discussion_id", postId);

      if (likesError) {
        console.error("Error loading likes", likesError);
      }
      setLikeCount(count ?? 0);

      if (user) {
        const { data: myLike } = await supabase
          .from("discussion_likes")
          .select("id")
          .eq("discussion_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();
        setLiked(!!myLike);

        // ----- REPORTED? -----
        const { data: myReport, error: reportError } = await supabase
          .from("discussion_reports")
          .select("id")
          .eq("discussion_id", postId)
          .eq("reporter_id", user.id)
          .maybeSingle();

        if (reportError) {
          console.error("Error loading report status", reportError);
        } else {
          setReported(!!myReport);
        }
      }

      setLoading(false);
    };

    if (postId) loadData();
  }, [postId]);

  // ----- ADD COMMENT -----
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        alert("You must be logged in to comment.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const authorName = profile?.full_name || studentName || "Student";

      const { data, error } = await supabase
        .from("discussion_comments")
        .insert({
          discussion_id: postId,
          author_id: user.id,
          author_name: authorName,
          content: newComment.trim(),
        })
        .select("id, author_name, content, created_at")
        .single();

      if (error || !data) {
        console.error("Failed to add comment", error);
        alert(
          `Failed to add comment: ${error?.message || JSON.stringify(error)}`
        );
        return;
      }

      // newest at top
      setComments((prev) => [
        {
          id: data.id,
          author_name: data.author_name,
          content: data.content,
          created_at: data.created_at,
        },
        ...prev,
      ]);

      setNewComment("");
    } catch (err: any) {
      console.error("Unexpected error adding comment", err);
      alert(`Failed to add comment: ${err?.message || JSON.stringify(err)}`);
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (liked) {
      const { error } = await supabase
        .from("discussion_likes")
        .delete()
        .eq("discussion_id", postId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to unlike", error);
        return;
      }
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      const { error } = await supabase.from("discussion_likes").insert({
        discussion_id: postId,
        user_id: user.id,
      });

      if (error) {
        console.error("Failed to like", error);
        return;
      }
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  // ----- REPORT TOGGLE -----
  const handleReportButtonClick = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !post) return;

    if (reported) {
      // unreport
      const { error } = await supabase
        .from("discussion_reports")
        .delete()
        .eq("discussion_id", post.id)
        .eq("reporter_id", user.id);

      if (error) {
        console.error("Failed to unreport", error);
        alert("Failed to remove report.");
        return;
      }
      setReported(false);
    } else {
      // open dialog to choose reason
      setShowReportDialog(true);
    }
  };

  const handleSubmitReport = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !post) return;

    try {
      const { error } = await supabase.from("discussion_reports").insert({
        discussion_id: post.id,
        reporter_id: user.id,
        reason: reportReason,
      });

      if (error) {
        console.error("Failed to report", error);
        alert("Failed to report this post.");
        return;
      }

      setReported(true);
      setShowReportDialog(false);
    } catch (err) {
      console.error("Failed to report", err);
      alert("Failed to report this post.");
    }
  };

  const handleDeleteClick = (type: "post" | "comment", id: string) => {
    setDeleteTarget({ type, id });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (deleteTarget.type === "comment") {
      await supabase
        .from("discussion_comments")
        .delete()
        .eq("id", deleteTarget.id)
        .eq("author_id", user.id);

      setComments((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } else {
      await supabase
        .from("discussions")
        .delete()
        .eq("id", deleteTarget.id)
        .eq("author_id", user.id);

      onNavigate("discussion");
    }

    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  if (loading || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors" style={{ backgroundColor: theme.background }}>
        <p style={{ color: theme.textSecondary }}>{t('loading')}...</p>
      </div>
    );
  }

  const postTimestampLabel = new Date(post.created_at).toLocaleString();
  const isAuthor = post.author_name === studentName;

  return (
    <div className="min-h-screen pb-24 discussion-detail-page transition-colors" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-6 py-6 border-b transition-colors"
        style={{ backgroundColor: theme.background, borderColor: theme.border }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("discussion")}
            style={{ color: theme.primary }}
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: theme.text, fontWeight: 600, fontSize: "20px" }}>
            {t('disc_detail_title')}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Original Post */}
        <div
          className="border p-5 transition-colors"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* avatar row now centered */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: theme.mode === 1 ? "#333333" : "#F5F5F5",
                color: theme.primary,
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              {post.author_name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span
                  style={{
                    color: theme.text,
                    fontWeight: 600,
                    fontSize: "15px",
                  }}
                >
                  {post.author_name}
                </span>
                <span className="text-xs" style={{ color: theme.textSecondary }}>
                  {postTimestampLabel}
                </span>
              </div>
            </div>
          </div>

          <h3
            className="mb-2"
            style={{ color: theme.text, fontWeight: 600, fontSize: "17px" }}
          >
            {post.title}
          </h3>
          <p
            className="text-sm mb-4"
            style={{ color: theme.textSecondary, lineHeight: "1.7" }}
          >
            {post.content}
          </p>

          {/* Actions row */}
          <div
            className="flex items-center justify-between gap-4 pt-3 border-t"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-center gap-5">
              <button
                className="flex items-center gap-2"
                onClick={handleToggleLike}
              >
                <Heart
                  className="w-5 h-5"
                  strokeWidth={1.5}
                  style={{ color: liked ? "#d4183d" : theme.textSecondary }}
                  fill={liked ? "#d4183d" : "none"}
                />
                <span className="text-sm" style={{ color: theme.textSecondary }}>
                  {likeCount}
                </span>
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle
                  className="w-5 h-5"
                  style={{ color: theme.textSecondary }}
                  strokeWidth={1.5}
                />
                <span className="text-sm" style={{ color: theme.textSecondary }}>
                  {comments.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={handleReportButtonClick}
                className="flex items-center gap-1"
                style={{ color: reported ? "#d4183d" : theme.textSecondary }}
              >
                <Flag className="w-3 h-3" />
                {reported ? t('disc_reported') : t('disc_report')}
              </button>

              {isAuthor && (
                <button
                  onClick={() => handleDeleteClick("post", post.id)}
                  className="flex items-center gap-1"
                  style={{ color: "#d4183d" }}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  {t('disc_delete')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div>
          <h3
            className="mb-4"
            style={{ color: theme.text, fontWeight: 600, fontSize: "16px" }}
          >
            {t('disc_comments_title')}
          </h3>
          {comments.length === 0 && (
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              {t('disc_no_comments')}
            </p>
          )}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border p-4 transition-colors"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  borderRadius: "14px"
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: theme.mode === 1 ? "#333333" : "#F5F5F5",
                      color: theme.primary,
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {comment.author_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        style={{
                          color: theme.text,
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {comment.author_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: theme.textSecondary }}>
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                        {comment.author_name === studentName && (
                          <button
                            onClick={() =>
                              handleDeleteClick("comment", comment.id)
                            }
                            style={{ color: "#d4183d" }}
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: theme.textSecondary, lineHeight: "1.6" }}
                    >
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment Input Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ borderTop: `1px solid ${theme.border}`, backgroundColor: theme.cardBg }}>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('disc_comment_ph')}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 h-10 px-4 border transition-colors"
            style={{
              backgroundColor: theme.background,
              borderColor: theme.border,
              borderRadius: "14px",
              fontSize: "14px",
              color: theme.text,
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || posting}
            className="h-10 px-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            style={{
              backgroundColor: theme.primary,
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "14px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            {posting ? t('disc_sending') : t('disc_send')}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div
            className="p-6 w-full max-w-sm border transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: "14px",
              borderColor: theme.border
            }}
          >
            <h3
              className="mb-2"
              style={{ color: theme.text, fontWeight: 600, fontSize: "18px" }}
            >
              {t('disc_delete_confirm_title')}
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: theme.textSecondary, lineHeight: "1.6" }}
            >
              {t('disc_delete_confirm_msg')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 h-11 border"
                style={{
                  borderColor: theme.border,
                  borderRadius: "14px",
                  color: theme.textSecondary,
                  fontWeight: "500",
                }}
              >
                {t('disc_cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-11"
                style={{
                  backgroundColor: "#d4183d",
                  color: "#FFFFFF",
                  borderRadius: "14px",
                  fontWeight: "500",
                }}
              >
                {t('disc_delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div
            className="p-6 w-full max-w-sm border transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: "14px",
              borderColor: theme.border
            }}
          >
            <h3
              className="mb-2"
              style={{ color: theme.text, fontWeight: 600, fontSize: "18px" }}
            >
              {t('disc_report_title')}
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: theme.textSecondary, lineHeight: "1.6" }}
            >
              {t('disc_report_msg')}
            </p>

            <div
              className="space-y-2 mb-6 text-sm"
              style={{ color: theme.text }}
            >
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="spam"
                  checked={reportReason === "spam"}
                  onChange={() => setReportReason("spam")}
                />
                <span>{t('disc_report_spam')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="harassment"
                  checked={reportReason === "harassment"}
                  onChange={() => setReportReason("harassment")}
                />
                <span>{t('disc_report_harassment')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="false_info"
                  checked={reportReason === "false_info"}
                  onChange={() => setReportReason("false_info")}
                />
                <span>{t('disc_report_false')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="other"
                  checked={reportReason === "other"}
                  onChange={() => setReportReason("other")}
                />
                <span>{t('disc_report_other')}</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReportDialog(false)}
                className="flex-1 h-11 border"
                style={{
                  borderColor: theme.border,
                  borderRadius: "14px",
                  color: theme.textSecondary,
                  fontWeight: "500",
                }}
              >
                {t('disc_cancel')}
              </button>
              <button
                onClick={handleSubmitReport}
                className="flex-1 h-11"
                style={{
                  backgroundColor: "#d4183d",
                  color: "#FFFFFF",
                  borderRadius: "14px",
                  fontWeight: "500",
                }}
              >
                {t('disc_submit_report')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

