import { useState, forwardRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

const Footer = forwardRef<HTMLElement>((_props, ref) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await fetch("https://hooks.zapier.com/hooks/catch/26220162/u00o6nq/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({ email: email.trim().toLowerCase(), subscribed_at: new Date().toISOString(), source: "footer" }),
      });
      setStatus('success');
      setEmail("");
    } catch {
      setStatus('idle');
    }
  };

  return (
    <footer ref={ref} className="border-t border-accent/15 bg-background">
      <div className="container-veil py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Shop */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-5">Shop</h3>
            <nav className="flex flex-col gap-3">
              {[
                { name: "All Products", href: "/shop" },
                { name: "Obsidian Series", href: "/collections/obsidian" },
                { name: "Clear Series", href: "/collections/clear" },
                { name: "Limited Drops", href: "/drops" },
                { name: "New Arrivals", href: "/shop" },
              ].map(l => (
                <Link key={l.name} to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.name}</Link>
              ))}
            </nav>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-5">Help</h3>
            <nav className="flex flex-col gap-3">
              {[
                { name: "FAQ", href: "/faq" },
                { name: "Shipping & Returns", href: "/shipping-returns" },
                { name: "Track Order", href: "/track" },
                { name: "Care Guide", href: "/care-guide" },
                { name: "Contact", href: "/contact" },
              ].map(l => (
                <Link key={l.name} to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.name}</Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-5">Company</h3>
            <nav className="flex flex-col gap-3">
              {[
                { name: "About VEIL", href: "/about" },
                { name: "Collaborations", href: "/collab" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms of Service", href: "/terms-of-service" },
              ].map(l => (
                <Link key={l.name} to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.name}</Link>
              ))}
            </nav>
          </div>

          {/* Follow VEIL + Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-5">Follow VEIL</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              {["Instagram", "TikTok", "X", "Pinterest"].map(s => (
                <a key={s} href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-accent transition-colors">{s}</a>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mb-3">Join the inner circle</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={status !== 'idle'}
                className="flex-1 min-w-0 bg-secondary border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
              />
              <button type="submit" disabled={status !== 'idle'} aria-label="Subscribe to newsletter" className="btn-gold rounded-full p-2.5 flex-shrink-0">
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : status === 'success' ? <span className="text-xs px-1">✓</span> : <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-accent/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} VEIL. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
