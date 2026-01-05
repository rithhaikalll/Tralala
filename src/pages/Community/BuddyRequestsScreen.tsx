import { ArrowLeft, UserPlus, Check, X, Clock } from "lucide-react";

interface BuddyRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  recipientId: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  isIncoming?: boolean; // Added this field
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
  studentId,
  buddyRequests,
  onAcceptRequest,
  onRejectRequest
}: BuddyRequestsScreenProps) {
  
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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("find-buddy")}
            style={{ color: "#7A0019" }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "20px" }}>
            Buddy Requests
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Incoming Requests */}
        <div>
          <h3 className="mb-3" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "16px" }}>
            Received Requests
            {incomingRequests.length > 0 && (
              <span 
                className="ml-2 px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: "#7A0019",
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
                borderColor: "#E5E5E5",
                borderRadius: "14px",
                backgroundColor: "#F5F5F5"
              }}
            >
              <UserPlus className="w-12 h-12 mx-auto mb-3" style={{ color: "#CCCCCC" }} strokeWidth={1.5} />
              <p style={{ color: "#888888", fontSize: "15px" }}>
                No pending requests
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border bg-white p-4"
                  style={{
                    borderColor: "#E5E5E5",
                    borderRadius: "14px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: "#FFF9F5", 
                        borderRadius: "10px",
                        border: "1px solid #E5E5E5"
                      }}
                    >
                      <UserPlus className="w-6 h-6" style={{ color: "#7A0019" }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px", marginBottom: "2px" }}>
                        {request.requesterName}
                      </p>
                      <p className="text-sm mb-1" style={{ color: "#7A0019" }}>
                        {request.requesterId}
                      </p>
                      <p className="text-xs" style={{ color: "#888888" }}>
                        Sent {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onAcceptRequest(request.id)}
                      className="h-10 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: "#7A0019",
                        color: "#FFFFFF",
                        borderRadius: "8px",
                        fontWeight: "500"
                      }}
                    >
                      <Check className="w-4 h-4" strokeWidth={2} />
                      Accept
                    </button>
                    <button
                      onClick={() => onRejectRequest(request.id)}
                      className="h-10 flex items-center justify-center gap-2 border"
                      style={{
                        borderColor: "#E5E5E5",
                        backgroundColor: "#FFFFFF",
                        color: "#DC2626",
                        borderRadius: "8px",
                        fontWeight: "500"
                      }}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Requests */}
        <div>
          <h3 className="mb-3" style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "16px" }}>
            Sent Requests
          </h3>

          {sentRequests.length === 0 ? (
            <div 
              className="border p-8 text-center"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "14px",
                backgroundColor: "#F5F5F5"
              }}
            >
              <Clock className="w-12 h-12 mx-auto mb-3" style={{ color: "#CCCCCC" }} strokeWidth={1.5} />
              <p style={{ color: "#888888", fontSize: "15px" }}>
                No sent requests
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="border bg-white p-4"
                  style={{
                    borderColor: "#E5E5E5",
                    borderRadius: "14px"
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: "#F5F5F5", 
                        borderRadius: "10px"
                      }}
                    >
                      <UserPlus className="w-6 h-6" style={{ color: "#888888" }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "15px", marginBottom: "2px" }}>
                        Sent to {request.recipientId}
                      </p>
                      <p className="text-xs mb-2" style={{ color: "#888888" }}>
                        {formatDate(request.createdAt)}
                      </p>
                      <span
                        className="inline-block px-2 py-1 text-xs"
                        style={{
                          backgroundColor: 
                            request.status === "Pending" ? "#FFF7ED" :
                            request.status === "Accepted" ? "#F0FDF4" :
                            "#FEF2F2",
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