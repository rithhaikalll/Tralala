import { Home, Globe, Book, Compass, User, ChevronDown, Settings, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUserPreferences } from "../lib/UserPreferencesContext";

interface DesktopTopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  studentName: string;
  profilePictureUrl: string | null;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function DesktopTopNav({
  activeTab,
  onTabChange,
  studentName,
  profilePictureUrl,
  onNavigate,
  onLogout,
}: DesktopTopNavProps) {
  const { theme, preferences, t } = useUserPreferences();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tabData: Record<string, { labelKey: string; icon: any }> = {
    home: { labelKey: "nav_home", icon: Home },
    community: { labelKey: "Community", icon: Globe },
    book: { labelKey: "nav_book", icon: Book },
    activity: { labelKey: "nav_activity", icon: Compass },
    profile: { labelKey: "nav_profile", icon: User },
  };

  const orderedTabs = preferences.nav_order
    .map((key: string) => {
      const normalizedKey = key === "discussion" ? "community" : key;
      return tabData[normalizedKey]
        ? { id: normalizedKey, ...tabData[normalizedKey] }
        : null;
    })
    .filter(Boolean);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav
      className="hidden lg:flex items-center justify-between h-20 px-8 border-b sticky top-0 z-50"
      style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
    >
      {/* Left: Logo + App Name */}
      <button
        onClick={() => onTabChange("home")}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-base"
          style={{ backgroundColor: theme.primary }}
        >
          U+
        </div>
        <span
          className="font-semibold text-xl"
          style={{ color: theme.text }}
        >
          UTMGo+
        </span>
      </button>

      {/* Center: Navigation Items */}
      <div className="flex items-center gap-2">
        {orderedTabs.map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all hover:bg-opacity-10"
            style={{
              color: activeTab === tab.id ? theme.primary : theme.textSecondary,
              backgroundColor: activeTab === tab.id ? theme.primary + "15" : "transparent",
            }}
          >
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-sm font-medium">{t(tab.labelKey)}</span>
          </button>
        ))}
      </div>

      {/* Right: Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-opacity-10 transition-all"
          style={{
            backgroundColor: showDropdown ? theme.primary + "15" : "transparent",
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border overflow-hidden"
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
              <User size={16} style={{ color: theme.primary }} />
            )}
          </div>
          <span className="text-sm font-medium" style={{ color: theme.text }}>
            {studentName}
          </span>
          <ChevronDown
            size={16}
            style={{
              color: theme.textSecondary,
              transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div
            className="absolute right-0 mt-2 w-56 border rounded-xl shadow-lg overflow-hidden"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
            }}
          >
            <button
              onClick={() => {
                setShowDropdown(false);
                onNavigate("edit-profile");
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-5 transition-colors border-b"
              style={{ borderColor: theme.border }}
            >
              <User size={18} style={{ color: theme.primary }} />
              <span className="text-sm" style={{ color: theme.text }}>
                {preferences.language_code === "ms" ? "Edit Profil" : "Edit Profile"}
              </span>
            </button>
            <button
              onClick={() => {
                setShowDropdown(false);
                onNavigate("settings/interface");
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-5 transition-colors border-b"
              style={{ borderColor: theme.border }}
            >
              <Settings size={18} style={{ color: theme.primary }} />
              <span className="text-sm" style={{ color: theme.text }}>
                {preferences.language_code === "ms" ? "Tetapan" : "Settings"}
              </span>
            </button>
            <button
              onClick={() => {
                setShowDropdown(false);
                onLogout();
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-opacity-5 transition-colors"
            >
              <LogOut size={18} style={{ color: "#ef4444" }} />
              <span className="text-sm" style={{ color: "#ef4444" }}>
                {preferences.language_code === "ms" ? "Log Keluar" : "Sign Out"}
              </span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
