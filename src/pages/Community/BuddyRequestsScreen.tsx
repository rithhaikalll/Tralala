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
  profilePicture?: string | null;
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

  const incomingRequests = buddyRequests.filter(req => req.isIncoming && req.status === "Pending");
  const sentRequests = buddyRequests.filter(req => !req.isIncoming);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen pb-20 transition-colors" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 py-6 border-b transition-colors" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("buddy")} style={{ color: theme.primary }}>
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: theme.text, fontWeight: "600", fontSize: "20px" }}>{t('buddy_req_title')}</h2>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Incoming Requests */}
        <div>
          <h3 className="mb-3" style={{ color: theme.text, fontWeight: "600", fontSize: "16px" }}>
            {t('buddy_req_received')} 
            {incomingRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded" style={{ backgroundColor: theme.primary, color: "#FFFFFF" }}>
                {incomingRequests.length}
              </span>
            )}
          </h3>
          
          {incomingRequests.length === 0 ? (
            <p className="text-center py-8 text-sm opacity-50" style={{ color: theme.textSecondary }}>{t('buddy_req_none_received')}</p>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((request) => (
                <div key={request.id} className="border p-4 rounded-xl shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <div className="flex items-start gap-3 mb-3">
                    
                    {/* Profile Picture */}
                    <div 
                      className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center border" 
                      style={{ borderColor: theme.border, backgroundColor: theme.mode === 1 ? "#333" : "#FFF9F5" }}
                    >
                      {request.profilePicture ? (
                        <img src={request.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <UserPlus className="w-6 h-6" style={{ color: theme.primary }} />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-[15px]" style={{ color: theme.text }}>{request.requesterName}</p>
                      <p className="text-sm mb-1" style={{ color: theme.primary }}>{request.requesterId}</p>
                      <p className="text-xs opacity-60" style={{ color: theme.textSecondary }}>{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons with Fixed Styling */}
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => onAcceptRequest(request.id)} 
                      className="h-10 flex items-center justify-center gap-2 rounded-lg font-medium shadow-sm active:scale-95 transition-transform"
                      style={{ backgroundColor: theme.primary, color: "#FFFFFF" }}
                    >
                      <Check className="w-4 h-4" /> {t('buddy_req_accept')}
                    </button>
                    
                    <button 
                      onClick={() => onRejectRequest(request.id)} 
                      className="h-10 flex items-center justify-center gap-2 border rounded-lg font-medium active:scale-95 transition-transform"
                      style={{ 
                        borderColor: theme.border, 
                        backgroundColor: theme.cardBg, 
                        color: "#DC2626" // Red color for reject
                      }}
                    >
                      <X className="w-4 h-4" /> {t('buddy_req_reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Requests */}
        <div>
          <h3 className="mb-3" style={{ color: theme.text, fontWeight: "600", fontSize: "16px" }}>{t('buddy_req_sent')}</h3>
          {sentRequests.length === 0 ? (
            <p className="text-center py-8 text-sm opacity-50" style={{ color: theme.textSecondary }}>{t('buddy_req_none_sent')}</p>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <div key={request.id} className="border p-4 rounded-xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <div className="flex items-start gap-3">
                    
                    {/* Profile Picture */}
                    <div 
                      className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center border" 
                      style={{ borderColor: theme.border, backgroundColor: theme.mode === 1 ? "#333" : "#FFF9F5" }}
                    >
                      {request.profilePicture ? (
                        <img src={request.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                         <UserPlus className="w-6 h-6" style={{ color: theme.textSecondary }} />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-[15px]" style={{ color: theme.text }}>{t('buddy_req_sent_to').replace('{name}', request.recipientId)}</p>
                      <p className="text-xs mb-2 opacity-60" style={{ color: theme.textSecondary }}>{formatDate(request.createdAt)}</p>
                      
                      <span 
                        className="inline-block px-2 py-1 text-xs rounded-md font-medium"
                        style={{
                          backgroundColor:
                            request.status === "Pending" ? (theme.mode === 1 ? "#3D2B00" : "#FFF7ED") :
                              request.status === "Accepted" ? (theme.mode === 1 ? "#00280D" : "#F0FDF4") :
                                (theme.mode === 1 ? "#440B0B" : "#FEF2F2"),
                          color:
                            request.status === "Pending" ? "#F59E0B" :
                              request.status === "Accepted" ? "#16A34A" :
                                "#DC2626"
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