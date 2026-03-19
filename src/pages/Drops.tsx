import { useRef, useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import VeilProductCard from "@/components/VeilProductCard";
import { getProductsByCollection } from "@/data/products";
import { motion, useInView } from "framer-motion";

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
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden" ref={ref}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        <div className="container-veil text-center relative z-10">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-[10px] font-medium uppercase tracking-[0.4em] text-accent mb-4">
            Exclusive Access
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-6xl text-foreground mb-3">
            THE VAULT
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-md mx-auto mb-10">
            Once they're gone, they're gone. Limited edition artist collaborations.
          </motion.p>

          {/* Countdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-5 md:gap-8 mb-10">
            {[
              { label: 'Days', value: time.d },
              { label: 'Hours', value: time.h },
              { label: 'Minutes', value: time.m },
              { label: 'Seconds', value: time.s },
            ].map(t => (
              <div key={t.label} className="text-center">
                <div className="text-4xl md:text-6xl font-bold text-foreground font-display tabular-nums leading-none">{String(t.value).padStart(2, '0')}</div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-2">{t.label}</p>
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
              className="flex-1 w-full bg-secondary border border-border rounded-full px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            />
            <button type="submit" disabled={subscribed} className="btn-gold px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap">
              {subscribed ? "You're in ✓" : "Notify Me"}
            </button>
          </motion.form>
        </div>
      </section>

      {/* Drops grid */}
      <section className="section-padding">
        <div className="container-veil">
          <h2 className="font-display text-2xl text-foreground mb-8">Current & Past Drops</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {drops.map(p => <VeilProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Drops;
