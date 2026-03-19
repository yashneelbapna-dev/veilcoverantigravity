import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight, Tablet } from "lucide-react";

const IPad = () => {
  return (
    <Layout>
      <div className="container-veil py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-muted-foreground">Shop by Apple</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">iPad</span>
        </nav>

        <div className="text-center py-20">
          <Tablet className="h-20 w-20 mx-auto text-primary mb-6" />
          <h1 className="text-4xl font-bold text-foreground">iPad Accessories</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Cases, keyboards, and accessories for your iPad. Coming soon.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default IPad;
