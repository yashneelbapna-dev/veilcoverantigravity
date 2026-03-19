import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/collections";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import ColorSelector from "./ColorSelector";
import QuantitySelector from "./QuantitySelector";
import PhoneModelSelector from "./PhoneModelSelector";
import { Heart, ShoppingBag, Star, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, open, onClose }: QuickViewModalProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || "");
      setSelectedModel(product.phoneModels[0] || "");
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedModel);
    toast({
      title: "Added to bag",
      description: `${product.name} has been added to your bag.`,
    });
    onClose();
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={cn(
        "max-w-4xl p-0 overflow-hidden",
        "bg-card/90 dark:bg-card/80 backdrop-blur-2xl",
        "border border-border/30 dark:border-border/20",
        "max-h-[90vh] md:max-h-[85vh] rounded-3xl",
        "shadow-[0_25px_50px_-12px_hsl(var(--foreground)/0.25)]"
      )}>
        <DialogTitle className="sr-only">Quick View: {product.name}</DialogTitle>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute right-4 top-4 z-20",
            "flex h-10 w-10 items-center justify-center rounded-full",
            "bg-background/80 backdrop-blur-xl",
            "border border-border/40 shadow-lg",
            "hover:bg-background hover:scale-110",
            "active:scale-95",
            "transition-all duration-200"
          )}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2 overflow-y-auto max-h-[90vh] md:max-h-[85vh] premium-scrollbar">
          {/* Image Section */}
          <div className="relative h-64 sm:h-80 md:h-full md:min-h-[500px] bg-gradient-to-br from-muted/40 to-muted/20 flex-shrink-0 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain md:object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
            
            {/* Discount Badge */}
            {discount && (
              <span className={cn(
                "absolute left-4 top-4 rounded-full px-4 py-1.5",
                "text-sm font-bold text-destructive-foreground",
                "bg-destructive/95 shadow-lg"
              )}>
                -{discount}% OFF
              </span>
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/10 pointer-events-none md:hidden" />
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 space-y-5 overflow-y-auto">
            {/* Material Tag */}
            <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
              {product.material}
            </span>

            {/* Name */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h2>
            
            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-sm font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            <div className="h-px bg-border/50" />

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Color: <span className="text-primary">{selectedColor}</span>
              </label>
              <ColorSelector
                colors={product.colors}
                selectedColor={selectedColor}
                onChange={setSelectedColor}
              />
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Phone Model
              </label>
              <PhoneModelSelector
                models={product.phoneModels}
                selectedModel={selectedModel}
                onChange={setSelectedModel}
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Quantity
              </label>
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>

            <div className="h-px bg-border/50" />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                className={cn(
                  "flex-1 h-12 md:h-14 rounded-xl text-base font-semibold",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 transition-all duration-200",
                  "shadow-lg hover:shadow-xl hover:scale-[1.02]"
                )}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Bag
              </Button>
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                className={cn(
                  "h-12 w-12 md:h-14 md:w-14 rounded-xl p-0",
                  "border-border/50 transition-all duration-200 hover:scale-105",
                  isWishlisted && "bg-destructive/10 border-destructive"
                )}
              >
                <Heart
                  className={cn(
                    "h-5 w-5 md:h-6 md:w-6",
                    isWishlisted ? "fill-destructive text-destructive" : ""
                  )}
                />
              </Button>
            </div>

            {/* View Full Details Link */}
            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className={cn(
                "flex items-center justify-center gap-2 w-full py-3 rounded-xl",
                "text-sm font-medium text-primary",
                "bg-primary/5 hover:bg-primary/10 transition-colors"
              )}
            >
              View Full Details
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
