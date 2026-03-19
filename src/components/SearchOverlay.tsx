import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, Clock, Trash2 } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { useAuth } from "@/contexts/AuthContext";
import { products as veilProducts, VeilProduct } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

// Unified search item type
interface SearchResult {
  id: string;
  name: string;
  price: number;
  image: string;
  material: string;
  link: string;
}

// Build searchable list from veilProducts only (products with actual detail pages)
const allSearchItems: (SearchResult & { _searchText: string })[] = [
  ...veilProducts.map((p: VeilProduct) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images[0] || "",
    material: p.material,
    link: `/product/${p.slug}`,
    _searchText: [p.name, p.material, p.device, p.deviceFamily, p.collection, ...p.colors.map(c => c.name)].join(" ").toLowerCase(),
  })),
];

interface SearchHistoryItem {
  id: string;
  query_text: string;
  created_at: string;
}

const SearchOverlay = () => {
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery } = useSearch();
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
      // Show history when opening if user is logged in and no query
      if (user && !searchQuery.trim()) {
        fetchSearchHistory();
        setShowHistory(true);
      }
    }
  }, [isSearchOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      if (user) {
        setShowHistory(true);
      }
      return;
    }

    setShowHistory(false);
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = (allSearchItems as (SearchResult & { _searchText: string })[]).filter(
        (item) => item._searchText.includes(query)
      );
      // Deduplicate by name (veilProducts may share names across devices)
      const seen = new Set<string>();
      const unique = filtered.filter(item => {
        const key = item.name + item.price;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setResults(unique);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  const fetchSearchHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("search_history")
        .select("id, query_text, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setSearchHistory(data || []);
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const saveSearchQuery = async (query: string) => {
    if (!user || !query.trim()) return;

    try {
      // Check if this exact query already exists
      const { data: existing } = await supabase
        .from("search_history")
        .select("id")
        .eq("user_id", user.id)
        .eq("query_text", query.trim())
        .maybeSingle();

      if (existing) {
        // Update timestamp of existing query
        await supabase
          .from("search_history")
          .delete()
          .eq("id", existing.id);
      }

      // Insert new query
      await supabase
        .from("search_history")
        .insert({
          user_id: user.id,
          query_text: query.trim(),
        });
    } catch (error) {
      console.error("Error saving search query:", error);
    }
  };

  const handleResultClick = () => {
    if (searchQuery.trim()) {
      saveSearchQuery(searchQuery);
    }
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
  };

  const clearHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await supabase.from("search_history").delete().eq("id", id);
      setSearchHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting search history item:", error);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm">
      <div className="container-veil py-8">
        {/* Close button */}
        <button
          onClick={() => setIsSearchOpen(false)}
          className="absolute right-6 top-6 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Search input */}
        <div className="max-w-2xl mx-auto mt-20">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (user && !searchQuery.trim()) {
                  fetchSearchHistory();
                  setShowHistory(true);
                }
              }}
              placeholder="Search products..."
              className="w-full rounded-full border-2 border-primary/30 bg-card px-16 py-5 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              ESC
            </span>
          </div>

          {/* Search History */}
          {showHistory && searchHistory.length > 0 && !searchQuery.trim() && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Searches
              </p>
              <div className="space-y-2">
                {searchHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistoryClick(item.query_text)}
                    className="w-full flex items-center justify-between gap-3 rounded-lg border border-primary/10 bg-card p-3 text-left transition-all hover:border-primary/30 hover:bg-muted/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{item.query_text}</span>
                    </div>
                    <button
                      onClick={(e) => clearHistoryItem(item.id, e)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="mt-8 max-h-[60vh] overflow-y-auto">
            {searchQuery && results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found for "{searchQuery}"</p>
                <p className="text-sm text-muted-foreground mt-2">Try searching for different keywords</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={product.link}
                    onClick={handleResultClick}
                    className="flex gap-4 rounded-xl border border-primary/10 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.material}</p>
                      <p className="mt-1 font-semibold text-primary">
                        ₹{product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;