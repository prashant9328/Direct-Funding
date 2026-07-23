import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [countdown, setCountdown] = useState(297); // 4:57 feels real

  // Exit intent detection — mouse leaves viewport top
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && !dismissed) {
      setShow(true);
    }
  }, [dismissed]);

  // Also trigger on tab blur (mobile/tab switch)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !dismissed) {
      setShow(true);
    }
  }, [dismissed]);

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleMouseLeave, handleVisibilityChange]);

  // Fake countdown timer
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [show]);

  const dismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Urgency banner */}
            <div className="bg-urgency/10 border-b border-urgency/20 px-5 py-3 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-urgency animate-pulse" />
              <span className="text-sm font-bold text-urgency">
                Your pre-qualification expires in {formatTime(countdown)}
              </span>
            </div>

            {/* Close — intentionally small and low contrast */}
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 p-1 text-muted-foreground/30 hover:text-muted-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="p-6 space-y-5">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-display font-bold text-foreground">
                  Wait — You're Already Pre-Qualified! 🎉
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Based on the info you've entered, you're in the <span className="text-primary font-semibold">top 8% of applicants</span> today.
                  Leaving now means you'll lose your spot and need to start over.
                </p>
              </div>

              {/* Fake social proof */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Recent approvals near you</p>
                <div className="space-y-1.5 text-sm text-foreground">
                  <p>✅ David R. — <span className="font-semibold">$92,000</span> funded 12 min ago</p>
                  <p>✅ Maria S. — <span className="font-semibold">$145,000</span> funded 28 min ago</p>
                </div>
              </div>

              {/* CTA — big, prominent, action-oriented */}
              <Button
                onClick={dismiss}
                className="w-full h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Continue & Secure My Offer
              </Button>

              {/* Shame click — guilt-driven dismiss */}
              <button
                onClick={dismiss}
                className="w-full text-center text-xs text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors py-1"
              >
                No thanks, I don't want funding right now
              </button>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                Average approval time: 2 hours
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
