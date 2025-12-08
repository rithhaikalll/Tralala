import { useState } from "react";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabaseClient";

interface RegisterScreenProps {
  onNavigate: (screen: string) => void;
}

export function RegisterScreen({ onNavigate }: RegisterScreenProps) {
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
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            className="mb-2"
            style={{ color: "#7A0019", fontWeight: "600", fontSize: "24px" }}
          >
            Create Your Account
          </h1>
          <p className="text-sm" style={{ color: "#6A6A6A" }}>
            Register to access UTM facility bookings.
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-6">
          {/* FULL NAME */}
          <div>
            <label className="block mb-2 text-sm" style={{ color: "#6A6A6A" }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full h-12 px-4 border bg-white"
              style={{ borderColor: "#E5E5E5", borderRadius: "8px" }}
              placeholder="Enter your full name"
            />
          </div>

          {/* STUDENT ID */}
          <div>
            <label className="block mb-2 text-sm" style={{ color: "#6A6A6A" }}>
              Student ID
            </label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) =>
                setFormData({ ...formData, studentId: e.target.value })
              }
              className="w-full h-12 px-4 border bg-white"
              style={{ borderColor: "#E5E5E5", borderRadius: "8px" }}
              placeholder="Enter your student ID"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block mb-2 text-sm" style={{ color: "#6A6A6A" }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full h-12 px-4 border bg-white"
              style={{ borderColor: "#E5E5E5", borderRadius: "8px" }}
              placeholder="you@graduate.utm.my"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block mb-2 text-sm" style={{ color: "#6A6A6A" }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full h-12 px-4 border bg-white"
              style={{ borderColor: "#E5E5E5", borderRadius: "8px" }}
              placeholder="Create a password"
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block mb-2 text-sm" style={{ color: "#6A6A6A" }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full h-12 px-4 border bg-white"
              style={{ borderColor: "#E5E5E5", borderRadius: "8px" }}
              placeholder="Re-enter password"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
          {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

          <Button
            onClick={handleRegister}
            disabled={loading}
            className="w-full h-12 mt-8"
            style={{
              backgroundColor: "#7A0019",
              color: "white",
              borderRadius: "8px",
            }}
          >
            {loading ? "Creating account..." : "Register"}
          </Button>

          <div className="text-center pt-4">
            <p className="text-sm" style={{ color: "#6A6A6A" }}>
              Already have an account?
              <button
                onClick={() => onNavigate("login")}
                className="underline ml-1"
                style={{ color: "#7A0019" }}
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
