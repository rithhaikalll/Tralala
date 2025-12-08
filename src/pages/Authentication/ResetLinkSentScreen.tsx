import { Mail } from "lucide-react";
import { Button } from "../../components/ui/button";

interface ResetLinkSentScreenProps {
  onNavigate: (screen: string) => void;
}

export function ResetLinkSentScreen({ onNavigate }: ResetLinkSentScreenProps) {
  const handleResend = () => {
    // Optional: you can pass the email here as a prop and call
    // supabase.auth.resetPasswordForEmail(email) again.
    console.log("Resend reset link clicked");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          {/* Mail Icon */}
          <div className="flex justify-center mb-6">
            <Mail
              className="w-16 h-16"
              strokeWidth={1.5}
              style={{ color: "#7A0019" }}
            />
          </div>

          {/* Title */}
          <h1
            className="mb-3"
            style={{
              color: "#7A0019",
              fontWeight: "600",
              fontSize: "24px",
              letterSpacing: "-0.02em",
            }}
          >
            Check Your Email
          </h1>

          {/* Subtitle */}
          <p
            className="mb-8 mx-auto"
            style={{
              color: "#6A6A6A",
              lineHeight: "1.6",
              fontSize: "15px",
              maxWidth: "80%",
            }}
          >
            We've sent a password reset link to your email. Please check your
            inbox or spam folder.
          </p>

          {/* Return to Login Button */}
          <Button
            onClick={() => onNavigate("login")}
            className="w-full h-12 flex items-center justify-center"
            style={{
              backgroundColor: "#7A0019",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "16px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            Return to Login
          </Button>

          {/* Resend Link */}
          <div className="text-center pt-6">
            <p className="text-sm" style={{ color: "#6A6A6A" }}>
              Didn't receive the email?{" "}
              <button
                onClick={handleResend}
                className="underline"
                style={{ color: "#7A0019", fontWeight: "500" }}
              >
                Resend Link
              </button>
            </p>
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
