import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlistIds: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  clearWishlist: () => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "veil_wishlist";

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize wishlist from localStorage on mount (only when not logged in)
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem(STORAGE_KEY);
      setWishlistIds(saved ? JSON.parse(saved) : []);
    }
  }, []);

  // Clear wishlist when user logs out, load from Supabase when user logs in
  useEffect(() => {
    if (user) {
      // User logged in - load from Supabase
      syncWithSupabase();
    } else {
      // User logged out - clear wishlist state (localStorage already cleared by signOut)
      const saved = localStorage.getItem(STORAGE_KEY);
      setWishlistIds(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  // Sync with localStorage only when not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, user]);

  // Function to clear wishlist on logout (called from AuthContext)
  const clearWishlist = () => {
    localStorage.removeItem(STORAGE_KEY);
    setWishlistIds([]);
  };

  const syncWithSupabase = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch existing wishlist from Supabase
      const { data: dbWishlist, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const dbIds = dbWishlist?.map((item) => item.product_id) || [];
      const localIds = [...wishlistIds];

      // Merge local and db wishlists
      const mergedIds = [...new Set([...localIds, ...dbIds])];

      // Add any local items not in db
      const toAdd = localIds.filter((id) => !dbIds.includes(id));
      for (const productId of toAdd) {
        await supabase.from("wishlist").upsert(
          { user_id: user.id, product_id: productId },
          { onConflict: "user_id,product_id" }
        );
      }

      setWishlistIds(mergedIds);
    } catch (error) {
      console.error("Error syncing wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (wishlistIds.includes(productId)) return;

    setWishlistIds((prev) => [...prev, productId]);
    toast({ title: "Added to wishlist", description: "Item saved to your wishlist" });

    if (user) {
      try {
        await supabase.from("wishlist").upsert(
          { user_id: user.id, product_id: productId },
          { onConflict: "user_id,product_id" }
        );
      } catch (error) {
        console.error("Error adding to wishlist:", error);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    toast({ title: "Removed from wishlist", description: "Item removed from your wishlist" });

    if (user) {
      try {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } catch (error) {
        console.error("Error removing from wishlist:", error);
      }
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const getWishlistCount = () => wishlistIds.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistCount,
        clearWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
