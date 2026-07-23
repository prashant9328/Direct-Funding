import { useState } from "react";
import ValidatedInput from "../ValidatedInput";
import ValidatedSelect from "../ValidatedSelect";
import AddressAutocomplete from "../AddressAutocomplete";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Building2, TrendingUp, Eye, EyeOff, Shield } from "lucide-react";

interface BusinessInfoProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

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

const INDUSTRIES = [
  "Agriculture",
  "Automotive",
  "Construction",
  "Contracting",
  "E-commerce",
  "Education",
  "Energy and Utilities",
  "Financial Services",
  "Government & Related",
  "Health & Medical Services",
  "Information Technology",
  "Lodging",
  "Manufacturing",
  "Media & Publishing",
  "Personal Services",
  "Professional Services",
  "Real Estate",
  "Recreation",
  "Restaurant & Food Services",
  "Retail",
  "Salons & Spas",
  "Transportation and Logistics",
  "Other",
].map((s) => ({ value: s, label: s }));

const SUB_INDUSTRIES: Record<string, string[]> = {
  "Agriculture": [
    "Equipment",
    "Farming - Crops",
    "Farming - Livestock",
    "Forestry & Fishing",
    "Logging",
    "Other",
  ],
  "Automotive": [
    "Automotive Parts Manufacturing",
    "Automotive Retail Sales - Auto Parts",
    "Automotive Retail Sales - New & Used Cars",
    "Repairs - Brakes",
    "Repairs - General / Full-Service",
    "Repairs - Oil Change, Smog, Mufflers",
    "Repairs - Paint & Body",
    "Repairs - Transmissions",
    "Repairs - Wheels & Tires",
    "Other"
  ],
  "Construction": ["Builder / New Construction","Infrastructure, Water, Sewer, Pipeline, Power","Parking Lots / Parking Decks"],
  "Contracting": [
  "General Contractor",
  "Specialty Trade - Carpentry & Framing",
  "Specialty Trade - Concrete",
  "Specialty Trade - Drywall",
  "Specialty Trade - Electrical",
  "Specialty Trade - Excavation",
  "Specialty Trade - Flooring",
  "Specialty Trade - HVAC",
  "Specialty Trade - Masonry",
  "Specialty Trade - Painting",
  "Specialty Trade - Plumbing",
  "Specialty Trade - Roofing & Siding",
  "Specialty Trade - Solar Sales & Install",
  "Specialty Trade - Other",
  "Other"
],
  "E-commerce": ["Consultant","Sales"],
  "Education": ["Consultant","Child Day Care Services","Private School","Tutoring / Specialty Learning Centers","Other"],
  "Energy and Utilities": ["Environmental","Gas Stations","	Gas Stations","Mining","Production","Services","Other"],
  "Financial Services": ["Accountant / CPA","Banking","Insurance","Personal Financial Adviser","Other"],
  "Government & Related": ["Government","Non-Profit","Other"],
  "Health & Medical Services": [
  "Biotechnology",
  "Clinic - Immediate Care",
  "Home Health Care",
  "Laboratories",
  "Med Spa",
  "Medical Transportation",
  "Outpatient Facility",
  "Pharmacy",
  "Specialist - Chiropractor",
  "Specialist - Dentist",
  "Specialist - General Practitioner",
  "Specialist - Massage Therapeutics",
  "Specialist - Optometrist",
  "Specialist - Orthopedics",
  "Specialist - Physical Therapy",
  "Specialist - Therapist (Mental Health)",
  "Specialist - Veterinarian",
  "Specialist - Other",
  "Other"
],
  "Information Technology": ["IT Consultant","IT Repairs","IT Sales - Not Retail","Other"],
  "Lodging": ["Alternative Lodging (AirBnB, etc.)","Camping","Hotels & Motels"],
  "Manufacturing": [
  "Appliances",
  "Automotive Parts",
  "Boats, Recreational Vehicles",
  "Cannabis",
  "Chemicals",
  "Computer & Electronics",
  "Food & Beverage",
  "Furniture & Fixtures",
  "Home & Building Components",
  "Machinery",
  "Medical Equipment",
  "Metals - Production & Processing",
  "Paper Products",
  "Pharmaceuticals, Biotechnology",
  "Plastics & Rubber Products",
  "Technology",
  "Telecommunications",
  "Textiles - Apparel",
  "Textiles - Other",
  "Other"
],
  "Media & Publishing": ["Media","Printing","Publishing","Other"],
  "Personal Services": [
  "Car Washes",
  "Dry Cleaners",
  "Home Pest Services",
  "Housekeeping",
  "Laundromats",
  "Pet Sitting",
  "Residential Yard Service",
  "Other"
],
  "Professional Services": [
    "Consultant",
    "Government",
    "IT Consultant",  
    "Advertising / Marketing",
    "Cleaning & Janitorial",
    "Commercial Landscaping",
    "Courier Service",
    "Disposal & Shredding",
    "Employment Agency",
    "Engineer",
    "Lawyer, Legal Services",
    "Security Guard & Armored Car Services",
    "Other"
  ],
  
  "Real Estate": ["Appraiser","Broker","Inspector","Investor","Property Management","Other"],
  "Recreation": [
    "Amusement & Recreation Services",
    "Dance Studio",
    "Health Clubs",
    "Sports & Recreation Clubs",
    "Yoga Studio",
    "Youth Sport Academies",
    "Other"
  ],
  "Restaurant & Food Services": [
    "Bar",
    "Catering",
    "Distribution",
    "Equipment Rental & Leasing",
    "Food Trucks",
    "Ghost/Virtual Kitchen (App delivery)",
    "Production, Processing, Packing",
    "Restaurant - Fast-Casual",
    "Restaurant - Fast-Food",
    "Restaurant - Full-Service",
    "Store - Convenience Store",
    "Store - Grocery Store",
    "Store Specialty - Bakery",
    "Store Specialty - Butcher",
    "Store Specialty - Coffee Shop / Café",
    "Store Specialty - Donut Shop",
    "Store Specialty - Juice Bar",
    "Store Specialty - Other",
    "Other"
  ],
  "Retail": [
    "Accessories",
    "Antiques",
    "Apparel / Shoes",
    "Beauty",
    "Bookstore",
    "Cellular Phones",
    "Convenience Store",
    "Drug Store / Pharmacy",
    "Electronics",
    "Florist",
    "Furniture",
    "Gas Station/Convenience Store",
    "Gift Shops",
    "Grocery Store",
    "Home Supplies / Repairs",
    "Jewelry",
    "Record/Vinyl Stores",
    "Toys & Hobbies",
    "Other",
  ],
  "Salons & Spas": ["Barber Shop","Cosmetology Schools","Estheticians","Salon Full-Service (Nail, Hair, Skin, etc.)","	Salon Hair-Only","Salon Nail-Only","Other"],
  "Transportation and Logistics": ["Air Courier Services","	Logistics Management","Shipping","Towing","Trucking","Other"],
  "Other": [
    "Equipment Rental & Leasing",
    "Adult Entertainment",
    "Auction Houses",
    "Credit Repair",
    "Firearms",
    "Import/Export",
    "Pawn Shops",
    "Ticket Brokers",
    "Wholesalers",
  ],
};

const ENTITY_TYPES = [
  "Sole Proprietorship","LLC","Corporation","Partnership","S-Corp","Non-Profit"
].map((s) => ({ value: s, label: s }));

const MONEY_NEEDS = [
  "Working Capital","Equipment Purchase","Inventory","Expansion","Payroll",
  "Renovations","Marketing","Debt Consolidation","Emergency Expenses","Other"
].map((s) => ({ value: s, label: s }));

const MONEY_TIMELINE = [
  { value: "Immediately", label: "🔥 ASAP — I need it now" },
  { value: "1-2 weeks", label: "⚡ This Week" },
  { value: "30 days", label: "📅 Within 30 Days" },
  { value: "More than 30 days", label: "🔍 Just Exploring" },
];

const RadioQuestion = ({ label, value, onChange, name }: { label: string; value: string; onChange: (v: string) => void; name: string }) => (
  <div className="space-y-2.5">
    <p className="text-[13px] font-medium text-foreground">{label}</p>
    <RadioGroup value={value} onValueChange={onChange} className="flex gap-3">
      {["yes", "no"].map((v) => (
        <label
          key={v}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${
            value === v ? "border-primary bg-primary/10 text-foreground glow-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"
          }`}
        >
          <RadioGroupItem value={v} id={`${name}-${v}`} />
          <Label htmlFor={`${name}-${v}`} className="cursor-pointer capitalize">{v}</Label>
        </label>
      ))}
    </RadioGroup>
  </div>
);

const BusinessInfo = ({ data, onChange, errors }: BusinessInfoProps) => {
  const [showEIN, setShowEIN] = useState(false);

  const subIndustries = data.industry ? (SUB_INDUSTRIES[data.industry] || ["Other"]).map(s => ({ value: s, label: s })) : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Tell Us About Your Business 🏢</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Businesses that complete this step get funded 3x faster. You're 40% done!
        </p>
      </div>

      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-success/5 border border-success/15">
        <TrendingUp className="w-4 h-4 text-success flex-shrink-0" />
        <span className="text-xs text-success font-medium">Businesses in your area are getting funded $50K-$500K on average</span>
      </div>

      {/* Address */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 bg-primary rounded-full" />
          <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">Business Address</h3>
        </div>
        <AddressAutocomplete
          label="Street Address"
          value={data.bizStreet || ""}
          onChange={(v) => onChange("bizStreet", v)}
          onAddressSelect={(addr) => {
            onChange("bizStreet", addr.street);
            onChange("bizCity", addr.city);
            onChange("bizState", addr.state);
            onChange("bizZip", addr.zip);
          }}
          isValid={!!data.bizStreet && data.bizStreet.length > 3}
          error={errors.bizStreet}
        />
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <ValidatedInput label="City" placeholder="New York" value={data.bizCity || ""} onChange={(e) => onChange("bizCity", e.target.value)} isValid={!!data.bizCity} error={errors.bizCity} autoComplete="address-level2" />
          </div>
          <ValidatedSelect label="State" placeholder="State" options={US_STATES} value={data.bizState || ""} onValueChange={(v) => onChange("bizState", v)} error={errors.bizState} />
          <ValidatedInput label="ZIP" placeholder="10001" maxLength={5} value={data.bizZip || ""} onChange={(e) => onChange("bizZip", e.target.value.replace(/\D/g, ""))} isValid={!!data.bizZip && data.bizZip.length === 5} error={errors.bizZip} autoComplete="postal-code" />
        </div>
      </section>

      {/* Industry */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 bg-primary rounded-full" />
          <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">Industry & Purpose</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ValidatedSelect label="Business Industry" placeholder="Select industry" options={INDUSTRIES} value={data.industry || ""} onValueChange={(v) => { onChange("industry", v); onChange("subIndustry", ""); }} error={errors.industry} />
          {subIndustries.length > 0 && (
            <ValidatedSelect label="Sub-Industry" placeholder="Select sub-industry" options={subIndustries} value={data.subIndustry || ""} onValueChange={(v) => onChange("subIndustry", v)} />
          )}
          <ValidatedSelect label="What do you need the money for?" placeholder="Select purpose" options={MONEY_NEEDS} value={data.moneyPurpose || ""} onValueChange={(v) => onChange("moneyPurpose", v)} error={errors.moneyPurpose} />
          <ValidatedSelect label="When do you need the money?" placeholder="Select timeline" options={MONEY_TIMELINE} value={data.moneyTimeline || ""} onValueChange={(v) => onChange("moneyTimeline", v)} error={errors.moneyTimeline} />
        </div>
      </section>

      {/* Entity & Registration */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 bg-primary rounded-full" />
          <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">Entity & Registration</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ValidatedSelect label="Business Entity Type" placeholder="Select entity" options={ENTITY_TYPES} value={data.entityType || ""} onValueChange={(v) => onChange("entityType", v)} error={errors.entityType} />
          <ValidatedSelect label="State of Formation" placeholder="Select state" options={US_STATES} value={data.formationState || ""} onValueChange={(v) => onChange("formationState", v)} error={errors.formationState} />
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Federal Tax ID (EIN)</label>
            <div className="relative">
              <input
                type={showEIN ? "text" : "password"}
                inputMode="numeric"
                autoComplete="off"
                placeholder="••-•••••••"
                maxLength={10}
                value={data.taxId || ""}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 9);
                  if (v.length > 2) v = v.slice(0, 2) + "-" + v.slice(2);
                  onChange("taxId", v);
                }}
                className={`w-full bg-card border text-foreground placeholder:text-muted-foreground/60 h-10 px-3 pr-10 transition-all duration-200 text-sm rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50 ${
                  data.taxId && data.taxId.replace(/\D/g, "").length === 9 ? "border-success field-valid" : errors.taxId ? "border-destructive" : "border-border"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowEIN(!showEIN)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showEIN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.taxId && <p className="text-[11px] text-destructive font-medium">{errors.taxId}</p>}
            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1"><Shield className="w-3 h-3" />9-digit Employer Identification Number</p>
          </div>
          <ValidatedInput label="Business Registration Date" type="date" value={data.registrationDate || ""} onChange={(e) => onChange("registrationDate", e.target.value)} isValid={!!data.registrationDate} error={errors.registrationDate} />
        </div>
      </section>

      {/* Yes/No */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 bg-primary rounded-full" />
          <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">
            Additional Information
          </h3>
        </div>
        <RadioQuestion
          label="Do you have any open business loans or merchant cash advances?"
          value={data.hasOpenLoans || ""}
          onChange={(v) => {
            onChange("hasOpenLoans", v);
            if (v !== "yes") onChange("openLoansCount", "");
          }}
          name="loans"
        />
        {data.hasOpenLoans === "yes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ValidatedSelect
              label="If Yes, How Many?"
              placeholder="Select"
              value={data.openLoansCount || ""}
              onValueChange={(v) => onChange("openLoansCount", v)}
              options={[
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
                { value: "5+", label: "5+" },
              ]}
              error={errors.openLoansCount}
            />
          </div>
        )}
        <RadioQuestion
          label="Do you own any commercial/residential investment properties?"
          value={data.hasProperties || ""}
          onChange={(v) => onChange("hasProperties", v)}
          name="props"
        />
      </section>
    </motion.div>
  );
};

export default BusinessInfo;
