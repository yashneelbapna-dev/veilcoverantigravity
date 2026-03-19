import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import VeilProductCard from "@/components/VeilProductCard";
import { getProductsByCollection } from "@/data/products";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const collectionMeta: Record<string, { name: string; description: string }> = {
  obsidian: {
    name: "Obsidian Series",
    description: "Matte black ultra-minimal. Military-grade protection meets stealth aesthetics.",
  },
  clear: {
    name: "Clear Series",
    description: "Premium transparent protection. Show off your device with zero yellowing.",
  },
  drops: {
    name: "Limited Drops",
    description: "Exclusive artist collaborations. Once they're gone, they're gone.",
  },
};

const CollectionDetail = () => {
  const { slug } = useParams();
  const meta = collectionMeta[slug || ''];
  const collectionProducts = getProductsByCollection(slug || '');

  if (!meta) {
    return (
      <Layout>
        <div className="container-veil section-padding text-center">
          <h1 className="text-h2 font-display text-foreground mb-4">Collection Not Found</h1>
          <Link to="/collections" className="text-accent hover:underline">View All Collections</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-veil">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{meta.name}</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="font-display text-h1 md:text-display-sm text-foreground">{meta.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">{meta.description}</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {collectionProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <VeilProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CollectionDetail;
