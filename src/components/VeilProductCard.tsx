import { Link } from "react-router-dom";
import { Heart, Plus, Star, ShoppingBag } from "lucide-react";
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
      className="group relative product-card-glow rounded-2xl overflow-hidden bg-card border border-border/50"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35 }}
    >
      {/* Badge */}
      {product.badge && (
        <div className={`absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          product.badge === 'SOLD OUT'
            ? 'bg-muted/90 text-muted-foreground backdrop-blur-sm'
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
        className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-background/70 backdrop-blur-md border border-border/40 text-muted-foreground hover:text-accent hover:border-accent/30 transition-all duration-200"
        aria-label="Toggle wishlist"
      >
        <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-accent text-accent' : ''}`} />
      </button>

      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-secondary">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Quick Add Overlay */}
      {product.inStock && (
        <div className="absolute bottom-[85px] left-0 right-0 px-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleQuickAdd}
            className="w-full btn-gold py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Quick Add
          </button>
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
          {product.device}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-bold text-foreground truncate hover:text-accent transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.round(product.rating) ? 'fill-accent text-accent' : 'text-border'}`} />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5 mt-2.5">
          {product.colors.slice(0, 4).map((c) => (
            <div
              key={c.name}
              className="h-4 w-4 rounded-full border-2 border-border/50 hover:border-accent/50 transition-colors"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-[10px] text-muted-foreground ml-1">+{product.colors.length - 4}</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-base font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">₹{product.comparePrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VeilProductCard;
