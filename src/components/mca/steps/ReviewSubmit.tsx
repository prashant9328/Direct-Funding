import { motion } from "framer-motion";
import { Check, Building2, User, ShieldCheck, Lock, PartyPopper } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Owner } from "./OwnerInfo";

interface ReviewSubmitProps {
  appData: Record<string, string>;
  owners: Owner[];
  agreed: boolean;
  onAgreeChange: (v: boolean) => void;
}

const ReviewSubmit = ({ appData, owners, agreed, onAgreeChange }: ReviewSubmitProps) => {
  const Section = ({ icon: Icon, title, items }: { icon: any; title: string; items: [string, string][] }) => (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 bg-secondary/50 border-b border-border flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-[13px] font-bold text-foreground">{title}</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {items.filter(([, v]) => v && v.trim()).map(([label, value]) => (
            <div key={label}>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className="text-sm text-foreground mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Step 4 of 5
          </span>
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Lock In Your Pre-Approval 🔒
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          You're 80% done! Review your info and secure your offer.
        </p>
      </div>

      {/* <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 glow-primary"
      >
        <PartyPopper className="w-5 h-5 text-primary flex-shrink-0" />
        <div>
          <p className="text-sm text-primary font-bold">You're pre-qualified!</p>
          <p className="text-xs text-primary/70 mt-0.5">Based on your info, you may qualify for up to $500,000 in funding</p>
        </div>
      </motion.div> */}

      <Section
        icon={User}
        title="Contact Information"
        items={[
          ["Name", `${appData.firstName || ""} ${appData.lastName || ""}`],
          ["Email", appData.email || ""],
          ["Phone", appData.phone || ""],
        ]}
      />

      <Section
        icon={Building2}
        title="Business Information"
        items={[
          ["Business Name", appData.businessName || ""],
          ["DBA", appData.dba || ""],
          [
            "Address",
            `${appData.bizStreet || ""}, ${appData.bizCity || ""}, ${appData.bizState || ""} ${appData.bizZip || ""}`,
          ],
          [
            "Industry",
            `${appData.industry || ""}${appData.subIndustry ? ` / ${appData.subIndustry}` : ""}`,
          ],
          ["Entity Type", appData.entityType || ""],
          ["State of Formation", appData.formationState || ""],
          ["Federal Tax ID", appData.taxId || ""],
          ["Registration Date", appData.registrationDate || ""],
          ["Purpose", appData.moneyPurpose || ""],
          ["Timeline", appData.moneyTimeline || ""],
          ["Open Loans/MCAs", appData.hasOpenLoans || ""],
          ["Number of Open Loans", appData.openLoansCount || ""],
          ["Investment Properties", appData.hasProperties || ""],
          ["Business Location", appData.businessLocation || ""],
        ]}
      />

      {owners.map((o, i) => (
        <Section
          key={i}
          icon={User}
          title={`Owner ${i + 1}: ${o.firstName} ${o.lastName}`}
          items={[
            [
              "Address",
              `${o.homeStreet}, ${o.homeCity}, ${o.homeState} ${o.homeZip}`,
            ],
            ["Credit Score", String(o.creditScore)],
            ["Date of Birth", o.dob],
            ["Home Ownership", o.homeOwnership],
            ["Ownership", `${o.ownershipPercent}%`],
          ]}
        />
      ))}

      {/* Consent — pre-checked with small text */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={agreed}
            onCheckedChange={(v) => onAgreeChange(!!v)}
            className="mt-0.5 border-primary data-[state=checked]:bg-primary"
          />
          <label
            htmlFor="consent"
            className="text-[11px] text-muted-foreground/70 leading-relaxed cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3 inline-block mr-1 text-primary/50 align-text-bottom" />
            I agree to the Direct Funding Now's{" "}
            <span className="text-primary/60 underline underline-offset-2">
              <a href="https://www.directfundingnow.com/terms-of-use/" target="_blank">
              Sign Consent Agreement
              </a>
            </span>{" "}
            and understand that I may receive communications to the phone number
            provided; I agree that this consent applies even if the phone number
            provided is on any state, federal, or corporate do-not-call
            registry. Consent may be revoked at any time and by any reasonable
            means.
          </label>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewSubmit;
