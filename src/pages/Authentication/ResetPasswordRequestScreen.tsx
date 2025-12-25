import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { supabase } from "../../lib/supabaseClient";
// Import context untuk tema
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface ResetPasswordRequestScreenProps {
  onNavigate: (screen: string) => void;
}

export function ResetPasswordRequestScreen({
  onNavigate,
}: ResetPasswordRequestScreenProps) {
  // Ambil data tema daripada context
  const { theme } = useUserPreferences();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendResetLink = async () => {
    setErrorMsg("");

    if (!email) {
      setErrorMsg("Please enter your email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Di mana pengguna akan dihantar SELEPAS mengklik pautan e-mel
      redirectTo: `${window.location.origin}/reset-password-new`,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Failed to send reset link.");
      return;
    }

    // Pergi ke skrin "Check your email"
    onNavigate("reset-link-sent");
  };

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: theme.background }} // Latar belakang dinamik
    >
      {/* Header */}
      <div className="px-6 py-12 text-center">
        <h1
          className="text-3xl mb-2"
          style={{
            color: theme.primary, // Warna tajuk mengikut primary tema
            fontWeight: "600",
            letterSpacing: "-0.02em",
          }}
        >
          Reset Password
        </h1>
        <p className="text-sm" style={{ color: theme.textSecondary, lineHeight: "1.6" }}>
          Enter your email and we will send you a reset link.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        <div className="space-y-5">
          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm"
              style={{ color: theme.text, fontWeight: "500" }} // Warna label dinamik
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 px-4 border"
              style={{
                borderColor: theme.border, // Warna sempadan dinamik
                backgroundColor: theme.cardBg, // Latar belakang input dinamik
                color: theme.text, // Warna teks input dinamik
                borderRadius: "14px",
                fontSize: "15px",
              }}
            />
          </div>

          {errorMsg && <p className="text-sm text-red-500 mt-1">{errorMsg}</p>}

          {/* Send Reset Link Button */}
          <Button
            onClick={handleSendResetLink}
            disabled={loading}
            className="w-full h-12 mt-8 flex items-center justify-center disabled:opacity-60 transition-all active:scale-95 shadow-md"
            style={{
              backgroundColor: theme.primary, // Warna butang primary dinamik
              color: "#FFFFFF",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          {/* Back to Login Link */}
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate("login")}
              className="text-sm font-semibold transition-opacity active:opacity-60"
              style={{ color: theme.primary }} // Warna pautan dinamik
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center mt-auto">
        <p className="text-xs" style={{ color: theme.textSecondary, lineHeight: "1.6" }}>
          UTMGo+ Sport Facility Booking System
        </p>
        <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}