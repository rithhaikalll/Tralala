import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { supabase } from "../lib/supabaseClient";

interface ResetPasswordRequestScreenProps {
  onNavigate: (screen: string) => void;
}

export function ResetPasswordRequestScreen({
  onNavigate,
}: ResetPasswordRequestScreenProps) {
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
      // Where the user will be sent AFTER clicking the email link
      redirectTo: `${window.location.origin}/reset-password-new`,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Failed to send reset link.");
      return;
    }

    // Go to "Check your email" screen
    onNavigate("reset-link-sent");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-12 text-center">
        <h1
          className="text-3xl mb-2"
          style={{
            color: "#7A0019",
            fontWeight: "600",
            letterSpacing: "-0.02em",
          }}
        >
          Reset Password
        </h1>
        <p className="text-sm" style={{ color: "#6A6A6A", lineHeight: "1.6" }}>
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
              style={{ color: "#1A1A1A", fontWeight: "500" }}
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
                borderColor: "#E5E5E5",
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
            className="w-full h-12 mt-8 flex items-center justify-center disabled:opacity-60"
            style={{
              backgroundColor: "#7A0019",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "16px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          {/* Back to Login Link */}
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate("login")}
              className="text-sm"
              style={{ color: "#7A0019", fontWeight: "500" }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center">
        <p className="text-xs" style={{ color: "#888888", lineHeight: "1.6" }}>
          UTMGo+ Sport Facility Booking System
        </p>
        <p className="text-xs mt-1" style={{ color: "#888888" }}>
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}
