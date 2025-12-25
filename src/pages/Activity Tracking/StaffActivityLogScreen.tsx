import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Input } from "../../components/ui/input";
// 1. Import the global preferences hook
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface StaffActivityLogScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

const activityLogs = [
  { id: "1", studentId: "A20EC0123", action: "Booked Badminton Court", date: "Dec 18", time: "10:23 AM" },
  { id: "2", studentId: "A20EC0456", action: "Cancelled Futsal Court", date: "Dec 18", time: "10:15 AM" },
  { id: "3", studentId: "A20EC0789", action: "Booked Gym", date: "Dec 18", time: "9:45 AM" },
  { id: "4", studentId: "A20EC0234", action: "Booked Volleyball Court", date: "Dec 18", time: "9:30 AM" },
  { id: "5", studentId: "A20EC0567", action: "Cancelled Ping Pong Table", date: "Dec 18", time: "8:50 AM" },
  { id: "6", studentId: "A20EC0890", action: "Booked Badminton Court", date: "Dec 17", time: "5:20 PM" },
  { id: "7", studentId: "A20EC0321", action: "Booked Futsal Court", date: "Dec 17", time: "4:15 PM" },
  { id: "8", studentId: "A20EC0654", action: "Cancelled Gym", date: "Dec 17", time: "3:30 PM" },
];

export function StaffActivityLogScreen({ onNavigate }: StaffActivityLogScreenProps) {
  // 2. Consume global theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState("");

  const isMs = preferences.language_code === 'ms';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1
          className="mb-2"
          style={{
            color: theme.primary,
            fontWeight: "600",
            fontSize: "24px",
            letterSpacing: "-0.02em",
          }}
        >
          {isMs ? "Log Aktiviti Sistem" : "System Activity Logs"}
        </h1>
        <p className="text-sm" style={{ color: theme.textSecondary, lineHeight: "1.6" }}>
          {isMs ? "Lihat semua tindakan tempahan dan pengurusan fasiliti." : "View all booking and facility management actions."}
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            strokeWidth={1.5}
            style={{ color: theme.textSecondary }}
          />
          <Input
            type="text"
            placeholder={isMs ? "Cari melalui pelajar, fasiliti, atau tindakan" : "Search by student, facility, or action"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 pr-4 border transition-colors"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              borderRadius: "14px",
              fontSize: "15px",
              color: theme.text,
            }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="px-6 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            isMs ? "Julat Tarikh" : "Date Range",
            isMs ? "Jenis Tindakan" : "Action Type",
            isMs ? "Fasiliti" : "Facility",
            isMs ? "Peranan Pengguna" : "User Role"
          ].map((filterLabel) => (
            <button
              key={filterLabel}
              className="flex items-center gap-2 px-4 h-10 border transition-colors whitespace-nowrap"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                borderRadius: "8px",
                fontSize: "14px",
                color: theme.textSecondary,
                fontWeight: "500",
              }}
            >
              {filterLabel}
              <ChevronDown className="w-4 h-4" strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {/* Activity Log List */}
      <div className="px-6 space-y-1">
        {activityLogs.map((log) => (
          <button
            key={log.id}
            onClick={() => onNavigate("activity-detail", log.id)}
            className="w-full text-left border-b py-4 transition-colors active:opacity-70"
            style={{
              borderColor: theme.border,
            }}
          >
            <p
              className="text-sm"
              style={{ color: theme.text, lineHeight: "1.6" }}
            >
              <span style={{ fontWeight: "600", color: theme.primary }}>
                [{log.studentId}]
              </span>{" "}
              {log.action} — <span style={{ color: theme.textSecondary }}>{log.date}, {log.time}</span>
            </p>
          </button>
        ))}
      </div>

      {/* Pagination Info */}
      <div className="px-6 py-8 text-center">
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          {isMs ? `Menunjukkan 8 daripada 124 entri` : `Showing 8 of 124 entries`}
        </p>
      </div>
    </div>
  );
}