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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-navbar border-b border-border/50" : "bg-transparent"
        }`}
      >
        <div className="container-veil">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-lg md:text-xl font-light tracking-[0.4em] text-foreground z-10">
              VEIL
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="nav-link-underline text-[13px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-3">
              
              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
                <Search className="h-[18px] w-[18px]" />
              </button>

              <Link to="/wishlist" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block" aria-label="Wishlist">
                <Heart className="h-[18px] w-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full cart-badge text-[9px]">{wishlistCount}</span>
                )}
              </Link>

              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Cart">
                <ShoppingBag className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full cart-badge text-[9px]">{cartCount}</span>
                )}
              </button>

              <Link to={user ? "/account" : "/auth"} className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block" aria-label="Account">
                <User className="h-[18px] w-[18px]" />
              </Link>

              <button onClick={() => setMobileOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <div className="flex items-center justify-between px-4 h-16">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-lg font-light tracking-[0.4em]">VEIL</Link>
              <button onClick={() => setMobileOpen(false)} className="p-2" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div key={link.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link to={link.href} onClick={() => setMobileOpen(false)} className="text-3xl font-display font-bold tracking-wide text-foreground">
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex items-center justify-center gap-6 pb-8">
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" /> Wishlist
              </Link>
              <Link to={user ? "/account" : "/auth"} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" /> {user ? "Account" : "Sign In"}
              </Link>
              {user && (
                <button onClick={async () => { await signOut(); setMobileOpen(false); navigate("/"); }} className="flex items-center gap-2 text-sm text-destructive">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
