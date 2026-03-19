import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";
import { maskEmail } from "@/lib/masking";
import { supabase } from "@/integrations/supabase/client";

type Step = "email" | "otp" | "reset";

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ForgotPassword = ({ onBack, onSuccess }: ForgotPasswordProps) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(password),
    passwordsMatch: password === confirmPassword && password.length > 0,
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("password-reset", {
        body: { action: "send", email: email.trim() },
      });
      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      setMessage(data?.message || "A verification code has been sent to your email.");
      setStep("otp");
      setCooldown(60);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("password-reset", {
        body: { action: "verify", email: email.trim(), otp: code },
      });
      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        return;
      }
      if (data?.verified) {
        setOtpVerified(true);
        setVerifiedOtp(code);
        setStep("reset");
      }
    } catch {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const isValid =
      passwordValidation.minLength &&
      passwordValidation.hasUppercase &&
      passwordValidation.hasNumber &&
      passwordValidation.hasSpecialChar &&
      passwordValidation.passwordsMatch;

    if (!isValid) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("password-reset", {
        body: { action: "reset", email: email.trim(), otp: verifiedOtp, password },
      });
      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        return;
      }
      onSuccess();
    } catch {
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = [
    passwordValidation.minLength,
    passwordValidation.hasUppercase,
    passwordValidation.hasNumber,
    passwordValidation.hasSpecialChar,
  ].filter(Boolean).length;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strengthScore];
  const strengthColor = ["", "bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-green-500"][strengthScore];

  return (
    <div className="w-full max-w-md mx-auto px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-wider">VEIL</h1>
        <p className="text-muted-foreground mt-2">
          {step === "email" && "Forgot Password"}
          {step === "otp" && "Enter Verification Code"}
          {step === "reset" && "Set New Password"}
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-primary/20 p-8">
        {/* ─── STEP 1: Email ─── */}
        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Enter your registered email address and we'll send you a verification code.
            </p>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="pl-12 h-12 bg-background border-primary/20 focus:border-primary"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              isLoading={loading}
              loadingText="Sending..."
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium"
            >
              Send Code
            </Button>
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mx-auto mt-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </button>
          </form>
        )}

        {/* ─── STEP 2: OTP ─── */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              We sent a 6-digit code to <span className="text-foreground font-medium">{maskEmail(email)}</span>
            </p>
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-13 text-center text-xl font-semibold rounded-lg border border-primary/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            {message && !error && <p className="text-sm text-muted-foreground text-center">{message}</p>}
            <Button
              type="submit"
              isLoading={loading}
              loadingText="Verifying..."
              disabled={otp.join("").length !== 6}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium"
            >
              Verify Code
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => { if (cooldown <= 0) handleSendCode(); }}
                disabled={cooldown > 0}
                className={`transition-colors ${cooldown > 0 ? "text-muted-foreground/50 cursor-not-allowed" : "text-primary hover:underline"}`}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
              </button>
            </div>
          </form>
        )}

        {/* ─── STEP 3: New Password ─── */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="pl-12 pr-12 h-12 bg-background border-primary/20 focus:border-primary"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${i <= strengthScore ? strengthColor : "bg-muted"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{strengthLabel}</p>
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                className={`pl-12 pr-12 h-12 bg-background border-primary/20 focus:border-primary ${
                  confirmPassword && !passwordValidation.passwordsMatch ? "border-destructive" : 
                  passwordValidation.passwordsMatch ? "border-green-500" : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Validation checklist */}
            <div className="space-y-1 text-sm">
              {[
                { ok: passwordValidation.minLength, label: "Min 8 characters" },
                { ok: passwordValidation.hasUppercase, label: "1 uppercase letter" },
                { ok: passwordValidation.hasNumber, label: "1 number" },
                { ok: passwordValidation.hasSpecialChar, label: "1 special character" },
                { ok: passwordValidation.passwordsMatch, label: "Passwords match" },
              ].map(({ ok, label }) => (
                <div key={label} className={`flex items-center gap-2 ${ok ? "text-green-500" : "text-muted-foreground"}`}>
                  {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {label}
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              isLoading={loading}
              loadingText="Updating..."
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium"
            >
              Update Password
            </Button>
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mx-auto mt-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
