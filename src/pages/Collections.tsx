import Layout from "@/components/layout/Layout";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const collections = [
  {
    name: "Obsidian Series",
    tagline: "Matte. Minimal. Lethal.",
    description: "Ultra-minimal matte finish with military-grade drop protection.",
    image: "/images/collections/obsidian-hero.webp",
    href: "/collections/obsidian",
  },
  {
    name: "Clear Series",
    tagline: "See everything. Protect everything.",
    description: "Zero-yellowing crystal clear protection that shows off your device.",
    image: "/images/collections/clear-hero.webp",
    href: "/collections/clear",
  },
  {
    name: "Limited Drops",
    tagline: "Never the same twice.",
    description: "Artist collaborations in numbered runs. Once they're gone, they're gone.",
    image: "/images/collections/drops-hero.webp",
    href: "/drops",
  },
  {
    name: "Leather Collection",
    tagline: "Age with intention.",
    description: "Vegetable-tanned Italian leather that develops a unique patina over time.",
    image: "/images/products/leather-brown-1.webp",
    href: "/shop",
  },
];

const Collections = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-card/40" />
        <div className="absolute inset-0 noise-texture" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/5 blur-[100px] rounded-full" />

        <div className="container-veil text-center relative z-10">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-semibold uppercase tracking-[0.35em] text-accent mb-4">
            Explore
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Collections
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base text-muted-foreground max-w-lg mx-auto">
            Curated phone protection for every aesthetic.
          </motion.p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="section-padding">
        <div className="container-veil">
          <div className="grid md:grid-cols-2 gap-6">
            {collections.map((col, i) => (
              <motion.div
                key={col.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <Link
                  to={col.href}
                  className="group relative block aspect-[16/9] overflow-hidden rounded-2xl"
                >
                  <img
                    src={col.image}
                    alt={col.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-1 font-display">{col.name}</h2>
                    <p className="text-sm text-muted-foreground mb-1">{col.tagline}</p>
                    <p className="text-xs text-muted-foreground/70 mb-4 max-w-sm">{col.description}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Explore Collection <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Highlight Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-accent/10 border border-accent/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-1">New</p>
              <p className="text-lg font-display text-foreground">iPhone 17 Series cases now available</p>
            </div>
            <Link to="/shop" className="btn-gold px-8 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Collections;
