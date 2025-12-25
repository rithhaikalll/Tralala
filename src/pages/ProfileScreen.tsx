import {
  ArrowLeft,
  User,
  Settings,
  HelpCircle,
  ChevronRight,
  Activity,
  Check,
  Moon,
  Sun,
  Save,
  LayoutDashboard,
  MoveVertical
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUserPreferences } from "../lib/UserPreferencesContext";

interface ProfileScreenProps {
  studentName: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function ProfileScreen({
  studentName,
  onNavigate,
  onLogout,
}: ProfileScreenProps) {
  const { preferences, updateTheme, updateLanguage, theme } = useUserPreferences();
  
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profileName, setProfileName] = useState<string>(studentName);
  const [studentId, setStudentId] = useState<string>("");
  // Tambah state untuk peranan pengguna
  const [userRole, setUserRole] = useState<"student" | "staff">("student");
  
  // Local state for toggles
  const [isCustomColorMode, setIsCustomColorMode] = useState(false);
  
  // Local state for the color picker
  const [selectedColor, setSelectedColor] = useState(preferences.theme_color);

  useEffect(() => {
    setSelectedColor(preferences.theme_color);
    
    const isDefault = 
      preferences.theme_color === '#7A0019' || 
      preferences.theme_color === '#9e1c3a';
    setIsCustomColorMode(!isDefault);

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ambil role daripada metadata
      const role = user.user_metadata?.role || "student";
      setUserRole(role);

      // Tentukan logik pengambilan data profil berdasarkan role
      if (role === 'staff') {
        const { data: staffProfile } = await supabase
          .from("staff_profiles")
          .select("full_name")
          .eq("user_id", user.id) // Berdasarkan image_52e828.png
          .maybeSingle();

        if (staffProfile?.full_name) setProfileName(staffProfile.full_name);
      } else {
        const { data: studentProfile } = await supabase
          .from("profiles")
          .select("full_name, matric_id")
          .eq("id", user.id)
          .maybeSingle();

        if (studentProfile?.full_name) setProfileName(studentProfile.full_name);
        if (studentProfile?.matric_id) setStudentId(studentProfile.matric_id);
      }
    };
    fetchProfile();
  }, [preferences.theme_color]);

  // Bina menuItems secara dinamik berdasarkan peranan pengguna
  const menuItems = [
    {
      icon: Activity,
      label: preferences.language_code === 'ms' ? "Sejarah Aktiviti" : "Activity History",
      subtitle: preferences.language_code === 'ms' ? "Lihat sejarah tempahan anda" : "View your booking history",
      action: "activity-history",
      show: true // Sentiasa tunjuk history
    },
    {
      icon: LayoutDashboard,
      label: preferences.language_code === 'ms' ? "Susunan Dashboard" : "Dashboard Settings",
      subtitle: preferences.language_code === 'ms' ? "Susun semula widget dashboard" : "Rearrange dashboard widgets",
      action: "settings/interface", 
      show: userRole === 'student' // Hanya untuk student
    },
    {
      icon: MoveVertical,
      label: preferences.language_code === 'ms' ? "Susunan Navbar" : "Navbar Settings",
      subtitle: preferences.language_code === 'ms' ? "Susun semula menu bawah" : "Rearrange bottom navigation",
      action: "settings/navbar", 
      show: userRole === 'student' // Hanya untuk student
    },
    {
      icon: Settings,
      label: preferences.language_code === 'ms' ? "Tetapan" : "Settings",
      subtitle: userRole === 'staff' 
        ? (preferences.language_code === 'ms' ? "Pilihan aplikasi" : "App preferences") // Paparan mengikut image_52e00c.png
        : (preferences.language_code === 'ms' ? "Tema & Bahasa" : "Theme & Language"),
      action: "settings",
      show: true
    },
    {
      icon: HelpCircle,
      label: preferences.language_code === 'ms' ? "Bantuan" : "Help & Support",
      subtitle: preferences.language_code === 'ms' ? "Dapatkan bantuan" : "Get assistance",
      action: "",
      show: true
    },
  ].filter(item => item.show); // Tapis item yang tidak perlu ditunjukkan

  const handleMenuClick = (action: string) => {
    if (action === "settings") {
      setShowSettings(true);
    } else if (action) {
      onNavigate(action);
    }
  };

  const handleResetColor = () => {
    setIsCustomColorMode(false);
    const defaultColor = preferences.theme_mode === 1 ? '#9e1c3a' : '#7A0019';
    setSelectedColor(defaultColor);
    updateTheme(preferences.theme_mode, defaultColor);
  };

  const handleSaveColor = () => {
    updateTheme(preferences.theme_mode, selectedColor);
  };

  if (showSettings) {
    return (
      <div className="h-full w-full transition-colors duration-300 relative z-50 overflow-y-auto" style={{ backgroundColor: theme.background, color: theme.text }}>
        <div className="sticky top-0 border-b px-6 py-4 flex items-center gap-3" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
           <button onClick={() => setShowSettings(false)} className="p-1">
             <ArrowLeft className="w-6 h-6" />
           </button>
           <h2 className="font-semibold text-lg">
             {preferences.language_code === 'ms' ? "Tetapan" : "Settings"}
           </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* THEME MODE SECTION */}
          <section>
            <h3 className="text-sm font-semibold uppercase mb-4 tracking-wider" style={{ color: theme.textSecondary }}>
               {preferences.language_code === 'ms' ? "Mod Paparan" : "Display Mode"}
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => updateTheme(0)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border transition-colors"
                style={{ 
                  borderColor: preferences.theme_mode === 0 ? theme.primary : theme.border,
                  backgroundColor: preferences.theme_mode === 0 ? theme.primary + '10' : 'transparent'
                }}
              >
                <Sun className="w-6 h-6 mb-2" style={{ color: preferences.theme_mode === 0 ? theme.primary : theme.textSecondary }} />
                <span className="text-sm">Light</span>
              </button>

              <button 
                onClick={() => updateTheme(1)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border transition-colors"
                style={{ 
                  borderColor: preferences.theme_mode === 1 ? theme.primary : theme.border,
                  backgroundColor: preferences.theme_mode === 1 ? theme.primary + '10' : 'transparent'
                }}
              >
                <Moon className="w-6 h-6 mb-2" style={{ color: preferences.theme_mode === 1 ? theme.primary : theme.textSecondary }} />
                <span className="text-sm">Dark</span>
              </button>
            </div>
          </section>

          {/* ACCENT COLOR SECTION */}
          <section>
            <h3 className="text-sm font-semibold uppercase mb-4 tracking-wider" style={{ color: theme.textSecondary }}>
               {preferences.language_code === 'ms' ? "Warna Tema" : "Accent Color"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                 <button 
                  onClick={handleResetColor}
                  className="p-3 rounded-lg border text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: !isCustomColorMode ? theme.primary : 'transparent',
                    color: !isCustomColorMode ? 'white' : theme.textSecondary,
                    borderColor: !isCustomColorMode ? 'transparent' : theme.border
                  }}
                 >
                  Default
                 </button>
                 <button 
                  onClick={() => setIsCustomColorMode(true)}
                  className="p-3 rounded-lg border text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: isCustomColorMode ? theme.primary : 'transparent',
                    color: isCustomColorMode ? 'white' : theme.textSecondary,
                    borderColor: isCustomColorMode ? 'transparent' : theme.border
                  }}
                 >
                  Custom
                 </button>
              </div>

              {isCustomColorMode && (
                <div className="border rounded-xl p-4" style={{ borderColor: theme.primary, backgroundColor: theme.cardBg }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium" style={{ color: theme.primary }}>Pick Color</span>
                    <div 
                       className="w-8 h-8 rounded-full border shadow-sm" 
                       style={{ backgroundColor: selectedColor, borderColor: theme.border }}
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
                       <div className="absolute inset-0 border rounded-lg flex items-center justify-center text-sm" style={{ borderColor: theme.border, color: theme.textSecondary, backgroundColor: theme.background }}>
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

          {/* LANGUAGE SECTION */}
          <section>
            <h3 className="text-sm font-semibold uppercase mb-4 tracking-wider" style={{ color: theme.textSecondary }}>
               {preferences.language_code === 'ms' ? "Bahasa" : "Language"}
            </h3>
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: theme.border }}>
              <button 
                onClick={() => updateLanguage('en')}
                className="w-full p-4 flex items-center justify-between border-b active:opacity-70 transition-colors"
                style={{ borderColor: theme.border }}
              >
                <span>English</span>
                {preferences.language_code === 'en' && <Check className="w-5 h-5" style={{ color: theme.primary }} />}
              </button>
              <button 
                onClick={() => updateLanguage('ms')}
                className="w-full p-4 flex items-center justify-between active:opacity-70 transition-colors"
              >
                <span>Bahasa Melayu</span>
                {preferences.language_code === 'ms' && <Check className="w-5 h-5" style={{ color: theme.primary }} />}
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full transition-colors duration-300" style={{ backgroundColor: theme.background, color: theme.text }}>
      <div className="fixed top-0 left-0 right-0 z-40 px-6 py-6 border-b" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <h2 className="font-semibold text-xl">Profile</h2>
      </div>

      <div className="h-22" />

      <div className="px-6 py-2 space-y-6 pb-24">
        {/* User Card */}
        <div className="border p-6 text-center rounded-2xl shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center border" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
              <User className="w-10 h-10" style={{ color: theme.primary }} />
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-1">{profileName}</h2>
          {/* Label dinamik (Staff Member vs Student ID) mengikut imej dibekalkan */}
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {userRole === 'staff' ? 'Staff Member' : `Student ID: ${studentId || "—"}`}
          </p>
        </div>

        {/* Menu yang ditapis mengikut role */}
        <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item.action)}
              className="w-full px-4 py-4 flex items-center justify-between border-b last:border-b-0 active:opacity-70 transition-colors"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" style={{ color: theme.primary }} />
                <div className="text-left">
                  <div className="font-medium text-[15px]">{item.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>{item.subtitle}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: theme.textSecondary }} />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="px-0">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="w-full h-12 border rounded-lg font-medium shadow-sm transition-all active:scale-95"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Logout Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div className="p-6 w-full max-w-sm border rounded-2xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <h3 className="mb-2 font-semibold text-lg">Log Out?</h3>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 h-11 border rounded-xl transition-colors"
                style={{ borderColor: theme.border, color: theme.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 h-11 text-white rounded-xl active:opacity-90"
                style={{ backgroundColor: theme.primary }}
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