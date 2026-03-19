import { Check } from "lucide-react";

interface ColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onChange: (color: string) => void;
}

const colorMap: Record<string, string> = {
  Black: "#1a1a1a",
  Navy: "#1e3a5f",
  Forest: "#228b22",
  White: "#ffffff",
  Cream: "#fffdd0",
  Pearl: "#eae8e1",
  Graphite: "#4a4a4a",
  Silver: "#c0c0c0",
  Gold: "#d4af37",
  Brown: "#654321",
  Tan: "#d2b48c",
  Slate: "#708090",
  Charcoal: "#36454f",
  Stone: "#8c8c8c",
  "Rose Gold": "#b76e79",
  Clear: "#ffffff",
  Frosted: "#f0f0f0",
  "Fog Grey": "#b0b0b0",
  Mist: "#d3d3d3",
  Cloud: "#f5f5f5",
  Cognac: "#9a463d",
  Burgundy: "#800020",
  Espresso: "#3c2415",
  Chocolate: "#7b3f00",
  Caramel: "#ffddaf",
  "Midnight Blue": "#191970",
  "Deep Ocean": "#003366",
  Ink: "#1a1a2e",
};

const ColorSelector = ({ colors, selectedColor, onChange }: ColorSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const isSelected = selectedColor === color;
        const bgColor = colorMap[color] || "#888888";
        const isLight = ["White", "Cream", "Pearl", "Clear", "Frosted", "Mist", "Cloud", "Caramel"].includes(color);

        return (
          <button
            key={color}
            onClick={() => onChange(color)}
            title={color}
            className={`relative h-10 w-10 rounded-full transition-all ${
              isSelected
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background"
            }`}
            style={{ backgroundColor: bgColor }}
          >
            {isSelected && (
              <Check
                className={`absolute inset-0 m-auto h-5 w-5 ${
                  isLight ? "text-background" : "text-white"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ColorSelector;
