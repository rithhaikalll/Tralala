import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
// ⬇️ adjust this path to wherever your supabaseClient is
import { supabase } from "../lib/supabaseClient";

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

export function StaffCheckInDashboardScreen({
  onNavigate,
  onLogout,
  staffName = "Staff User",
}: StaffCheckInDashboardScreenProps) {
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

  // Load today's sessions from Supabase
  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      setFeedbackMessage(null);

      // Must match whatever you stored in facility_bookings.date_label
      const todayLabel = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }); // e.g. "Sun, Nov 16"

      // 1) Get today's bookings (keep this query simple)
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
        facilities (
          name
        )
      `
        )
        .eq("date_label", todayLabel)
        .neq("status", "cancelled");

      if (error) {
        console.error("Error loading sessions", error);
        setFeedbackMessage({
          type: "error",
          text: "Failed to load today's sessions.",
        });
        setSessions([]);
        setLoading(false);
        return;
      }

      // 2) Fetch profiles for those user_ids (best-effort)
      let profilesById: Record<
        string,
        { id: string; full_name: string | null; matric_id: string | null }
      > = {};

      try {
        const userIds = Array.from(
          new Set(
            (bookings || [])
              .map((b: any) => b.user_id as string | null)
              .filter(Boolean)
          )
        );

        if (userIds.length) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, matric_id")
            .in("id", userIds);

          if (profilesError) {
            console.error(
              "Error loading profiles for staff dashboard",
              profilesError
            );
          } else {
            profilesById = Object.fromEntries(
              (profilesData || []).map((p: any) => [p.id, p])
            );
          }
        }
      } catch (e) {
        console.error("Unexpected error while loading profiles", e);
      }

      // 3) Map into Session[]
      const mapped: Session[] =
        (bookings || []).map((row: any) => {
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
        }) || [];

      setSessions(mapped);
      setLoading(false);
    };

    loadSessions();
  }, []);

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
      if (alreadyCheckedIn) {
        setFeedbackMessage({
          type: "error",
          text: "This booking has already been checked in.",
        });
      } else {
        setFeedbackMessage({
          type: "error",
          text: "Invalid or expired check-in code.",
        });
      }
      resetFeedbackLater();
      return;
    }

    // Update in Supabase: set status to checked_in + check_in_time
    const now = new Date();
    const isoNow = now.toISOString();
    const hhmm = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const { error } = await supabase
      .from("facility_bookings")
      .update({
        status: "checked_in",
        check_in_time: isoNow,
      })
      .eq("id", session.id);

    if (error) {
      console.error("Error updating check-in", error);
      setFeedbackMessage({
        type: "error",
        text: "Failed to check in. Please try again.",
      });
      resetFeedbackLater();
      return;
    }

    updateSessionInState(session.id, {
      status: "Checked-In",
      checkInTime: hhmm,
    });

    setFeedbackMessage({
      type: "success",
      text: `Successfully checked in ${session.studentName}`,
    });
    setCheckInCode("");
    resetFeedbackLater();
  };

  const handleManualCheckIn = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.status !== "Approved") return;

    const now = new Date();
    const isoNow = now.toISOString();
    const hhmm = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const { error } = await supabase
      .from("facility_bookings")
      .update({
        status: "checked_in",
        check_in_time: isoNow,
      })
      .eq("id", session.id);

    if (error) {
      console.error("Error updating manual check-in", error);
      setFeedbackMessage({
        type: "error",
        text: "Failed to check in. Please try again.",
      });
      resetFeedbackLater();
      return;
    }

    updateSessionInState(session.id, {
      status: "Checked-In",
      checkInTime: hhmm,
    });

    setFeedbackMessage({
      type: "success",
      text: `Successfully checked in ${session.studentName}`,
    });
    setShowManualSearch(false);
    setSearchQuery("");
    resetFeedbackLater();
  };

  const handleEndSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.status !== "Checked-In") {
      setFeedbackMessage({
        type: "error",
        text: "This session is not available for check-out.",
      });
      resetFeedbackLater();
      return;
    }

    const now = new Date();
    const isoNow = now.toISOString();
    const hhmm = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const { error } = await supabase
      .from("facility_bookings")
      .update({
        status: "completed",
        check_out_time: isoNow,
      })
      .eq("id", session.id);

    if (error) {
      console.error("Error ending session", error);
      setFeedbackMessage({
        type: "error",
        text: "Failed to end session. Please try again.",
      });
      resetFeedbackLater();
      return;
    }

    updateSessionInState(session.id, {
      status: "Completed",
      checkOutTime: hhmm,
    });

    setFeedbackMessage({
      type: "success",
      text: `Session ended for ${session.studentName}`,
    });
    setShowEndSessionModal(false);
    setSelectedSession(null);
    resetFeedbackLater();
  };

  const filteredSessions = sessions
    .filter((session) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "approved") return session.status === "Approved";
      if (selectedFilter === "checked-in")
        return session.status === "Checked-In";
      if (selectedFilter === "completed") return session.status === "Completed";
      return true;
    })
    .filter((session) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        session.studentName.toLowerCase().includes(q) ||
        session.matricId.toLowerCase().includes(q) ||
        session.facility.toLowerCase().includes(q)
      );
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 py-6 flex items-center justify-between border-b"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E5E5",
        }}
      >
        <h1
          style={{
            color: "#7A0019",
            fontWeight: "600",
            fontSize: "20px",
            letterSpacing: "-0.01em",
          }}
        >
          UTMGo+
        </h1>
        <button
          onClick={onLogout ? onLogout : () => onNavigate("profile")}
          className="w-10 h-10 flex items-center justify-center border"
          style={{
            borderColor: "#E5E5E5",
            borderRadius: "10px",
            backgroundColor: "#F5F5F5",
          }}
        >
          <LogOut
            className="w-5 h-5"
            style={{ color: "#7A0019" }}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Page Title */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
        <h2
          style={{
            color: "#1A1A1A",
            fontWeight: "600",
            fontSize: "24px",
            marginBottom: "4px",
          }}
        >
          Today's Sessions
        </h2>
        <p style={{ color: "#6A6A6A", fontSize: "14px" }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p style={{ color: "#888888", fontSize: "12px", marginTop: "4px" }}>
          Logged in as {staffName}
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

      {/* Check-In Code Entry - UC13 */}
      <div className="p-6">
        <div className="mb-4">
          <label
            className="block mb-2 text-sm"
            style={{ color: "#1A1A1A", fontWeight: "500" }}
          >
            Enter Check-In Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={checkInCode}
              onChange={(e) =>
                setCheckInCode(e.target.value.replace(/\D/g, ""))
              }
              placeholder="6-digit code"
              className="flex-1 h-12 px-4 border"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "8px",
                fontSize: "15px",
                fontFamily: "monospace",
                letterSpacing: "2px",
              }}
            />
            <button
              onClick={handleCheckIn}
              disabled={checkInCode.length !== 6}
              className="h-12 px-6"
              style={{
                backgroundColor:
                  checkInCode.length === 6 ? "#7A0019" : "#E5E5E5",
                color: checkInCode.length === 6 ? "#FFFFFF" : "#999999",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "15px",
              }}
            >
              Check In
            </button>
          </div>
        </div>

        {/* Manual Search Option - AF2 */}
        <button
          onClick={() => setShowManualSearch(!showManualSearch)}
          className="text-sm"
          style={{ color: "#7A0019", fontWeight: "500" }}
        >
          {showManualSearch ? "Hide" : "Can't find code? Search manually"}
        </button>
      </div>

      {/* Manual Search - AF2 */}
      {showManualSearch && (
        <div className="px-6 pb-4">
          <div
            className="p-4"
            style={{ backgroundColor: "#F9FAFB", borderRadius: "8px" }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, matric ID, or facility"
              className="w-full h-10 px-3 border mb-3"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <div className="space-y-2">
              {filteredSessions
                .filter((s) => s.status === "Approved")
                .map((session) => (
                  <div
                    key={session.id}
                    className="p-3 bg-white border flex justify-between items-center"
                    style={{
                      borderColor: "#E5E5E5",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#1A1A1A",
                        }}
                      >
                        {session.studentName}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888888" }}>
                        {session.matricId} • {session.facility} • {session.time}
                      </div>
                    </div>
                    <button
                      onClick={() => handleManualCheckIn(session.id)}
                      className="px-3 py-1 text-sm"
                      style={{
                        backgroundColor: "#7A0019",
                        color: "#FFFFFF",
                        borderRadius: "6px",
                        fontWeight: "500",
                      }}
                    >
                      Check In
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs - UC15 */}
      <div className="px-6 pb-4">
        <div className="flex gap-2 overflow-x-auto">
          {["all", "approved", "checked-in", "completed"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter as any)}
              className="px-4 py-2 text-sm whitespace-nowrap"
              style={{
                backgroundColor:
                  selectedFilter === filter ? "#7A0019" : "#F5F5F5",
                color: selectedFilter === filter ? "#FFFFFF" : "#6A6A6A",
                borderRadius: "8px",
                fontWeight: "500",
                textTransform: "capitalize",
              }}
            >
              {filter === "all" ? "All" : filter.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List - UC15 */}
      <div className="px-6 space-y-3 pb-8">
        {loading ? (
          <div className="text-center py-12" style={{ color: "#888888" }}>
            Loading sessions...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12" style={{ color: "#888888" }}>
            No sessions found for this filter.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const statusStyle = getStatusStyle(session.status);
            return (
              <div
                key={session.id}
                className="p-4 border"
                style={{
                  borderColor: "#E5E5E5",
                  borderRadius: "12px",
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#1A1A1A",
                      }}
                    >
                      {session.facility}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#888888",
                        marginTop: "2px",
                      }}
                    >
                      {session.time}
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 text-xs"
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      borderRadius: "6px",
                      fontWeight: "500",
                    }}
                  >
                    {session.status}
                  </span>
                </div>

                <div
                  className="mb-3 pb-3"
                  style={{
                    borderBottom: "1px solid #F0F0F0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#1A1A1A",
                      marginBottom: "2px",
                    }}
                  >
                    {session.studentName}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888888" }}>
                    {session.matricId}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div style={{ fontSize: "12px", color: "#888888" }}>
                    Check-In Code
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#7A0019",
                      fontFamily: "monospace",
                      letterSpacing: "2px",
                    }}
                  >
                    {session.code}
                  </div>
                </div>

                {session.checkInTime && (
                  <div className="text-xs mb-2" style={{ color: "#888888" }}>
                    Checked in at {session.checkInTime}
                  </div>
                )}

                {session.checkOutTime && (
                  <div className="text-xs mb-2" style={{ color: "#888888" }}>
                    Checked out at {session.checkOutTime}
                  </div>
                )}

                {/* Actions - UC14 */}
                {session.status === "Checked-In" && (
                  <button
                    onClick={() => {
                      setSelectedSession(session);
                      setShowEndSessionModal(true);
                    }}
                    className="w-full h-10 mt-2"
                    style={{
                      backgroundColor: "#7A0019",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    End Session / Check Out
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* End Session Confirmation Modal - UC14 with AF1 */}
      {showEndSessionModal && selectedSession && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50"
          onClick={() => setShowEndSessionModal(false)}
        >
          <div
            className="bg-white p-6 max-w-sm w-full"
            style={{ borderRadius: "12px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg mb-2"
              style={{ fontWeight: "600", color: "#1A1A1A" }}
            >
              End Session?
            </h3>
            <p className="text-sm mb-4" style={{ color: "#6A6A6A" }}>
              Confirm check-out for {selectedSession.studentName} at{" "}
              {selectedSession.facility}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndSessionModal(false)}
                className="flex-1 h-10 border"
                style={{
                  borderColor: "#E5E5E5",
                  borderRadius: "8px",
                  color: "#6A6A6A",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleEndSession(selectedSession.id)}
                className="flex-1 h-10"
                style={{
                  backgroundColor: "#7A0019",
                  color: "#FFFFFF",
                  borderRadius: "8px",
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
