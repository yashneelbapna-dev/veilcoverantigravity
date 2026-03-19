import { useRef, useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import VeilProductCard from "@/components/VeilProductCard";
import { getProductsByCollection } from "@/data/products";
import { motion, useInView } from "framer-motion";
import { Lock } from "lucide-react";

const drops = getProductsByCollection('drops');

const Drops = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

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
    <Layout>
      {/* Hero — THE VAULT */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden" ref={ref}>
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent/8 blur-[180px] hero-orb" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-accent/4 blur-[120px] hero-orb-2" />
        </div>
        <div className="absolute inset-0 noise-texture" />

        <div className="container-veil text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-6">
            <Lock className="h-3 w-3 text-accent" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">Exclusive Access</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-7xl text-foreground mb-4">
            THE <span className="gold-text">VAULT</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-md mx-auto mb-12 leading-relaxed">
            Once they're gone, they're gone. Limited edition artist collaborations.
          </motion.p>

          {/* Countdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-6 md:gap-10 mb-12">
            {[
              { label: 'Days', value: time.d },
              { label: 'Hours', value: time.h },
              { label: 'Minutes', value: time.m },
              { label: 'Seconds', value: time.s },
            ].map((t, i) => (
              <div key={t.label} className="text-center">
                <div className="text-4xl md:text-6xl font-bold text-foreground countdown-num leading-none">{String(t.value).padStart(2, '0')}</div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-2 font-medium">{t.label}</p>
                {i < 3 && <span className="hidden md:inline-block text-accent/30 text-3xl font-light absolute translate-x-8 -translate-y-10">:</span>}
              </div>
            ))}
          </motion.div>

          {/* Email waitlist */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            onSubmit={e => { e.preventDefault(); if (email.trim()) setSubscribed(true); }}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={subscribed}
              className="flex-1 w-full bg-secondary border border-border rounded-full px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 transition-shadow"
            />
            <button type="submit" disabled={subscribed} className="btn-gold px-6 py-3.5 rounded-full text-sm font-semibold whitespace-nowrap">
              {subscribed ? "You're in ✓" : "Notify Me"}
            </button>
          </motion.form>
        </div>
      </section>

      {/* Drops grid */}
      <section className="section-padding">
        <div className="container-veil">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">Archive</p>
              <h2 className="font-display text-2xl md:text-3xl text-foreground">Current & Past Drops</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {drops.map(p => <VeilProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Drops;
