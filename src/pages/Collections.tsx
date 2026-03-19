import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getResponsiveSrc, getSrcSet, COLLECTION_CARD_SIZES } from "@/lib/image";

const collectionsData = [
  { name: "Obsidian Series", slug: "obsidian", description: "Matte. Minimal. Lethal.", image: "/images/collections/obsidian-hero.webp" },
  { name: "Clear Series", slug: "clear", description: "See everything. Protect everything.", image: "/images/collections/clear-hero.webp" },
  { name: "Limited Drops", slug: "drops", description: "Never the same twice.", image: "/images/collections/drops-hero.webp" },
];

const Collections = () => (
  <Layout>
    <section className="section-padding">
      <div className="container-veil">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-[2.75rem] text-foreground">Collections</h1>
          <p className="text-muted-foreground mt-2">Explore our curated series.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {collectionsData.map((col, i) => (
            <motion.div key={col.slug} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={col.slug === 'drops' ? '/drops' : `/collections/${col.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-xl">
                <img src={getResponsiveSrc(col.image)} srcSet={getSrcSet(col.image)} sizes={COLLECTION_CARD_SIZES} alt={col.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-lg font-bold text-foreground mb-0.5">{col.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{col.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
                    View Collection <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Collections;
