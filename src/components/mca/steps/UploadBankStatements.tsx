import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, ShieldCheck, Zap, Clock, Timer } from "lucide-react";

interface UploadBankStatementsProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const UploadBankStatements = ({ files, onFilesChange }: UploadBankStatementsProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15:00
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pulse effect when under 3 minutes
  useEffect(() => {
    setPulsing(timeLeft < 180);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const dropped = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === "application/pdf" || f.type.startsWith("image/")
      );
      onFilesChange([...files, ...dropped]);
    },
    [files, onFilesChange]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFilesChange([...files, ...Array.from(e.target.files)]);
  };

  const removeFile = (index: number) => onFilesChange(files.filter((_, i) => i !== index));

  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Submit Your Bank Statements 📄</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Upload your last 4 months of bank statements to complete your application. You're 95% done!
        </p>
      </div>

      {/* Priority queue timer */}
      <div className={`relative overflow-hidden p-4 rounded-xl border transition-all ${
        timeLeft < 120 
          ? "bg-destructive/10 border-destructive/30" 
          : timeLeft < 180 
            ? "bg-urgency/10 border-urgency/30" 
            : "bg-card border-border"
      }`}>
        {pulsing && (
          <div className="absolute inset-0 bg-destructive/5 animate-pulse rounded-xl" />
        )}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              timeLeft < 120 ? "bg-destructive/20" : "bg-primary/10"
            }`}>
              <Timer className={`w-4.5 h-4.5 ${timeLeft < 120 ? "text-destructive animate-pulse" : "text-primary"}`} />
            </div>
            <div>
              <p className={`text-[13px] font-semibold ${timeLeft < 120 ? "text-destructive" : "text-foreground"}`}>
                {timeLeft < 120 ? "⚠️ Priority queue closing!" : timeLeft < 180 ? "Priority queue closing soon" : "Priority review queue closes in"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {timeLeft < 120 
                  ? "Submit now or your application moves to standard processing" 
                  : "Submit to stay in the fast-track review lane"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xl font-mono font-bold tabular-nums ${
              timeLeft < 120 ? "text-destructive animate-pulse" : timeLeft < 180 ? "text-urgency" : "text-primary"
            }`}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            {timeLeft < 180 && (
              <p className="text-[10px] text-destructive font-medium mt-0.5">Don't lose your spot</p>
            )}
          </div>
        </div>
      </div>

      {/* Priority queue benefit */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-xs text-primary font-medium">
          You're in the priority queue — applications reviewed within hours, not days
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer bg-card ${
          dragActive ? "border-primary bg-primary/5 glow-primary" : "border-border hover:border-primary/40"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input id="file-input" type="file" multiple accept=".pdf,image/*" className="hidden" onChange={handleInput} />
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Drop your statements here</p>
        <p className="text-xs text-primary font-medium mt-1">or click to browse files</p>
        <p className="text-[11px] text-muted-foreground mt-2">PDF or image files — up to 25MB each</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        <span>Documents are encrypted and securely stored</span>
      </div>
    </motion.div>
  );
};

export default UploadBankStatements;
