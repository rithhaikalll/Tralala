import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
} from "lucide-react";
import { useState } from "react";

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

  const handleUpdateComplaint = () => {
    // Validate that rejected complaints have remarks
    if (status === "Rejected" && !staffRemarks.trim()) {
      alert("Please provide remarks when rejecting a complaint");
      return;
    }

    // Validate that resolved complaints have remarks
    if (status === "Resolved" && !staffRemarks.trim()) {
      alert("Please provide remarks explaining the resolution");
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
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div
        className="sticky top-0 z-40 bg-white px-6 py-6 border-b"
        style={{ borderColor: "#E5E5E5" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("staff-complaints")}
            style={{ color: "#7A0019" }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "20px" }}>
            Manage Complaint
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
                  Overdue Complaint
                </p>
                <p className="text-sm" style={{ color: "#991B1B" }}>
                  This complaint has been pending for {daysOld} days. Please
                  prioritize resolution.
                </p>
              </div>
            </div>
          )}

        {/* Student Information */}
        <div
          className="border bg-white p-5"
          style={{
            borderColor: "#E5E5E5",
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <h3
            className="text-sm mb-3"
            style={{ color: "#888888", fontWeight: "500" }}
          >
            Student Details
          </h3>
          <div className="space-y-2">
            <p
              style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "600" }}
            >
              {complaint.studentName}
            </p>
            <p className="text-sm" style={{ color: "#555555" }}>
              Student ID: {complaint.studentId}
            </p>
          </div>
        </div>

        {/* Complaint Information */}
        <div
          className="border bg-white p-5 space-y-4"
          style={{
            borderColor: "#E5E5E5",
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div>
            <h3
              className="text-sm mb-1"
              style={{ color: "#888888", fontWeight: "500" }}
            >
              Facility
            </h3>
            <p
              style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "500" }}
            >
              {complaint.facilityName}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "#F5F5F5" }}>
            <h3
              className="text-sm mb-1"
              style={{ color: "#888888", fontWeight: "500" }}
            >
              Category
            </h3>
            <p
              style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "500" }}
            >
              {complaint.category}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "#F5F5F5" }}>
            <h3
              className="text-sm mb-1"
              style={{ color: "#888888", fontWeight: "500" }}
            >
              Submitted Date
            </h3>
            <p
              style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "500" }}
            >
              {complaint.submittedDate}
              <span className="text-xs ml-2" style={{ color: "#888888" }}>
                (
                {daysOld === 0
                  ? "Today"
                  : `${daysOld} day${daysOld > 1 ? "s" : ""} ago`}
                )
              </span>
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "#F5F5F5" }}>
            <h3
              className="text-sm mb-2"
              style={{ color: "#888888", fontWeight: "500" }}
            >
              Complaint Title
            </h3>
            <p
              style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "600" }}
            >
              {complaint.title}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "#F5F5F5" }}>
            <h3
              className="text-sm mb-2"
              style={{ color: "#888888", fontWeight: "500" }}
            >
              Description
            </h3>
            <p
              style={{ color: "#1A1A1A", fontSize: "15px", lineHeight: "1.6" }}
            >
              {complaint.description}
            </p>
          </div>

          {/* Photo Evidence */}
          {complaint.photoEvidence && (
            <div className="border-t pt-4" style={{ borderColor: "#F5F5F5" }}>
              <h3
                className="text-sm mb-3"
                style={{ color: "#888888", fontWeight: "500" }}
              >
                Photo Evidence
              </h3>
              <img
                src={complaint.photoEvidence}
                alt="Evidence"
                className="w-full rounded-lg border"
                style={{ borderColor: "#E5E5E5" }}
              />
            </div>
          )}
        </div>

        {/* Management Actions */}
        <div
          className="border bg-white p-5 space-y-4"
          style={{
            borderColor: "#E5E5E5",
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <h3 style={{ color: "#1A1A1A", fontSize: "16px", fontWeight: "600" }}>
            Complaint Management
          </h3>

          {/* Priority Level */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "#1A1A1A", fontWeight: "500" }}
            >
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full h-11 px-3 border bg-white"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "8px",
                color: "#1A1A1A",
              }}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent</option>
            </select>
            <p className="mt-1 text-xs" style={{ color: "#888888" }}>
              Set priority based on severity and impact
            </p>
          </div>

          {/* Assign To */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "#1A1A1A", fontWeight: "500" }}
            >
              Assign To
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: "#888888" }}
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter staff name or leave empty"
                className="w-full h-11 pl-10 pr-3 border bg-white"
                style={{
                  borderColor: "#E5E5E5",
                  borderRadius: "8px",
                  color: "#1A1A1A",
                }}
              />
            </div>
            <p className="mt-1 text-xs" style={{ color: "#888888" }}>
              Assign this complaint to a specific staff member
            </p>
          </div>

          {/* Status Update */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "#1A1A1A", fontWeight: "500" }}
            >
              Update Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-11 px-3 border bg-white"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "8px",
                color: "#1A1A1A",
              }}
            >
              <option value="Submitted">Submitted (New)</option>
              <option value="In Progress">In Progress (Being Addressed)</option>
              <option value="Resolved">Resolved (Completed)</option>
              <option value="Rejected">Rejected (Cannot Address)</option>
            </select>
          </div>

          {/* Staff Remarks */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "#1A1A1A", fontWeight: "500" }}
            >
              Staff Remarks{" "}
              {(status === "Rejected" || status === "Resolved") && (
                <span style={{ color: "#DC2626" }}>*</span>
              )}
            </label>
            <textarea
              value={staffRemarks}
              onChange={(e) => setStaffRemarks(e.target.value)}
              placeholder="Add detailed remarks about actions taken, resolution, or reasons for rejection..."
              rows={5}
              className="w-full px-3 py-3 border bg-white resize-none"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "8px",
                color: "#1A1A1A",
              }}
            />
            {status === "Rejected" && (
              <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>
                Required: Explain why this complaint cannot be addressed
              </p>
            )}
            {status === "Resolved" && (
              <p className="mt-1 text-xs" style={{ color: "#16A34A" }}>
                Required: Describe how the complaint was resolved
              </p>
            )}
            {status === "In Progress" && (
              <p className="mt-1 text-xs" style={{ color: "#888888" }}>
                Optional: Add notes about current progress or expected timeline
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
              backgroundColor: "#7A0019",
              color: "#FFFFFF",
              borderRadius: "14px",
              fontWeight: "500",
              fontSize: "15px",
            }}
          >
            Update Complaint
          </button>
          <button
            onClick={() => onNavigate("staff-complaints")}
            className="w-full h-12 border"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              color: "#555555",
              fontWeight: "500",
              fontSize: "15px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div
            className="bg-white p-6 w-full max-w-sm border"
            style={{ borderRadius: "14px", borderColor: "#E5E5E5" }}
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
              style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "18px" }}
            >
              Update Complaint?
            </h3>
            <p
              className="text-sm mb-2 text-center"
              style={{ color: "#555555", lineHeight: "1.6" }}
            >
              Status: <span style={{ fontWeight: "600" }}>{status}</span>
              <br />
              Priority: <span style={{ fontWeight: "600" }}>{priority}</span>
              {assignedTo && (
                <>
                  <br />
                  Assigned to:{" "}
                  <span style={{ fontWeight: "600" }}>{assignedTo}</span>
                </>
              )}
            </p>
            <p
              className="text-xs mb-6 text-center"
              style={{ color: "#888888" }}
            >
              {status === "Resolved" || status === "Rejected"
                ? "This complaint will be closed."
                : "Student will be notified of the update."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 h-11 border"
                style={{
                  borderColor: "#E5E5E5",
                  borderRadius: "14px",
                  color: "#555555",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateComplaint}
                className="flex-1 h-11"
                style={{
                  backgroundColor: "#7A0019",
                  color: "#FFFFFF",
                  borderRadius: "14px",
                  fontWeight: "500",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
