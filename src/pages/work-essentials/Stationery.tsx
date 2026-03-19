import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight, PenTool } from "lucide-react";

const Stationery = () => {
  return (
    <Layout>
      <div className="container-veil py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-green-500 font-medium">Work Essentials</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Stationery</span>
        </nav>

        <div className="text-center py-20">
          <PenTool className="h-20 w-20 mx-auto text-green-500 mb-6" />
          <h1 className="text-4xl font-bold text-foreground">Stationery</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Premium notebooks, pens, and stationery for professionals. Coming soon.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Stationery;
