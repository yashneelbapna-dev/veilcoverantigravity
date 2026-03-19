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
      await fetch("https://freeautomation.app.n8n.cloud/webhook/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          timestamp: new Date().toISOString(),
        }),
      });
      setStatus('success');
      setEmail("");
    } catch {
      setStatus('idle');
    }
  };

  return (
    <footer ref={ref} className="border-t border-accent/10 bg-background relative overflow-hidden">
      {/* Subtle accent glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-accent/3 blur-[100px] rounded-full" />

      <div className="container-veil py-16 md:py-24 relative z-10">
        {/* Newsletter Banner */}
        <div className="mb-16 pb-16 border-b border-accent/10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-2xl md:text-3xl text-foreground mb-2">Stay in the loop</h3>
              <p className="text-sm text-muted-foreground">Get notified about new drops, artist collaborations, and exclusive offers.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2.5">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={status !== 'idle'}
                className="flex-1 min-w-0 bg-secondary border border-border rounded-full px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 transition-shadow"
              />
              <button type="submit" disabled={status !== 'idle'} aria-label="Subscribe to newsletter" className="btn-gold rounded-full px-6 py-3 text-sm font-semibold flex items-center gap-2">
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : status === 'success' ? <span>Subscribed ✓</span> : <><span>Subscribe</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Shop */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent mb-6">Shop</h3>
            <nav className="flex flex-col gap-3.5">
              {[
                { name: "All Products", href: "/shop" },
                { name: "Obsidian Series", href: "/collections/obsidian" },
                { name: "Clear Series", href: "/collections/clear" },
                { name: "Limited Drops", href: "/drops" },
                { name: "New Arrivals", href: "/shop" },
              ].map(l => (
                <Link key={l.name} to={l.href} className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200">{l.name}</Link>
              ))}
            </nav>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent mb-6">Help</h3>
            <nav className="flex flex-col gap-3.5">
              {[
                { name: "FAQ", href: "/faq" },
                { name: "Shipping & Returns", href: "/shipping-returns" },
                { name: "Track Order", href: "/track" },
                { name: "Care Guide", href: "/care-guide" },
                { name: "Contact", href: "/contact" },
              ].map(l => (
                <Link key={l.name} to={l.href} className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200">{l.name}</Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent mb-6">Company</h3>
            <nav className="flex flex-col gap-3.5">
              {[
                { name: "About VEIL", href: "/about" },
                { name: "Collaborations", href: "/collab" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms of Service", href: "/terms-of-service" },
              ].map(l => (
                <Link key={l.name} to={l.href} className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200">{l.name}</Link>
              ))}
            </nav>
          </div>

          {/* Follow VEIL */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent mb-6">Follow VEIL</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              {["Instagram", "TikTok", "X", "Pinterest"].map(s => (
                <a key={s} href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200">{s}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-accent/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-light tracking-[0.4em] text-foreground">VEIL</span>
            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
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
