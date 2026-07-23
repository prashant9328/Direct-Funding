import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import ValidatedInput from "../ValidatedInput";
import ValidatedSelect from "../ValidatedSelect";
import AddressAutocomplete from "../AddressAutocomplete";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Trash2, UserPlus, User, Shield } from "lucide-react";
import { formatUSPhone } from "@/lib/utils";

interface Owner {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ssn: string;
  homeStreet: string;
  homeCity: string;
  homeState: string;
  homeZip: string;
  creditScore: number;
  dob: string;
  homeOwnership: string;
  ownershipPercent: number;
}

const createEmptyOwner = (): Owner => ({
  firstName: "", lastName: "", email: "", phone: "",
  ssn: "", homeStreet: "", homeCity: "", homeState: "", homeZip: "",
  creditScore: 650, dob: "", homeOwnership: "", ownershipPercent: 100,
});

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming"
].map((s) => ({ value: s, label: s }));

interface OwnerInfoProps {
  owners: Owner[];
  onOwnersChange: (owners: Owner[]) => void;
  errors: Record<string, string>;
}

const getCreditLabel = (score: number) => {
  if (score >= 750) return { label: "Excellent — Best rates unlocked! 🎉", color: "text-primary" };
  if (score >= 700) return { label: "Good — Strong approval odds 💪", color: "text-primary" };
  if (score >= 650) return { label: "Fair — Still eligible ✓", color: "text-foreground" };
  if (score >= 600) return { label: "Below Average — Options available", color: "text-urgency" };
  return { label: "We can still help", color: "text-muted-foreground" };
};

const OwnerInfo = ({ owners, onOwnersChange, errors }: OwnerInfoProps) => {
  const [activeOwner, setActiveOwner] = useState(0);
  const [showSSN, setShowSSN] = useState(false);

  const updateOwner = (index: number, field: keyof Owner, value: string | number) => {
    const updated = [...owners];
    updated[index] = { ...updated[index], [field]: value };
    onOwnersChange(updated);
  };

  const addOwner = () => { 
    if (owners.length >= 2) return;
    const currentTotal = owners.reduce((sum, o) => sum + o.ownershipPercent, 0);
    let newPercent = 100 - currentTotal;
    if (newPercent <= 0) {
      const updatedOwners = [...owners];
      updatedOwners[0].ownershipPercent = 50;
      onOwnersChange([...updatedOwners, { ...createEmptyOwner(), ownershipPercent: 50 }]);
    } else {
      onOwnersChange([...owners, { ...createEmptyOwner(), ownershipPercent: newPercent }]);
    }
    setActiveOwner(owners.length); 
  };
  const removeOwner = (index: number) => {
    if (owners.length <= 1) return;
    onOwnersChange(owners.filter((_, i) => i !== index));
    setActiveOwner(Math.min(activeOwner, owners.length - 2));
  };

  const owner = owners[activeOwner];
  const credit = getCreditLabel(owner.creditScore);

  const sumOfOtherOwners = owners.reduce((acc, o, i) => i !== activeOwner ? acc + o.ownershipPercent : acc, 0);
  const maxAvailablePercent = Math.max(1, 100 - sumOfOtherOwners);

  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Almost There — Verify Ownership 👤</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          You're 60% done! Most applicants finish in under 60 seconds.
        </p>
      </div>

      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
        <Shield className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-xs text-primary font-medium">This does NOT affect your credit score — it's a soft check only</span>
      </div>

      {/* Owner tabs */}
      {owners.length > 1 && (
        <div className="flex gap-1.5 p-1 bg-secondary rounded-xl w-fit">
          {owners.map((o, i) => (
            <button key={i} onClick={() => setActiveOwner(i)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                i === activeOwner ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Owner {i + 1}{o.firstName ? `: ${o.firstName}` : ""}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={activeOwner} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-8">
          {/* Name */}
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-primary rounded-full" />
                <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">Personal Details</h3>
              </div>
              {activeOwner === 0 && owner.firstName && (
                <span className="text-[11px] text-primary font-medium flex items-center gap-1 bg-primary/8 px-2.5 py-1 rounded-full border border-primary/20">
                  ✨ Auto-filled from Step 1
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ValidatedInput label="First Name" placeholder="John" value={owner.firstName} onChange={(e) => updateOwner(activeOwner, "firstName", e.target.value)} isValid={!!owner.firstName && owner.firstName.length > 1} error={errors[`owner${activeOwner}_firstName`]} autoComplete="given-name" />
              <ValidatedInput label="Last Name" placeholder="Smith" value={owner.lastName} onChange={(e) => updateOwner(activeOwner, "lastName", e.target.value)} isValid={!!owner.lastName && owner.lastName.length > 1} error={errors[`owner${activeOwner}_lastName`]} autoComplete="family-name" />
              <ValidatedInput label="Email Address" type="email" placeholder="john@acme.com" value={owner.email || ""} onChange={(e) => updateOwner(activeOwner, "email", e.target.value)} isValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email || "")} autoComplete="email" />
              <ValidatedInput label="Mobile Phone" type="tel" placeholder="(555) 123-4567" maxLength={14} value={owner.phone || ""} onChange={(e) => updateOwner(activeOwner, "phone", formatUSPhone(e.target.value))} isValid={(owner.phone || "").replace(/\D/g, "").length === 10} autoComplete="tel" />
              <ValidatedInput label="Date of Birth" type="date" value={owner.dob} onChange={(e) => updateOwner(activeOwner, "dob", e.target.value)} isValid={!!owner.dob} error={errors[`owner${activeOwner}_dob`]} autoComplete="bday" />
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">Social Security Number</label>
                <div className="relative">
                  <input
                    type={showSSN ? "text" : "password"}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="•••-••-••••"
                    maxLength={11}
                    value={owner.ssn || ""}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "").slice(0, 9);
                      if (v.length > 5) v = v.slice(0, 3) + "-" + v.slice(3, 5) + "-" + v.slice(5);
                      else if (v.length > 3) v = v.slice(0, 3) + "-" + v.slice(3);
                      updateOwner(activeOwner, "ssn", v);
                    }}
                    className={`w-full bg-card border text-foreground placeholder:text-muted-foreground/60 h-10 px-3 pr-10 transition-all duration-200 text-sm rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50 ${
                      owner.ssn && owner.ssn.replace(/\D/g, "").length === 9 ? "border-success field-valid" : errors[`owner${activeOwner}_ssn`] ? "border-destructive" : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSSN(!showSSN)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showSSN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors[`owner${activeOwner}_ssn`] && <p className="text-[11px] text-destructive font-medium">{errors[`owner${activeOwner}_ssn`]}</p>}
                <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1"><Shield className="w-3 h-3" />Encrypted & secure — required for credit check authorization</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[13px] font-medium text-foreground">Home Ownership</p>
                <RadioGroup value={owner.homeOwnership} onValueChange={(v) => updateOwner(activeOwner, "homeOwnership", v)} className="flex gap-3 pt-1">
                  {[{ v: "Own", l: "🏠 Own" }, { v: "Rent", l: "🔑 Rent" }].map(({ v, l }) => (
                    <label key={v} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${owner.homeOwnership === v ? "border-primary bg-primary/10 glow-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
                      <RadioGroupItem value={v} id={`home-${v}-${activeOwner}`} />
                      <Label htmlFor={`home-${v}-${activeOwner}`} className="cursor-pointer">{l}</Label>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>  
          </section>

          {/* Address */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-5 bg-primary rounded-full" />
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">Home Address</h3>
            </div>
            <AddressAutocomplete
              label="Street Address"
              value={owner.homeStreet}
              onChange={(v) => updateOwner(activeOwner, "homeStreet", v)}
              onAddressSelect={(addr) => {
                const updated = [...owners];
                updated[activeOwner] = {
                  ...updated[activeOwner],
                  homeStreet: addr.street,
                  homeCity: addr.city,
                  homeState: addr.state,
                  homeZip: addr.zip,
                };
                onOwnersChange(updated);
              }}
              isValid={!!owner.homeStreet && owner.homeStreet.length > 3}
              error={errors[`owner${activeOwner}_homeStreet`]}
            />
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <ValidatedInput label="City" placeholder="New York" value={owner.homeCity} onChange={(e) => updateOwner(activeOwner, "homeCity", e.target.value)} isValid={!!owner.homeCity} error={errors[`owner${activeOwner}_homeCity`]} autoComplete="address-level2" />
              </div>
              <ValidatedSelect label="State" placeholder="State" options={US_STATES} value={owner.homeState} onValueChange={(v) => updateOwner(activeOwner, "homeState", v)} error={errors[`owner${activeOwner}_homeState`]} />
              <ValidatedInput label="ZIP" placeholder="10001" maxLength={5} value={owner.homeZip} onChange={(e) => updateOwner(activeOwner, "homeZip", e.target.value.replace(/\D/g, ""))} isValid={!!owner.homeZip && owner.homeZip.length === 5} error={errors[`owner${activeOwner}_homeZip`]} autoComplete="postal-code" />
            </div>
          </section>

          {/* Sliders */}
          <section className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-5 bg-primary rounded-full" />
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">Financial Profile</h3>
            </div>

            <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-foreground">Personal Credit Score</span>
                <span className={`text-sm font-bold tabular-nums ${credit.color}`}>{owner.creditScore} — {credit.label}</span>
              </div>
              <Slider value={[owner.creditScore]} onValueChange={([v]) => updateOwner(activeOwner, "creditScore", v)} min={300} max={850} step={10} />
              <div className="flex justify-between text-[11px] text-muted-foreground"><span>300</span><span>850</span></div>
            </div>

            <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-foreground">Ownership Percentage</span>
                <span className="text-sm font-bold tabular-nums text-foreground">{owner.ownershipPercent}%</span>
              </div>
              <Slider value={[owner.ownershipPercent]} onValueChange={([v]) => updateOwner(activeOwner, "ownershipPercent", v)} min={1} max={owners.length > 1 ? maxAvailablePercent : 100} step={1} />
            </div>
          </section>

          {owners.length > 1 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => removeOwner(activeOwner)} className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Remove Owner
            </Button>
          )}
        </motion.div>
      </AnimatePresence>

      {owners.length < 2 && (
        <Button type="button" variant="outline" onClick={addOwner} className="w-full border-dashed h-11 gap-2 text-muted-foreground hover:text-primary hover:border-primary/40 rounded-xl">
          <UserPlus className="w-4 h-4" /> Add Another Owner
        </Button>
      )}
    </motion.div>
  );
};

export default OwnerInfo;
export { createEmptyOwner };
export type { Owner };
