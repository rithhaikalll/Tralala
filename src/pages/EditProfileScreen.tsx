import { ArrowLeft, User, Camera, Check, AlertCircle, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; 
import { useUserPreferences } from "../lib/UserPreferencesContext"; 
import { toast } from "sonner"; 

interface EditProfileScreenProps {
  onNavigate: (screen: string) => void;
  userId: string;
  userRole: "student" | "staff" | "admin";
  onSaveProfile: (name: string) => void;
  studentId: string;
}

export function EditProfileScreen({ 
  onNavigate, 
  userId, 
  userRole, 
  onSaveProfile,
  studentId 
}: EditProfileScreenProps) {
  const { theme, t } = useUserPreferences(); 
  
  const [fullName, setFullName] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // To store the actual file
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial data with fallback logic
  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. Try to get edited data from profile_details
      const { data: details } = await supabase
        .from("profile_details")
        .select("full_name, profile_picture_url")
        .eq("user_id", userId)
        .maybeSingle();

      if (details && details.full_name) {
        setFullName(details.full_name);
        setProfilePicture(details.profile_picture_url || null);
      } else {
        // 2. Fallback: Get original name from core tables if no edit exists
        let tableName = "profiles";
        let matchCol = "id"; // Default for students

        if (userRole === 'staff') {
            tableName = "staff_profiles";
            matchCol = "user_id";
        }

        const { data: core } = await supabase
          .from(tableName)
          .select("full_name")
          .eq(matchCol, userId)
          .maybeSingle();
          
        if (core) {
          setFullName(core.full_name || "");
        }
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, [userId, userRole]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImageError("Invalid image format. Please use JPG, PNG, or WebP.");
      toast.error("Invalid image format");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image is too large. Max 5MB.");
      toast.error("Image too large");
      return;
    }

    // Store file for uploading later
    setImageFile(file);

    // Create local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicture(event.target?.result as string);
      setImageError(null);
    };
    reader.readAsDataURL(file);
  };

  // Helper to upload image to Supabase Storage
  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setIsSaving(true);
    try {
      let finalAvatarUrl = profilePicture;

      // 1. Upload new image if exists
      if (imageFile) {
        finalAvatarUrl = await uploadImage(imageFile);
      }

      // --- CRITICAL CHANGE: Check results individually ---

      // A. Update 'profile_details' (The custom display layer)
      // We check specifically for an error here. If this fails, we STOP.
      const { error: detailsError } = await supabase
        .from("profile_details")
        .upsert({ 
          user_id: userId,
          full_name: fullName,
          profile_picture_url: finalAvatarUrl, 
        }, { onConflict: 'user_id' });

      if (detailsError) {
        console.error("Profile Details Error:", detailsError);
        // Throwing error here prevents the success message from showing
        throw new Error("Could not save to database. Check RLS policies.");
      }

      // B. Update 'auth.users' (Metadata)
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (authError) console.error("Auth Update Error:", authError);

      // C. Update 'profiles' or 'staff_profiles' (Core Data)
      let table = "profiles";
      let matchCol = "id"; 

      if (userRole === "staff") {
        table = "staff_profiles";
        matchCol = "user_id";
      }

      const { error: coreError } = await supabase
        .from(table)
        .update({ full_name: fullName })
        .eq(matchCol, userId);
      
      if (coreError) console.error("Core Profile Error:", coreError);

      // If we reach this point, the primary update succeeded
      onSaveProfile(fullName);
      toast.success("Profile updated successfully!");
      onNavigate("profile");

    } catch (err: any) {
      console.error("Save Error:", err);
      // Show the actual error message to the user
      toast.error(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <Loader2 className="animate-spin" style={{ color: theme.primary }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b lg:hidden" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <div className="px-6 py-4 flex items-center gap-4">
          <button onClick={() => onNavigate("profile")} className="p-1 -ml-1" style={{ color: theme.primary }}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 style={{ color: theme.text, fontWeight: "600", fontSize: "20px" }}>Edit Profile</h2>
        </div>
      </div>

      <div className="container-form lg:pt-8">
        <div className="px-6 py-6 space-y-6">
          {/* Profile Picture */}
          <div className="border p-6 shadow-sm" style={{ borderColor: theme.border, backgroundColor: theme.cardBg, borderRadius: "14px" }}>
            <h3 style={{ color: theme.text, fontWeight: "600", fontSize: "15px", marginBottom: "16px" }}>Profile Picture</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center border overflow-hidden" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12" style={{ color: theme.primary }} />
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="h-10 px-4 flex items-center gap-2 border rounded-lg"
                style={{ borderColor: theme.primary, color: theme.primary, fontWeight: "500", fontSize: "14px" }}
              >
                <Camera className="w-4 h-4" />
                Change Photo
              </button>
              {imageError && (
                <div className="w-full flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: "#FEE2E2" }}>
                  <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: "#DC2626" }} />
                  <p className="text-sm" style={{ color: "#DC2626" }}>{imageError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Info */}
          <div className="border p-6 shadow-sm" style={{ borderColor: theme.border, backgroundColor: theme.cardBg, borderRadius: "14px" }}>
            <h3 style={{ color: theme.text, fontWeight: "600", fontSize: "15px", marginBottom: "16px" }}>Personal Information</h3>
            <div className="space-y-2">
              <label className="text-sm" style={{ color: theme.textSecondary, fontWeight: "500" }}>Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="w-full h-12 px-4 border rounded-lg"
                style={{ borderColor: theme.border, backgroundColor: theme.background, color: theme.text, fontSize: "15px" }} 
              />
            </div>
            <div className="space-y-2 mt-4">
              <label className="text-sm" style={{ color: theme.textSecondary, fontWeight: "500" }}>
                {userRole === "staff" ? "Staff ID" : "Student ID"}
              </label>
              <div className="w-full h-12 px-4 border rounded-lg flex items-center opacity-50" style={{ borderColor: theme.border, backgroundColor: theme.background, color: theme.textSecondary }}>
                 <span>{studentId || "(No ID Found)"}</span> 
              </div>
              <p className="text-xs" style={{ color: theme.textSecondary }}>ID cannot be changed.</p>
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full h-12 rounded-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.primary, color: "#FFF", fontWeight: "500", fontSize: "16px" }}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Check className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}