import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const artists = [
  {
    name: "VOID",
    title: "Digital Artist & Creative Director",
    quote: "Protection should be invisible. Art should not.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fm=webp",
    collection: "Eclipse Edition",
    pieces: 3,
  },
  {
    name: "NULL",
    title: "Sculptor & Material Experimentalist",
    quote: "I wanted to capture the texture of digital darkness in something you can hold.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&fm=webp",
    collection: "Obsidian Haze",
    pieces: 2,
  },
];

const Collab = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding" ref={ref}>
        <div className="container-veil text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-[10px] font-medium uppercase tracking-[0.4em] text-accent mb-4">
            Artist Series
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-6xl text-foreground mb-6">
            Art Meets Protection
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-lg mx-auto">
            We work with boundary-pushing creators to make cases that transcend function.
          </motion.p>
        </div>
      </section>

      {/* Artists */}
      <section className="pb-24">
        <div className="container-veil space-y-24">
          {artists.map((artist, i) => (
            <motion.div
              key={artist.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? '' : ''}`}
            >
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-card">
                  <img src={artist.image} alt={artist.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
              </div>
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-accent mb-3">{artist.collection} · {artist.pieces} pieces</p>
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-2">{artist.name}</h2>
                <p className="text-sm text-muted-foreground mb-6">{artist.title}</p>
                <blockquote className="text-lg md:text-xl text-foreground/80 italic font-display border-l-2 border-accent pl-6 mb-8">
                  "{artist.quote}"
                </blockquote>
                <Link to="/drops" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                  View Collection <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-card/50">
        <div className="container-veil text-center">
          <h2 className="font-display text-2xl text-foreground mb-4">Are you a creator?</h2>
          <p className="text-muted-foreground mb-6">Let's make something together.</p>
          <Link to="/contact" className="btn-gold inline-block px-8 py-3.5 rounded-full text-sm font-semibold">
            Get in Touch
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Collab;
