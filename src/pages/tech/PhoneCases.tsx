import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/collections";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const PhoneCases = () => {
  // For now, show all products as phone cases
  const phoneCases = products;

  return (
    <Layout>
      <div className="container-veil py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Phone Cases</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Phone Cases</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Premium protection meets minimalist design. Our phone cases are engineered for perfect fit and maximum protection.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {phoneCases.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PhoneCases;
