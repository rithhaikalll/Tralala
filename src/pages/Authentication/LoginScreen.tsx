import { Eye, EyeOff } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
// Import context untuk tema
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface LoginScreenProps {
  onLogin: (name: string, id: string) => void;
  onNavigate: (path: string) => void;
}

export function LoginScreen({ onLogin, onNavigate }: LoginScreenProps) {
  // Ambil data tema daripada context
  const { theme } = useUserPreferences();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setLoading(true);

    // 1. Sign in with email + password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      setErrorMsg(error?.message || "Login failed.");
      return;
    }

    const user = data.user;

    // 2. Get profile for this user (full_name comes from DB)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, matric_id")
      .eq("id", user.id)
      .maybeSingle();

    setLoading(false);

    // 3. Use full_name from DB, fallback to "Student"
    const displayName = profile?.full_name || "Student";
    const userId = user.id;

    onLogin(displayName, userId);
  };

  return (
    <div className="flex flex-col h-full transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <div className="container-form lg:pt-8">
        {/* Header */}
        <div className="px-6 py-12 text-center">
          <h1
            className="text-3xl mb-3 font-varela"
            style={{
              color: theme.primary, // Menggunakan warna primary tema
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            UTMGo+
          </h1>

          <p className="text-sm" style={{ color: theme.textSecondary, lineHeight: "1.6" }}>
            Sign in to book your sports facilities
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 px-6">
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm"
                style={{ color: theme.text, fontWeight: 500 }}
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@graduate.utm.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                inputMode="email"
                spellCheck={false}
                className="h-12 px-4 border text-[16px]"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.cardBg,
                  color: theme.text,
                  borderRadius: "14px",
                  fontSize: "16px",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm"
                style={{ color: theme.text, fontWeight: 500 }}
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-12 px-4 pr-12 border text-[16px]"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.cardBg,
                    color: theme.text,
                    borderRadius: "14px",
                    fontSize: "16px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: theme.textSecondary }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {errorMsg && <p className="text-sm text-red-500 mt-1">{errorMsg}</p>}

            {/* Sign In Button */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 mt-6 flex items-center justify-center disabled:opacity-60 transition-all active:scale-95"
              style={{
                backgroundColor: theme.primary,
                color: "#FFFFFF",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center pt-2">
              <button
                onClick={() => onNavigate("reset-password-request")}
                className="text-sm transition-opacity active:opacity-60"
                style={{ color: theme.primary, fontWeight: 500 }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                Don't have an account?{" "}
                <button
                  onClick={() => onNavigate("register")}
                  className="underline transition-opacity active:opacity-60"
                  style={{ color: theme.primary, fontWeight: 600 }}
                >
                  Register
                </button>
              </p>
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
    </div>
  );
}