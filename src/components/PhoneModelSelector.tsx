import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PhoneModelSelectorProps {
  models: string[];
  selectedModel: string;
  onChange: (model: string) => void;
}

const PhoneModelSelector = ({ models, selectedModel, onChange }: PhoneModelSelectorProps) => {
  return (
    <Select value={selectedModel} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-card border-primary/20 text-foreground">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent className="bg-card border-primary/20">
        {models.map((model) => (
          <SelectItem
            key={model}
            value={model}
            className="text-foreground hover:bg-primary/10 focus:bg-primary/10"
          >
            {model}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PhoneModelSelector;
