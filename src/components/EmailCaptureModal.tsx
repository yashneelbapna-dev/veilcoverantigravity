import { useState, useEffect } from "react";
import { X, Copy, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const EmailCaptureModal = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("veil-email-modal-dismissed");
    if (dismissed) return;

    const timer = setTimeout(() => {
      if (!sessionStorage.getItem("veil-email-modal-dismissed")) {
        setOpen(true);
      }
    }, 30000);

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem("veil-email-modal-dismissed")) {
        setOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const dismiss = () => {
    setOpen(false);
    sessionStorage.setItem("veil-email-modal-dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('claim-discount', {
        body: { email: email.trim().toLowerCase() },
      });

      if (error) throw error;
      const code = data.coupon_code;
      setCouponCode(code);

      // Store coupon in localStorage for checkout
      localStorage.setItem("veil_coupon", JSON.stringify({
        code,
        discount: 10,
        type: "percentage",
        expires: Date.now() + 86400000, // 24 hours
      }));
    } catch (err) {
      console.error("Failed to claim coupon:", err);
      setCouponCode("VEIL10-ERROR");
    }

    setLoading(false);
    setSubmitted(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md"
            onClick={dismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl pointer-events-auto shadow-xl border border-accent/15">
              {/* Gradient accent strip at top */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-accent to-transparent" />

              <div className="bg-card p-8 pt-7">
                {/* Close button */}
                <button
                  onClick={dismiss}
                  className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>

                {!submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Badge */}
                    <div className="flex items-center gap-1.5 mb-5">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
                        Exclusive Offer
                      </span>
                    </div>

                    {/* Big discount number */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-6xl font-bold text-foreground leading-none">
                          10
                        </span>
                        <span className="font-display text-3xl font-bold text-accent leading-none">
                          %
                        </span>
                        <span className="text-lg font-medium text-muted-foreground ml-2 self-end pb-1">
                          off
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        Your first order. Enter your email to join the VEIL inner circle.
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3 mt-6">
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full bg-secondary/80 border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-gold w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide disabled:opacity-60 transition-all hover:shadow-lg hover:shadow-accent/20"
                      >
                        {loading ? (
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                          >
                            Generating your code...
                          </motion.span>
                        ) : (
                          "Claim My Discount"
                        )}
                      </button>
                    </form>

                    <p className="text-[10px] text-muted-foreground text-center mt-4 tracking-wide">
                      No spam, ever. Unsubscribe anytime.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="text-center py-2"
                  >
                    {/* Success checkmark */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                      className="mx-auto w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-5"
                    >
                      <Check className="h-7 w-7 text-accent" />
                    </motion.div>

                    <h3 className="font-display text-2xl text-foreground mb-1.5">🎉 Here's your 10% off code</h3>
                    <p className="text-sm text-muted-foreground mb-5">Copy it and use at checkout</p>

                    {/* Coupon code display with copy button */}
                    <div className="flex items-center gap-2 bg-secondary border border-accent/20 rounded-xl px-4 py-4 mx-auto">
                      <span className="text-accent font-bold text-xl tracking-[0.15em] font-mono flex-1 text-center">
                        {couponCode}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            COPIED ✓
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            COPY
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-6">
                      Applied automatically at checkout · Valid for 24 hours
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailCaptureModal;
