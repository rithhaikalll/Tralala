// src/pages/ProfileScreen.tsx
import {
  ArrowLeft,
  User,
  Edit,
  Settings,
  ChevronRight,
  Activity,
  Check,
  Moon,
  Sun,
  Save,
  LayoutDashboard,
  MoveVertical,
  Trash2,
  AlertTriangle,
  Loader2,
  MessageSquareWarning,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";
import { useUserPreferences } from "../lib/UserPreferencesContext";

interface ProfileScreenProps {
  studentName: string;
  profilePictureUrl: string | null;
  studentId: string;
  userRole: "student" | "staff";
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function ProfileScreen({
  studentName,
  profilePictureUrl,
  studentId,
  userRole,
  onNavigate,
  onLogout,
}: ProfileScreenProps) {
  const { preferences, updateTheme, updateLanguage, theme } =
    useUserPreferences();
  const isMs = preferences.language_code === "ms";

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isCustomColorMode, setIsCustomColorMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(preferences.theme_color);

  // Badge state
  const [complaintBadge, setComplaintBadge] = useState(0);

  useEffect(() => {
    // Poll badge count if staff
    if (userRole === "staff") {
      import("../lib/complaints").then(({ getStaffComplaintBadgeCount }) => {
        getStaffComplaintBadgeCount().then(setComplaintBadge);
      });
    }
  }, [userRole]);

  useEffect(() => {
    setSelectedColor(preferences.theme_color);
    const isDefault =
      preferences.theme_color === "#7A0019" ||
      preferences.theme_color === "#9e1c3a";
    setIsCustomColorMode(!isDefault);
  }, [preferences.theme_color]);

  const menuItems = [
    {
      icon: Edit,
      label: isMs ? "Edit Profil" : "Edit Profile",
      subtitle: isMs
        ? "Kemas kini maklumat peribadi"
        : "Update your personal information",
      action: "edit-profile",
      show: true,
    },
    {
      icon: Activity,
      label: isMs ? "Sejarah Aktiviti" : "Activity History",
      subtitle: isMs
        ? "Lihat sejarah tempahan anda"
        : "View your booking history",
      action: "activity-history",
      show: true,
    },
    {
      icon: LayoutDashboard,
      label: isMs ? "Susunan Dashboard" : "Dashboard Settings",
      subtitle: isMs
        ? "Susun semula widget dashboard"
        : "Rearrange dashboard widgets",
      action: "settings/interface",
      show: userRole === "student",
    },
    {
      icon: MoveVertical,
      label: isMs ? "Susunan Navbar" : "Navbar Settings",
      subtitle: isMs
        ? "Susun semula menu bawah"
        : "Rearrange bottom navigation",
      action: "settings/navbar",
      show: userRole === "student",
    },
    {
      icon: Settings,
      label: isMs ? "Tetapan" : "Settings",
      subtitle:
        userRole === "staff"
          ? isMs
            ? "Pilihan aplikasi"
            : "App preferences"
          : isMs
            ? "Tema & Bahasa"
            : "Theme & Language",
      action: "settings",
      show: true,
    },

    {
      icon: MessageSquareWarning,
      label:
        userRole === "staff"
          ? isMs
            ? "Pengurusan Aduan Fasiliti"
            : "Facility Complaint Management"
          : isMs
            ? "Aduan Fasiliti"
            : "Facility Complaint",
      subtitle:
        userRole === "staff"
          ? isMs
            ? "Semak dan selesaikan isu fasiliti"
            : "Review and resolve reported facility issues"
          : isMs
            ? "Laporkan isu fasiliti & semak status"
            : "Report facility issues & track status",
      action: "facility-complaint-entry",
      show: true,
      badge: userRole === "staff" ? complaintBadge : 0,
    },
  ].filter((item) => item.show);

  const handleMenuClick = (action: string) => {
    if (action === "settings") {
      setShowSettings(true);
      return;
    }

    // ✅ Role-based route
    if (action === "facility-complaint-entry") {
      onNavigate(
        userRole === "staff" ? "staff-complaints" : "facility-complaints"
      );
      return;
    }

    if (action) onNavigate(action);
  };

  const handleResetColor = () => {
    setIsCustomColorMode(false);
    const defaultColor = preferences.theme_mode === 1 ? "#9e1c3a" : "#7A0019";
    setSelectedColor(defaultColor);
    updateTheme(preferences.theme_mode, defaultColor);
  };

  const handleSaveColor = () => {
    updateTheme(preferences.theme_mode, selectedColor);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Call the Enhanced RPC (Server-side cleanup handled in SQL)
      const { error: rpcError } = await supabase.rpc("delete_user_account");

      if (rpcError) {
        console.error("RPC Error:", rpcError);
        throw new Error(
          isMs
            ? `Sila jalankan skrip SQL di Supabase: ${rpcError.message}`
            : `Please run the updated SQL script in Supabase. Error: ${rpcError.message}`
        );
      }

      await onLogout();
    } catch (error: any) {
      console.error("Delete failed", error);
      toast.error(
        isMs
          ? `Gagal memadam akaun: ${error.message}`
          : `Failed to delete account: ${error.message}`
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // SETTINGS VIEW (unchanged)
  if (showSettings) {
    return (
      <div
        className="h-full w-full transition-colors duration-300 relative z-50 overflow-y-auto"
        style={{ backgroundColor: theme.background, color: theme.text }}
      >
        <div
          className="sticky top-0 border-b px-6 py-4 flex items-center gap-3"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        >
          <button onClick={() => setShowSettings(false)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="font-semibold text-lg">
            {isMs ? "Tetapan" : "Settings"}
          </h2>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <h3
              className="text-sm font-semibold uppercase mb-4 tracking-wider"
              style={{ color: theme.textSecondary }}
            >
              {isMs ? "Mod Paparan" : "Display Mode"}
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => updateTheme(0)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border transition-colors"
                style={{
                  borderColor:
                    preferences.theme_mode === 0 ? theme.primary : theme.border,
                  backgroundColor:
                    preferences.theme_mode === 0
                      ? theme.primary + "10"
                      : "transparent",
                }}
              >
                <Sun
                  className="w-6 h-6 mb-2"
                  style={{
                    color:
                      preferences.theme_mode === 0
                        ? theme.primary
                        : theme.textSecondary,
                  }}
                />
                <span className="text-sm">Light</span>
              </button>

              <button
                onClick={() => updateTheme(1)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border transition-colors"
                style={{
                  borderColor:
                    preferences.theme_mode === 1 ? theme.primary : theme.border,
                  backgroundColor:
                    preferences.theme_mode === 1
                      ? theme.primary + "10"
                      : "transparent",
                }}
              >
                <Moon
                  className="w-6 h-6 mb-2"
                  style={{
                    color:
                      preferences.theme_mode === 1
                        ? theme.primary
                        : theme.textSecondary,
                  }}
                />
                <span className="text-sm">Dark</span>
              </button>
            </div>
          </section>

          <section>
            <h3
              className="text-sm font-semibold uppercase mb-4 tracking-wider"
              style={{ color: theme.textSecondary }}
            >
              {isMs ? "Warna Tema" : "Accent Color"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleResetColor}
                  className="p-3 rounded-lg border text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: !isCustomColorMode
                      ? theme.primary
                      : "transparent",
                    color: !isCustomColorMode ? "white" : theme.textSecondary,
                    borderColor: !isCustomColorMode
                      ? "transparent"
                      : theme.border,
                  }}
                >
                  Default
                </button>
                <button
                  onClick={() => setIsCustomColorMode(true)}
                  className="p-3 rounded-lg border text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isCustomColorMode
                      ? theme.primary
                      : "transparent",
                    color: isCustomColorMode ? "white" : theme.textSecondary,
                    borderColor: isCustomColorMode
                      ? "transparent"
                      : theme.border,
                  }}
                >
                  Custom
                </button>
              </div>

              {isCustomColorMode && (
                <div
                  className="border rounded-xl p-4"
                  style={{
                    borderColor: theme.primary,
                    backgroundColor: theme.cardBg,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="font-medium"
                      style={{ color: theme.primary }}
                    >
                      Pick Color
                    </span>
                    <div
                      className="w-8 h-8 rounded-full border shadow-sm"
                      style={{
                        backgroundColor: selectedColor,
                        borderColor: theme.border,
                      }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="relative flex-1 h-10">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                      />
                      <div
                        className="absolute inset-0 border rounded-lg flex items-center justify-center text-sm"
                        style={{
                          borderColor: theme.border,
                          color: theme.textSecondary,
                          backgroundColor: theme.background,
                        }}
                      >
                        Tap to Select
                      </div>
                    </div>

                    <button
                      onClick={handleSaveColor}
                      className="flex items-center gap-2 px-4 h-10 text-white rounded-lg text-sm font-medium active:opacity-90"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3
              className="text-sm font-semibold uppercase mb-4 tracking-wider"
              style={{ color: theme.textSecondary }}
            >
              {isMs ? "Bahasa" : "Language"}
            </h3>
            <div
              className="border rounded-xl overflow-hidden"
              style={{ borderColor: theme.border }}
            >
              <button
                onClick={() => updateLanguage("en")}
                className="w-full p-4 flex items-center justify-between border-b active:opacity-70 transition-colors"
                style={{ borderColor: theme.border }}
              >
                <span>English</span>
                {preferences.language_code === "en" && (
                  <Check className="w-5 h-5" style={{ color: theme.primary }} />
                )}
              </button>
              <button
                onClick={() => updateLanguage("ms")}
                className="w-full p-4 flex items-center justify-between active:opacity-70 transition-colors"
              >
                <span>Bahasa Melayu</span>
                {preferences.language_code === "ms" && (
                  <Check className="w-5 h-5" style={{ color: theme.primary }} />
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // MAIN VIEW
  return (
    <div
      className="h-full w-full transition-colors duration-300"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div
        className="fixed top-0 left-0 right-0 z-40 px-6 py-6 border-b"
        style={{ backgroundColor: theme.background, borderColor: theme.border }}
      >
        <h2 className="font-semibold text-xl">{isMs ? "Profil" : "Profile"}</h2>
      </div>

      <div className="h-22" />

      <div className="px-6 py-2 space-y-6 pb-28">
        <div
          className="border p-6 text-center rounded-2xl shadow-sm"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border overflow-hidden"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.background,
              }}
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10" style={{ color: theme.primary }} />
              )}
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-1">{studentName}</h2>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {userRole === "staff"
              ? "Staff Member"
              : `Student ID: ${studentId || "—"}`}
          </p>
        </div>

        <div
          className="border rounded-2xl overflow-hidden shadow-sm"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item.action)}
              className="w-full px-4 py-4 flex items-center justify-between border-b last:border-b-0 active:opacity-70 transition-colors"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className="w-5 h-5"
                  style={{ color: theme.primary }}
                />
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-[15px]">{item.label}</div>
                    {/* Badge Rendering */}
                    {(item as any).badge > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {(item as any).badge}
                      </span>
                    )}
                  </div>

                  <div
                    className="text-xs mt-0.5"
                    style={{ color: theme.textSecondary }}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
              <ChevronRight
                className="w-5 h-5"
                style={{ color: theme.textSecondary }}
              />
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="w-full h-12 border rounded-lg font-medium shadow-sm transition-all active:scale-95"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            {isMs ? "Log Keluar" : "Sign Out"}
          </button>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full h-12 flex items-center justify-center gap-2 font-medium transition-all active:scale-95"
            style={{ color: "#ef4444" }}
          >
            <Trash2 className="w-4 h-4" />
            {isMs ? "Padam Akaun" : "Delete Account"}
          </button>
        </div>
      </div>

      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50 animate-in fade-in">
          <div
            className="p-6 w-full max-w-sm border rounded-2xl"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <h3 className="mb-2 font-semibold text-lg">
              {isMs ? "Log Keluar?" : "Log Out?"}
            </h3>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>
              {isMs
                ? "Adakah anda pasti mahu log keluar?"
                : "Are you sure you want to log out?"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 h-11 border rounded-xl transition-colors font-medium"
                style={{
                  borderColor: theme.border,
                  color: theme.textSecondary,
                }}
              >
                {isMs ? "Batal" : "Cancel"}
              </button>
              <button
                onClick={onLogout}
                className="flex-1 h-11 text-white rounded-xl active:opacity-90 font-bold"
                style={{ backgroundColor: theme.primary }}
              >
                {isMs ? "Log Keluar" : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50 animate-in fade-in">
          <div
            className="p-6 w-full max-w-sm border rounded-2xl shadow-xl"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex items-center gap-3 mb-4 text-[#ef4444]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg">
                {isMs ? "Padam Akaun?" : "Delete Account?"}
              </h3>
            </div>

            <p
              className="text-sm mb-6"
              style={{ color: theme.textSecondary, lineHeight: "1.6" }}
            >
              {isMs
                ? "Tindakan ini akan memadamkan profil anda secara kekal. Data ini tidak boleh dikembalikan."
                : "This action will permanently delete your profile. This cannot be undone."}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="flex-1 h-11 border rounded-xl transition-colors font-medium"
                style={{
                  borderColor: theme.border,
                  color: theme.textSecondary,
                }}
              >
                {isMs ? "Batal" : "Cancel"}
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 h-11 text-white rounded-xl active:opacity-90 font-bold flex items-center justify-center gap-2"
                style={{ backgroundColor: "#ef4444" }}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isMs ? (
                  "Padam"
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
