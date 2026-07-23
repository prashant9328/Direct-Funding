import { useState, InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ValidatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isValid?: boolean;
  helperText?: string;
  optional?: boolean;
}

const ValidatedInput = ({
  label,
  error,
  isValid,
  helperText,
  optional,
  className,
  ...props
}: ValidatedInputProps) => {
  const [touched, setTouched] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[13px] font-medium text-foreground">{label}</label>
        {optional && <span className="text-[11px] text-muted-foreground">Optional</span>}
      </div>
      <div className="relative">
        <Input
          className={cn(
            "bg-card border-border text-foreground placeholder:text-muted-foreground/60 h-10 pr-9 transition-all duration-200 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50",
            touched && isValid && !error && "field-valid border-success",
            (error) && "border-destructive ring-1 ring-destructive/30",
            className
          )}
          onBlur={() => setTouched(true)}
          {...props}
        />
        {touched && isValid && !error && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-3 h-3 text-primary" />
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-muted-foreground">{helperText}</p>}
    </div>
  );
};

export default ValidatedInput;
