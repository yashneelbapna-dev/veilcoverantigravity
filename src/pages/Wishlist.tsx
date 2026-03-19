import Layout from "@/components/layout/Layout";
import VeilProductCard from "@/components/VeilProductCard";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { products as veilProducts } from "@/data/products";

const Wishlist = () => {
  const { wishlistIds } = useWishlist();
  
  const wishlistedProducts = veilProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <Layout>
      <div className="container-veil section-padding">
        <h1 className="font-display text-3xl text-foreground mb-8">My Wishlist</h1>

        {wishlistedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-xl font-medium text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save your favorite items here for later</p>
            <Link to="/shop" className="btn-gold inline-block px-8 py-3.5 rounded-full text-sm font-semibold">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">{wishlistedProducts.length} item{wishlistedProducts.length !== 1 ? "s" : ""} saved</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {wishlistedProducts.map((product) => (
                <VeilProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
