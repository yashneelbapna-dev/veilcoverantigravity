import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import VeilProductCard from "@/components/VeilProductCard";
import { products, deviceFamilies } from "@/data/products";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

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

  const activeFilterCount = (device !== 'All' ? 1 : 0) + (material !== 'All' ? 1 : 0);

  return (
    <Layout>
      {/* Page hero */}
      <section className="pt-8 pb-6">
        <div className="container-veil">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Shop</span>
          </nav>
          <h1 className="font-display text-3xl md:text-[2.75rem] text-foreground">The Collection</h1>
          <p className="text-sm text-muted-foreground mt-2">Explore our full range of premium cases.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-veil">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar filters — Desktop */}
            <aside className="hidden lg:block w-56 flex-shrink-0 space-y-10">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-4">Device</h3>
                <div className="flex flex-col gap-2.5">
                  <button onClick={() => setDevice('All')} className={`text-left text-sm transition-colors duration-200 ${device === 'All' ? 'text-accent font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>All Devices</button>
                  {deviceFamilies.map(d => (
                    <button key={d} onClick={() => setDevice(d)} className={`text-left text-sm transition-colors duration-200 ${device === d ? 'text-accent font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>{d}</button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-4">Material</h3>
                <div className="flex flex-col gap-2.5">
                  {materials.map(m => (
                    <button key={m} onClick={() => setMaterial(m)} className={`text-left text-sm transition-colors duration-200 ${material === m ? 'text-accent font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>{m}</button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setDevice('All'); setMaterial('All'); }}
                  className="text-xs text-accent hover:text-accent/80 transition-colors font-medium"
                >
                  Clear all filters ({activeFilterCount})
                </button>
              )}
            </aside>

            {/* Mobile filter toggle */}
            <div className="lg:hidden flex items-center justify-between mb-2">
              <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
                )}
              </button>
              <select value={sort} onChange={e => setSort(e.target.value)} className="bg-secondary border border-border rounded-full px-4 py-2 text-sm text-foreground">
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
                  <div className="bg-card rounded-2xl p-5 mb-4 space-y-5 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Filters</span>
                      <button onClick={() => setFiltersOpen(false)}><X className="h-4 w-4" /></button>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-2">Device</p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setDevice('All')} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${device === 'All' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>All</button>
                        {deviceFamilies.map(d => (
                          <button key={d} onClick={() => setDevice(d)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${device === d ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>{d}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-2">Material</p>
                      <div className="flex flex-wrap gap-2">
                        {materials.map(m => (
                          <button key={m} onClick={() => setMaterial(m)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${material === m ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>{m}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product grid */}
            <div className="flex-1">
              <div className="hidden lg:flex items-center justify-between mb-8">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="text-foreground font-semibold">{filtered.length}</span> products
                </p>
                <select value={sort} onChange={e => setSort(e.target.value)} className="bg-secondary border border-border rounded-full px-4 py-2 text-sm text-foreground">
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
                <div className="text-center py-24">
                  <p className="text-lg font-display text-muted-foreground italic mb-4">No products match your filters.</p>
                  <button onClick={() => { setDevice('All'); setMaterial('All'); }} className="text-sm text-accent hover:underline font-semibold">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
