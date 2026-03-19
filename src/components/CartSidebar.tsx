import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const FREE_SHIPPING_THRESHOLD = 5000;

const CartSidebar = () => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const total = getCartTotal();
  const remaining = FREE_SHIPPING_THRESHOLD - total;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[80] w-full sm:max-w-md bg-background border-l border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Your Bag ({getCartCount()})</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Your bag is empty</h3>
                <p className="text-sm text-muted-foreground mb-6">Add some premium cases to get started</p>
                <Link to="/shop" onClick={() => setIsCartOpen(false)} className="btn-gold px-8 py-3 rounded-full text-sm font-semibold">
                  Browse Collection
                </Link>
              </div>
            ) : (
              <>
                {/* Free shipping bar */}
                {remaining > 0 && (
                  <div className="px-6 py-3 border-b border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      Add <span className="text-accent font-semibold">₹{remaining.toLocaleString('en-IN')}</span> more for <span className="text-accent font-semibold">FREE shipping</span>
                    </p>
                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.selectedColor}-${item.selectedModel}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-3 rounded-xl bg-card border border-border"
                    >
                      <img src={item.product.image} alt={item.product.name} className="h-20 w-20 rounded-lg object-cover bg-secondary" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">{item.product.name}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.selectedColor} · {item.selectedModel}</p>
                        <p className="text-sm font-bold text-foreground mt-1">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedModel, item.quantity - 1)}
                            className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedModel, item.quantity + 1)}
                            className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedModel)}
                            className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-border space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-xl font-bold text-foreground">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="btn-gold w-full py-4 rounded-full text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
                  >
                    Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
