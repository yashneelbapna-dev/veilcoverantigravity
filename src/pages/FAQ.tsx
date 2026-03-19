import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, ChevronDown, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const categories = ['All', 'Orders', 'Shipping', 'Products', 'Returns', 'Account'];

const faqs = [
  { category: 'Shipping', q: "How long does shipping take?", a: "We ship worldwide with free shipping on all orders. Standard delivery takes 5-7 business days. Express shipping (2-3 days) is available at checkout for select regions." },
  { category: 'Returns', q: "What is your return policy?", a: "We offer a 30-day hassle-free return policy. If you're not completely satisfied with your purchase, return it in its original condition for a full refund. We'll even cover the return shipping." },
  { category: 'Products', q: "Are your cases MagSafe compatible?", a: "Yes! All our iPhone cases feature precisely embedded N52 magnets for perfect MagSafe alignment. This ensures your case works seamlessly with MagSafe chargers, wallets, and accessories." },
  { category: 'Orders', q: "How do I track my order?", a: "Once your order ships, you'll receive an email with a tracking number. You can also track your order anytime by visiting our Track Order page and entering your order ID." },
  { category: 'Products', q: "What materials do you use?", a: "We use premium materials including polycarbonate shells for impact resistance, TPU bumpers for shock absorption, matte soft-touch coatings, genuine leather, Aramid fiber, and carbon fiber for our premium lines." },
  { category: 'Shipping', q: "Do you ship internationally?", a: "Absolutely. We ship to over 40 countries worldwide with free standard shipping. International orders typically arrive within 7-14 business days depending on your location." },
  { category: 'Products', q: "What's your warranty?", a: "Every VEIL case comes with a 2-year warranty against manufacturing defects. If your case cracks, yellows, or shows signs of manufacturing defects within 2 years, we'll replace it free of charge." },
  { category: 'Products', q: "How do I care for my case?", a: "For matte cases, wipe with a soft cloth. For leather cases, use a leather conditioner occasionally. Clear cases can be cleaned with mild soap and water. Avoid abrasive cleaners on all case types." },
];

const FAQ = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || faq.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-card/40" />
        <div className="absolute inset-0 noise-texture" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/5 blur-[100px] rounded-full" />

        <div className="container-veil text-center relative z-10">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-semibold uppercase tracking-[0.35em] text-accent mb-4">
            Support
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base text-muted-foreground max-w-lg mx-auto">
            Find answers to common questions about our products, shipping, and more.
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-veil max-w-3xl">
          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-full pl-12 pr-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  category === cat
                    ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="border border-border rounded-2xl overflow-hidden bg-card/50 hover:border-accent/20 transition-colors duration-200"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-accent' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-sm text-muted-foreground px-6 pb-5 leading-relaxed">{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-display text-lg italic mb-3">No matching questions found.</p>
              <button onClick={() => { setSearch(''); setCategory('All'); }} className="text-sm text-accent hover:underline font-semibold">Clear filters</button>
            </div>
          )}

          {/* Still Need Help */}
          <div className="mt-16 text-center bg-card/50 rounded-3xl border border-border p-12">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 text-accent">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl text-foreground mb-3">Still Need Help?</h3>
            <p className="text-muted-foreground mb-6">Our team is here to help. Get in touch and we'll respond within 24 hours.</p>
            <Link to="/contact" className="btn-gold inline-block px-8 py-3.5 rounded-full text-sm font-semibold">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
