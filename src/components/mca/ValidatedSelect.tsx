import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ValidatedSelectProps {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (v: string) => void;
  error?: string;
}

const ValidatedSelect = ({
  label,
  placeholder,
  options,
  value,
  onValueChange,
  error,
}: ValidatedSelectProps) => {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      <div className="relative">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            className={cn(
              "bg-card border-border text-foreground h-10 transition-all duration-200 text-sm rounded-xl focus:ring-1 focus:ring-primary/30 focus:border-primary/50",
              value && "border-success field-valid",
              error && "border-destructive"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border shadow-2xl rounded-xl">
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-sm rounded-lg">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value && (
          <div className="absolute right-9 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center pointer-events-none">
            <Check className="w-3 h-3 text-primary" />
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}
    </div>
  );
};

export default ValidatedSelect;
