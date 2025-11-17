import {
  User,
  Settings,
  HelpCircle,
  ChevronRight,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface ProfileScreenProps {
  studentName: string; // fallback only
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function ProfileScreen({
  studentName,
  onNavigate,
  onLogout,
}: ProfileScreenProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [profileName, setProfileName] = useState<string>(studentName);
  const [studentId, setStudentId] = useState<string>("");

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, matric_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) setProfileName(profile.full_name);
      if (profile?.matric_id) setStudentId(profile.matric_id);
    };

    fetchProfile();
  }, []);

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const menuItems = [
    {
      icon: Activity,
      label: "Activity History",
      subtitle: "View your booking history",
      action: "activity-history",
    },
    {
      icon: Settings,
      label: "Settings",
      subtitle: "App preferences",
      action: "",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      subtitle: "Get assistance",
      action: "",
    },
  ];

  return (
    <div className="h-full w-full bg-white">
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-white px-6 py-6 border-b"
        style={{ borderColor: "#E5E5E5" }}
      >
        <h2 style={{ color: "#1A1A1A", fontWeight: 600, fontSize: 20 }}>
          Profile
        </h2>
      </div>

      <div className="h-22" />

      <div
        className="px-6 py-2 space-y-6"
        style={{
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px) + 60px)",
        }}
      >
        {/* User Card */}
        <div
          className="border bg-white p-6 text-center"
          style={{
            borderColor: "#E5E5E5",
            borderRadius: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border"
              style={{ borderColor: "#E5E5E5", backgroundColor: "#F5F5F5" }}
            >
              <User className="w-10 h-10" style={{ color: "#7A0019" }} />
            </div>
          </div>

          <h2
            style={{
              color: "#1A1A1A",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 4,
            }}
          >
            {profileName}
          </h2>

          <p className="text-sm" style={{ color: "#555", lineHeight: 1.6 }}>
            Student ID: {studentId || "—"}
          </p>
        </div>

        {/* Menu */}
        <div
          className="border bg-white overflow-hidden"
          style={{
            borderColor: "#E5E5E5",
            borderRadius: 14,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.action && onNavigate(item.action)}
              className="w-full px-4 py-4 flex items-center justify-between border-b last:border-b-0"
              style={{ borderColor: "#E5E5E5" }}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" style={{ color: "#7A0019" }} />
                <div className="text-left">
                  <div
                    style={{
                      color: "#1A1A1A",
                      fontWeight: 500,
                      fontSize: 15,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "#555", lineHeight: 1.4 }}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: "#888" }} />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="px-6 py-2">
          <button
            onClick={onLogout}
            className="w-full h-12 border flex items-center justify-center"
            style={{
              borderColor: "#7A0019",
              borderRadius: 8,
              color: "#7A0019",
              fontWeight: 500,
              fontSize: 16,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Confirmation dialog (unchanged) */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div
            className="bg-white p-6 w-full max-w-sm border"
            style={{ borderRadius: 14, borderColor: "#E5E5E5" }}
          >
            <h3
              className="mb-2"
              style={{ color: "#1A1A1A", fontWeight: 600, fontSize: 18 }}
            >
              Log Out?
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "#555", lineHeight: 1.6 }}
            >
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 h-11 border"
                style={{
                  borderColor: "#E5E5E5",
                  borderRadius: 14,
                  color: "#555",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 h-11"
                style={{
                  backgroundColor: "#d4183d",
                  color: "#fff",
                  borderRadius: 14,
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
