import {
  AlertCircle,
  ArrowLeft,
  Filter,
  Search,
  Clock,
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

interface StaffComplaintsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  complaints: Complaint[];
}

export function StaffComplaintsScreen({
  onNavigate,
  complaints,
}: StaffComplaintsScreenProps) {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [facilityFilter, setFacilityFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

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

  const getPriorityColor = (priority?: string) => {
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

  const facilities = Array.from(new Set(complaints.map((c) => c.facilityName)));

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesFacility =
      facilityFilter === "All" || c.facilityName === facilityFilter;
    const matchesPriority =
      priorityFilter === "All" || (c.priority || "Medium") === priorityFilter;
    const matchesSearch =
      searchQuery === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesFacility && matchesPriority && matchesSearch;
  });



  // Calculate urgency (days since submission)
  const getDaysOld = (dateStr: string) => {
    const submitted = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <div
        className="sticky top-0 z-40 bg-white px-6 py-6 border-b"
        style={{ borderColor: "#E5E5E5" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate("staff-checkin-dashboard")}
            style={{ color: "#7A0019" }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2 style={{ color: "#1A1A1A", fontWeight: "600", fontSize: "20px" }}>
            Complaint Management
          </h2>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: "#888888" }}
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, student name or ID..."
            className="w-full h-10 pl-10 pr-3 border bg-white text-sm"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "8px",
              color: "#1A1A1A",
            }}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2 border bg-white text-xs"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "8px",
              color: "#1A1A1A",
            }}
          >
            <option value="All">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 px-2 border bg-white text-xs"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "8px",
              color: "#1A1A1A",
            }}
          >
            <option value="All">All Priority</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="h-9 px-2 border bg-white text-xs"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "8px",
              color: "#1A1A1A",
            }}
          >
            <option value="All">All Facilities</option>
            {facilities.map((facility) => (
              <option key={facility} value={facility}>
                {facility}
              </option>
            ))}
          </select>
        </div>


      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="border p-4"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              backgroundColor: "#FFF4E6",
            }}
          >
            <div
              className="text-2xl mb-1"
              style={{ color: "#D97706", fontWeight: "600" }}
            >
              {
                complaints.filter(
                  (c) => c.status === "Submitted" || c.status === "In Progress"
                ).length
              }
            </div>
            <div
              className="text-xs"
              style={{ color: "#92400E", fontWeight: "500" }}
            >
              Pending
            </div>
          </div>

          <div
            className="border p-4"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              backgroundColor: "#FEF2F2",
            }}
          >
            <div
              className="text-2xl mb-1"
              style={{ color: "#DC2626", fontWeight: "600" }}
            >
              {
                complaints.filter((c) => {
                  const days = getDaysOld(c.submittedDate);
                  return (
                    days > 7 &&
                    (c.status === "Submitted" || c.status === "In Progress")
                  );
                }).length
              }
            </div>
            <div
              className="text-xs"
              style={{ color: "#991B1B", fontWeight: "500" }}
            >
              Overdue (7+ days)
            </div>
          </div>
        </div>



        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#F5F5F5" }}
              >
                <AlertCircle
                  className="w-8 h-8"
                  style={{ color: "#888888" }}
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <p
              style={{ color: "#555555", fontSize: "15px", lineHeight: "1.6" }}
            >
              No complaints match your filters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredComplaints.map((complaint) => {
              const statusColors = getStatusColor(complaint.status);
              const priorityColors = getPriorityColor(
                complaint.priority || "Medium"
              );
              const daysOld = getDaysOld(complaint.submittedDate);
              const isOverdue =
                daysOld > 7 &&
                (complaint.status === "Submitted" ||
                  complaint.status === "In Progress");

              return (
                <div
                  key={complaint.id}
                  className="border bg-white p-4"
                  style={{
                    borderColor: "#E5E5E5",
                    borderRadius: "14px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Complaint Content */}
                    <button
                      onClick={() =>
                        onNavigate("staff-complaint-detail", { complaint })
                      }
                      className="flex-1 text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              style={{
                                color: "#1A1A1A",
                                fontWeight: "600",
                                fontSize: "15px",
                              }}
                            >
                              {complaint.title}
                            </h3>
                            {isOverdue && (
                              <span
                                className="flex items-center gap-1 px-1.5 py-0.5 text-xs"
                                style={{
                                  backgroundColor: "#FEF2F2",
                                  color: "#DC2626",
                                  borderRadius: "4px",
                                  fontWeight: "500",
                                }}
                              >
                                <Clock className="w-3 h-3" strokeWidth={2} />
                                Overdue
                              </span>
                            )}
                          </div>
                          <p
                            className="text-sm mb-1"
                            style={{ color: "#555555" }}
                          >
                            {complaint.facilityName}
                          </p>
                          <p className="text-xs" style={{ color: "#888888" }}>
                            {complaint.studentName} • {complaint.studentId}
                          </p>
                        </div>
                      </div>

                      {/* Tags Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-2 py-1 text-xs border"
                          style={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                            borderColor: statusColors.border,
                            borderRadius: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {complaint.status}
                        </span>
                        <span
                          className="px-2 py-1 text-xs"
                          style={{
                            backgroundColor: priorityColors.bg,
                            color: priorityColors.text,
                            borderRadius: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {complaint.priority || "Medium"}
                        </span>
                        <span className="text-xs" style={{ color: "#888888" }}>
                          {complaint.category}
                        </span>
                        <span className="text-xs" style={{ color: "#888888" }}>
                          •
                        </span>
                        <span className="text-xs" style={{ color: "#888888" }}>
                          {daysOld === 0
                            ? "Today"
                            : `${daysOld} day${daysOld > 1 ? "s" : ""} ago`}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
