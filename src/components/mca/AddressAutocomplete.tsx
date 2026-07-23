import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fetchPlaces } from "@/lib/salesforceApi";

interface AddressResult {
  street: string;
  city: string;
  state: string;
  zip: string;
  stateShort: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: AddressResult) => void;
  placeholder?: string;
  label: string;
  error?: string;
  isValid?: boolean;
}

const AddressAutocomplete = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  label,
  error,
  isValid,
}: AddressAutocompleteProps) => {
  const [predictions, setPredictions] = useState<{ place_id: string; description: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchPredictions = async (input: string) => {
    if (input.length < 3) { setPredictions([]); setIsOpen(false); return; }
    setLoading(true);
    try {
      const result = await fetchPlaces(input, "autocomplete");
      if (!result.success) throw new Error(result.error ?? "Autocomplete failed");
      const data = result.data as { predictions?: { place_id: string; description: string }[] };
      setPredictions(data.predictions ?? []);
      setIsOpen((data.predictions ?? []).length > 0);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setTouched(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(val), 300);
  };

  const handleSelect = async (placeId: string, description: string) => {
    onChange(description);
    setIsOpen(false);
    setPredictions([]);
    try {
      const result = await fetchPlaces(description, "details", placeId);
      if (!result.success) throw new Error(result.error ?? "Details failed");
      if (result.data) onAddressSelect(result.data as AddressResult);
    } catch (err) {
      console.error("Place details error:", err);
    }
  };

  return (
    <div ref={wrapperRef} className="relative space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => { if (predictions.length > 0) setIsOpen(true); }}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          autoComplete="street-address"
          className={cn(
            "bg-card border-border text-foreground placeholder:text-muted-foreground/60 h-10 pl-9 pr-9 transition-all duration-200 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50",
            touched && isValid && !error && "field-valid border-success",
            error && "border-destructive ring-1 ring-destructive/30"
          )}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(p.place_id, p.description)}
              className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2.5"
            >
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{p.description}</span>
            </button>
          ))}
          <div className="px-3 py-1.5 text-[10px] text-muted-foreground/50 border-t border-border">
            Powered by Google
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}
    </div>
  );
};

export default AddressAutocomplete;
