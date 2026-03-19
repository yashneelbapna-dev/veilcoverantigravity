import { Link } from "react-router-dom";
import { Heart, Plus, Star } from "lucide-react";
import { VeilProduct } from "@/data/products";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";

interface VeilProductCardProps {
  product: VeilProduct;
}

const VeilProductCard = ({ product }: VeilProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      rating: product.rating,
      reviewCount: product.reviewCount,
      material: product.material,
      colors: product.colors.map(c => c.name),
      phoneModels: [product.device],
      inStock: product.inStock,
      collections: [product.collection],
    };
    addToCart(cartProduct, 1, product.colors[0]?.name || '', product.device);
  };

  return (
    <motion.div
      className="group relative product-card-glow rounded-xl overflow-hidden bg-card border border-border"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Badge */}
      {product.badge && (
        <div className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          product.badge === 'SOLD OUT'
            ? 'bg-muted text-muted-foreground'
            : product.badge === 'LIMITED'
            ? 'bg-accent text-accent-foreground'
            : product.badge === 'BEST SELLER'
            ? 'bg-accent text-accent-foreground'
            : 'bg-foreground text-background'
        }`}>
          {product.badge}{product.badgeCount ? ` — ${product.badgeCount} left` : ''}
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          wishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-accent transition-colors"
        aria-label="Toggle wishlist"
      >
        <Heart className={`h-4 w-4 ${wishlisted ? 'fill-accent text-accent' : ''}`} />
      </button>

      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-secondary">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
          {product.device}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-foreground truncate hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5 mt-2">
          {product.colors.slice(0, 4).map((c) => (
            <div
              key={c.name}
              className="h-3.5 w-3.5 rounded-full border border-border"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* Price + Quick Add */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
            {product.comparePrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.comparePrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          {product.inStock && (
            <button
              onClick={handleQuickAdd}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-accent text-accent-foreground hover:scale-110 active:scale-95"
              aria-label="Quick add"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VeilProductCard;
