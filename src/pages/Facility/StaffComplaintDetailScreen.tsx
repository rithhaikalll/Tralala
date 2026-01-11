import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
} from "lucide-react";
import { useState } from "react";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface Complaint {
  id: string;
  studentName: string;
  studentId: string;
  facilityName: string;
  title: string;
  category: string;
  description: string;
  status: "Submitted" | "In Progress" | "Resolved" | "Rejected";
  submittedDate: string;
  photoEvidence?: string;
  staffRemarks?: string;
  priority?: "Low" | "Medium" | "High" | "Urgent";
  assignedTo?: string;
}

interface StaffComplaintDetailScreenProps {
  complaint: Complaint;
  onNavigate: (screen: string) => void;
  onUpdateComplaint: (updatedComplaint: Complaint) => void;
}

export function StaffComplaintDetailScreen({
  complaint,
  onNavigate,
  onUpdateComplaint,
}: StaffComplaintDetailScreenProps) {
  const { theme, t } = useUserPreferences();
  const [status, setStatus] = useState(complaint.status);
  const [staffRemarks, setStaffRemarks] = useState(
    complaint.staffRemarks || ""
  );
  const [priority, setPriority] = useState(complaint.priority || "Medium");
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || "");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return { bg: "#FEF2F2", text: "#DC2626" };
      case "High":
        return { bg: "#FFF4E6", text: "#EA580C" };
      case "Medium":
        return { bg: "#FFF7ED", text: "#F59E0B" };
      case "Low":
        return { bg: "#F0F9FF", text: "#0284C7" };
      default:
        return { bg: "#F5F5F5", text: "#888888" };
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

  const handleUpdateComplaint = () => {
    // Validate that rejected complaints have remarks
    if (status === "Rejected" && !staffRemarks.trim()) {
      alert(t('alert_reject_remarks'));
      return;
    }

    // Validate that resolved complaints have remarks
    if (status === "Resolved" && !staffRemarks.trim()) {
      alert(t('alert_resolve_remarks'));
      return;
    }

    const updatedComplaint: Complaint = {
      ...complaint,
      status,
      staffRemarks: staffRemarks.trim() || undefined,
      priority,
      assignedTo: assignedTo.trim() || undefined,
    };

    onUpdateComplaint(updatedComplaint);
    setShowConfirmDialog(false);
    onNavigate("staff-complaints");
  };

  const statusColors = getStatusColor(status);
  const priorityColors = getPriorityColor(priority);

  // Calculate days since submission
  const getDaysOld = (dateStr: string) => {
    const submitted = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const daysOld = getDaysOld(complaint.submittedDate);

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
            onClick={() => onNavigate("staff-complaints")}
            style={{ color: theme.primary }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: theme.text, fontWeight: "600", fontSize: "20px" }}>
            {t('manage_complaint')}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Time Alert */}
        {daysOld > 7 &&
          (status === "Submitted" || status === "In Progress") && (
            <div
              className="border p-4 flex items-start gap-3"
              style={{
                borderColor: "#FCA5A5",
                borderRadius: "14px",
                backgroundColor: "#FEF2F2",
              }}
            >
              <AlertTriangle
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: "#DC2626" }}
                strokeWidth={1.5}
              />
              <div>
                <p
                  style={{
                    color: "#DC2626",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "2px",
                  }}
                >
                  {t('overdue_complaint')}
                </p>
                <p className="text-sm" style={{ color: "#991B1B" }}>
                  {t('overdue_desc').replace('{days}', daysOld.toString())}
                </p>
              </div>
            </div>
          )}

        {/* Student Information */}
        <div
          className="border p-5"
          style={{
            borderColor: theme.border,
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            backgroundColor: theme.cardBg
          }}
        >
          <h3
            className="text-sm mb-3"
            style={{ color: theme.textSecondary, fontWeight: "500" }}
          >
            {t('student_details')}
          </h3>
          <div className="space-y-2">
            <p
              style={{ color: theme.text, fontSize: "15px", fontWeight: "600" }}
            >
              {complaint.studentName}
            </p>
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              {t('student_id')}: {complaint.studentId}
            </p>
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
            <h3
              className="text-sm mb-1"
              style={{ color: theme.textSecondary, fontWeight: "500" }}
            >
              {t('facility')}
            </h3>
            <p
              style={{ color: theme.text, fontSize: "15px", fontWeight: "500" }}
            >
              {complaint.facilityName}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: theme.border }}>
            <h3
              className="text-sm mb-1"
              style={{ color: theme.textSecondary, fontWeight: "500" }}
            >
              {t('category')}
            </h3>
            <p
              style={{ color: theme.text, fontSize: "15px", fontWeight: "500" }}
            >
              {complaint.category}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: theme.border }}>
            <h3
              className="text-sm mb-1"
              style={{ color: theme.textSecondary, fontWeight: "500" }}
            >
              {t('submitted_date')}
            </h3>
            <p
              style={{ color: theme.text, fontSize: "15px", fontWeight: "500" }}
            >
              {complaint.submittedDate}
              <span className="text-xs ml-2" style={{ color: theme.textSecondary }}>
                (
                {daysOld === 0
                  ? t('today')
                  : t('days_ago').replace('{days}', daysOld.toString())}
                )
              </span>
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: theme.border }}>
            <h3
              className="text-sm mb-2"
              style={{ color: theme.textSecondary, fontWeight: "500" }}
            >
              {t('complaint_title')}
            </h3>
            <p
              style={{ color: theme.text, fontSize: "15px", fontWeight: "600" }}
            >
              {complaint.title}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: theme.border }}>
            <h3
              className="text-sm mb-2"
              style={{ color: theme.textSecondary, fontWeight: "500" }}
            >
              {t('description')}
            </h3>
            <p
              style={{ color: theme.text, fontSize: "15px", lineHeight: "1.6" }}
            >
              {complaint.description}
            </p>
          </div>

          {/* Photo Evidence */}
          {complaint.photoEvidence && (
            <div className="border-t pt-4" style={{ borderColor: theme.border }}>
              <h3
                className="text-sm mb-3"
                style={{ color: theme.textSecondary, fontWeight: "500" }}
              >
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

        {/* Management Actions */}
        <div
          className="border p-5 space-y-4"
          style={{
            borderColor: theme.border,
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            backgroundColor: theme.cardBg
          }}
        >
          <h3 style={{ color: theme.text, fontSize: "16px", fontWeight: "600" }}>
            {t('complaint_management')}
          </h3>

          {/* Priority Level */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: theme.text, fontWeight: "500" }}
            >
              {t('priority_level')}
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full h-11 px-3 border"
              style={{
                borderColor: theme.border,
                borderRadius: "8px",
                color: theme.text,
                backgroundColor: theme.cardBg
              }}
            >
              <option value="Low">{t('priority_low')}</option>
              <option value="Medium">{t('priority_medium')}</option>
              <option value="High">{t('priority_high')}</option>
              <option value="Urgent">{t('priority_urgent')}</option>
            </select>
            <p className="mt-1 text-xs" style={{ color: theme.textSecondary }}>
              {t('priority_desc')}
            </p>
          </div>

          {/* Assign To */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: theme.text, fontWeight: "500" }}
            >
              {t('assign_to')}
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: theme.textSecondary }}
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder={t('assign_placeholder')}
                className="w-full h-11 pl-10 pr-3 border"
                style={{
                  borderColor: theme.border,
                  borderRadius: "8px",
                  color: theme.text,
                  backgroundColor: theme.cardBg
                }}
              />
            </div>
            <p className="mt-1 text-xs" style={{ color: theme.textSecondary }}>
              {t('assign_desc')}
            </p>
          </div>

          {/* Status Update */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: theme.text, fontWeight: "500" }}
            >
              {t('update_status')}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-11 px-3 border"
              style={{
                borderColor: theme.border,
                borderRadius: "8px",
                color: theme.text,
                backgroundColor: theme.cardBg
              }}
            >
              <option value="Submitted">{t('status_submitted_desc')}</option>
              <option value="In Progress">{t('status_progress_desc')}</option>
              <option value="Resolved">{t('status_resolved_desc')}</option>
              <option value="Rejected">{t('status_rejected_desc')}</option>
            </select>
          </div>

          {/* Staff Remarks */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: theme.text, fontWeight: "500" }}
            >
              {t('staff_remarks')}{" "}
              {(status === "Rejected" || status === "Resolved") && (
                <span style={{ color: "#DC2626" }}>*</span>
              )}
            </label>
            <textarea
              value={staffRemarks}
              onChange={(e) => setStaffRemarks(e.target.value)}
              placeholder={t('staff_remarks_placeholder')}
              rows={5}
              className="w-full px-3 py-3 border resize-none"
              style={{
                borderColor: theme.border,
                borderRadius: "8px",
                color: theme.text,
                backgroundColor: theme.cardBg
              }}
            />
            {status === "Rejected" && (
              <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>
                {t('remarks_required_rejected')}
              </p>
            )}
            {status === "Resolved" && (
              <p className="mt-1 text-xs" style={{ color: "#16A34A" }}>
                {t('remarks_required_resolved')}
              </p>
            )}
            {status === "In Progress" && (
              <p className="mt-1 text-xs" style={{ color: theme.textSecondary }}>
                {t('remarks_optional')}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="w-full h-12"
            style={{
              backgroundColor: theme.primary,
              color: "#FFFFFF",
              borderRadius: "14px",
              fontWeight: "500",
              fontSize: "15px",
            }}
          >
            {t('update_complaint')}
          </button>
          <button
            onClick={() => onNavigate("staff-complaints")}
            className="w-full h-12 border"
            style={{
              borderColor: theme.border,
              borderRadius: "14px",
              color: theme.textSecondary,
              fontWeight: "500",
              fontSize: "15px",
            }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div
            className="p-6 w-full max-w-sm border"
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: "14px",
              borderColor: theme.border
            }}
          >
            <div className="flex justify-center mb-4">
              {status === "Resolved" ? (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#F0FDF4" }}
                >
                  <CheckCircle
                    className="w-8 h-8"
                    style={{ color: "#16A34A" }}
                    strokeWidth={1.5}
                  />
                </div>
              ) : status === "Rejected" ? (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#FEF2F2" }}
                >
                  <XCircle
                    className="w-8 h-8"
                    style={{ color: "#DC2626" }}
                    strokeWidth={1.5}
                  />
                </div>
              ) : null}
            </div>
            <h3
              className="mb-2 text-center"
              style={{ color: theme.text, fontWeight: "600", fontSize: "18px" }}
            >
              {t('update_complaint_dialog')}
            </h3>
            <p
              className="text-sm mb-2 text-center"
              style={{ color: theme.textSecondary, lineHeight: "1.6" }}
            >
              {t('complaint_status')}: <span style={{ fontWeight: "600", color: theme.text }}>{getStatusTranslation(status)}</span>
              <br />
              {t('priority_level')}: <span style={{ fontWeight: "600", color: theme.text }}>{priority}</span>
              {assignedTo && (
                <>
                  <br />
                  {t('assign_to')}:{" "}
                  <span style={{ fontWeight: "600", color: theme.text }}>{assignedTo}</span>
                </>
              )}
            </p>
            <p
              className="text-xs mb-6 text-center"
              style={{ color: theme.textSecondary }}
            >
              {status === "Resolved" || status === "Rejected"
                ? t('update_close_warning')
                : t('update_notify_info')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 h-11 border"
                style={{
                  borderColor: theme.border,
                  borderRadius: "14px",
                  color: theme.textSecondary,
                  fontWeight: "500",
                }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleUpdateComplaint}
                className="flex-1 h-11"
                style={{
                  backgroundColor: theme.primary,
                  color: "#FFFFFF",
                  borderRadius: "14px",
                  fontWeight: "500",
                }}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
