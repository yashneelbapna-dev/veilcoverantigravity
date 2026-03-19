import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "newest" | "best_selling" | "price_asc" | "price_desc" | "highest_rated";

interface SortDropdownProps {
  onSortChange?: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "best_selling", label: "Best Selling" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "highest_rated", label: "Highest Rated" },
];

const SortDropdown = ({ onSortChange }: SortDropdownProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSort = (searchParams.get("sort") as SortOption) || "newest";

  const handleChange = (value: SortOption) => {
    setSearchParams((prev) => {
      prev.set("sort", value);
      return prev;
    });
    onSortChange?.(value);
  };

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px] bg-card border-primary/20">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent className="bg-card border-primary/20">
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SortDropdown;
