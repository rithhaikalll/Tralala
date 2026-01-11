import { ArrowLeft, Search, User, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface UserProfile {
  id: string; // UUID
  matric_id: string;
  full_name: string;
  faculty: string;
  year: string;
  favorite_sports: string[];
}

interface FindBuddyScreenProps {
  onNavigate: (screen: string) => void;
  studentId: string; // Your UUID
  connectedBuddies: string[]; // List of UUIDs you are already connected with
  onSendRequest: (recipientId: string) => void;
}

export function FindBuddyScreen({
  onNavigate,
  studentId,
  connectedBuddies,
  onSendRequest
}: FindBuddyScreenProps) {
  const { theme, t } = useUserPreferences();
  const [searchUserId, setSearchUserId] = useState("");
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSearch = async () => {
    setError("");
    setSuccessMessage("");
    setSearchResult(null);

    if (!searchUserId.trim()) {
      setError(t('buddy_enter_id'));
      return;
    }

    setLoading(true);

    try {
      // SEARCH SUPABASE FOR MATRIC ID
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('matric_id', searchUserId.trim().toUpperCase()) // Case insensitive search usually better, but explicit upper here
        .single();

      if (error || !data) {
        setError(t('buddy_id_not_found'));
      } else if (data.id === studentId) {
        setError(t('buddy_self_error'));
      } else {
        setSearchResult(data);
      }
    } catch (err) {
      setError("An error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = () => {
    if (!searchResult) return;

    setError("");
    setSuccessMessage("");

    // Check if already connected
    if (connectedBuddies.includes(searchResult.id)) {
      setError(t('buddy_already_connected'));
      return;
    }

    // Trigger parent to send request to DB
    onSendRequest(searchResult.id);

    setSuccessMessage(t('buddy_req_sent_success').replace('{name}', searchResult.full_name));
    setSearchResult(null);
    setSearchUserId("");
  };

  return (
    <div className="min-h-screen pb-20 transition-colors" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 py-6 border-b transition-colors" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("buddy")}
            style={{ color: theme.primary }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: theme.text, fontWeight: "600", fontSize: "20px" }}>
            {t('buddy_find_title')}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Search Section */}
        <div>
          <label className="block mb-2 text-sm" style={{ color: theme.text, fontWeight: "500" }}>
            {t('buddy_enter_id')} <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: theme.textSecondary }}
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g., A23CS0128"
                className="w-full h-11 pl-10 pr-3 border transition-colors"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: error ? "#FCA5A5" : theme.border,
                  borderRadius: "8px",
                  color: theme.text
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="h-11 px-6 disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: theme.primary,
                color: "#FFFFFF",
                borderRadius: "8px",
                fontWeight: "500"
              }}
            >
              {loading ? "..." : t('buddy_search_btn')}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 flex items-start gap-2 border bg-red-50 border-red-200 rounded-lg">
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="mt-3 p-3 flex items-start gap-2 border bg-green-50 border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}
        </div>

        {/* Search Result Card */}
        {searchResult && (
          <div
            className="border p-5 transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              boxShadow: theme.mode === 1 ? "none" : "0 1px 3px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: theme.mode === 1 ? "#333333" : "#FFF9F5",
                  borderRadius: "12px",
                  border: `2px solid ${theme.border}`
                }}
              >
                <User className="w-8 h-8" style={{ color: theme.primary }} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 style={{ color: theme.text, fontWeight: "600", fontSize: "18px", marginBottom: "4px" }}>
                  {searchResult.full_name}
                </h3>
                <p className="text-sm mb-1" style={{ color: theme.primary, fontWeight: "500" }}>
                  {searchResult.matric_id}
                </p>
                <p className="text-sm mb-1" style={{ color: theme.mode === 1 ? "#CCC" : "#555555" }}>
                  {searchResult.faculty || "Faculty not set"}
                </p>
                <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>
                  {searchResult.year || "Year not set"}
                </p>

                {searchResult.favorite_sports && searchResult.favorite_sports.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs mb-2" style={{ color: theme.textSecondary, fontWeight: "500" }}>
                      {t('buddy_fav_sports')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.favorite_sports.map((sport) => (
                        <span
                          key={sport}
                          className="px-2 py-1 text-xs"
                          style={{
                            backgroundColor: theme.mode === 1 ? "#3D2B00" : "#FFF9F5",
                            color: theme.primary,
                            borderRadius: "6px",
                            fontWeight: "500"
                          }}
                        >
                          {sport}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSendRequest}
                  className="w-full h-10 flex items-center justify-center gap-2 transition-colors"
                  style={{
                    backgroundColor: theme.primary,
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    fontWeight: "500"
                  }}
                >
                  <UserPlus className="w-4 h-4" strokeWidth={1.5} />
                  {t('buddy_send_req')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}