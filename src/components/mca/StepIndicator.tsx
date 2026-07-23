import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  steps: { label: string; description: string; emoji?: string }[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <nav className="space-y-1">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={i} className="relative">
            <div
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary/[0.08] border border-primary/20"
                  : isCompleted
                  ? "bg-success/[0.05]"
                  : "hover:bg-muted/60"
              }`}
            >
              {/* Step number/check */}
              <motion.div
                animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                  isCompleted
                    ? "bg-success text-success-foreground glow-success"
                    : isActive
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "bg-secondary text-muted-foreground border border-border"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.emoji || String(i + 1)}
              </motion.div>

              {/* Label */}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold leading-tight transition-colors ${
                    isActive ? "text-foreground" : isCompleted ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 leading-tight truncate ${
                  isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                }`}>
                  {isCompleted ? "✓ Complete" : step.description}
                </p>
              </div>

              {isActive && (
                <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
              )}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeStep"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={`ml-[1.45rem] w-px h-1.5 ${isCompleted ? 'bg-primary/30' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default StepIndicator;
