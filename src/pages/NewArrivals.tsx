import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import SortDropdown, { SortOption } from "@/components/SortDropdown";
import QuickViewModal from "@/components/QuickViewModal";
import { products, Product } from "@/data/collections";

const NewArrivals = () => {
  const [searchParams] = useSearchParams();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const sortOption = (searchParams.get("sort") as SortOption) || "newest";

  const newArrivalsProducts = useMemo(() => {
    const filtered = products.filter((p) => p.collections.includes("new-arrivals"));
    switch (sortOption) {
      case "price_asc": return filtered.sort((a, b) => a.price - b.price);
      case "price_desc": return filtered.sort((a, b) => b.price - a.price);
      case "highest_rated": return filtered.sort((a, b) => b.rating - a.rating);
      case "best_selling": return filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      default: return filtered;
    }
  }, [sortOption]);

  return (
    <Layout>
      <div className="container-veil py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Fresh Designs</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">New Arrivals</h1>
            <p className="mt-2 text-muted-foreground">{newArrivalsProducts.length} products</p>
          </div>
          <SortDropdown />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {newArrivalsProducts.map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={() => setQuickViewProduct(product)} />
          ))}
        </div>

        <QuickViewModal product={quickViewProduct} open={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      </div>
    </Layout>
  );
};

export default NewArrivals;
