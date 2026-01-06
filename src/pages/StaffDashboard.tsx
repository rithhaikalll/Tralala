import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUserPreferences } from "../lib/UserPreferencesContext";

interface StaffCheckInDashboardScreenProps {
  onNavigate: (path: string) => void;
  onLogout?: () => void;
  staffName?: string;
}

type SessionStatus = "Approved" | "Checked-In" | "Completed" | "Cancelled";

interface Session {
  id: string;
  code: string;
  facility: string;
  time: string;
  studentName: string;
  matricId: string;
  status: SessionStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
}

function mapDbStatusToUi(status: string | null | undefined): SessionStatus {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "confirmed":
      return "Approved";
    case "checked_in":
      return "Checked-In";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Approved";
  }
}

// ✅ normalize status to filter key that matches tabs
function statusToFilterKey(status: SessionStatus) {
  // "Checked-In" -> "checked-in"
  return status.toLowerCase().replace(/\s+/g, "-");
}

export function StaffCheckInDashboardScreen({
  onNavigate,
  onLogout,
  staffName = "Staff User",
}: StaffCheckInDashboardScreenProps) {
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === "ms";

  const [checkInCode, setCheckInCode] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "approved" | "checked-in" | "completed"
  >("all");
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      setFeedbackMessage(null);

      const todayLabel = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const { data: bookings, error } = await supabase
        .from("facility_bookings")
        .select(
          `
          id,
          date_label,
          time_label,
          status,
          reference_code,
          check_in_code,
          check_in_time,
          check_out_time,
          user_id,
          facilities ( name )
        `
        )
        .eq("date_label", todayLabel)
        .neq("status", "cancelled");

      if (error) {
        console.error("Error loading sessions", error);
        setFeedbackMessage({
          type: "error",
          text: isMs
            ? "Gagal memuatkan sesi hari ini."
            : "Failed to load today's sessions.",
        });
        setSessions([]);
        setLoading(false);
        return;
      }

      let profilesById: Record<
        string,
        { id: string; full_name: string | null; matric_id: string | null }
      > = {};

      try {
        const userIds = Array.from(
          new Set((bookings || []).map((b: any) => b.user_id).filter(Boolean))
        );

        if (userIds.length) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, matric_id")
            .in("id", userIds);

          if (!profilesError && profilesData) {
            profilesById = Object.fromEntries(
              profilesData.map((p: any) => [p.id, p])
            );
          }
        }
      } catch (e) {
        console.error("Unexpected error profiles", e);
      }

      const mapped: Session[] = (bookings || []).map((row: any) => {
        const uiStatus = mapDbStatusToUi(row.status);
        const profile = row.user_id ? profilesById[row.user_id] : null;
        const sixDigit =
          row.check_in_code ??
          (row.reference_code ? row.reference_code.slice(-6) : "");

        return {
          id: row.id,
          code: sixDigit || "------",
          facility: row.facilities?.name || "Facility",
          time: row.time_label || "",
          studentName: profile?.full_name || "Student",
          matricId: profile?.matric_id || "-",
          status: uiStatus,
          checkInTime: row.check_in_time
            ? row.check_in_time.slice(11, 16)
            : null,
          checkOutTime: row.check_out_time
            ? row.check_out_time.slice(11, 16)
            : null,
        };
      });

      setSessions(mapped);
      setLoading(false);
    };

    loadSessions();
  }, [isMs]);

  const resetFeedbackLater = () => {
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const updateSessionInState = (id: string, changes: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s))
    );
  };

  const handleCheckIn = async () => {
    if (checkInCode.length !== 6) return;

    const session = sessions.find(
      (s) => s.code === checkInCode && s.status === "Approved"
    );

    if (!session) {
      const alreadyCheckedIn = sessions.find(
        (s) => s.code === checkInCode && s.status !== "Approved"
      );
      setFeedbackMessage({
        type: "error",
        text: alreadyCheckedIn
          ? isMs
            ? "Tempahan ini sudah didaftar masuk."
            : "This booking has already been checked in."
          : isMs
          ? "Kod tidak sah atau tamat tempoh."
          : "Invalid or expired check-in code.",
      });
      resetFeedbackLater();
      return;
    }

    const now = new Date();
    const { error } = await supabase
      .from("facility_bookings")
      .update({ status: "checked_in", check_in_time: now.toISOString() })
      .eq("id", session.id);

    if (error) {
      setFeedbackMessage({
        type: "error",
        text: isMs ? "Gagal daftar masuk." : "Failed to check in.",
      });
    } else {
      updateSessionInState(session.id, {
        status: "Checked-In",
        checkInTime: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      });
      setFeedbackMessage({
        type: "success",
        text: isMs
          ? `Berjaya daftar masuk ${session.studentName}`
          : `Successfully checked in ${session.studentName}`,
      });
      setCheckInCode("");
    }
    resetFeedbackLater();
  };

  const handleManualCheckIn = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.status !== "Approved") return;

    const now = new Date();
    const { error } = await supabase
      .from("facility_bookings")
      .update({ status: "checked_in", check_in_time: now.toISOString() })
      .eq("id", session.id);

    if (error) {
      setFeedbackMessage({
        type: "error",
        text: isMs ? "Gagal daftar masuk." : "Failed to check in.",
      });
    } else {
      updateSessionInState(session.id, {
        status: "Checked-In",
        checkInTime: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      });
      setFeedbackMessage({
        type: "success",
        text: isMs
          ? `Berjaya daftar masuk ${session.studentName}`
          : `Successfully checked in ${session.studentName}`,
      });
      setShowManualSearch(false);
      setSearchQuery("");
    }
    resetFeedbackLater();
  };

  const handleEndSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const now = new Date();
    const { error } = await supabase
      .from("facility_bookings")
      .update({ status: "completed", check_out_time: now.toISOString() })
      .eq("id", session.id);

    if (error) {
      setFeedbackMessage({
        type: "error",
        text: isMs ? "Gagal tamatkan sesi." : "Failed to end session.",
      });
    } else {
      updateSessionInState(session.id, {
        status: "Completed",
        checkOutTime: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      });
      setFeedbackMessage({
        type: "success",
        text: isMs
          ? `Sesi tamat untuk ${session.studentName}`
          : `Session ended for ${session.studentName}`,
      });
    }

    setShowEndSessionModal(false);
    setSelectedSession(null);
    resetFeedbackLater();
  };

  // ✅ FIX FILTER
  const filteredSessions = sessions
    .filter((s) => {
      if (selectedFilter === "all") return true;
      // compare normalized keys
      return statusToFilterKey(s.status) === selectedFilter;
    })
    .filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.studentName.toLowerCase().includes(q) ||
        s.matricId.toLowerCase().includes(q) ||
        s.facility.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const getScore = (status: SessionStatus) => {
        if (status === "Approved") return 0;
        if (status === "Checked-In") return 1;
        return 2; // Completed, Cancelled, etc.
      };
      return getScore(a.status) - getScore(b.status);
    });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Approved":
        return { bg: "#FFF7ED", color: "#C2410C" };
      case "Checked-In":
        return { bg: "#F0F9FF", color: "#0369A1" };
      case "Completed":
        return { bg: "#F0FDF4", color: "#15803D" };
      default:
        return { bg: "#F5F5F5", color: "#6A6A6A" };
    }
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 py-6 flex items-center justify-between border-b"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
      >
        <h1
          style={{
            color: theme.primary,
            fontWeight: "600",
            fontSize: "20px",
            letterSpacing: "-0.01em",
          }}
        >
          UTMGo+
        </h1>
        <button
          onClick={onLogout ? onLogout : () => onNavigate("profile")}
          className="w-10 h-10 flex items-center justify-center border transition-all active:scale-95"
          style={{
            borderColor: theme.border,
            borderRadius: "10px",
            backgroundColor: theme.background,
          }}
        >
          <LogOut
            className="w-5 h-5"
            style={{ color: theme.primary }}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Page Title */}
      <div className="px-6 py-6 border-b" style={{ borderColor: theme.border }}>
        <h2
          style={{
            color: theme.text,
            fontWeight: "600",
            fontSize: "24px",
            marginBottom: "4px",
          }}
        >
          {isMs ? "Sesi Hari Ini" : "Today's Sessions"}
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: "14px" }}>
          {new Date().toLocaleDateString(isMs ? "ms-MY" : "en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p
          style={{
            color: theme.textSecondary,
            opacity: 0.8,
            fontSize: "12px",
            marginTop: "4px",
          }}
        >
          {isMs ? "Log masuk sebagai" : "Logged in as"} {staffName}
        </p>
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div
          className="mx-6 mt-4 p-3 rounded-lg text-sm"
          style={{
            backgroundColor:
              feedbackMessage.type === "success" ? "#F0FDF4" : "#FEF2F2",
            color: feedbackMessage.type === "success" ? "#15803D" : "#DC2626",
            border: `1px solid ${
              feedbackMessage.type === "success" ? "#BBF7D0" : "#FECACA"
            }`,
          }}
        >
          {feedbackMessage.text}
        </div>
      )}

      {/* Check-In Code Entry */}
      <div className="p-6">
        <div className="mb-4">
          <label
            className="block mb-2 text-sm"
            style={{ color: theme.text, fontWeight: "500" }}
          >
            {isMs ? "Masukkan Kod Daftar Masuk" : "Enter Check-In Code"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={checkInCode}
              onChange={(e) =>
                setCheckInCode(e.target.value.replace(/\D/g, ""))
              }
              placeholder={isMs ? "Kod 6-digit" : "6-digit code"}
              className="flex-1 h-12 px-4 border outline-none"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.cardBg,
                color: theme.text,
                borderRadius: "8px",
                fontSize: "15px",
                fontFamily: "monospace",
                letterSpacing: "2px",
              }}
            />
            <button
              onClick={handleCheckIn}
              disabled={checkInCode.length !== 6}
              className="h-12 px-6 transition-all active:scale-95 disabled:opacity-50"
              style={{
                backgroundColor:
                  checkInCode.length === 6 ? theme.primary : theme.border,
                color:
                  checkInCode.length === 6 ? "#FFFFFF" : theme.textSecondary,
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "15px",
              }}
            >
              {isMs ? "Daftar" : "Check In"}
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowManualSearch(!showManualSearch)}
          className="text-sm"
          style={{ color: theme.primary, fontWeight: "500" }}
        >
          {showManualSearch
            ? isMs
              ? "Tutup"
              : "Hide"
            : isMs
            ? "Carian manual?"
            : "Can't find code? Search manually"}
        </button>
      </div>

      {/* Manual Search */}
      {showManualSearch && (
        <div className="px-6 pb-4">
          <div
            className="p-4"
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isMs
                  ? "Cari nama, matrik..."
                  : "Search by name, matric ID, or facility"
              }
              className="w-full h-10 px-3 border mb-3 outline-none"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.background,
                color: theme.text,
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredSessions
                .filter((s) => s.status === "Approved")
                .map((session) => (
                  <div
                    key={session.id}
                    className="p-3 border flex justify-between items-center"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: theme.text,
                        }}
                      >
                        {session.studentName}
                      </div>
                      <div
                        style={{ fontSize: "12px", color: theme.textSecondary }}
                      >
                        {session.matricId} • {session.facility} • {session.time}
                      </div>
                    </div>
                    <button
                      onClick={() => handleManualCheckIn(session.id)}
                      className="px-3 py-1 text-sm text-white active:scale-95"
                      style={{
                        backgroundColor: theme.primary,
                        borderRadius: "6px",
                        fontWeight: "500",
                      }}
                    >
                      {isMs ? "Daftar" : "Check In"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-6 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {["all", "approved", "checked-in", "completed"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter as any)}
              className="px-4 py-2 text-sm font-medium whitespace-nowrap"
              style={{
                backgroundColor:
                  selectedFilter === filter ? theme.primary : theme.cardBg,
                color:
                  selectedFilter === filter ? "#FFFFFF" : theme.textSecondary,
                border: `1px solid ${
                  selectedFilter === filter ? theme.primary : theme.border
                }`,
                borderRadius: "8px",
                textTransform: "capitalize",
              }}
            >
              {filter === "all"
                ? isMs
                  ? "Semua"
                  : "All"
                : filter.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="px-6 space-y-3 pb-24">
        {loading ? (
          <div
            className="text-center py-12"
            style={{ color: theme.textSecondary }}
          >
            {isMs ? "Memuatkan..." : "Loading sessions..."}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div
            className="text-center py-12"
            style={{ color: theme.textSecondary }}
          >
            {isMs ? "Tiada sesi." : "No sessions found."}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const statusStyle = getStatusStyle(session.status);
            return (
              <div
                key={session.id}
                className="p-4 border shadow-sm"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.cardBg,
                  borderRadius: "12px",
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: theme.text,
                      }}
                    >
                      {session.facility}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: theme.textSecondary,
                        marginTop: "2px",
                      }}
                    >
                      {session.time}
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 text-[10px] font-bold uppercase rounded-full"
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    {session.status}
                  </span>
                </div>

                <div
                  className="mb-3 pb-3"
                  style={{ borderBottom: `1px solid ${theme.border}44` }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: theme.text,
                      fontWeight: "500",
                      marginBottom: "2px",
                    }}
                  >
                    {session.studentName}
                  </div>
                  <div style={{ fontSize: "13px", color: theme.textSecondary }}>
                    {session.matricId}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div style={{ fontSize: "12px", color: theme.textSecondary }}>
                    {isMs ? "Kod Daftar" : "Check-In Code"}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: theme.primary,
                      fontFamily: "monospace",
                      letterSpacing: "2px",
                    }}
                  >
                    {session.code}
                  </div>
                </div>

                {session.checkInTime && (
                  <div
                    className="text-xs mb-1"
                    style={{ color: theme.textSecondary }}
                  >
                    {isMs ? "Daftar masuk pada" : "Checked in at"}{" "}
                    {session.checkInTime}
                  </div>
                )}
                {session.checkOutTime && (
                  <div
                    className="text-xs mb-1"
                    style={{ color: theme.textSecondary }}
                  >
                    {isMs ? "Daftar keluar pada" : "Checked out at"}{" "}
                    {session.checkOutTime}
                  </div>
                )}

                {session.status === "Checked-In" && (
                  <button
                    onClick={() => {
                      setSelectedSession(session);
                      setShowEndSessionModal(true);
                    }}
                    className="w-full h-10 mt-2 font-bold text-white shadow-md active:scale-95"
                    style={{
                      backgroundColor: theme.primary,
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  >
                    {isMs
                      ? "Tamat Sesi / Daftar Keluar"
                      : "End Session / Check Out"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* End Session Confirmation Modal */}
      {showEndSessionModal && selectedSession && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          onClick={() => setShowEndSessionModal(false)}
        >
          <div
            className="p-6 max-w-sm w-full shadow-2xl"
            style={{ backgroundColor: theme.cardBg, borderRadius: "12px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg mb-2"
              style={{ fontWeight: "600", color: theme.text }}
            >
              {isMs ? "Tamatkan Sesi?" : "End Session?"}
            </h3>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>
              {isMs
                ? `Sahkan daftar keluar untuk ${selectedSession.studentName} di ${selectedSession.facility}.`
                : `Confirm check-out for ${selectedSession.studentName} at ${selectedSession.facility}.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndSessionModal(false)}
                className="flex-1 h-10 border font-medium"
                style={{
                  borderColor: theme.border,
                  borderRadius: "8px",
                  color: theme.textSecondary,
                }}
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => handleEndSession(selectedSession.id)}
                className="flex-1 h-10 font-medium text-white shadow-lg active:scale-95"
                style={{ backgroundColor: theme.primary, borderRadius: "8px" }}
              >
                {isMs ? "Sahkan" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
