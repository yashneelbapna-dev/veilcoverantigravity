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

const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center" ref={ref}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        <div className="container-veil relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="font-display text-4xl md:text-6xl text-foreground mb-6">
            About VEIL
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crafted in limited quantities. Designed to outlast trends.
          </motion.p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="section-padding">
        <div className="container-veil max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p className="text-foreground text-xl font-display italic">
              "We built VEIL because protection shouldn't mean ugly."
            </p>
            <p>
              Every VEIL case begins as a digital sculpture, refined over weeks until the proportions feel inevitable. We obsess over button tactility, edge chamfers, and the satisfying click of a perfect fit.
            </p>
            <p>
              Our small team works with material specialists globally to produce cases that blur the line between technology and art. We use polycarbonate shells, TPU bumpers, matte coatings, and embedded MagSafe rings.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Materials */}
      <section className="section-padding bg-card/50">
        <div className="container-veil">
          <h2 className="font-display text-3xl text-foreground text-center mb-12">Materials & Craft</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Polycarbonate Shell", desc: "Hard outer shell for impact resistance." },
              { icon: Layers, title: "TPU Bumper", desc: "Flexible inner frame absorbs shock energy." },
              { icon: Recycle, title: "Matte Coating", desc: "Soft-touch finish that resists fingerprints." },
              { icon: Award, title: "MagSafe Ring", desc: "Embedded magnets for perfect alignment." },
            ].map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/20 text-accent">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding">
        <div className="container-veil">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-foreground font-display">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-card/50">
        <div className="container-veil text-center">
          <h2 className="font-display text-3xl text-foreground mb-3">Made to last. Designed to stand out.</h2>
          <p className="text-muted-foreground mb-8">Protection has never looked this good.</p>
          <Link to="/shop" className="btn-gold inline-block px-10 py-4 rounded-full text-sm font-semibold tracking-wide">
            Shop Now
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default About;
