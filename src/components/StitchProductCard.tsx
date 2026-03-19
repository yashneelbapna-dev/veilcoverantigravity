import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Eye, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/collections";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getResponsiveSrc, getSrcSet, PRODUCT_CARD_SIZES } from "@/lib/image";

interface StitchProductCardProps {
  product: Product;
  onQuickView?: () => void;
  index?: number;
}

const StitchProductCard = ({ product, onQuickView, index = 0 }: StitchProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const isWishlisted = isInWishlist(product.id);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Intersection observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.();
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.colors[0], product.phoneModels[0]);
    setJustAdded(true);
    toast({
      title: "Added to bag",
      description: `${product.name} has been added to your bag.`,
    });
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative",
        isVisible ? "stitch-card-visible" : "stitch-card-hidden"
      )}
      style={{ 
        animationDelay: `${index * 0.08}s`,
        "--card-delay": `${index * 0.08}s`
      } as React.CSSProperties}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glass Card Container */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          // Glassmorphism base
          "bg-card/50 dark:bg-card/30",
          "backdrop-blur-xl",
          "border border-border/40 dark:border-border/20",
          // Shadow system
          "shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.08)]",
          // Hover transforms
          isHovered && [
            "scale-[1.02] -translate-y-2",
            "rotate-[0.5deg]",
            "border-primary/40 dark:border-primary/30",
            // Enhanced glow shadow on hover
            "shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.25),0_8px_20px_-8px_hsl(var(--primary)/0.15)]",
          ]
        )}
      >
        {/* Glow border effect on hover */}
        <div 
          className={cn(
            "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none",
            "bg-gradient-to-br from-primary/20 via-transparent to-primary/10",
            isHovered && "opacity-100"
          )} 
        />

        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
          <Link to={`/product/${product.id}`} className="block h-full">
            <img
              src={getResponsiveSrc(product.image)}
              srcSet={getSrcSet(product.image)}
              sizes={PRODUCT_CARD_SIZES}
              alt={product.name}
              loading="lazy"
              className={cn(
                "h-full w-full object-cover",
                "transition-transform duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
                isHovered && "scale-110"
              )}
            />
          </Link>

          {/* Gradient Overlay - always visible, stronger on hover */}
          <div 
            className={cn(
              "absolute inset-0 pointer-events-none",
              "bg-gradient-to-t from-background/90 via-background/20 to-transparent",
              "transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-40"
            )}
          />

          {/* Top Left Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
            {discount && (
              <span className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold tracking-wide",
                "bg-destructive/95 text-destructive-foreground",
                "backdrop-blur-sm shadow-lg",
                "animate-pulse-subtle"
              )}>
                -{discount}%
              </span>
            )}
            {!product.inStock && (
              <span className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium",
                "bg-muted/95 text-muted-foreground backdrop-blur-sm"
              )}>
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Button - Top Right */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute right-3 top-3 z-10",
              "flex h-10 w-10 items-center justify-center rounded-full",
              "bg-background/70 dark:bg-background/50",
              "backdrop-blur-md border border-border/50",
              "shadow-lg transition-all duration-300",
              "hover:scale-110 hover:shadow-xl",
              "active:scale-95",
              isWishlisted && "bg-destructive/20 border-destructive/50"
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all duration-300",
                isWishlisted 
                  ? "fill-destructive text-destructive scale-110" 
                  : "text-foreground hover:text-destructive"
              )}
            />
          </button>

          {/* Quick Actions - Slide Up on Hover */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-4 z-10",
              "flex gap-2",
              "transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
              isHovered 
                ? "translate-y-0 opacity-100" 
                : "translate-y-full opacity-0"
            )}
          >
            <Button
              onClick={handleQuickAdd}
              className={cn(
                "flex-1 h-11 rounded-xl font-semibold text-sm",
                "transition-all duration-200",
                "shadow-lg",
                justAdded 
                  ? "bg-success text-success-foreground hover:bg-success/90" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
                "hover:shadow-xl hover:scale-[1.02]",
                "active:scale-[0.98]"
              )}
              disabled={!product.inStock}
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Quick Add
                </>
              )}
            </Button>
            {onQuickView && (
              <Button
                variant="outline"
                onClick={handleQuickView}
                className={cn(
                  "h-11 w-11 rounded-xl p-0",
                  "bg-background/90 backdrop-blur-md",
                  "border-border/50",
                  "shadow-lg transition-all duration-200",
                  "hover:bg-background hover:scale-105",
                  "active:scale-95"
                )}
                aria-label="Quick view"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          {/* Material Tag */}
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {product.material}
          </span>

          {/* Product Name */}
          <Link to={`/product/${product.id}`} className="block group/name">
            <h3 className={cn(
              "font-semibold text-foreground text-base leading-tight",
              "line-clamp-2 transition-colors duration-200",
              "group-hover/name:text-primary"
            )}>
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5 transition-colors",
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted/50 text-muted/50"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Color Dots */}
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1.5 pt-1">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color}
                  className={cn(
                    "h-4 w-4 rounded-full shadow-sm",
                    "border border-border/50",
                    "transition-transform duration-200 hover:scale-110"
                  )}
                  style={{ backgroundColor: getColorValue(color) }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground font-medium">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Color mapping helper
const getColorValue = (colorName: string): string => {
  const colors: Record<string, string> = {
    Black: "#1a1a1a",
    White: "#ffffff",
    Navy: "#1e3a5f",
    Forest: "#228b22",
    Cream: "#fffdd0",
    Pearl: "#f0ead6",
    Graphite: "#383838",
    Silver: "#c0c0c0",
    Gold: "#ffd700",
    Brown: "#8b4513",
    Tan: "#d2b48c",
    Slate: "#708090",
    Charcoal: "#36454f",
    Stone: "#928e85",
    "Rose Gold": "#e0bfb8",
    Clear: "transparent",
    Frosted: "rgba(255,255,255,0.8)",
    Cognac: "#9a463d",
    Burgundy: "#800020",
    Espresso: "#3c2415",
    Chocolate: "#7b3f00",
    Caramel: "#ffd59a",
    "Midnight Blue": "#191970",
    "Deep Ocean": "#003366",
    Ink: "#1a1a2e",
    "Fog Grey": "#b8b8b8",
    Mist: "#d3d3d3",
    Cloud: "#f0f0f0",
  };
  return colors[colorName] || "#888888";
};

export default StitchProductCard;
