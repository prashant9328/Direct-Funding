import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Lock,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Zap,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StepIndicator from "./StepIndicator";
import ApplicationInfo from "./steps/ApplicationInfo";
import BusinessInfo from "./steps/BusinessInfo";
import OwnerInfo, { createEmptyOwner, Owner } from "./steps/OwnerInfo";
import ReviewSubmit from "./steps/ReviewSubmit";
import UploadBankStatements from "./steps/UploadBankStatements";
import ExitIntentPopup from "./ExitIntentPopup";
import {
  isLeadExist,
  getDataForApplicationTab,
  getDataForBusinessTab,
  getDataForOwnersTab,
  setDataForLead,
  updateApexTracker,
  uploadFiles,
  getFundedAction,
  getOwnerInfo,
  LoanApplicationSettings,
  UserOwnerInfo,
} from "@/lib/salesforceApi";

const STEPS = [
  { label: "Contact Info", description: "Takes 30 seconds", emoji: "🚀" },
  { label: "Business Details", description: "Almost there", emoji: "🏢" },
  {
    label: "Owner Verification",
    description: "Quick verification",
    emoji: "👤",
  },
  { label: "Review & Agree", description: "Secure your offer", emoji: "🔒" },
  { label: "Bank Statements", description: "Skip the wait", emoji: "⚡" },
];

const SOCIAL_PROOF = [
  "Sarah M. from Texas was funded $85,000 — 2 hours ago",
  "Mike R. from Florida received $120,000 — 4 hours ago",
  "Lisa K. from New York got approved for $65,000 — 6 hours ago",
  "James W. from California received $200,000 — 8 hours ago",
];

const STATE_TO_CODE: Record<string, string> = {
  // US States
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",

  // Canada
  Ontario: "ON",
  "British Columbia": "BC",
  Alberta: "AB",
  Manitoba: "MB",
  "New Brunswick": "NB",
  "Newfoundland and Labrador": "NL",
  "Nova Scotia": "NS",
  "Northwest Territories": "NT",
  Nunavut: "NU",
  "Prince Edward Island": "PE",
  Quebec: "QC",
  Saskatchewan: "SK",
  Yukon: "YT",
};

const CODE_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_TO_CODE).map(([name, code]) => [code, name]),
);
const FIELD_LABELS: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email Address",
  phone: "Phone Number",
  website: "Website",
  bizStreet: "Business Street",
  bizCity: "Business City",
  bizState: "Business State",
  bizZip: "Business ZIP",
  industry: "Industry",
  moneyPurpose: "Purpose of Funds",
  moneyTimeline: "Funding Timeline",
  entityType: "Entity Type",
  formationState: "Formation State",
  taxId: "Tax ID (EIN)",
  registrationDate: "Registration Date",
  openLoansCount: "Number of Open Loans",
  homeStreet: "Home Street",
  homeCity: "Home City",
  homeState: "Home State",
  homeZip: "Home ZIP",
  dob: "Date of Birth",
  ssn: "SSN",
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.substring(result.indexOf(",") + 1);
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function mapReactStateToSalesforce(
  stepIndex: number,
  appData: Record<string, string>,
  owners: Owner[],
  config: LoanApplicationSettings,
  recordId: string,
): Record<string, any> {
  const result: Record<string, any> = { Id: recordId };

  if (stepIndex === 0) {
    if (config.Company_Name__c)
      result[config.Company_Name__c] = appData.businessName || "";
    if (config.DBA_Name__c) result[config.DBA_Name__c] = appData.dba || "";
    if (config.Business_Operating_Time__c)
      result[config.Business_Operating_Time__c] = appData.operatingTime || "";
    if (config.Gross_Monthly_Revenue__c)
      result[config.Gross_Monthly_Revenue__c] = appData.grossRevenue || "";
    if (config.Website__c) result[config.Website__c] = appData.website || "";
    if (config.Loan_Request__c) {
      const cleanLoan = (appData.loanRequest || "")
        .replace(/\$/g, "")
        .replace(/,/g, "");
      result[config.Loan_Request__c] = cleanLoan;
    }
    if (config.First_Name__c)
      result[config.First_Name__c] = appData.firstName || "";
    if (config.Last_Name__c)
      result[config.Last_Name__c] = appData.lastName || "";
    if (config.Email_Address__c)
      result[config.Email_Address__c] = appData.email || "";
    if (config.Mobile_Phone_Number__c)
      result[config.Mobile_Phone_Number__c] = appData.phone || "";

    result.Loan_Application_Stage__c = "Application Information";
  }

  if (stepIndex === 1) {
    if (config.Business_Street_Address__c)
      result[config.Business_Street_Address__c] = appData.bizStreet || "";
    if (config.Business_City__c)
      result[config.Business_City__c] = appData.bizCity || "";
    //if (config.Business_State__c) result[config.Business_State__c] = appData.bizState || "";
    if (config.Business_State__c) {
      result[config.Business_State__c] = STATE_TO_CODE[appData.bizState] || "";
    }
    if (config.Business_Zip__c)
      result[config.Business_Zip__c] = appData.bizZip || "";
    if (config.Business_Industry__c)
      result[config.Business_Industry__c] = appData.industry || "";
    if (config.Sub_Industry__c)
      result[config.Sub_Industry__c] = appData.subIndustry || "";
    if (config.What_do_you_need_the_money_for__c)
      result[config.What_do_you_need_the_money_for__c] =
        appData.moneyPurpose || "";
    if (config.When_Do_You_Need_the_Money__c)
      result[config.When_Do_You_Need_the_Money__c] =
        appData.moneyTimeline || "";
    if (config.Select_your_business_entity__c)
      result[config.Select_your_business_entity__c] = appData.entityType || "";
    //if (config.State_Of_Formation__c) result[config.State_Of_Formation__c] = appData.formationState || "";
    if (config.State_Of_Formation__c) {
      result[config.State_Of_Formation__c] =
        STATE_TO_CODE[appData.formationState] || "";
    }
    if (config.Federal_Tax_ID__c) {
      const cleanEIN = (appData.taxId || "").replace(/\D/g, "");
      result[config.Federal_Tax_ID__c] = cleanEIN;
    }
    if (config.Business_Registration_Date__c)
      result[config.Business_Registration_Date__c] =
        appData.registrationDate || "";
    if (config.Do_You_Have_Any_Open_Business_Loans_MCA__c) {
      const value = appData.hasOpenLoans?.toLowerCase();

      result[config.Do_You_Have_Any_Open_Business_Loans_MCA__c] =
        value === "yes" || value === "true";
    }
    if (config.If_Yes_How_Many__c)
      result[config.If_Yes_How_Many__c] = appData.openLoansCount || "";

    result.Loan_Application_Stage__c = "Business Information";
  }

  if (stepIndex === 2) {
    const o0 = owners[0];
    if (o0) {
      if (config.First_Name__c)
        result[config.First_Name__c] = o0.firstName || "";
      if (config.Last_Name__c) result[config.Last_Name__c] = o0.lastName || "";
      if (config.Email_Address__c)
        result[config.Email_Address__c] = o0.email || "";
      if (config.Mobile_Phone_Number__c)
        result[config.Mobile_Phone_Number__c] = o0.phone || "";
      if (config.First_Owner_Birth__c)
        result[config.First_Owner_Birth__c] = o0.dob || "";
      if (config.First_Owner_SSN__c) {
        const cleanSSN = (o0.ssn || "").replace(/\D/g, "");
        result[config.First_Owner_SSN__c] = cleanSSN;
      }
      if (config.First_Owner_Street__c)
        result[config.First_Owner_Street__c] = o0.homeStreet || "";
      if (config.First_Owner_City__c)
        result[config.First_Owner_City__c] = o0.homeCity || "";
      if (config.First_Owner_State__c)
        result[config.First_Owner_State__c] = STATE_TO_CODE[o0.homeState] || "";
      // Change To Code
      if (config.First_Owner_Zip__c)
        result[config.First_Owner_Zip__c] = o0.homeZip || "";
      if (config.First_Owner_Personal_Credit_Score__c)
        result[config.First_Owner_Personal_Credit_Score__c] = o0.creditScore;
      if (config.What_percentage_of_ownership_do_you_have__c)
        result[config.What_percentage_of_ownership_do_you_have__c] =
          o0.ownershipPercent;
      if (config.Do_you_own_or_rent_your_home__c)
        result[config.Do_you_own_or_rent_your_home__c] = o0.homeOwnership || "";
    }

    const o1 = owners[1];
    if (o1) {
      if (config.Second_Owner_First_Name__c)
        result[config.Second_Owner_First_Name__c] = o1.firstName || "";
      if (config.Second_Owner_Last_Name__c)
        result[config.Second_Owner_Last_Name__c] = o1.lastName || "";
      if (config.Second_Owner_Email__c)
        result[config.Second_Owner_Email__c] = o1.email || "";
      if (config.Second_Owner_Phone_Number__c)
        result[config.Second_Owner_Phone_Number__c] = o1.phone || "";
      if (config.Second_Owner_Birth__c)
        result[config.Second_Owner_Birth__c] = o1.dob || "";
      if (config.Second_Owner_SSN__c) {
        const cleanSSN = (o1.ssn || "").replace(/\D/g, "");
        result[config.Second_Owner_SSN__c] = cleanSSN;
      }
      if (config.Second_Owner_Street__c)
        result[config.Second_Owner_Street__c] = o1.homeStreet || "";
      if (config.Second_Owner_City__c)
        result[config.Second_Owner_City__c] = o1.homeCity || "";
      if (config.Second_Owner_State__c) result[config.Second_Owner_State__c] = STATE_TO_CODE[o1.homeState] || "";
      if (config.Second_Owner_Zip__c)
        result[config.Second_Owner_Zip__c] = o1.homeZip || "";
      if (config.Seecond_Owner_Credit_Score__c)
        result[config.Seecond_Owner_Credit_Score__c] = o1.creditScore;
      if (config.Second_What_Percentage_Of_Ownership__c)
        result[config.Second_What_Percentage_Of_Ownership__c] =
          o1.ownershipPercent;
    }

    result.Loan_Application_Stage__c = "Personal Information";
  }

  return result;
}

const formatDate = (timestamp: number | string | null | undefined): string => {
  if (!timestamp) return "";

  const date = new Date(Number(timestamp));
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

function mapSalesforceToReactState(
  sObj: any,
  config: LoanApplicationSettings,
): { appData: Record<string, string>; owners: Owner[] } {
  const appData: Record<string, string> = {};
  console.log("Start Mapping");
  console.log("Config Fields ", config);
  console.log("Salesforce Object ", sObj);
  console.log(
    "Loan Request ",
    sObj[config.Loan_Request__c],
    config.Loan_Request__c,
  );
  if (config.Company_Name__c && sObj[config.Company_Name__c])
    appData.businessName = String(sObj[config.Company_Name__c]);
  if (config.DBA_Name__c && sObj[config.DBA_Name__c])
    appData.dba = String(sObj[config.DBA_Name__c]);
  if (
    config.Business_Operating_Time__c &&
    sObj[config.Business_Operating_Time__c]
  )
    appData.operatingTime = String(sObj[config.Business_Operating_Time__c]);
  if (config.Gross_Monthly_Revenue__c && sObj[config.Gross_Monthly_Revenue__c])
    appData.grossRevenue = String(sObj[config.Gross_Monthly_Revenue__c]);
  if (config.Website__c && sObj[config.Website__c])
    appData.website = String(sObj[config.Website__c]);
  if (config.Loan_Request__c && sObj[config.Loan_Request__c])
    appData.loanRequest = String(sObj[config.Loan_Request__c]);
  if (config.First_Name__c && sObj[config.First_Name__c])
    appData.firstName = String(sObj[config.First_Name__c]);
  if (config.Last_Name__c && sObj[config.Last_Name__c])
    appData.lastName = String(sObj[config.Last_Name__c]);
  if (config.Email_Address__c && sObj[config.Email_Address__c])
    appData.email = String(sObj[config.Email_Address__c]);
  if (config.Mobile_Phone_Number__c && sObj[config.Mobile_Phone_Number__c])
    appData.phone = String(sObj[config.Mobile_Phone_Number__c]);

  if (
    config.Business_Street_Address__c &&
    sObj[config.Business_Street_Address__c]
  )
    appData.bizStreet = String(sObj[config.Business_Street_Address__c]);
  if (config.Business_City__c && sObj[config.Business_City__c])
    appData.bizCity = String(sObj[config.Business_City__c]);
  if (config.Business_State__c && sObj[config.Business_State__c]) {
    appData.bizState =
      CODE_TO_STATE[String(sObj[config.Business_State__c])] || "";
  }
  //Change to state code
  if (config.Business_Zip__c && sObj[config.Business_Zip__c])
    appData.bizZip = String(sObj[config.Business_Zip__c]);
  if (config.Business_Industry__c && sObj[config.Business_Industry__c])
    appData.industry = String(sObj[config.Business_Industry__c]);
  if (config.Sub_Industry__c && sObj[config.Sub_Industry__c])
    appData.subIndustry = String(sObj[config.Sub_Industry__c]);
  if (
    config.What_do_you_need_the_money_for__c &&
    sObj[config.What_do_you_need_the_money_for__c]
  )
    appData.moneyPurpose = String(
      sObj[config.What_do_you_need_the_money_for__c],
    );
  if (
    config.When_Do_You_Need_the_Money__c &&
    sObj[config.When_Do_You_Need_the_Money__c]
  )
    appData.moneyTimeline = String(sObj[config.When_Do_You_Need_the_Money__c]);
  if (
    config.Select_your_business_entity__c &&
    sObj[config.Select_your_business_entity__c]
  )
    appData.entityType = String(sObj[config.Select_your_business_entity__c]);
  if (config.State_Of_Formation__c && sObj[config.State_Of_Formation__c])
    appData.formationState =
      CODE_TO_STATE[String(sObj[config.State_Of_Formation__c])] || "";
  // Change to state code
  if (config.Federal_Tax_ID__c && sObj[config.Federal_Tax_ID__c])
    appData.taxId = String(sObj[config.Federal_Tax_ID__c]);
  if (
    config.Business_Registration_Date__c &&
    sObj[config.Business_Registration_Date__c]
  ) {
    const date = new Date(Number(sObj[config.Business_Registration_Date__c]));
    appData.registrationDate = date.toISOString().split("T")[0];
    console.log("date converted : ", date);
  }
  console.log("date : ", appData.registrationDate);
  if (config.Do_You_Have_Any_Open_Business_Loans_MCA__c) {
    const value = sObj[config.Do_You_Have_Any_Open_Business_Loans_MCA__c];

    if (value !== null && value !== undefined) {
      appData.hasOpenLoans = value ? "yes" : "no";
    }
  }
  if (config.If_Yes_How_Many__c && sObj[config.If_Yes_How_Many__c])
    appData.openLoansCount = String(sObj[config.If_Yes_How_Many__c]);

  // Do_You_Own_Any_Investment_Property__c  Remaining

  const owners: Owner[] = [];

  const o0: Owner = {
    firstName: sObj[config.First_Name__c]
      ? String(sObj[config.First_Name__c])
      : "",
    lastName: sObj[config.Last_Name__c]
      ? String(sObj[config.Last_Name__c])
      : "",
    email: sObj[config.Email_Address__c]
      ? String(sObj[config.Email_Address__c])
      : "",
    phone: sObj[config.Mobile_Phone_Number__c]
      ? String(sObj[config.Mobile_Phone_Number__c])
      : "",
    //dob: sObj[config.First_Owner_Birth__c] ? String(sObj[config.First_Owner_Birth__c]) : "",
    dob: formatDate(sObj[config.First_Owner_Birth__c]),

    ssn: sObj[config.First_Owner_SSN__c]
      ? String(sObj[config.First_Owner_SSN__c])
      : "",
    homeStreet: sObj[config.First_Owner_Street__c]
      ? String(sObj[config.First_Owner_Street__c])
      : "",
    homeCity: sObj[config.First_Owner_City__c]
      ? String(sObj[config.First_Owner_City__c])
      : "",
    homeState: sObj[config.First_Owner_State__c]
      ? CODE_TO_STATE[String(sObj[config.First_Owner_State__c])]
      : "",
    homeZip: sObj[config.First_Owner_Zip__c]
      ? String(sObj[config.First_Owner_Zip__c])
      : "",
    creditScore: sObj[config.First_Owner_Personal_Credit_Score__c]
      ? Number(sObj[config.First_Owner_Personal_Credit_Score__c])
      : 650,
    ownershipPercent: sObj[config.What_percentage_of_ownership_do_you_have__c]
      ? Number(sObj[config.What_percentage_of_ownership_do_you_have__c])
      : 100,
    homeOwnership: sObj[config.Do_you_own_or_rent_your_home__c]
      ? String(sObj[config.Do_you_own_or_rent_your_home__c])
      : "",
  };
  owners.push(o0);

  if (
    sObj[config.Second_Owner_First_Name__c] ||
    sObj[config.Second_Owner_Last_Name__c]
  ) {
    const o1: Owner = {
      firstName: sObj[config.Second_Owner_First_Name__c]
        ? String(sObj[config.Second_Owner_First_Name__c])
        : "",
      lastName: sObj[config.Second_Owner_Last_Name__c]
        ? String(sObj[config.Second_Owner_Last_Name__c])
        : "",
      email: sObj[config.Second_Owner_Email__c]
        ? String(sObj[config.Second_Owner_Email__c])
        : "",
      phone: sObj[config.Second_Owner_Phone_Number__c]
        ? String(sObj[config.Second_Owner_Phone_Number__c])
        : "",
      // dob: sObj[config.Second_Owner_Birth__c] ? String(sObj[config.Second_Owner_Birth__c]) : "",
      dob: formatDate(sObj[config.Second_Owner_Birth__c]),
      ssn: sObj[config.Second_Owner_SSN__c]
        ? String(sObj[config.Second_Owner_SSN__c])
        : "",
      homeStreet: sObj[config.Second_Owner_Street__c]
        ? String(sObj[config.Second_Owner_Street__c])
        : "",
      homeCity: sObj[config.Second_Owner_City__c]
        ? String(sObj[config.Second_Owner_City__c])
        : "",
      homeState: sObj[config.Second_Owner_State__c]
        ? CODE_TO_STATE[String(sObj[config.Second_Owner_State__c])]
        : "",
      homeZip: sObj[config.Second_Owner_Zip__c]
        ? String(sObj[config.Second_Owner_Zip__c])
        : "",
      creditScore: sObj[config.Seecond_Owner_Credit_Score__c]
        ? Number(sObj[config.Seecond_Owner_Credit_Score__c])
        : 650,
      ownershipPercent: sObj[config.Second_What_Percentage_Of_Ownership__c]
        ? Number(sObj[config.Second_What_Percentage_Of_Ownership__c])
        : 50,
      homeOwnership: "",
    };
    owners.push(o1);
  }

  return { appData, owners };
}

const MCAApplicationForm = () => {
  const [step, setStep] = useState(0);
  const [appData, setAppData] = useState<Record<string, string>>({});
  const [owners, setOwners] = useState<Owner[]>([createEmptyOwner()]);
  const [agreed, setAgreed] = useState(true); // Pre-checked
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialProofIndex, setSocialProofIndex] = useState(0);
  const [completedFields, setCompletedFields] = useState(0);

  // Salesforce State
  const [config, setConfig] = useState<LoanApplicationSettings | null>(null);
  const [recordId, setRecordId] = useState<string>("00QUf000006y5ZF");
  const [loadingRecord, setLoadingRecord] = useState<boolean>(true);
  const [ownerDetails, setOwnerDetails] = useState<UserOwnerInfo | null>(null);

  // Extract ID and load data on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let rId = "00QUf000006y5ZF"; // Default fallback
    if (urlParams.has("recordId")) {
      rId = urlParams.get("recordId")!;
    } else {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#")) {
        rId = hash.substring(1);
      }
    }
    console.log(rId);
    setRecordId(rId);

    const initData = async () => {
      setLoadingRecord(true);
      try {
        const configRecord = await isLeadExist(rId);
        if (configRecord) {
          setConfig(configRecord);
          // Preload data across all sections
          const [appDataObj, bizDataObj, ownerDataObj] = await Promise.all([
            getDataForApplicationTab(rId),
            getDataForBusinessTab(rId),
            getDataForOwnersTab(rId),
          ]);
          console.log("Data Fetch Successfully");
          console.log(appDataObj, bizDataObj, ownerDataObj);

          const mergedRecord = {
            ...appDataObj,
            ...bizDataObj,
            ...ownerDataObj,
          };
          const { appData: loadedAppData, owners: loadedOwners } =
            mapSalesforceToReactState(mergedRecord, configRecord);

          console.log("loadedAppData", loadedAppData);
          console.log("loadedOwners", loadedOwners);
          if (Object.keys(loadedAppData).length > 0) {
            setAppData((prev) => ({ ...prev, ...loadedAppData }));
          }
          if (loadedOwners.length > 0) {
            setOwners(loadedOwners);
          }
        }
      } catch (err) {
        console.error("Error loading application record from Salesforce:", err);
      } finally {
        setLoadingRecord(false);
      }
    };

    initData();
  }, []);

  // Rotate social proof
  useEffect(() => {
    const interval = setInterval(() => {
      setSocialProofIndex((prev) => (prev + 1) % SOCIAL_PROOF.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Count completed fields for gamification
  useEffect(() => {
    const filled = Object.values(appData).filter((v) => v && v.trim()).length;
    setCompletedFields(filled);
  }, [appData]);

  // Log current form data to console on step navigation
  useEffect(() => {
    console.log(
      `[Form Navigation] Step ${step + 1} ("${STEPS[step]?.label || ""}") loaded.`,
      {
        currentStep: step + 1,
        appData,
        owners,
        filesCount: files.length,
        filesList: files.map((f) => ({
          name: f.name,
          size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
          type: f.type,
        })),
      },
    );
  }, [step]);

  const updateField = (field: string, value: string) => {
    setAppData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const REAL_TLDS = new Set([
    "com",
    "net",
    "org",
    "io",
    "co",
    "us",
    "uk",
    "ca",
    "au",
    "de",
    "fr",
    "in",
    "jp",
    "cn",
    "br",
    "mx",
    "ru",
    "it",
    "es",
    "nl",
    "gov",
    "edu",
    "biz",
    "info",
    "me",
    "tv",
    "app",
    "dev",
    "ai",
    "tech",
    "online",
    "store",
    "shop",
    "blog",
    "news",
    "media",
    "digital",
    "cloud",
    "health",
    "mobi",
    "name",
    "pro",
    "nz",
    "sg",
    "hk",
    "za",
    "ae",
    "sa",
    "se",
    "no",
    "dk",
    "fi",
    "pl",
    "be",
    "ch",
    "at",
    "pt",
    "gr",
    "tr",
    "id",
    "ph",
    "th",
    "vn",
    "my",
    "ng",
    "ke",
    "gh",
    "ma",
    "eg",
    "pk",
    "bd",
    "lk",
    "ar",
    "cl",
    "pe",
    "ve",
    "ec",
    "uy",
    "bo",
    "py",
    "cr",
    "gt",
    "hn",
    "sv",
    "ni",
    "pa",
    "do",
    "cu",
    "pr",
    "tt",
    "jm",
    "gg",
    "je",
    "im",
    "eu",
    "int",
    "mil",
    "aero",
    "coop",
    "museum",
    "travel",
    "jobs",
    "cat",
    "tel",
    "post",
    "xxx",
    "ua",
    "rs",
    "hr",
    "bg",
    "ro",
    "hu",
    "cz",
    "sk",
    "ee",
    "lv",
    "lt",
    "si",
    "by",
    "md",
    "al",
    "ba",
    "mk",
    "is",
    "li",
    "lu",
    "mc",
    "sm",
    "va",
    "cy",
    "mt",
    "kz",
    "uz",
    "az",
    "ge",
    "am",
    "mn",
    "af",
    "np",
    "bt",
    "kh",
    "la",
    "mm",
    "bn",
    "mz",
    "rw",
    "tz",
    "ug",
    "zm",
    "zw",
    "bw",
    "ls",
    "sz",
    "na",
    "bi",
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

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!appData.businessName) errs.businessName = "Required";
      if (!appData.operatingTime) errs.operatingTime = "Required";
      if (!appData.grossRevenue) errs.grossRevenue = "Required";
      if (!appData.loanRequest) errs.loanRequest = "Required";
      if (!appData.firstName) errs.firstName = "Required";
      if (!appData.lastName) errs.lastName = "Required";
      if (!appData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(appData.email))
        errs.email = "Valid email required";
      if (!appData.phone || appData.phone.replace(/\D/g, "").length < 10)
        errs.phone = "Valid phone required";
      if (appData.website && !isValidWebsite(appData.website))
        errs.website = "Enter a valid website URL (e.g. www.example.com)";
    }
    if (step === 1) {
      if (!appData.bizStreet) errs.bizStreet = "Required";
      if (!appData.bizCity) errs.bizCity = "Required";
      if (!appData.bizState) errs.bizState = "Required";
      if (!appData.bizZip || appData.bizZip.length !== 5)
        errs.bizZip = "Valid ZIP required";
      if (!appData.industry) errs.industry = "Required";
      if (!appData.moneyPurpose) errs.moneyPurpose = "Required";
      if (!appData.moneyTimeline) errs.moneyTimeline = "Required";
      if (!appData.entityType) errs.entityType = "Required";
      if (!appData.formationState) errs.formationState = "Required";
      if (!appData.taxId || appData.taxId.replace(/\D/g, "").length !== 9)
        errs.taxId = "Valid 9-digit EIN required";
      if (!appData.registrationDate) errs.registrationDate = "Required";
      if (appData.hasOpenLoans === "yes" && !appData.openLoansCount)
        errs.openLoansCount = "Required";
    }
    if (step === 2) {
      owners.forEach((o, i) => {
        if (!o.firstName) errs[`owner${i}_firstName`] = "Required";
        if (!o.lastName) errs[`owner${i}_lastName`] = "Required";
        if (!o.homeStreet) errs[`owner${i}_homeStreet`] = "Required";
        if (!o.homeCity) errs[`owner${i}_homeCity`] = "Required";
        if (!o.homeState) errs[`owner${i}_homeState`] = "Required";
        if (!o.homeZip || o.homeZip.length !== 5)
          errs[`owner${i}_homeZip`] = "Valid ZIP required";
        if (!o.dob) errs[`owner${i}_dob`] = "Required";
        if (!o.ssn || o.ssn.replace(/\D/g, "").length !== 9)
          errs[`owner${i}_ssn`] = "Valid SSN required";
      });
    }
    setErrors(errs);
    const errKeys = Object.keys(errs);
    if (errKeys.length > 0) {
      const missing = errKeys.slice(0, 3).map((k) => {
        if (k.startsWith("owner")) {
          const parts = k.split("_");
          const ownerNum = parseInt(parts[0].replace("owner", "")) + 1;
          const fieldLabel =
            FIELD_LABELS[parts.slice(1).join("_")] ?? parts.slice(1).join(" ");
          return owners.length > 1
            ? `Owner ${ownerNum}: ${fieldLabel}`
            : fieldLabel;
        }
        return FIELD_LABELS[k] ?? k;
      });
      const suffix = errKeys.length > 3 ? ` + ${errKeys.length - 3} more` : "";
      toast.error(`Please complete: ${missing.join(", ")}${suffix}`);
      setTimeout(() => {
        const el = document.querySelector(".border-destructive");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return false;
    }
    return true;
  };

  const next = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      let updatedOwners = owners;
      if (step === 1) {
        const updated = [...owners];
        const owner0 = { ...updated[0] };
        if (!owner0.firstName && appData.firstName)
          owner0.firstName = appData.firstName;
        if (!owner0.lastName && appData.lastName)
          owner0.lastName = appData.lastName;
        if (!owner0.email && appData.email) owner0.email = appData.email;
        if (!owner0.phone && appData.phone) owner0.phone = appData.phone;
        updated[0] = owner0;
        updatedOwners = updated;
        setOwners(updated);
      }

      // Save stage progress to Salesforce
      if (config) {
        try {
          const sfPayload = mapReactStateToSalesforce(
            step,
            appData,
            updatedOwners,
            config,
            recordId,
          );
          await setDataForLead(JSON.stringify(sfPayload));

          const stageName =
            step === 0
              ? "Application Information"
              : step === 1
                ? "Business Information"
                : "Personal Information";
          await updateApexTracker(JSON.stringify(sfPayload), stageName);
        } catch (err) {
          console.error("Failed to save step progress to Salesforce:", err);
        }
      }

      if (step < STEPS.length - 1) {
        setStep(step + 1);
        const messages = [
          "🎉 Great start! You're already ahead of 73% of applicants",
          "🔥 Business details locked in! Your custom offer is being prepared...",
          "✅ Verified! You're in the top 12% of applicants today",
          "🚀 Almost done — don't lose your spot in the funding queue!",
        ];
        if (messages[step]) toast.success(messages[step]);
      }
    } finally {
      setLoading(false);
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (step === 3 && !agreed) {
      toast.error("Please agree to continue");
      return;
    }

    if (step === 3) {
      setSubmitting(true);
      try {
        await getFundedAction(recordId);
        setStep(4);
      } catch (err) {
        toast.error("Failed to update status — please try again");
        console.error(err);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Step 4 — final submission (upload statements and finalize)
    setSubmitting(true);
    console.log(
      "[Form Submission] Submitting final files and completing application...",
      {
        recordId,
        files: files.map((f) => ({
          name: f.name,
          size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
          type: f.type,
        })),
      },
    );

    try {
      // Upload statements in base64 format
      for (const file of files) {
        try {
          const base64 = await fileToBase64(file);
          await uploadFiles(base64, file.name, recordId);
        } catch (uploadErr) {
          console.error(`File upload failed for ${file.name}:`, uploadErr);
        }
      }

      // Close the lead application and retrieve assignee info
      const ownerInfo = await getOwnerInfo(recordId);
      if (ownerInfo) {
        setOwnerDetails(ownerInfo);
      }

      setSubmitted(true);
      toast.success("Application submitted! Expect a call within hours");
    } catch (err) {
      toast.error("Submission failed — please try again or contact support");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">
            Loading your application details...
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto glow-primary"
          >
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-3xl font-display font-bold text-foreground">
              You're In! 🎉
            </h1>
            <p className="text-muted-foreground text-[15px] leading-relaxed">
              Your application has been received successfully. A dedicated
              funding specialist is reviewing your application details now to
              secure your pre-approved offers.
            </p>
          </div>

          {ownerDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-elevated rounded-2xl p-6 text-left border border-border bg-card space-y-4 shadow-md"
            >
              <h3 className="text-xs font-bold text-primary uppercase tracking-wide">
                Assigned Funding Representative
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-base font-bold text-foreground">
                    {ownerDetails.Name}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground space-y-2 border-t border-border/60 pt-3">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      📧 Email:
                    </span>
                    <a
                      href={`mailto:${ownerDetails.Email}`}
                      className="text-primary hover:underline"
                    >
                      {ownerDetails.Email}
                    </a>
                  </p>
                  {ownerDetails.Phone && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        📞 Phone:
                      </span>
                      <a
                        href={`tel:${ownerDetails.Phone}`}
                        className="text-primary hover:underline"
                      >
                        {ownerDetails.Phone}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <div className="card-elevated rounded-xl p-5 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Your information is protected with bank-level 256-bit encryption
          </div>
        </motion.div>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  const stepCTAs = [
    { label: "Continue — Lock In Your Rate", icon: ArrowRight },
    { label: "Next — Unlock Your Offer", icon: ArrowRight },
    { label: "Verify & Secure My Spot", icon: ArrowRight },
    { label: "Claim My Pre-Approval →", icon: ArrowRight },
    { label: "Submit & Get Funded Today", icon: Send },
  ];

  const cta = stepCTAs[step];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ExitIntentPopup />

      {/* Professional Loading Overlay */}
      <AnimatePresence>
        {(loading || submitting) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className="bg-card rounded-2xl p-8 shadow-2xl text-center space-y-4 max-w-sm"
            >
              <div className="flex justify-center">
                <div className="relative w-16 h-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {submitting
                    ? "Submitting Application"
                    : "Processing Your Information"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {submitting
                    ? "Uploading files and finalizing..."
                    : "Saving your data securely..."}
                </p>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <motion.span
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ●
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  >
                    ●
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  >
                    ●
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Top bar */}
      <header className="bg-card border-b border-border px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-[15px] font-display font-bold text-foreground tracking-tight">
                Direct Funding Now
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" />
              256-bit Encrypted
            </span>
          </div>
        </div>
      </header>

      {/* Social proof ticker */}
      <div className="bg-primary/[0.04] border-b border-primary/10 px-4 py-2 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <AnimatePresence mode="wait">
            <motion.p
              key={socialProofIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-primary font-medium"
            >
              {SOCIAL_PROOF[socialProofIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="lg:hidden h-1.5 bg-secondary">
        <motion.div
          className="h-full bg-primary progress-bar-glow rounded-r-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex-1 flex">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col w-80 bg-card border-r border-border p-6">
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Progress
                </p>
                <span className="text-xs font-bold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full progress-bar-glow"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
            <StepIndicator steps={STEPS} currentStep={step} />
          </div>

          {/* Trust + urgency badges */}
          <div className="space-y-3 pt-6 border-t border-border">
            <div className="rounded-lg bg-urgency/10 border border-urgency/20 p-3 text-xs text-urgency font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              Same-day funding available — apply now
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Secure credit review included</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>Bank-level encryption</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              <span>97% approval rate</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
            {/* Step header */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                {STEPS[step].emoji} Step {step + 1} of {STEPS.length} —{" "}
                {STEPS[step].label}
              </p>
              <span className="text-[11px] text-muted-foreground lg:hidden">
                {Math.round(progress)}% complete
              </span>
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <ApplicationInfo
                  key="app"
                  data={appData}
                  onChange={updateField}
                  errors={errors}
                />
              )}
              {step === 1 && (
                <BusinessInfo
                  key="biz"
                  data={appData}
                  onChange={updateField}
                  errors={errors}
                />
              )}
              {step === 2 && (
                <OwnerInfo
                  key="owner"
                  owners={owners}
                  onOwnersChange={setOwners}
                  errors={errors}
                />
              )}
              {step === 3 && (
                <ReviewSubmit
                  key="review"
                  appData={appData}
                  owners={owners}
                  agreed={agreed}
                  onAgreeChange={setAgreed}
                />
              )}
              {step === 4 && (
                <UploadBankStatements
                  key="upload"
                  files={files}
                  onFilesChange={setFiles}
                />
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={prev}
                disabled={step === 0}
                className="text-muted-foreground hover:text-foreground gap-1.5 h-10 px-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>

              {step < 3 && (
                <Button
                  onClick={next}
                  disabled={loading}
                  className="h-11 px-7 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold glow-primary text-sm disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      {cta.label} <cta.icon className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
              {step === 3 && (
                <Button
                  onClick={handleSubmit}
                  disabled={!agreed || submitting || loading}
                  className="h-11 px-7 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold glow-primary text-sm disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      {cta.label} <cta.icon className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
              {step === 4 && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || loading}
                  className="h-11 px-7 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold glow-primary text-sm disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      {cta.label} <cta.icon className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Bottom urgency nudge */}
            <div className="mt-4 text-center">
              <p className="text-[11px] text-muted-foreground">
                ⏱️ Complete now to qualify for{" "}
                <span className="text-urgency font-semibold">
                  same-day funding
                </span>{" "}
                — offer expires at midnight
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MCAApplicationForm;
