import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/collections";
import { useWishlist } from "@/contexts/WishlistContext";
import { getResponsiveSrc, getSrcSet, PRODUCT_CARD_SIZES } from "@/lib/image";

interface ProductCardProps {
  product: Product;
  onQuickView?: () => void;
}

const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div
      ref={cardRef}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative aspect-square overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 ${
          isHovered ? "shadow-lg -translate-y-1" : ""
        }`}
      >
        <Link to={`/product/${product.id}`}>
          <img
            src={getResponsiveSrc(product.image)}
            srcSet={getSrcSet(product.image)}
            sizes={PRODUCT_CARD_SIZES}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {discount && (
          <span className="absolute left-2 top-2 rounded bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground">
            -{discount}%
          </span>
        )}

        <button
          onClick={handleWishlistToggle}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm transition-all hover:scale-110"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "fill-destructive text-destructive" : "text-foreground"
            }`}
          />
        </button>

        {onQuickView && (
          <div
            className={`absolute bottom-2 left-2 right-2 transition-all duration-200 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <Button
              variant="secondary"
              className="w-full gap-2 bg-background/90 backdrop-blur-sm text-foreground hover:bg-background text-xs sm:text-sm"
              size="sm"
              onClick={handleQuickView}
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Quick View</span>
              <span className="sm:hidden">View</span>
            </Button>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-foreground text-sm sm:text-base transition-colors hover:text-muted-foreground line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
          <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
          <span className="text-xs sm:text-sm text-muted-foreground">({product.reviewCount})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-lg font-semibold text-foreground">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;