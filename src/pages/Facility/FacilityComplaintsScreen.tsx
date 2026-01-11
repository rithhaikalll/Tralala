import { AlertCircle, ArrowLeft, Plus, Filter } from "lucide-react";
import { useState } from "react";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface Complaint {
  id: string;
  facilityName: string;
  title: string;
  category: string;
  description: string;
  status: "Submitted" | "In Progress" | "Resolved" | "Rejected";
  submittedDate: string;
  photoEvidence?: string;
  staffRemarks?: string;
}

interface FacilityComplaintsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  complaints: Complaint[];
  onUpdateComplaints: (complaints: Complaint[]) => void;
}

export function FacilityComplaintsScreen({
  onNavigate,
  complaints,
  onUpdateComplaints,
}: FacilityComplaintsScreenProps) {
  const { theme, t } = useUserPreferences();
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return { bg: "#F5F5F5", text: "#555555", border: "#E5E5E5" };
      case "In Progress":
        return { bg: "#FFF4E6", text: "#D97706", border: "#FCD34D" };
      case "Resolved":
        return { bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC" };
      case "Rejected":
        return { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" };
      default:
        return { bg: "#F5F5F5", text: "#555555", border: "#E5E5E5" };
    }
  };

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "Submitted": return t('status_submitted');
      case "In Progress": return t('status_in_progress');
      case "Resolved": return t('status_resolved');
      case "Rejected": return t('status_rejected');
      default: return status;
    }
  };

  const filteredComplaints =
    statusFilter === "All"
      ? complaints
      : complaints.filter((c) => c.status === statusFilter);

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-6 py-6 border-b"
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("profile")}
              style={{ color: theme.primary }}
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <h2
              style={{ color: theme.text, fontWeight: "600", fontSize: "20px" }}
            >
              {t('facility_complaints_title')}
            </h2>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 h-10 px-3 border text-sm"
            style={{
              borderColor: theme.border,
              borderRadius: "8px",
              color: theme.text,
              backgroundColor: theme.cardBg
            }}
          >
            <option value="All">{t('filter_all_status')}</option>
            <option value="Submitted">{t('status_submitted')}</option>
            <option value="In Progress">{t('status_in_progress')}</option>
            <option value="Resolved">{t('status_resolved')}</option>
            <option value="Rejected">{t('status_rejected')}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Submit New Complaint Button */}
        <button
          onClick={() => onNavigate("submit-complaint")}
          className="w-full h-12 flex items-center justify-center gap-2"
          style={{
            backgroundColor: theme.primary,
            color: "#FFFFFF",
            borderRadius: "14px",
            fontWeight: "500",
            fontSize: "15px",
          }}
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          {t('submit_new_complaint')}
        </button>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.mode === 1 ? "#333333" : "#F5F5F5" }}
              >
                <AlertCircle
                  className="w-8 h-8"
                  style={{ color: theme.textSecondary }}
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <p
              style={{ color: theme.textSecondary, fontSize: "15px", lineHeight: "1.6" }}
            >
              {statusFilter === "All"
                ? t('no_complaints_yet')
                : t('no_complaints_filtered').replace('{status}', getStatusTranslation(statusFilter))}
            </p>
            <p
              className="text-sm mt-2"
              style={{ color: theme.textSecondary, lineHeight: "1.6" }}
            >
              {t('submit_complaint_instruction')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredComplaints.map((complaint) => {
              const statusColors = getStatusColor(complaint.status);
              return (
                <button
                  key={complaint.id}
                  onClick={() => onNavigate("complaint-detail", { complaint })}
                  className="w-full border p-4 text-left"
                  style={{
                    borderColor: theme.border,
                    borderRadius: "14px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    backgroundColor: theme.cardBg
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3
                        style={{
                          color: theme.text,
                          fontWeight: "600",
                          fontSize: "15px",
                          marginBottom: "2px",
                        }}
                      >
                        {complaint.title}
                      </h3>
                      <p className="text-sm" style={{ color: theme.textSecondary }}>
                        {complaint.facilityName}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 text-xs border ml-3"
                      style={{
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                        borderColor: statusColors.border,
                        borderRadius: "6px",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getStatusTranslation(complaint.status)}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-4 text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    <span>{complaint.category}</span>
                    <span>•</span>
                    <span>{complaint.submittedDate}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
