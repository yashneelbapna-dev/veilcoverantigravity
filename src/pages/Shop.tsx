import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import VeilProductCard from "@/components/VeilProductCard";
import { products, deviceFamilies } from "@/data/products";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const materials = ['All', 'Matte', 'Clear', 'Leather', 'Aramid Fiber', 'Carbon Fiber'];
const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Best Selling', value: 'best-selling' },
];

const Shop = () => {
  const [device, setDevice] = useState('All');
  const [material, setMaterial] = useState('All');
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];
    if (device !== 'All') result = result.filter(p => p.deviceFamily === device);
    if (material !== 'All') result = result.filter(p => p.material === material);

    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'best-selling': result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'newest': result.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0)); break;
    }
    return result;
  }, [device, material, sort]);

  return (
    <Layout>
      {/* Page hero */}
      <section className="pt-8 pb-6">
        <div className="container-veil">
          <p className="text-xs text-muted-foreground mb-1">Home / Shop</p>
          <h1 className="font-display text-3xl md:text-[2.75rem] text-foreground">The Collection</h1>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-veil">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters - Desktop */}
            <aside className="hidden lg:block w-52 flex-shrink-0 space-y-8">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent mb-3">Device</h3>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setDevice('All')} className={`text-left text-sm ${device === 'All' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'} transition-colors`}>All Devices</button>
                  {deviceFamilies.map(d => (
                    <button key={d} onClick={() => setDevice(d)} className={`text-left text-sm ${device === d ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'} transition-colors`}>{d}</button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent mb-3">Material</h3>
                <div className="flex flex-col gap-2">
                  {materials.map(m => (
                    <button key={m} onClick={() => setMaterial(m)} className={`text-left text-sm ${material === m ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'} transition-colors`}>{m}</button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Mobile filter toggle */}
            <div className="lg:hidden flex items-center justify-between mb-2">
              <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 text-sm text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <select value={sort} onChange={e => setSort(e.target.value)} className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden overflow-hidden"
                >
                  <div className="bg-card rounded-xl p-4 mb-4 space-y-4 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Filters</span>
                      <button onClick={() => setFiltersOpen(false)}><X className="h-4 w-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setDevice('All')} className={`px-3 py-1.5 rounded-full text-xs ${device === 'All' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>All</button>
                      {deviceFamilies.map(d => (
                        <button key={d} onClick={() => setDevice(d)} className={`px-3 py-1.5 rounded-full text-xs ${device === d ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>{d}</button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {materials.map(m => (
                        <button key={m} onClick={() => setMaterial(m)} className={`px-3 py-1.5 rounded-full text-xs ${material === m ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product grid */}
            <div className="flex-1">
              <div className="hidden lg:flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">Showing {filtered.length} products</p>
                <select value={sort} onChange={e => setSort(e.target.value)} className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                  >
                    <VeilProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-20">No products match your filters.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
