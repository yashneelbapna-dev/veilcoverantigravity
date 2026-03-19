import { useRef, useState, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import VeilProductCard from "@/components/VeilProductCard";
import { products, deviceFamilies, getProductsByDevice, getBestSellers, type DeviceFamily } from "@/data/products";
import { ArrowRight, Shield, Truck, Clock, Palette, Award, ChevronDown, Star } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { getResponsiveSrc, getSrcSet, COLLECTION_CARD_SIZES } from "@/lib/image";

/* ═══════════════════ HERO ═══════════════════ */
const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Animated gradient orb */}
    <div className="absolute inset-0">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-accent/3 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    </div>

    <div className="container-veil relative z-10 text-center px-4">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-[10px] md:text-xs font-medium uppercase tracking-[0.4em] text-accent mb-6"
      >
        New Collection 2025
      </motion.p>

      <motion.h1
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold text-foreground mb-6 leading-[1.05]"
      >
        Born to Protect.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto mb-10"
      >
        Ultra-premium cases engineered for the way you live.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link to="/shop" className="btn-gold px-10 py-4 rounded-full text-sm font-semibold tracking-wide">
          Shop Collection
        </Link>
        <Link to="/drops" className="btn-ghost-veil px-10 py-4 rounded-full text-sm font-medium tracking-wide">
          View Drops
        </Link>
      </motion.div>
    </div>

    {/* Scroll indicator */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
    >
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <ChevronDown className="h-5 w-5 text-muted-foreground/40" />
      </motion.div>
    </motion.div>
  </section>
);

/* ═══════════════════ TRUST TICKER ═══════════════════ */
const trustItems = [
  "✦ Free Worldwide Shipping",
  "✦ 30-Day Returns",
  "✦ MagSafe Compatible",
  "✦ 6ft Drop Tested",
  "✦ 2-Year Warranty",
  "✦ Artist Collaborations",
  "✦ Limited Drops",
];

const TrustBar = () => (
  <section className="py-3.5 border-y border-accent/10 bg-card overflow-hidden">
    <div className="flex animate-marquee whitespace-nowrap">
      {[...trustItems, ...trustItems].map((item, i) => (
        <span key={i} className="mx-8 text-[11px] md:text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground flex-shrink-0">
          {item}
        </span>
      ))}
    </div>
  </section>
);

/* ═══════════════════ FEATURED COLLECTIONS ═══════════════════ */
const collections = [
  { name: "Obsidian Series", tagline: "Matte. Minimal. Lethal.", image: "/images/collections/obsidian-hero.webp", href: "/collections/obsidian" },
  { name: "Limited Drops", tagline: "Never the same twice.", image: "/images/collections/drops-hero.webp", href: "/drops" },
  { name: "Clear Series", tagline: "See everything. Protect everything.", image: "/images/collections/clear-hero.webp", href: "/collections/clear" },
];

const FeaturedCollections = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-veil">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-[2.75rem] text-foreground text-center mb-12"
        >
          The Collections
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {collections.map((col, i) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <Link to={col.href} className="group relative block aspect-[3/4] overflow-hidden rounded-xl">
                <img src={getResponsiveSrc(col.image)} srcSet={getSrcSet(col.image)} sizes={COLLECTION_CARD_SIZES} alt={col.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent transition-opacity group-hover:from-background/80" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-lg font-bold text-foreground mb-0.5">{col.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{col.tagline}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-accent opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════ DEVICE SELECTOR ═══════════════════ */
const DeviceSelector = () => {
  const [selected, setSelected] = useState<DeviceFamily>('iPhone 17 Series');
  const filteredProducts = getProductsByDevice(selected);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="section-padding bg-card/50" ref={ref}>
      <div className="container-veil">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-[2.75rem] text-foreground text-center mb-10"
        >
          Find Your Case
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {deviceFamilies.map((family) => (
            <button
              key={family}
              onClick={() => setSelected(family)}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                selected === family
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {family}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {filteredProducts.map((product) => (
              <VeilProductCard key={product.id} product={product} />
            ))}
            {filteredProducts.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-16">Coming soon for this device.</p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-10">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════ BEST SELLERS ═══════════════════ */
const BestSellers = () => {
  const sellers = getBestSellers();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-veil">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="font-display text-3xl md:text-[2.75rem] text-foreground text-center mb-10"
        >
          Best Sellers
        </motion.h2>
        <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {sellers.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[260px] md:w-[280px] snap-start">
              <VeilProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════ DROPS TEASER ═══════════════════ */
const DropsTeaser = () => {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [email, setEmail] = useState("");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 7);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="section-padding bg-card/50 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
      <div className="container-veil relative z-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}}>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-accent mb-3">Next Drop</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">VEIL x VOID — Eclipse Edition</h2>
            <div className="flex gap-5 mb-8">
              {[
                { label: 'Days', value: time.d },
                { label: 'Hours', value: time.h },
                { label: 'Min', value: time.m },
                { label: 'Sec', value: time.s },
              ].map(t => (
                <div key={t.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-foreground font-display tabular-nums">{String(t.value).padStart(2, '0')}</div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{t.label}</p>
                </div>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); }} className="flex gap-2 max-w-sm">
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 bg-secondary border border-border rounded-full px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
              <button type="submit" className="btn-gold px-5 py-3 rounded-full text-sm font-semibold whitespace-nowrap">Get Early Access</button>
            </form>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} className="hidden md:flex justify-center">
            <div className="w-64 h-80 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/10 flex items-center justify-center">
              <span className="text-6xl font-display text-accent/20">?</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════ SOCIAL PROOF ═══════════════════ */

const SocialProof = forwardRef<HTMLElement>((_props, _ref) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-veil text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-accent mb-4">@veilcover</p>
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-accent text-accent" />)}
          </div>
          <p className="text-2xl md:text-3xl font-display text-foreground mb-2">Join 50,000+ customers</p>
          <p className="text-muted-foreground">protecting in style.</p>
        </motion.div>
      </div>
    </section>
  );
});

SocialProof.displayName = "SocialProof";

/* ═══════════════════ INDEX ═══════════════════ */
const Index = () => (
  <Layout>
    <Hero />
    <TrustBar />
    <FeaturedCollections />
    <DeviceSelector />
    <BestSellers />
    <DropsTeaser />
    <SocialProof />
  </Layout>
);

export default Index;
