import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Shield, Layers, Recycle, Award } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { value: "50,000+", label: "Customers" },
  { value: "6ft", label: "Drop Tested" },
  { value: "40+", label: "Countries" },
  { value: "2yr", label: "Warranty" },
];

const materials = [
  { icon: Shield, title: "Polycarbonate Shell", desc: "Hard outer shell engineered for maximum impact resistance and structural integrity." },
  { icon: Layers, title: "TPU Bumper", desc: "Flexible inner frame that absorbs and disperses shock energy on impact." },
  { icon: Recycle, title: "Matte Coating", desc: "Soft-touch finish that resists fingerprints and provides premium grip." },
  { icon: Award, title: "MagSafe Ring", desc: "Precision-embedded N52 magnets for perfect alignment every time." },
];

const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden" ref={ref}>
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/8 blur-[150px] hero-orb" />
        </div>
        <div className="absolute inset-0 noise-texture" />

        <div className="container-veil relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-xs font-semibold uppercase tracking-[0.35em] text-accent mb-5">
            Our Story
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-6xl text-foreground mb-6">
            About <span className="gold-text">VEIL</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Crafted in limited quantities. Designed to outlast trends.
          </motion.p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="section-padding">
        <div className="container-veil max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            <div className="relative pl-6 border-l-2 border-accent/30">
              <p className="text-foreground text-xl md:text-2xl font-display italic leading-relaxed">
                "We built VEIL because protection shouldn't mean ugly."
              </p>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Every VEIL case begins as a digital sculpture, refined over weeks until the proportions feel inevitable. We obsess over button tactility, edge chamfers, and the satisfying click of a perfect fit.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our small team works with material specialists globally to produce cases that blur the line between technology and art. We use polycarbonate shells, TPU bumpers, matte coatings, and embedded MagSafe rings — each chosen for a reason.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Materials */}
      <section className="section-padding bg-card/40">
        <div className="container-veil">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">Engineering Excellence</p>
            <h2 className="font-display text-3xl md:text-[2.5rem] text-foreground">Materials & Craft</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 md:gap-8">
            {materials.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }} className="text-center group">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/20 text-accent group-hover:bg-accent/5 group-hover:border-accent/40 transition-all duration-300">
                  <v.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding">
        <div className="container-veil">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-foreground font-display leading-none">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-2 font-medium tracking-wide">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-card/40 relative overflow-hidden">
        <div className="absolute inset-0 noise-texture" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/5 blur-[100px] rounded-full" />

        <div className="container-veil text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Made to last. Designed to stand out.</h2>
          <p className="text-muted-foreground mb-10 text-lg">Protection has never looked this good.</p>
          <Link to="/shop" className="btn-gold inline-block px-12 py-4 rounded-full text-sm font-semibold tracking-wide">
            Shop Now
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default About;
