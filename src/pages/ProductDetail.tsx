import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { getProductBySlug, products, VeilProduct } from "@/data/products";
import { Star, Shield, Heart, Minus, Plus, ChevronRight, Truck, RotateCcw, Award, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import VeilProductCard from "@/components/VeilProductCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ProductDetail = () => {
  const { productId } = useParams();
  const product = getProductBySlug(productId || '');
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const addToCartBtn = document.getElementById('main-add-to-cart');
      if (addToCartBtn) {
        const rect = addToCartBtn.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product) {
    return (
      <Layout>
        <div className="container-veil section-padding text-center">
          <h1 className="text-3xl font-display text-foreground mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-accent hover:underline">Back to Shop</Link>
        </div>
      </Layout>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const relatedProducts = products.filter(p => p.collection === product.collection && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
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
    addToCart(cartProduct, quantity, product.colors[selectedColor]?.name || '', product.device);
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-veil">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground truncate">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="aspect-square overflow-hidden rounded-2xl bg-card mb-4 relative group cursor-zoom-in">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </AnimatePresence>
              </div>
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-accent' : 'border-border hover:border-accent/40'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent mb-2">{product.device}</p>
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-accent text-accent' : 'text-border'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
                {product.comparePrice && (
                  <span className="text-lg text-muted-foreground line-through">₹{product.comparePrice.toLocaleString('en-IN')}</span>
                )}
              </div>

              {/* Color selector */}
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-3">Color: <span className="text-muted-foreground">{product.colors[selectedColor]?.name}</span></p>
                <div className="flex gap-3">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(i)}
                      className={`h-8 w-8 rounded-full transition-all ${
                        selectedColor === i ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : 'border-2 border-border hover:border-accent/40'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* MagSafe badge */}
              {product.magsafe && (
                <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-card border border-border w-fit">
                  <Zap className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-foreground">MagSafe Compatible</span>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <p className="text-sm font-medium text-foreground">Qty</p>
                <div className="flex items-center gap-3 bg-secondary rounded-full px-1 py-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 rounded-full hover:bg-card transition-colors">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-1.5 rounded-full hover:bg-card transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex flex-col gap-3 mb-8" id="main-add-to-cart">
                {product.inStock ? (
                  <motion.button
                    onClick={handleAddToCart}
                    whileTap={{ scale: 0.97 }}
                    className="btn-gold w-full py-4 rounded-full text-sm font-semibold tracking-wide"
                  >
                    Add to Cart — ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </motion.button>
                ) : (
                  <button disabled className="w-full py-4 rounded-full bg-secondary text-muted-foreground text-sm font-semibold cursor-not-allowed">
                    Sold Out
                  </button>
                )}
                <button
                  onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                  className="btn-ghost-veil w-full py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Heart className={`h-4 w-4 ${wishlisted ? 'fill-accent text-accent' : ''}`} />
                  {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-accent" /> 6ft Drop Tested</span>
                <span className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4 text-accent" /> 30-Day Returns</span>
                <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-accent" /> Free Shipping</span>
                <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-accent" /> 2yr Warranty</span>
              </div>

              {/* Accordion */}
              <Accordion type="single" collapsible className="border-t border-border">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm font-medium">Product Details</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-1">
                    <p>{product.description}</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {product.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="box">
                  <AccordionTrigger className="text-sm font-medium">What's in the Box</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">1x {product.name}, 1x Microfiber cleaning cloth, 1x VEIL warranty card</AccordionContent>
                </AccordionItem>
                <AccordionItem value="compatibility">
                  <AccordionTrigger className="text-sm font-medium">Compatibility</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">Designed for {product.device}. {product.magsafe ? 'MagSafe compatible.' : ''} Wireless charging compatible.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-sm font-medium">Shipping & Returns</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">Free worldwide shipping. Delivery in 5-7 business days. 30-day hassle-free returns.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>

          {/* Related */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="font-display text-2xl text-foreground mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {relatedProducts.map(p => <VeilProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sticky mobile bar */}
      <AnimatePresence>
        {showStickyBar && product.inStock && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-4 py-3 flex items-center gap-3 md:hidden"
          >
            <img src={product.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
              <p className="text-sm font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
            <button onClick={handleAddToCart} className="btn-gold px-6 py-3 rounded-full text-sm font-semibold">Add to Cart</button>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ProductDetail;
