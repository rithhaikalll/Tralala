import { ArrowLeft, Image as ImageIcon } from "lucide-react";
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

interface ComplaintDetailScreenProps {
  complaint: Complaint;
  onNavigate: (screen: string) => void;
}

export function ComplaintDetailScreen({ complaint, onNavigate }: ComplaintDetailScreenProps) {
  const { theme, t } = useUserPreferences();

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

  const statusColors = getStatusColor(complaint.status);

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("facility-complaints")}
            style={{ color: theme.primary }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: theme.text, fontWeight: "600", fontSize: "20px" }}>
            {t('complaint_details')}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Status Card */}
        <div
          className="border p-4"
          style={{
            borderColor: statusColors.border,
            borderRadius: "14px",
            backgroundColor: statusColors.bg
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "#555555", fontWeight: "500" }}>
              {t('complaint_status')}
            </span>
            <span
              className="px-3 py-1 text-sm border"
              style={{
                backgroundColor: "#FFFFFF",
                color: statusColors.text,
                borderColor: statusColors.border,
                borderRadius: "6px",
                fontWeight: "600"
              }}
            >
              {getStatusTranslation(complaint.status)}
            </span>
          </div>
        </div>

        {/* Complaint Information */}
        <div
          className="border p-5 space-y-4"
          style={{
            borderColor: theme.border,
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            backgroundColor: theme.cardBg
          }}
        >
          <div>
            <h3 className="text-sm mb-1" style={{ color: theme.textSecondary, fontWeight: "500" }}>
              {t('facility')}
            </h3>
            <p style={{ color: theme.text, fontSize: "15px", fontWeight: "500" }}>
              {complaint.facilityName}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: theme.border }}>
            <h3 className="text-sm mb-1" style={{ color: theme.textSecondary, fontWeight: "500" }}>
              {t('category')}
            </h3>
            <p style={{ color: theme.text, fontSize: "15px", fontWeight: "500" }}>
              {complaint.category}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: theme.border }}>
            <h3 className="text-sm mb-1" style={{ color: theme.textSecondary, fontWeight: "500" }}>
              {t('submitted_date')}
            </h3>
            <p style={{ color: theme.text, fontSize: "15px", fontWeight: "500" }}>
              {complaint.submittedDate}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: theme.border }}>
            <h3 className="text-sm mb-2" style={{ color: theme.textSecondary, fontWeight: "500" }}>
              {t('complaint_title')}
            </h3>
            <p style={{ color: theme.text, fontSize: "15px", fontWeight: "600" }}>
              {complaint.title}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: theme.border }}>
            <h3 className="text-sm mb-2" style={{ color: theme.textSecondary, fontWeight: "500" }}>
              {t('description')}
            </h3>
            <p style={{ color: theme.text, fontSize: "15px", lineHeight: "1.6" }}>
              {complaint.description}
            </p>
          </div>

          {/* Photo Evidence */}
          {complaint.photoEvidence && (
            <div className="border-t pt-4" style={{ borderColor: theme.border }}>
              <h3 className="text-sm mb-3" style={{ color: theme.textSecondary, fontWeight: "500" }}>
                {t('photo_evidence')}
              </h3>
              <img
                src={complaint.photoEvidence}
                alt="Evidence"
                className="w-full rounded-lg border"
                style={{ borderColor: theme.border }}
              />
            </div>
          )}
        </div>

        {/* Staff Remarks */}
        {complaint.staffRemarks && (
          <div
            className="border p-5"
            style={{
              borderColor: theme.border,
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              backgroundColor: theme.cardBg
            }}
          >
            <h3 className="text-sm mb-2" style={{ color: theme.textSecondary, fontWeight: "500" }}>
              {t('staff_remarks')}
            </h3>
            <p style={{ color: theme.text, fontSize: "15px", lineHeight: "1.6" }}>
              {complaint.staffRemarks}
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="pt-4">
          <button
            onClick={() => onNavigate("facility-complaints")}
            className="w-full h-12 border"
            style={{
              borderColor: theme.border,
              borderRadius: "14px",
              color: theme.textSecondary,
              fontWeight: "500",
              fontSize: "15px"
            }}
          >
            {t('back_to_complaints')}
          </button>
        </div>
      </div>
    </div>
  );
}
