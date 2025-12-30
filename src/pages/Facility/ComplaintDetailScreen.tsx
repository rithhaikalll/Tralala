import { ArrowLeft, Image as ImageIcon } from "lucide-react";

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

  const statusColors = getStatusColor(complaint.status);

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("facility-complaints")}
            style={{ color: "#7A0019" }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "20px" }}>
            Complaint Details
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
              Status
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
              {complaint.status}
            </span>
          </div>
        </div>

        {/* Complaint Information */}
        <div 
          className="border bg-white p-5 space-y-4"
          style={{
            borderColor: "#E5E5E5",
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div>
            <h3 className="text-sm mb-1" style={{ color: "#888888", fontWeight: "500" }}>
              Facility
            </h3>
            <p style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "500" }}>
              {complaint.facilityName}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "#F5F5F5" }}>
            <h3 className="text-sm mb-1" style={{ color: "#888888", fontWeight: "500" }}>
              Category
            </h3>
            <p style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "500" }}>
              {complaint.category}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "#F5F5F5" }}>
            <h3 className="text-sm mb-1" style={{ color: "#888888", fontWeight: "500" }}>
              Submitted Date
            </h3>
            <p style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "500" }}>
              {complaint.submittedDate}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "#F5F5F5" }}>
            <h3 className="text-sm mb-2" style={{ color: "#888888", fontWeight: "500" }}>
              Complaint Title
            </h3>
            <p style={{ color: "#1A1A1A", fontSize: "15px", fontWeight: "600" }}>
              {complaint.title}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "#F5F5F5" }}>
            <h3 className="text-sm mb-2" style={{ color: "#888888", fontWeight: "500" }}>
              Description
            </h3>
            <p style={{ color: "#1A1A1A", fontSize: "15px", lineHeight: "1.6" }}>
              {complaint.description}
            </p>
          </div>

          {/* Photo Evidence */}
          {complaint.photoEvidence && (
            <div className="border-t pt-4" style={{ borderColor: "#F5F5F5" }}>
              <h3 className="text-sm mb-3" style={{ color: "#888888", fontWeight: "500" }}>
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

        {/* Staff Remarks */}
        {complaint.staffRemarks && (
          <div 
            className="border bg-white p-5"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
            }}
          >
            <h3 className="text-sm mb-2" style={{ color: "#888888", fontWeight: "500" }}>
              Staff Remarks
            </h3>
            <p style={{ color: "#1A1A1A", fontSize: "15px", lineHeight: "1.6" }}>
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
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              color: "#555555",
              fontWeight: "500",
              fontSize: "15px"
            }}
          >
            Back to Complaints
          </button>
        </div>
      </div>
    </div>
  );
}
