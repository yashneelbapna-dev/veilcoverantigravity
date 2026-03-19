import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Product } from "@/data/collections";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedModel: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, color: string, model: string) => void;
  removeFromCart: (productId: string, color: string, model: string) => void;
  updateQuantity: (productId: string, color: string, model: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "veil-cart";

const loadFromLocalStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => loadFromLocalStorage());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Sync with Supabase when user logs in
  useEffect(() => {
    if (user && !hasInitialized) {
      syncWithSupabase();
    } else if (!user && hasInitialized) {
      setItems(loadFromLocalStorage());
    }
  }, [user]);

  // Save to localStorage on every items change
  useEffect(() => {
    if (!user) {
      try {
        if (items.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch { /* ignore quota errors */ }
    }
  }, [items, user]);

  const syncWithSupabase = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const localItems: CartItem[] = loadFromLocalStorage();

      const { data: dbCart, error } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const mergedItems: CartItem[] = [...localItems];

      for (const item of localItems) {
        const existsInDb = dbCart?.some(
          dbItem =>
            dbItem.product_id === item.product.id &&
            dbItem.selected_color === item.selectedColor &&
            dbItem.selected_model === item.selectedModel
        );

        if (!existsInDb) {
          await supabase.from("cart").upsert({
            user_id: user.id,
            product_id: item.product.id,
            quantity: item.quantity,
            selected_color: item.selectedColor,
            selected_model: item.selectedModel,
          }, {
            onConflict: "user_id,product_id,selected_color,selected_model"
          });
        }
      }

      localStorage.removeItem(STORAGE_KEY);
      
      setItems(mergedItems);
      setHasInitialized(true);
    } catch (error) {
      console.error("Error syncing cart:", error);
      setHasInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  const saveToSupabase = async (newItems: CartItem[]) => {
    if (!user) return;

    try {
      await supabase.from("cart").delete().eq("user_id", user.id);

      if (newItems.length > 0) {
        const cartRows = newItems.map(item => ({
          user_id: user.id,
          product_id: item.product.id,
          quantity: item.quantity,
          selected_color: item.selectedColor,
          selected_model: item.selectedModel,
        }));

        await supabase.from("cart").insert(cartRows);
      }
    } catch (error) {
      console.error("Error saving cart to Supabase:", error);
    }
  };

  const addToCart = useCallback((product: Product, quantity: number, color: string, model: string) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === color &&
          item.selectedModel === model
      );

      let newItems: CartItem[];
      if (existingIndex > -1) {
        newItems = [...prev];
        newItems[existingIndex].quantity += quantity;
      } else {
        newItems = [...prev, { product, quantity, selectedColor: color, selectedModel: model }];
      }

      if (user) {
        saveToSupabase(newItems);
      }

      return newItems;
    });
    setIsCartOpen(true);
  }, [user]);

  const removeFromCart = useCallback((productId: string, color: string, model: string) => {
    setItems((prev) => {
      const newItems = prev.filter(
        (item) =>
          !(item.product.id === productId &&
            item.selectedColor === color &&
            item.selectedModel === model)
      );

      if (user) {
        saveToSupabase(newItems);
      }

      return newItems;
    });
  }, [user]);

  const updateQuantity = useCallback((productId: string, color: string, model: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, model);
      return;
    }

    setItems((prev) => {
      const newItems = prev.map((item) =>
        item.product.id === productId &&
        item.selectedColor === color &&
        item.selectedModel === model
          ? { ...item, quantity }
          : item
      );

      if (user) {
        saveToSupabase(newItems);
      }

      return newItems;
    });
  }, [user, removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
    
    if (user) {
      supabase.from("cart").delete().eq("user_id", user.id).then(() => {});
    }
  }, [user]);

  const getCartTotal = useCallback(() =>
    items.reduce((total, item) => total + item.product.price * item.quantity, 0), [items]);

  const getCartCount = useCallback(() =>
    items.reduce((count, item) => count + item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartOpen,
        setIsCartOpen,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
