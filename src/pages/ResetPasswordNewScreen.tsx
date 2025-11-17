import { useState } from "react";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabaseClient";

interface ResetPasswordNewScreenProps {
  onNavigate: (screen: string) => void;
}

export function ResetPasswordNewScreen({
  onNavigate,
}: ResetPasswordNewScreenProps) {
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
    onNavigate("login");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="mb-2"
            style={{ color: "#7A0019", fontWeight: "600", fontSize: "24px" }}
          >
            Create New Password
          </h1>
          <p
            className="text-sm"
            style={{ color: "#6A6A6A", lineHeight: "1.6" }}
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
              style={{ color: "#6A6A6A", fontWeight: "500" }}
            >
              New Password
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="w-full h-12 px-4 border bg-white"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "8px",
                fontSize: "15px",
                color: "#1A1A1A",
              }}
              placeholder="Enter new password"
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "#6A6A6A", fontWeight: "500" }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full h-12 px-4 border bg-white"
              style={{
                borderColor: "#E5E5E5",
                borderRadius: "8px",
                fontSize: "15px",
                color: "#1A1A1A",
              }}
              placeholder="Re-enter new password"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-500 mt-1">{errorMsg}</p>}
          {successMsg && (
            <p className="text-sm text-green-600 mt-1">{successMsg}</p>
          )}

          {/* Update Password Button */}
          <Button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full h-12 mt-8 flex items-center justify-center disabled:opacity-60"
            style={{
              backgroundColor: "#7A0019",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>

          {/* Back to Login Link */}
          <div className="text-center pt-4">
            <button
              onClick={() => onNavigate("login")}
              className="text-sm underline"
              style={{ color: "#6A6A6A" }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
