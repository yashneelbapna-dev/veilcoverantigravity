import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

const QuantitySelector = ({ quantity, onChange, min = 1, max = 10 }: QuantitySelectorProps) => {
  const decrease = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const increase = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={decrease}
        disabled={quantity <= min}
        className="h-10 w-10 rounded-full border border-primary/20 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="text-lg font-medium text-foreground w-8 text-center">{quantity}</span>
      <button
        onClick={increase}
        disabled={quantity >= max}
        className="h-10 w-10 rounded-full border border-primary/20 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;
