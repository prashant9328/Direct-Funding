import ValidatedInput from "../ValidatedInput";
import ValidatedSelect from "../ValidatedSelect";
import { motion } from "framer-motion";
import { Building2, User, Zap } from "lucide-react";
import { formatUSPhone } from "@/lib/utils";

interface ApplicationInfoProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const OPERATING_TIME_OPTIONS = [
  { value: "Less than 6 months", label: "Less than 6 months" },
  { value: "1-2 years", label: "1-2 years" },
  { value: "3-4 years", label: "3-4 years" },
  { value: "5-9 years", label: "5-9 years" },
  { value: "10+ years", label: "10+ years" },
];

const REVENUE_OPTIONS = [
  { value: "under-$10,000", label: "Under $10,000" },
  // { value: "$1,000-$5,000", label: "$1,000 - $5,000" },
  { value: "$10,000-$20,000", label: "$10,000 - $20,000" },
  { value: "$20,000-$30,000", label: "$20,000 - $30,000" },
  { value: "$30,000-$50,000", label: "$30,000 - $50,000" },
  { value: "$50,000-$100,000", label: "$50,000 - $100,000" },
  { value: "$100,000-$200,000", label: "$100,000 - $200,000" },
  { value: "$200,000+", label: "$200,000+" }, 
];

const LOAN_REQUEST_OPTIONS = [
  { value: "10000", label: "$10,000" },
  { value: "25000", label: "$25,000" },
  { value: "50000", label: "$50,000" },
  { value: "75000", label: "$75,000" },
  { value: "100000", label: "$100,000" },
  { value: "150000", label: "$150,000" },
  { value: "200000", label: "$200,000" },
  { value: "250000", label: "$250,000" },
  { value: "500000", label: "$500,000+" },
];

const ApplicationInfo = ({ data, onChange, errors }: ApplicationInfoProps) => {
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPhone = (v: string) => v.replace(/\D/g, "").length === 10;
  const REAL_TLDS = new Set([
    "com","net","org","io","co","us","uk","ca","au","de","fr","in","jp","cn",
    "br","mx","ru","it","es","nl","gov","edu","biz","info","me","tv","app",
    "dev","ai","tech","online","store","shop","blog","news","media","digital",
    "cloud","health","mobi","name","pro","nz","sg","hk","za","ae","sa","se",
    "no","dk","fi","pl","be","ch","at","pt","gr","tr","id","ph","th","vn",
    "my","ng","ke","gh","ma","eg","pk","bd","lk","ar","cl","pe","co","ve",
    "ec","uy","bo","py","cr","gt","hn","sv","ni","pa","do","cu","pr","tt",
    "jm","gg","je","im","eu","int","mil","aero","coop","museum","travel",
    "jobs","cat","tel","post","xxx","ua","rs","hr","bg","ro","hu","cz","sk",
    "ee","lv","lt","si","by","md","al","ba","mk","me","is","li","lu","mc",
    "sm","va","cy","mt","kz","uz","az","ge","am","mn","af","np","bt","kh",
    "la","mm","bn","mz","rw","tz","ug","zm","zw","bw","ls","sz","na","bi",
  ]);
  const isValidWebsite = (v: string): boolean => {
    const s = v.trim().toLowerCase();
    if (!s) return false;
    const hostname = s.replace(/^https?:\/\//, "").split("/")[0];
    if (!hostname.includes(".")) return false;
    const parts = hostname.split(".");
    const tld = parts[parts.length - 1];
    const domain = parts[parts.length - 2];
    if (!REAL_TLDS.has(tld)) return false;
    if (!domain || domain.length < 2) return false;
    if (parts[0] === "www" && parts.length < 3) return false;
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Let's Get You Funded 🚀
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Takes under 2 minutes — most applicants get a decision within hours.
        </p>
      </div>

      {/* Quick win badge */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
        <Zap className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-xs text-primary font-medium">Pro tip: Complete this step and you're already 20% done!</span>
      </div>

      {/* Business Information */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 bg-primary rounded-full" />
          <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">Business Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ValidatedInput
            label="Business Legal Name"
            placeholder="Acme Corp LLC"
            value={data.businessName || ""}
            onChange={(e) => onChange("businessName", e.target.value)}
            isValid={!!data.businessName && data.businessName.length > 1}
            error={errors.businessName}
            autoComplete="organization"
          />
          <ValidatedInput
            label="Business DBA Name"
            placeholder="Acme Corp"
            optional
            value={data.dba || ""}
            onChange={(e) => onChange("dba", e.target.value)}
            isValid={!!data.dba}
            autoComplete="organization"
          />
          <ValidatedSelect
            label="Business Operating Time"
            placeholder="Select operating time"
            value={data.operatingTime || ""}
            onValueChange={(v) => onChange("operatingTime", v)}
            options={OPERATING_TIME_OPTIONS}
            error={errors.operatingTime}
          />
          <ValidatedSelect
            label="Gross Monthly Revenue"
            placeholder="Select revenue range"
            value={data.grossRevenue || ""}
            onValueChange={(v) => onChange("grossRevenue", v)}
            options={REVENUE_OPTIONS}
            error={errors.grossRevenue}
          />
          <ValidatedInput
            label="Website"
            placeholder="www.acmecorp.com"
            optional
            value={data.website || ""}
            onChange={(e) => onChange("website", e.target.value)}
            isValid={!!data.website && isValidWebsite(data.website)}
            error={errors.website}
            autoComplete="url"
          />
          <ValidatedSelect
            label="Loan Request"
            placeholder="Select amount"
            value={data.loanRequest || ""}
            onValueChange={(v) => onChange("loanRequest", v)}
            options={LOAN_REQUEST_OPTIONS}
            error={errors.loanRequest}
          />
        </div>
      </section>

      {/* Personal Information */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 bg-primary rounded-full" />
          <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ValidatedInput
            label="First Name"
            placeholder="John"
            value={data.firstName || ""}
            onChange={(e) => onChange("firstName", e.target.value)}
            isValid={!!data.firstName && data.firstName.length > 1}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <ValidatedInput
            label="Email Address"
            type="email"
            placeholder="john@acme.com"
            value={data.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            isValid={isValidEmail(data.email || "")}
            error={errors.email}
            autoComplete="email"
          />
          <ValidatedInput
            label="Last Name"
            placeholder="Smith"
            value={data.lastName || ""}
            onChange={(e) => onChange("lastName", e.target.value)}
            isValid={!!data.lastName && data.lastName.length > 1}
            error={errors.lastName}
            autoComplete="family-name"
          />
          <ValidatedInput
            label="Mobile Phone Number"
            type="tel"
            placeholder="(555) 123-4567"
            maxLength={14}
            value={data.phone || ""}
            onChange={(e) => onChange("phone", formatUSPhone(e.target.value))}
            isValid={isValidPhone(data.phone || "")}
            error={errors.phone}
            autoComplete="tel"
          />
        </div>
      </section>
    </motion.div>
  );
};

export default ApplicationInfo;
