import { ArrowLeft, UserPlus, Check, X, Clock } from "lucide-react";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface BuddyRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  recipientId: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  isIncoming?: boolean;
}

interface BuddyRequestsScreenProps {
  onNavigate: (screen: string) => void;
  studentId: string;
  buddyRequests: BuddyRequest[];
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

export function BuddyRequestsScreen({
  onNavigate,
  studentId: _studentId,
  buddyRequests,
  onAcceptRequest,
  onRejectRequest
}: BuddyRequestsScreenProps) {
  const { theme, t } = useUserPreferences();

  // FIX: Use isIncoming flag instead of comparing IDs
  const incomingRequests = buddyRequests.filter(
    req => req.isIncoming && req.status === "Pending"
  );

  // FIX: Use !isIncoming for sent requests
  const sentRequests = buddyRequests.filter(
    req => !req.isIncoming
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('today'); // Close enough or add specific key
    if (diffMins < 60) return `${diffMins}m`; // Simplified
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return t('days_ago').replace('{days}', diffDays.toString());
    return date.toLocaleDateString();
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
            {t('buddy_req_title')}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Incoming Requests */}
        <div>
          <h3 className="mb-3" style={{ color: theme.text, fontWeight: "600", fontSize: "16px" }}>
            {t('buddy_req_received')}
            {incomingRequests.length > 0 && (
              <span
                className="ml-2 px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: theme.primary,
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  fontWeight: "600"
                }}
              >
                {incomingRequests.length}
              </span>
            )}
          </h3>

          {incomingRequests.length === 0 ? (
            <div
              className="border p-8 text-center"
              style={{
                borderColor: theme.border,
                borderRadius: "14px",
                backgroundColor: theme.mode === 1 ? "#2A2A2A" : "#F5F5F5"
              }}
            >
              <UserPlus className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textSecondary }} strokeWidth={1.5} />
              <p style={{ color: theme.textSecondary, fontSize: "15px" }}>
                {t('buddy_req_none_received')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border p-4 transition-colors"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                    borderRadius: "14px",
                    boxShadow: theme.mode === 1 ? "none" : "0 1px 3px rgba(0, 0, 0, 0.04)"
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: theme.mode === 1 ? "#333333" : "#FFF9F5",
                        borderRadius: "10px",
                        border: `1px solid ${theme.border}`
                      }}
                    >
                      <UserPlus className="w-6 h-6" style={{ color: theme.primary }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p style={{ color: theme.text, fontWeight: "600", fontSize: "15px", marginBottom: "2px" }}>
                        {request.requesterName}
                      </p>
                      <p className="text-sm mb-1" style={{ color: theme.primary }}>
                        {request.requesterId}
                      </p>
                      <p className="text-xs" style={{ color: theme.textSecondary }}>
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onAcceptRequest(request.id)}
                      className="h-10 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: theme.primary,
                        color: "#FFFFFF",
                        borderRadius: "8px",
                        fontWeight: "500"
                      }}
                    >
                      <Check className="w-4 h-4" strokeWidth={2} />
                      {t('buddy_req_accept')}
                    </button>
                    <button
                      onClick={() => onRejectRequest(request.id)}
                      className="h-10 flex items-center justify-center gap-2 border"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: theme.cardBg,
                        color: "#DC2626",
                        borderRadius: "8px",
                        fontWeight: "500"
                      }}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                      {t('buddy_req_reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Requests */}
        <div>
          <h3 className="mb-3" style={{ color: theme.text, fontWeight: "600", fontSize: "16px" }}>
            {t('buddy_req_sent')}
          </h3>

          {sentRequests.length === 0 ? (
            <div
              className="border p-8 text-center"
              style={{
                borderColor: theme.border,
                borderRadius: "14px",
                backgroundColor: theme.mode === 1 ? "#2A2A2A" : "#F5F5F5"
              }}
            >
              <Clock className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textSecondary }} strokeWidth={1.5} />
              <p style={{ color: theme.textSecondary, fontSize: "15px" }}>
                {t('buddy_req_none_sent')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="border p-4 transition-colors"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                    borderRadius: "14px"
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: theme.mode === 1 ? "#333333" : "#F5F5F5",
                        borderRadius: "10px"
                      }}
                    >
                      <UserPlus className="w-6 h-6" style={{ color: theme.textSecondary }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p style={{ color: theme.text, fontWeight: "600", fontSize: "15px", marginBottom: "2px" }}>
                        {t('buddy_req_sent_to').replace('{name}', request.recipientId)}
                      </p>
                      <p className="text-xs mb-2" style={{ color: theme.textSecondary }}>
                        {formatDate(request.createdAt)}
                      </p>
                      <span
                        className="inline-block px-2 py-1 text-xs"
                        style={{
                          backgroundColor:
                            request.status === "Pending" ? (theme.mode === 1 ? "#3D2B00" : "#FFF7ED") :
                              request.status === "Accepted" ? (theme.mode === 1 ? "#00280D" : "#F0FDF4") :
                                (theme.mode === 1 ? "#440B0B" : "#FEF2F2"),
                          color:
                            request.status === "Pending" ? "#F59E0B" :
                              request.status === "Accepted" ? "#16A34A" :
                                "#DC2626",
                          borderRadius: "6px",
                          fontWeight: "500"
                        }}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}