import { 
  Search, User, Edit, Trash2, Shield, 
  AlertCircle, Home, Settings, LogOut, Loader2, Briefcase,
  ChevronRight, HelpCircle, Save, Check, Moon, Sun, ArrowLeft,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";
import { useUserPreferences } from "../lib/UserPreferencesContext";

// --- Types ---
interface UserProfile {
  id: string;        
  user_id?: string;  
  full_name: string;
  role: "student" | "staff"; 
  matric_id?: string;
  profilePicture?: string | null;
}

interface AdminDashboardProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const { theme, preferences, updateTheme, updateLanguage } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';
  
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editName, setEditName] = useState("");

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSettingsSubScreen, setShowSettingsSubScreen] = useState(false);
  const [isCustomColorMode, setIsCustomColorMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(preferences.theme_color);

  useEffect(() => {
    setSelectedColor(preferences.theme_color);
    const isDefault = preferences.theme_color === '#7A0019' || preferences.theme_color === '#9e1c3a';
    setIsCustomColorMode(!isDefault);
  }, [preferences.theme_color]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: students } = await supabase.from("profiles").select("*");
      const { data: staff } = await supabase.from("staff_profiles").select("*");

      let combinedUsers: UserProfile[] = [];
      if (students) combinedUsers = [...combinedUsers, ...students.map((s: any) => ({ ...s, role: "student" }))];
      if (staff) combinedUsers = [...combinedUsers, ...staff.map((s: any) => ({ ...s, role: "staff" }))];

      combinedUsers.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(isMs ? "Gagal memuatkan data" : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [isMs]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // --- ACTIONS ---
  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEditName(user.full_name);
    setShowEditDialog(true);
  };

  // --- FIXED: UPDATE LOGIC ---
  const confirmEdit = async () => {
    if (!selectedUser || !editName.trim() || isProcessing) return;
    
    setIsProcessing(true);
    const targetUserId = selectedUser.id;
    const newName = editName.trim();

    try {
      const tableName = selectedUser.role === "staff" ? "staff_profiles" : "profiles";
      
      // 1. Update the role-specific table (profiles or staff_profiles)
      const { error: mainError } = await supabase
        .from(tableName)
        .update({ full_name: newName })
        .eq("id", targetUserId);

      if (mainError) throw mainError;

      // 2. Update the profile_details table
      const authId = selectedUser.role === 'staff' ? selectedUser.user_id : selectedUser.id;
      if (authId) {
        await supabase
          .from("profile_details")
          .update({ full_name: newName })
          .eq("user_id", authId);
      }

      // 3. CRITICAL: Update local state immediately so the Dashboard reflects the change
      setUsers((prevUsers) => 
        prevUsers.map((u) => 
          u.id === targetUserId ? { ...u, full_name: newName } : u
        )
      );
      
      toast.success(isMs ? "Nama berjaya dikemas kini" : "Name updated successfully");
      setShowEditDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Edit failed:", error);
      toast.error(isMs ? "Gagal mengemas kini nama" : "Failed to update name");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser || isProcessing) return;
    setIsProcessing(true);
    try {
      const targetId = selectedUser.role === 'staff' ? selectedUser.user_id : selectedUser.id;
      if (!targetId) throw new Error("Invalid User ID");

      const { error: rpcError } = await supabase.rpc('admin_delete_user', { target_user_id: targetId });
      if (rpcError) throw rpcError;

      setUsers((prev) => prev.filter(u => u.id !== selectedUser.id));
      toast.success(isMs ? "Akaun telah dipadam sepenuhnya" : "Account deleted permanently");
    } catch (error: any) {
      console.error("Delete failed", error);
      toast.error(isMs ? `Gagal memadam: ${error.message}` : `Failed to delete: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.matric_id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (activeTab === "profile") {
        if (showSettingsSubScreen) {
            return (
              <div className="h-full w-full transition-colors duration-300 relative z-50 overflow-y-auto" style={{ backgroundColor: theme.background }}>
                <div className="sticky top-0 border-b px-6 py-4 flex items-center gap-3" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                   <button onClick={() => setShowSettingsSubScreen(false)} className="p-1"><ArrowLeft className="w-6 h-6" style={{ color: theme.text }} /></button>
                   <h2 className="font-semibold text-lg" style={{ color: theme.text }}>{isMs ? "Tetapan" : "Settings"}</h2>
                </div>
                <div className="p-6 space-y-8">
                  <section>
                    <h3 className="text-sm font-semibold uppercase mb-4 tracking-wider" style={{ color: theme.textSecondary }}>{isMs ? "Mod Paparan" : "Display Mode"}</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button onClick={() => updateTheme(0)} className="flex flex-col items-center justify-center p-4 rounded-xl border" style={{ borderColor: preferences.theme_mode === 0 ? theme.primary : theme.border, backgroundColor: preferences.theme_mode === 0 ? theme.primary + '10' : 'transparent' }}>
                        <Sun className="w-6 h-6 mb-2" style={{ color: preferences.theme_mode === 0 ? theme.primary : theme.textSecondary }} /><span className="text-sm" style={{ color: theme.text }}>Light</span>
                      </button>
                      <button onClick={() => updateTheme(1)} className="flex flex-col items-center justify-center p-4 rounded-xl border" style={{ borderColor: preferences.theme_mode === 1 ? theme.primary : theme.border, backgroundColor: preferences.theme_mode === 1 ? theme.primary + '10' : 'transparent' }}>
                        <Moon className="w-6 h-6 mb-2" style={{ color: preferences.theme_mode === 1 ? theme.primary : theme.textSecondary }} /><span className="text-sm" style={{ color: theme.text }}>Dark</span>
                      </button>
                    </div>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold uppercase mb-4 tracking-wider" style={{ color: theme.textSecondary }}>{isMs ? "Warna Tema" : "Accent Color"}</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => setIsCustomColorMode(false)} className="p-3 rounded-lg border text-sm font-medium" style={{ backgroundColor: !isCustomColorMode ? theme.primary : 'transparent', color: !isCustomColorMode ? 'white' : theme.textSecondary, borderColor: !isCustomColorMode ? 'transparent' : theme.border }}>Default</button>
                         <button onClick={() => setIsCustomColorMode(true)} className="p-3 rounded-lg border text-sm font-medium" style={{ backgroundColor: isCustomColorMode ? theme.primary : 'transparent', color: isCustomColorMode ? 'white' : theme.textSecondary, borderColor: isCustomColorMode ? 'transparent' : theme.border }}>Custom</button>
                      </div>
                      {isCustomColorMode && (
                        <div className="border rounded-xl p-4" style={{ borderColor: theme.primary, backgroundColor: theme.cardBg }}>
                          <div className="flex items-center justify-between mb-4"><span className="font-medium" style={{ color: theme.primary }}>Pick Color</span><div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: selectedColor, borderColor: theme.border }} /></div>
                          <div className="flex gap-3">
                            <div className="relative flex-1 h-10"><input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" /><div className="absolute inset-0 border rounded-lg flex items-center justify-center text-sm" style={{ borderColor: theme.border, color: theme.textSecondary, backgroundColor: theme.background }}>Tap to Select</div></div>
                            <button onClick={() => updateTheme(preferences.theme_mode, selectedColor)} className="flex items-center gap-2 px-4 h-10 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: theme.primary }}><Save className="w-4 h-4" />Save</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            );
          }
          return (
            <div className="px-6 py-6 space-y-6 pb-28">
                <div className="border p-6 text-center rounded-2xl shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <div className="flex justify-center mb-4"><div className="w-20 h-20 rounded-full flex items-center justify-center border overflow-hidden" style={{ borderColor: theme.border, backgroundColor: theme.background }}><Shield className="w-10 h-10" style={{ color: theme.primary }} /></div></div>
                  <h2 className="text-lg font-semibold mb-1" style={{ color: theme.text }}>Admin</h2>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>System Administrator</p>
                </div>
                <button onClick={() => setShowSettingsSubScreen(true)} className="w-full px-4 py-4 flex items-center justify-between border rounded-2xl shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                    <div className="flex items-center gap-3"><Settings className="w-5 h-5" style={{ color: theme.primary }} /><span className="font-medium" style={{ color: theme.text }}>{isMs ? "Tetapan" : "Settings"}</span></div>
                    <ChevronRight className="w-5 h-5" style={{ color: theme.textSecondary }} />
                </button>
                <button onClick={() => setShowLogoutDialog(true)} className="w-full h-12 border rounded-lg font-medium shadow-sm active:scale-95 transition-all" style={{ borderColor: theme.primary, color: theme.primary }}>{isMs ? "Log Keluar" : "Sign Out"}</button>
            </div>
          );
    }

    return (
      <div className="px-6 py-6 space-y-6 pb-24">
        <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
          <Shield className="w-5 h-5 mt-0.5" style={{ color: theme.primary }} strokeWidth={1.5} />
          <p className="text-sm" style={{ color: theme.textSecondary, lineHeight: "1.6" }}>{isMs ? "Menguruskan akaun Pelajar dan Staf." : "Managing Student and Staff accounts."}</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textSecondary }} strokeWidth={1.5} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={isMs ? "Cari pengguna..." : "Search users..."} className="w-full h-12 pl-12 pr-4 border rounded-lg outline-none" style={{ borderColor: theme.border, backgroundColor: theme.cardBg, color: theme.text, fontSize: "15px" }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border p-4 rounded-lg col-span-2" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
            <p className="text-sm mb-1" style={{ color: theme.textSecondary }}>{isMs ? "Jumlah Pengguna" : "Total Users"}</p>
            <p className="text-2xl" style={{ color: theme.text, fontWeight: "600" }}>{users.length}</p>
          </div>
          <div className="border p-4 rounded-lg" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
            <p className="text-sm mb-1" style={{ color: theme.textSecondary }}>{isMs ? "Pelajar" : "Students"}</p>
            <p className="text-2xl" style={{ color: theme.text, fontWeight: "600" }}>{users.filter(u => u.role === "student").length}</p>
          </div>
          <div className="border p-4 rounded-lg" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
            <p className="text-sm mb-1" style={{ color: theme.textSecondary }}>{isMs ? "Staf" : "Staff"}</p>
            <p className="text-2xl" style={{ color: theme.text, fontWeight: "600" }}>{users.filter(u => u.role === "staff").length}</p>
          </div>
        </div>

        <div className="border overflow-hidden rounded-xl shadow-sm" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
            <h3 style={{ color: theme.text, fontWeight: "600", fontSize: "15px" }}>{isMs ? "Senarai Pengguna" : "User List"} ({filteredUsers.length})</h3>
          </div>
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin" style={{ color: theme.primary }} /></div>
          ) : (
            <div>
              {filteredUsers.map((user) => (
                <div key={user.id} className="px-4 py-4 border-b last:border-b-0" style={{ borderColor: theme.border }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.background }}>
                      {user.role === 'staff' ? <Briefcase className="w-5 h-5" style={{ color: "#C2410C" }} /> : <User className="w-5 h-5" style={{ color: theme.primary }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate font-semibold text-sm" style={{ color: theme.text }}>{user.full_name}</h4>
                      <p className="text-xs truncate" style={{ color: theme.textSecondary }}>{user.role === 'staff' ? "Staff" : (user.matric_id || "Student")}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditUser(user)} className="p-2 border rounded-lg" style={{ borderColor: theme.border }}><Edit size={16} style={{ color: theme.text }} /></button>
                      <button onClick={() => handleDeleteUser(user)} className="p-2 bg-red-50 border border-red-100 rounded-lg"><Trash2 size={16} className="text-red-600" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <div className="sticky top-0 z-40 border-b px-6 py-4 flex items-center justify-between" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <h2 style={{ color: theme.text, fontWeight: "600", fontSize: "18px" }}>{activeTab === "home" ? "Admin Dashboard" : (isMs ? "Profil Admin" : "Admin Profile")}</h2>
      </div>
      
      {renderContent()}

      <div className="fixed bottom-0 left-0 right-0 border-t flex justify-around items-center px-2 py-3 z-50" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <button onClick={() => setActiveTab("home")} className="flex flex-col items-center w-full py-1"><Home size={22} style={{ color: activeTab === "home" ? theme.primary : theme.textSecondary }} /><span className="text-[10px] mt-1" style={{ color: activeTab === "home" ? theme.primary : theme.textSecondary }}>{isMs ? "Utama" : "Home"}</span></button>
        <button onClick={() => setActiveTab("profile")} className="flex flex-col items-center w-full py-1"><User size={22} style={{ color: activeTab === "profile" ? theme.primary : theme.textSecondary }} /><span className="text-[10px] mt-1" style={{ color: activeTab === "profile" ? theme.primary : theme.textSecondary }}>{isMs ? "Profil" : "Profile"}</span></button>
      </div>

      {showEditDialog && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="p-6 w-full max-w-sm rounded-2xl border shadow-xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <h3 className="mb-4 font-bold text-lg" style={{ color: theme.text }}>{isMs ? "Edit Pengguna" : "Edit User"}</h3>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={isProcessing} className="w-full h-11 px-4 border rounded-lg mb-4" style={{ borderColor: theme.border, backgroundColor: theme.background, color: theme.text }} />
            <div className="flex gap-3">
              <button onClick={() => setShowEditDialog(false)} disabled={isProcessing} className="flex-1 h-11 border rounded-lg" style={{ color: theme.textSecondary }}>{isMs ? "Batal" : "Cancel"}</button>
              <button onClick={confirmEdit} disabled={isProcessing} className="flex-1 h-11 text-white rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (isMs ? "Simpan" : "Save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50 animate-in fade-in">
          <div className="p-6 w-full max-w-sm border rounded-2xl shadow-xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <div className="flex items-center gap-3 mb-4 text-[#ef4444]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isMs ? "Padam Akaun?" : "Delete Account?"}</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary, lineHeight: '1.6' }}>
              {isMs ? `Tindakan ini akan memadamkan profil ${selectedUser.full_name} secara kekal dari sistem.` : `This action will permanently delete ${selectedUser.full_name}'s profile from the system.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteDialog(false)} disabled={isProcessing} className="flex-1 h-11 border rounded-xl font-medium" style={{ borderColor: theme.border, color: theme.textSecondary }}>{isMs ? "Batal" : "Cancel"}</button>
              <button onClick={confirmDelete} disabled={isProcessing} className="flex-1 h-11 text-white rounded-xl font-bold flex items-center justify-center gap-2" style={{ backgroundColor: "#ef4444" }}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : (isMs ? "Padam" : "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutDialog && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50"><div className="p-6 w-full max-w-sm border rounded-2xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}><h3 className="mb-2 font-semibold text-lg" style={{ color: theme.text }}>{isMs ? "Log Keluar?" : "Log Out?"}</h3><div className="flex gap-3 mt-6"><button onClick={() => setShowLogoutDialog(false)} className="flex-1 h-11 border rounded-lg" style={{ borderColor: theme.border, color: theme.textSecondary }}>{isMs ? "Batal" : "Cancel"}</button><button onClick={onLogout} className="flex-1 h-11 text-white rounded-xl" style={{ backgroundColor: theme.primary }}>Sign Out</button></div></div></div>)}
    </div>
  );
}