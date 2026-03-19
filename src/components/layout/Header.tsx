import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, Heart, ShoppingBag, X, User, LogOut } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSearch } from "@/contexts/SearchContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Shop", href: "/shop" },
  { name: "Collections", href: "/collections" },
  { name: "Drops", href: "/drops" },
  { name: "Collabs", href: "/collab" },
  { name: "About", href: "/about" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { getCartCount, setIsCartOpen } = useCart();
  const { setIsSearchOpen } = useSearch();
  const { getWishlistCount } = useWishlist();
  const { user, signOut } = useAuth();
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-navbar border-b border-border/40 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container-veil">
          <div className="flex h-16 md:h-[72px] items-center justify-between">
            {/* Mobile menu trigger */}
            <button onClick={() => setMobileOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link to="/" className="text-xl md:text-2xl font-light tracking-[0.45em] text-foreground z-10 hover:text-accent transition-colors duration-300">
              VEIL
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-9">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="nav-link-underline text-[13px] font-medium tracking-[0.06em] text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <button onClick={() => setIsSearchOpen(true)} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50" aria-label="Search">
                <Search className="h-[18px] w-[18px]" />
              </button>

              <Link to="/wishlist" className="relative p-2.5 text-muted-foreground hover:text-foreground transition-colors hidden sm:block rounded-full hover:bg-secondary/50" aria-label="Wishlist">
                <Heart className="h-[18px] w-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full cart-badge text-[9px]">{wishlistCount}</span>
                )}
              </Link>

              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50" aria-label="Cart">
                <ShoppingBag className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full cart-badge text-[9px]">{cartCount}</span>
                )}
              </button>

              <Link to={user ? "/account" : "/auth"} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors hidden sm:block rounded-full hover:bg-secondary/50" aria-label="Account">
                <User className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen overlay — Stitch Redesign */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            {/* Decorative glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />

            <div className="flex items-center justify-between px-5 h-16 relative z-10">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-xl font-light tracking-[0.45em] text-foreground">VEIL</Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center items-center gap-7 relative z-10">
              {navLinks.map((link, i) => (
                <motion.div key={link.name} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}>
                  <Link to={link.href} onClick={() => setMobileOpen(false)} className="text-3xl font-display font-bold tracking-wide text-foreground hover:text-accent transition-colors duration-200">
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center justify-center gap-6 pb-10 relative z-10"
            >
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
                <Heart className="h-4 w-4" /> Wishlist
              </Link>
              <Link to={user ? "/account" : "/auth"} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
                <User className="h-4 w-4" /> {user ? "Account" : "Sign In"}
              </Link>
              {user && (
                <button onClick={async () => { await signOut(); setMobileOpen(false); navigate("/"); }} className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
