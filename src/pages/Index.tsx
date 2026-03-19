import { useRef, useState, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import VeilProductCard from "@/components/VeilProductCard";
import { products, deviceFamilies, getProductsByDevice, getBestSellers, type DeviceFamily } from "@/data/products";
import { ArrowRight, Shield, Truck, Clock, Palette, Award, ChevronDown, Star, Sparkles } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { getResponsiveSrc, getSrcSet, COLLECTION_CARD_SIZES } from "@/lib/image";

/* ═══════════════════ HERO — STITCH REDESIGN ═══════════════════ */
const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Animated gradient orbs */}
    <div className="absolute inset-0">
      <div className="absolute top-1/3 left-1/2 w-[700px] h-[700px] rounded-full bg-accent/10 blur-[180px] hero-orb" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[140px] hero-orb-2" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-accent/3 blur-[100px] hero-orb-2" style={{ animationDelay: '4s' }} />
    </div>

    {/* Noise texture */}
    <div className="absolute inset-0 noise-texture" />

    <div className="container-veil relative z-10 text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.9 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-8"
      >
        <Sparkles className="h-3 w-3 text-accent" />
        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.35em] text-accent">
          New Collection 2025
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.9 }}
        className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-foreground mb-6 leading-[1.02]"
      >
        Born to <span className="gold-text">Protect.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed"
      >
        Ultra-premium cases engineered for the way you live.
        Merging high-fashion aesthetics with military-grade durability.
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
      transition={{ delay: 1.8 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2"
    >
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        <ChevronDown className="h-5 w-5 text-muted-foreground/40" />
      </motion.div>
    </motion.div>
  </section>
);

/* ═══════════════════ TRUST TICKER — STITCH REDESIGN ═══════════════════ */
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
  <section className="py-4 border-y border-accent/10 bg-card/60 overflow-hidden">
    <div className="flex animate-marquee whitespace-nowrap">
      {[...trustItems, ...trustItems, ...trustItems].map((item, i) => (
        <span key={i} className="mx-10 text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground/70 flex-shrink-0">
          {item}
        </span>
      ))}
    </div>
  </section>
);

/* ═══════════════════ FEATURED COLLECTIONS — STITCH REDESIGN ═══════════════════ */
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">Curated For You</p>
          <h2 className="font-display text-3xl md:text-[2.75rem] text-foreground">
            The Collections
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {collections.map((col, i) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.7 }}
            >
              <Link to={col.href} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl">
                <img src={getResponsiveSrc(col.image)} srcSet={getSrcSet(col.image)} sizes={COLLECTION_CARD_SIZES} alt={col.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 collection-overlay transition-opacity group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <h3 className="text-xl font-bold text-foreground mb-1 font-display">{col.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{col.tagline}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
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

/* ═══════════════════ DEVICE SELECTOR — STITCH REDESIGN ═══════════════════ */
const DeviceSelector = () => {
  const [selected, setSelected] = useState<DeviceFamily>('iPhone 17 Series');
  const filteredProducts = getProductsByDevice(selected);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="section-padding bg-card/40" ref={ref}>
      <div className="container-veil">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">Shop By Device</p>
          <h2 className="font-display text-3xl md:text-[2.75rem] text-foreground">
            Find Your Case
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {deviceFamilies.map((family) => (
            <button
              key={family}
              onClick={() => setSelected(family)}
              className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                selected === family
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
            >
              {family}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {filteredProducts.map((product) => (
              <VeilProductCard key={product.id} product={product} />
            ))}
            {filteredProducts.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-20 font-display text-lg italic">Coming soon for this device.</p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-12">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all duration-300">
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════ BEST SELLERS — STITCH REDESIGN ═══════════════════ */
const BestSellers = () => {
  const sellers = getBestSellers();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-veil">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">Most Popular</p>
            <h2 className="font-display text-3xl md:text-[2.75rem] text-foreground">
              Best Sellers
            </h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all duration-300">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {sellers.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[260px] md:w-[290px] snap-start">
              <VeilProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════ DROPS TEASER — STITCH REDESIGN ═══════════════════ */
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
      <div className="absolute inset-0 noise-texture" />
      {/* Accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 blur-[120px] rounded-full" />

      <div className="container-veil relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent mb-4">Next Drop</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] text-foreground mb-8 leading-tight">
              VEIL x VOID — <br className="hidden sm:block" />Eclipse Edition
            </h2>
            <div className="flex gap-6 md:gap-8 mb-10">
              {[
                { label: 'Days', value: time.d },
                { label: 'Hours', value: time.h },
                { label: 'Min', value: time.m },
                { label: 'Sec', value: time.s },
              ].map(t => (
                <div key={t.label} className="text-center">
                  <div className="text-3xl md:text-5xl font-bold text-foreground countdown-num leading-none">
                    {String(t.value).padStart(2, '0')}
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-2 font-medium">{t.label}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">Join the whitelist for priority 1-hour early access.</p>
            <form onSubmit={e => { e.preventDefault(); }} className="flex gap-2.5 max-w-sm">
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 bg-secondary border border-border rounded-full px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow" />
              <button type="submit" className="btn-gold px-6 py-3.5 rounded-full text-sm font-semibold whitespace-nowrap">Get Early Access</button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30, scale: 0.95 }} animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}} transition={{ duration: 0.7 }} className="hidden md:flex justify-center">
            <div className="w-72 h-96 rounded-3xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/15 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <span className="text-7xl font-display text-accent/20 block mb-2">?</span>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">Coming Soon</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════ SOCIAL PROOF — STITCH REDESIGN ═══════════════════ */
const SocialProof = forwardRef<HTMLElement>((_props, _ref) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-veil text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent mb-5">@veilcover</p>
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-accent text-accent" />)}
          </div>
          <p className="text-3xl md:text-4xl font-display text-foreground mb-3">Join 50,000+ customers</p>
          <p className="text-muted-foreground text-lg italic font-display">protecting in style.</p>
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "The most secure case I've ever owned, and it fits perfectly with my minimalist aesthetic. Truly protecting in style."
            </p>
            <p className="text-xs text-accent font-semibold mt-3 tracking-wide">— VERIFIED BUYER</p>
          </div>
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
