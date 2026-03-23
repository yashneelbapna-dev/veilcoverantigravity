import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, AlertTriangle, Check, X } from "lucide-react";
import { getSafeErrorMessage } from "@/lib/errors";
import { validateFullName } from "@/lib/validation";
import { useRateLimit } from "@/hooks/useRateLimit";

import ForgotPassword from "@/components/ForgotPassword";

type AuthMode = "signin" | "signup";

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signInWithEmail, signInWithOAuth } = useAuth();
  const { checkRateLimit, recordLoginAttempt } = useRateLimit();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false,
  });

  // Validate password on change
  useEffect(() => {
    if (mode === "signup") {
      // Password must have: 8+ chars, uppercase, number, special character
      // Special characters allowed by Supabase: !@#$%^&*()_+-=[]{};\':"|<>?,./`~
      setPasswordValidation({
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(password),
        passwordsMatch: password === confirmPassword && password.length > 0,
      });
    }
  }, [password, confirmPassword, mode]);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleNameChange = (value: string) => {
    setFullName(value);
    if (value.trim()) {
      const validation = validateFullName(value);
      setNameError(validation.success ? null : validation.error);
    } else {
      setNameError(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check rate limit for sign in
    if (mode === "signin") {
      const rateCheck = await checkRateLimit(email);
      if (!rateCheck.allowed) {
        setRateLimited(true);
        setError("Too many login attempts. Please try again in 12 hours.");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === "signup") {
        // Validate password requirements before sending to Supabase
        // Must match Supabase Auth password policy: 8+ chars, uppercase, number, special char
        const isPasswordValid = 
          password.length >= 8 &&
          /[A-Z]/.test(password) &&
          /[0-9]/.test(password) &&
          /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(password);
        
        if (!isPasswordValid) {
          setError("Password must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special character");
          setLoading(false);
          return;
        }
        
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        if (!fullName.trim()) {
          setError("Full name is required");
          setLoading(false);
          return;
        }
        
        // Validate name (letters only)
        const nameValidation = validateFullName(fullName);
        if (!nameValidation.success) {
          setNameError(nameValidation.error);
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;
        toast({ title: "Success", description: "Account created! You can now sign in." });
        setMode("signin");
      } else {
        // Sign in with timeout
        const signInPromise = signInWithEmail(email, password);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out. Please try again.")), 5000);
        });

        const result = await Promise.race([signInPromise, timeoutPromise]);
        
        if (result.error) {
          // Record failed attempt
          await recordLoginAttempt(email, false);
          setError("Invalid email or password");
          setLoading(false);
          return;
        }
        
        // Record successful attempt
        await recordLoginAttempt(email, true);
        toast({ title: "Welcome back!", description: "You've signed in successfully." });
        navigate("/");
      }
    } catch (error: any) {
      if (mode === "signin") {
        await recordLoginAttempt(email, false);
      }
      const safeMessage = getSafeErrorMessage(error, mode === "signup" ? "signup" : "auth");
      setError(safeMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithOAuth("google");
      if (error) {
        toast({ title: "Error", description: getSafeErrorMessage(error, "auth"), variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: getSafeErrorMessage(err, "auth"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  if (showForgotPassword) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12">
          <ForgotPassword
            onBack={() => setShowForgotPassword(false)}
            onSuccess={() => {
              setShowForgotPassword(false);
              toast({ title: "Password updated!", description: "Please sign in with your new password." });
            }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-wider">VEIL</h1>
            <p className="text-muted-foreground mt-2">
              {mode === "signin" ? "Sign in to your account" : "Create your account"}
            </p>
            
            {/* Rate limit warning */}
            {rateLimited && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">Account temporarily locked</span>
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-primary/20 p-8">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === "signup" && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Full Name (letters only)"
                    value={fullName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`pl-12 h-12 bg-background border-primary/20 focus:border-primary ${nameError ? 'border-destructive' : ''}`}
                    required
                  />
                  {nameError && <p className="text-sm text-destructive mt-1">{nameError}</p>}
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-background border-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className={`pl-12 h-12 bg-background border-primary/20 focus:border-primary ${error && mode === "signin" ? 'border-destructive' : ''}`}
                  required
                />
              </div>
              
              {/* Forgot password link */}
              {mode === "signin" && (
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Error message for signin */}
              {error && mode === "signin" && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
              
              {mode === "signup" && (
                <>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-12 h-12 bg-background border-primary/20 focus:border-primary ${
                        confirmPassword && !passwordValidation.passwordsMatch ? 'border-destructive' : 
                        passwordValidation.passwordsMatch ? 'border-success' : ''
                      }`}
                      required
                    />
                    {confirmPassword && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {passwordValidation.passwordsMatch ? (
                          <Check className="h-5 w-5 text-success" />
                        ) : (
                          <X className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Password requirements */}
                  <div className="space-y-1 text-sm">
                    <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-success' : 'text-muted-foreground'}`}>
                      {passwordValidation.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Min 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-success' : 'text-muted-foreground'}`}>
                      {passwordValidation.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      1 uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-success' : 'text-muted-foreground'}`}>
                      {passwordValidation.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      1 number
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-success' : 'text-muted-foreground'}`}>
                      {passwordValidation.hasSpecialChar ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      1 special character (!@#$%^&* etc.)
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.passwordsMatch ? 'text-success' : 'text-muted-foreground'}`}>
                      {passwordValidation.passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Passwords match
                    </div>
                  </div>
                  
                  {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                </>
              )}
              <Button
                type="submit"
                isLoading={loading}
                loadingText="Please wait..."
                disabled={rateLimited || (mode === "signup" && !!nameError)}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium"
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleGoogleAuth}
                isLoading={loading}
                className="w-full h-12 border-primary/20 hover:bg-primary/10 hover:border-primary"
              >
                {/* Official Google Logo SVG */}
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <p>
                  Don't have an account?{" "}
                  <button onClick={() => { setMode("signup"); setError(null); setRateLimited(false); }} className="text-primary hover:underline">
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button onClick={() => { setMode("signin"); setError(null); setNameError(null); }} className="text-primary hover:underline">
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
