import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/collections";
import { Link } from "react-router-dom";
import { ChevronRight, Smartphone } from "lucide-react";

const IPhone = () => {
  const iphoneProducts = products.filter((p) =>
    p.phoneModels.some((m) => m.toLowerCase().includes("iphone"))
  );

  return (
    <Layout>
      <div className="container-veil py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-muted-foreground">Shop by Apple</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">iPhone</span>
        </nav>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Smartphone className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">iPhone Accessories</h1>
          </div>
          <p className="max-w-2xl text-muted-foreground">
            Premium cases and accessories designed specifically for your iPhone.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {iphoneProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default IPhone;
