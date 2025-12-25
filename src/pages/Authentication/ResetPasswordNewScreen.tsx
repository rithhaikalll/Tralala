import { useState } from "react";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabaseClient";
// Import context untuk tema
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface ResetPasswordNewScreenProps {
  onNavigate: (screen: string) => void;
}

export function ResetPasswordNewScreen({
  onNavigate,
}: ResetPasswordNewScreenProps) {
  // Ambil data tema daripada context
  const { theme } = useUserPreferences();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleUpdatePassword = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.newPassword || !formData.confirmPassword) {
      setErrorMsg("Please fill in both password fields.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: formData.newPassword,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Failed to update password.");
      return;
    }

    setSuccessMsg("Password updated successfully. You can now log in.");
    // Memberi sedikit masa untuk pengguna melihat mesej berjaya sebelum navigasi
    setTimeout(() => onNavigate("login"), 2000);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6 transition-colors duration-300"
      style={{ backgroundColor: theme.background }} // Latar belakang dinamik
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="mb-2"
            style={{ color: theme.primary, fontWeight: "600", fontSize: "24px" }} // Warna tajuk dinamik
          >
            Create New Password
          </h1>
          <p
            className="text-sm"
            style={{ color: theme.textSecondary, lineHeight: "1.6" }} // Warna teks sekunder dinamik
          >
            Enter your new password below.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* New Password */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: theme.textSecondary, fontWeight: "500" }}
            >
              New Password
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="w-full h-12 px-4 border transition-colors"
              style={{
                borderColor: theme.border,
                borderRadius: "12px",
                fontSize: "15px",
                backgroundColor: theme.cardBg, // Latar belakang input dinamik
                color: theme.text, // Warna teks input dinamik
              }}
              placeholder="Enter new password"
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: theme.textSecondary, fontWeight: "500" }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full h-12 px-4 border transition-colors"
              style={{
                borderColor: theme.border,
                borderRadius: "12px",
                fontSize: "15px",
                backgroundColor: theme.cardBg, // Latar belakang input dinamik
                color: theme.text, // Warna teks input dinamik
              }}
              placeholder="Re-enter new password"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-500 mt-1 font-medium">{errorMsg}</p>}
          {successMsg && (
            <p className="text-sm text-green-600 mt-1 font-medium">{successMsg}</p>
          )}

          {/* Update Password Button */}
          <Button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full h-12 mt-8 flex items-center justify-center disabled:opacity-60 transition-all active:scale-95 shadow-md"
            style={{
              backgroundColor: theme.primary, // Warna butang dinamik
              color: "#FFFFFF",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>

          {/* Back to Login Link */}
          <div className="text-center pt-4">
            <button
              onClick={() => onNavigate("login")}
              className="text-sm underline font-medium transition-opacity active:opacity-60"
              style={{ color: theme.textSecondary }} // Warna teks pautan dinamik
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}