import { LogOut, Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
// 1. Import global preferences context
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
    case "confirmed": return "Approved";
    case "checked_in": return "Checked-In";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return "Approved";
  }
}

export function StaffCheckInDashboardScreen({
  onNavigate,
  onLogout,
  staffName = "Staff User",
}: StaffCheckInDashboardScreenProps) {
  // 2. Consume theme and translation tools
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  const [checkInCode, setCheckInCode] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "approved" | "checked-in" | "completed">("all");
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string; } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      const todayLabel = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const { data: bookings, error } = await supabase
        .from("facility_bookings")
        .select(`id, status, reference_code, check_in_code, check_in_time, check_out_time, user_id, time_label, facilities ( name )`)
        .eq("date_label", todayLabel)
        .neq("status", "cancelled");

      if (error) {
        setFeedbackMessage({ type: "error", text: isMs ? "Gagal memuatkan sesi hari ini." : "Failed to load today's sessions." });
        setLoading(false);
        return;
      }

      let profilesById: Record<string, any> = {};
      const userIds = Array.from(new Set((bookings || []).map((b: any) => b.user_id).filter(Boolean)));
      
      if (userIds.length) {
        const { data: profilesData } = await supabase.from("profiles").select("id, full_name, matric_id").in("id", userIds);
        profilesById = Object.fromEntries((profilesData || []).map((p: any) => [p.id, p]));
      }

      const mapped: Session[] = (bookings || []).map((row: any) => ({
        id: row.id,
        code: row.check_in_code ?? (row.reference_code ? row.reference_code.slice(-6) : ""),
        facility: row.facilities?.name || "Facility",
        time: row.time_label || "",
        studentName: profilesById[row.user_id]?.full_name || "Student",
        matricId: profilesById[row.user_id]?.matric_id || "-",
        status: mapDbStatusToUi(row.status),
        checkInTime: row.check_in_time ? row.check_in_time.slice(11, 16) : null,
        checkOutTime: row.check_out_time ? row.check_out_time.slice(11, 16) : null,
      }));

      setSessions(mapped);
      setLoading(false);
    };
    loadSessions();
  }, [isMs]);

  const updateSessionInState = (id: string, changes: Partial<Session>) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  };

  const handleCheckInAction = async (session: Session) => {
    const now = new Date();
    const hhmm = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    
    const { error } = await supabase.from("facility_bookings").update({ status: "checked_in", check_in_time: now.toISOString() }).eq("id", session.id);

    if (error) {
      setFeedbackMessage({ type: "error", text: isMs ? "Gagal daftar masuk." : "Failed to check in." });
      return;
    }

    updateSessionInState(session.id, { status: "Checked-In", checkInTime: hhmm });
    setFeedbackMessage({ type: "success", text: `${isMs ? 'Berjaya daftar masuk' : 'Successfully checked in'} ${session.studentName}` });
    setCheckInCode("");
    setShowManualSearch(false);
  };

  const handleEndSession = async (sessionId: string) => {
    const now = new Date();
    const { error } = await supabase.from("facility_bookings").update({ status: "completed", check_out_time: now.toISOString() }).eq("id", sessionId);

    if (!error) {
      updateSessionInState(sessionId, { status: "Completed", checkOutTime: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) });
      setFeedbackMessage({ type: "success", text: isMs ? "Sesi tamat." : "Session ended." });
    }
    setShowEndSessionModal(false);
  };

  const filteredSessions = sessions.filter(s => {
    const matchesFilter = selectedFilter === "all" || s.status.toLowerCase() === selectedFilter.replace("-", "");
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || s.studentName.toLowerCase().includes(q) || s.matricId.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-6 flex items-center justify-between border-b transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <h1 style={{ color: theme.primary, fontWeight: 600, fontSize: "20px" }}>UTMGo+</h1>
        <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
          <LogOut className="w-5 h-5" style={{ color: theme.primary }} />
        </button>
      </div>

      {/* Page Title */}
      <div className="px-6 py-6 border-b transition-colors" style={{ borderColor: theme.border }}>
        <h2 style={{ color: theme.text, fontWeight: 600, fontSize: "24px" }}>
          {isMs ? "Sesi Hari Ini" : "Today's Sessions"}
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: "14px" }}>
          {new Date().toLocaleDateString(isMs ? "ms-MY" : "en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="mx-6 mt-4 p-3 rounded-lg text-sm border animate-in fade-in" style={{ 
          backgroundColor: feedbackMessage.type === "success" ? "#065f4620" : "#991b1b20", 
          color: feedbackMessage.type === "success" ? "#34d399" : "#f87171",
          borderColor: feedbackMessage.type === "success" ? "#34d39940" : "#f8717140"
        }}>
          {feedbackMessage.text}
        </div>
      )}

      {/* Check-In Code Entry */}
      <div className="p-6">
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium" style={{ color: theme.text }}>
            {isMs ? "Masukkan Kod Daftar Masuk" : "Enter Check-In Code"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="flex-1 h-12 px-4 border rounded-xl outline-none transition-colors"
              style={{ borderColor: theme.border, backgroundColor: theme.cardBg, color: theme.text, fontFamily: "monospace", letterSpacing: "4px" }}
            />
            <button
              onClick={() => {
                const s = sessions.find(x => x.code === checkInCode && x.status === "Approved");
                s ? handleCheckInAction(s) : setFeedbackMessage({ type: "error", text: isMs ? "Kod tidak sah." : "Invalid code." });
              }}
              disabled={checkInCode.length !== 6}
              className="px-6 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: theme.primary }}
            >
              {isMs ? "Daftar" : "Check In"}
            </button>
          </div>
        </div>
        <button onClick={() => setShowManualSearch(!showManualSearch)} className="text-sm font-medium" style={{ color: theme.primary }}>
          {showManualSearch ? (isMs ? "Tutup" : "Close") : (isMs ? "Cari manual?" : "Search manually?")}
        </button>
      </div>

      {/* Manual Search UI */}
      {showManualSearch && (
        <div className="px-6 mb-6">
          <div className="p-4 rounded-2xl border transition-colors" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.textSecondary }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMs ? "Cari nama atau matrik..." : "Search name or matric..."}
                className="w-full h-10 pl-10 pr-4 border rounded-lg outline-none"
                style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredSessions.filter(s => s.status === "Approved").map(s => (
                <div key={s.id} className="p-3 border rounded-xl flex justify-between items-center" style={{ borderColor: theme.border }}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: theme.text }}>{s.studentName}</p>
                    <p className="text-xs" style={{ color: theme.textSecondary }}>{s.matricId} • {s.time}</p>
                  </div>
                  <button onClick={() => handleCheckInAction(s)} className="px-3 py-1 text-xs font-bold text-white rounded-lg" style={{ backgroundColor: theme.primary }}>
                    {isMs ? "Daftar" : "Check In"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {["all", "approved", "checked-in", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f as any)}
            className="px-4 py-2 text-xs font-bold whitespace-nowrap rounded-full border transition-all"
            style={{ 
              backgroundColor: selectedFilter === f ? theme.primary : theme.cardBg,
              color: selectedFilter === f ? "#FFFFFF" : theme.textSecondary,
              borderColor: selectedFilter === f ? theme.primary : theme.border
            }}
          >
            {f === "all" ? (isMs ? "Semua" : "All") : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="px-6 space-y-3 pb-24">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: theme.primary }} /></div>
        ) : (
          filteredSessions.map((s) => (
            <div key={s.id} className="p-4 border rounded-2xl transition-colors shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold" style={{ color: theme.text }}>{s.facility}</h3>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>{s.time}</p>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold rounded-lg" style={{ 
                  backgroundColor: s.status === "Approved" ? "#fb923c20" : s.status === "Checked-In" ? "#38bdf820" : "#34d39920",
                  color: s.status === "Approved" ? "#fb923c" : s.status === "Checked-In" ? "#38bdf8" : "#34d399"
                }}>
                  {s.status}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between items-end" style={{ borderColor: theme.border }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: theme.text }}>{s.studentName}</p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>{s.matricId}</p>
                  <p className="text-[10px] mt-2 font-mono" style={{ color: theme.primary }}>CODE: {s.code}</p>
                </div>
                {s.status === "Checked-In" && (
                  <button onClick={() => { setSelectedSession(s); setShowEndSessionModal(true); }} className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-lg active:scale-95" style={{ backgroundColor: theme.primary }}>
                    {isMs ? "Tamat Sesi" : "End Session"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* End Session Modal */}
      {showEndSessionModal && selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="p-6 max-w-sm w-full rounded-3xl shadow-2xl transition-colors" style={{ backgroundColor: theme.cardBg }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>{isMs ? "Tamatkan Sesi?" : "End Session?"}</h3>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>
              {isMs ? `Sahkan daftar keluar untuk ${selectedSession.studentName}.` : `Confirm check-out for ${selectedSession.studentName}.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndSessionModal(false)} className="flex-1 h-12 font-bold rounded-xl border" style={{ borderColor: theme.border, color: theme.text }}>{t("cancel")}</button>
              <button onClick={() => handleEndSession(selectedSession.id)} className="flex-1 h-12 font-bold text-white rounded-xl" style={{ backgroundColor: theme.primary }}>{isMs ? "Sahkan" : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}