import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight, Briefcase } from "lucide-react";

const LaptopSleeves = () => {
  return (
    <Layout>
      <div className="container-veil py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Laptop Sleeves & Bags</span>
        </nav>

        <div className="text-center py-20">
          <Briefcase className="h-20 w-20 mx-auto text-primary mb-6" />
          <h1 className="text-4xl font-bold text-foreground">Laptop Sleeves & Bags</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Premium laptop sleeves and bags for the modern professional. Coming soon.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LaptopSleeves;
