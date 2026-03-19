import { useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { collections } from "@/data/collections";

interface ShopFiltersProps {
  selectedCollections: string[];
  onCollectionsChange: (collections: string[]) => void;
  selectedMaterials: string[];
  onMaterialsChange: (materials: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const materials = [
  "Full-Grain Leather",
  "Italian Leather",
  "Nappa Leather",
  "Vegetable-Tanned Leather",
  "Premium Silicone",
  "Matte Polycarbonate",
  "Crystal Clear TPU",
  "Ultra-Thin PP",
  "Aluminum Frame",
  "Brushed Metal",
  "Soft-Touch Plastic",
  "Matte Finish TPU",
];

const priceRanges = [
  { label: "Under ₹2,000", range: [0, 2000] as [number, number] },
  { label: "₹2,000 - ₹3,500", range: [2000, 3500] as [number, number] },
  { label: "₹3,500 - ₹5,000", range: [3500, 5000] as [number, number] },
  { label: "Over ₹5,000", range: [5000, 10000] as [number, number] },
];

const ShopFilters = ({
  selectedCollections,
  onCollectionsChange,
  selectedMaterials,
  onMaterialsChange,
  priceRange,
  onPriceRangeChange,
  onClearFilters,
  isMobile,
  onClose,
}: ShopFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["collections", "price", "material"]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const toggleCollection = (collectionId: string) => {
    onCollectionsChange(
      selectedCollections.includes(collectionId)
        ? selectedCollections.filter((c) => c !== collectionId)
        : [...selectedCollections, collectionId]
    );
  };

  const toggleMaterial = (material: string) => {
    onMaterialsChange(
      selectedMaterials.includes(material)
        ? selectedMaterials.filter((m) => m !== material)
        : [...selectedMaterials, material]
    );
  };

  const activeFiltersCount =
    selectedCollections.length + selectedMaterials.length + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  return (
    <div className={cn(
      "space-y-6",
      isMobile && "p-4"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-foreground" />
          <h3 className="font-semibold text-foreground">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="rounded-full text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
          {isMobile && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Collections */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection("collections")}
          className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground"
        >
          Collections
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              expandedSections.includes("collections") && "rotate-180"
            )}
          />
        </button>
        {expandedSections.includes("collections") && (
          <div className="mt-3 space-y-2 animate-fade-in">
            {collections.map((collection) => (
              <label
                key={collection.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={selectedCollections.includes(collection.id)}
                  onCheckedChange={() => toggleCollection(collection.id)}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {collection.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground"
        >
          Price
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              expandedSections.includes("price") && "rotate-180"
            )}
          />
        </button>
        {expandedSections.includes("price") && (
          <div className="mt-3 space-y-2 animate-fade-in">
            {priceRanges.map(({ label, range }) => (
              <label
                key={label}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={priceRange[0] === range[0] && priceRange[1] === range[1]}
                  onCheckedChange={() => onPriceRangeChange(range)}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Material */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection("material")}
          className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground"
        >
          Material
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              expandedSections.includes("material") && "rotate-180"
            )}
          />
        </button>
        {expandedSections.includes("material") && (
          <div className="mt-3 space-y-2 animate-fade-in max-h-64 overflow-y-auto">
            {materials.map((material) => (
              <label
                key={material}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={selectedMaterials.includes(material)}
                  onCheckedChange={() => toggleMaterial(material)}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {material}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopFilters;
