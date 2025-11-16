import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Input } from "../components/ui/input";

interface StaffActivityLogScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

const activityLogs = [
  {
    id: "1",
    studentId: "A20EC0123",
    action: "Booked Badminton Court",
    date: "Dec 18",
    time: "10:23 AM",
  },
  {
    id: "2",
    studentId: "A20EC0456",
    action: "Cancelled Futsal Court",
    date: "Dec 18",
    time: "10:15 AM",
  },
  {
    id: "3",
    studentId: "A20EC0789",
    action: "Booked Gym",
    date: "Dec 18",
    time: "9:45 AM",
  },
  {
    id: "4",
    studentId: "A20EC0234",
    action: "Booked Volleyball Court",
    date: "Dec 18",
    time: "9:30 AM",
  },
  {
    id: "5",
    studentId: "A20EC0567",
    action: "Cancelled Ping Pong Table",
    date: "Dec 18",
    time: "8:50 AM",
  },
  {
    id: "6",
    studentId: "A20EC0890",
    action: "Booked Badminton Court",
    date: "Dec 17",
    time: "5:20 PM",
  },
  {
    id: "7",
    studentId: "A20EC0321",
    action: "Booked Futsal Court",
    date: "Dec 17",
    time: "4:15 PM",
  },
  {
    id: "8",
    studentId: "A20EC0654",
    action: "Cancelled Gym",
    date: "Dec 17",
    time: "3:30 PM",
  },
];

export function StaffActivityLogScreen({
  onNavigate,
}: StaffActivityLogScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1
          className="mb-2"
          style={{
            color: "#7A0019",
            fontWeight: "600",
            fontSize: "24px",
            letterSpacing: "-0.02em",
          }}
        >
          System Activity Logs
        </h1>
        <p className="text-sm" style={{ color: "#6A6A6A", lineHeight: "1.6" }}>
          View all booking and facility management actions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            strokeWidth={1.5}
            style={{ color: "#888888" }}
          />
          <Input
            type="text"
            placeholder="Search by student, facility, or action"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 pr-4 border bg-white"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "14px",
              fontSize: "15px",
            }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="px-6 mb-6">
        <div className="flex gap-3 overflow-x-auto">
          <button
            className="flex items-center gap-2 px-4 h-10 border bg-white whitespace-nowrap"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#6A6A6A",
              fontWeight: "500",
            }}
          >
            Date Range
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            className="flex items-center gap-2 px-4 h-10 border bg-white whitespace-nowrap"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#6A6A6A",
              fontWeight: "500",
            }}
          >
            Action Type
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            className="flex items-center gap-2 px-4 h-10 border bg-white whitespace-nowrap"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#6A6A6A",
              fontWeight: "500",
            }}
          >
            Facility
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            className="flex items-center gap-2 px-4 h-10 border bg-white whitespace-nowrap"
            style={{
              borderColor: "#E5E5E5",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#6A6A6A",
              fontWeight: "500",
            }}
          >
            User Role
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Activity Log List */}
      <div className="px-6 space-y-3">
        {activityLogs.map((log) => (
          <button
            key={log.id}
            onClick={() => onNavigate("activity-detail", log.id)}
            className="w-full text-left border-b py-3"
            style={{
              borderColor: "#E5E5E5",
            }}
          >
            <p
              className="text-sm"
              style={{ color: "#1A1A1A", lineHeight: "1.6" }}
            >
              <span style={{ fontWeight: "600", color: "#7A0019" }}>
                [{log.studentId}]
              </span>{" "}
              {log.action} — {log.date}, {log.time}
            </p>
          </button>
        ))}
      </div>

      {/* Pagination Info */}
      <div className="px-6 py-6 text-center">
        <p className="text-sm" style={{ color: "#888888" }}>
          Showing 8 of 124 entries
        </p>
      </div>
    </div>
  );
}
