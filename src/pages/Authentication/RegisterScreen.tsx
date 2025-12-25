import { useState } from "react";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabaseClient";
// Import context untuk tema
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface RegisterScreenProps {
  onNavigate: (screen: string) => void;
}

export function RegisterScreen({ onNavigate }: RegisterScreenProps) {
  // Ambil data tema daripada context
  const { theme } = useUserPreferences();

  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const { fullName, studentId, email, password, confirmPassword } = formData;

    if (!fullName || !studentId || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    // 1) Sign Up + attach metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          matric_id: studentId,
          role: "student",
        },
      },
    });

    if (error || !data.user) {
      setLoading(false);
      setErrorMsg(error?.message || "Registration failed.");
      return;
    }

    const user = data.user;

    // 2) Create profile row
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      matric_id: studentId,
      role: "student",
    });

    if (profileError) {
      setLoading(false);
      setErrorMsg(profileError.message || "Failed to save profile.");
      return;
    }

    setLoading(false);
    setSuccessMsg("Account created successfully!");

    onNavigate("login");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6 transition-colors duration-300"
      style={{ backgroundColor: theme.background }}
    >
      <div className="w-full max-w-md py-10">
        <div className="mb-8 text-center">
          <h1
            className="mb-2"
            style={{ color: theme.primary, fontWeight: "600", fontSize: "24px" }}
          >
            Create Your Account
          </h1>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            Register to access UTM facility bookings.
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          {/* FULL NAME */}
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: theme.text }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full h-12 px-4 border transition-colors"
              style={{ 
                borderColor: theme.border, 
                borderRadius: "12px", 
                backgroundColor: theme.cardBg,
                color: theme.text
              }}
              placeholder="Enter your full name"
            />
          </div>

          {/* STUDENT ID */}
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: theme.text }}>
              Student ID
            </label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) =>
                setFormData({ ...formData, studentId: e.target.value })
              }
              className="w-full h-12 px-4 border transition-colors"
              style={{ 
                borderColor: theme.border, 
                borderRadius: "12px", 
                backgroundColor: theme.cardBg,
                color: theme.text
              }}
              placeholder="Enter your student ID"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: theme.text }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full h-12 px-4 border transition-colors"
              style={{ 
                borderColor: theme.border, 
                borderRadius: "12px", 
                backgroundColor: theme.cardBg,
                color: theme.text
              }}
              placeholder="you@graduate.utm.my"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: theme.text }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full h-12 px-4 border transition-colors"
              style={{ 
                borderColor: theme.border, 
                borderRadius: "12px", 
                backgroundColor: theme.cardBg,
                color: theme.text
              }}
              placeholder="Create a password"
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: theme.text }}>
              Confirm Password
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
                backgroundColor: theme.cardBg,
                color: theme.text
              }}
              placeholder="Re-enter password"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-500 font-medium">{errorMsg}</p>}
          {successMsg && <p className="text-sm text-green-600 font-medium">{successMsg}</p>}

          <Button
            onClick={handleRegister}
            disabled={loading}
            className="w-full h-12 mt-4 transition-all active:scale-95 shadow-sm"
            style={{
              backgroundColor: theme.primary,
              color: "white",
              borderRadius: "12px",
              fontWeight: "600"
            }}
          >
            {loading ? "Creating account..." : "Register"}
          </Button>

          <div className="text-center pt-4">
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              Already have an account?
              <button
                onClick={() => onNavigate("login")}
                className="underline ml-1 font-semibold"
                style={{ color: theme.primary }}
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}