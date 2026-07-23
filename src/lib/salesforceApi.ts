export interface LoanApplicationSettings {
  Id: string;
  Company_Name__c: string;
  DBA_Name__c: string;
  Business_Operating_Time__c: string;
  Gross_Monthly_Revenue__c: string;
  Loan_Request__c: string;
  Email_Address__c: string;
  Mobile_Phone_Number__c: string;
  Website__c: string;
  First_Name__c: string;
  Last_Name__c: string;
  Business_Street_Address__c: string;
  Business_City__c: string;
  Business_State__c: string;
  Business_Zip__c: string;
  Business_Industry__c: string;
  Sub_Industry__c: string;
  What_do_you_need_the_money_for__c: string;
  When_Do_You_Need_the_Money__c: string;
  Select_your_business_entity__c: string;
  State_Of_Formation__c: string;
  Federal_Tax_ID__c: string;
  Business_Registration_Date__c: string;
  Do_You_Have_Any_Open_Business_Loans_MCA__c: string;
  If_Yes_How_Many__c: string;
  First_Owner_Street__c: string;
  First_Owner_City__c: string;
  First_Owner_State__c: string;
  First_Owner_Zip__c: string;
  First_Owner_Birth__c: string;
  First_Owner_SSN__c: string;
  First_Owner_Personal_Credit_Score__c: string;
  What_percentage_of_ownership_do_you_have__c: string;
  Do_you_own_or_rent_your_home__c: string;
  Second_Owner_First_Name__c: string;
  Second_Owner_Last_Name__c: string;
  Second_Owner_Email__c: string;
  Second_Owner_Phone_Number__c: string;
  Second_Owner_Street__c: string;
  Second_Owner_City__c: string;
  Second_Owner_State__c: string;
  Second_Owner_Zip__c: string;
  Second_Owner_Birth__c: string;
  Second_Owner_SSN__c: string;
  Seecond_Owner_Credit_Score__c: string;
  Second_What_Percentage_Of_Ownership__c: string;
}

export interface UserOwnerInfo {
  Id: string;
  Name: string;
  Email: string;
  Phone: string;
}

declare global {
  interface Window {
    Visualforce?: {
      remoting: {
        Manager: {
          invokeAction: (...args: any[]) => void;
        };
      };
    };
  }
}

function useVisualforceRemoting(): boolean {
  return Boolean(window.Visualforce?.remoting?.Manager);
}

/** Helper to invoke Visualforce Remoting methods on DirectFundingServiceController */
function invokeRemoteAction<T>(action: string, ...params: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!useVisualforceRemoting()) {
      reject(new Error("Visualforce remoting is not available"));
      return;
    }

    const callback = (result: any, event: { status: boolean; message?: string }) => {
      if (event.status) {
        resolve(result as T);
      } else {
        reject(new Error(event.message ?? `Remoting call to ${action} failed`));
      }
    };
    window.Visualforce!.remoting.Manager.invokeAction(
      `DirectFundingServiceController.${action}`,
      ...params,
      callback,
      { escape: false },
    );
  });
}

// Local In-Memory Fallback State for Localhost testing
const LOCAL_MOCK_CONFIG: LoanApplicationSettings = {
  Id: "mock-config-id",
  Company_Name__c: "Company",
  DBA_Name__c: "DBA_Name__c",
  Business_Operating_Time__c: "Business_Operating_Time__c",
  Gross_Monthly_Revenue__c: "Gross_Monthly_Revenue__c",
  Loan_Request__c: "Loan_Request__c",
  Email_Address__c: "Email_Address__c",
  Mobile_Phone_Number__c: "Mobile_Phone_Number__c",
  Website__c: "Website__c",
  First_Name__c: "FirstName",
  Last_Name__c: "LastName",
  
  Business_Street_Address__c: "Street",
  Business_City__c: "City",
  Business_State__c: "State",
  Business_Zip__c: "PostalCode",
  Business_Industry__c: "Industry",
  Sub_Industry__c: "Sub_Industry__c",
  What_do_you_need_the_money_for__c: "What_do_you_need_the_money_for__c",
  When_Do_You_Need_the_Money__c: "When_Do_You_Need_the_Money__c",
  Select_your_business_entity__c: "Select_your_business_entity__c",
  State_Of_Formation__c: "State_Of_Formation__c",
  Federal_Tax_ID__c: "Federal_Tax_ID__c",
  Business_Registration_Date__c: "Business_Registration_Date__c",
  Do_You_Have_Any_Open_Business_Loans_MCA__c: "Do_You_Have_Any_Open_Business_Loans_MCA__c",
  If_Yes_How_Many__c: "If_Yes_How_Many__c",
  
  First_Owner_Street__c: "First_Owner_Street__c",
  First_Owner_City__c: "First_Owner_City__c",
  First_Owner_State__c: "First_Owner_State__c",
  First_Owner_Zip__c: "First_Owner_Zip__c",
  First_Owner_Birth__c: "First_Owner_Birth__c",
  First_Owner_SSN__c: "First_Owner_SSN__c",
  First_Owner_Personal_Credit_Score__c: "First_Owner_Personal_Credit_Score__c",
  What_percentage_of_ownership_do_you_have__c: "What_percentage_of_ownership_do_you_have__c",
  Do_you_own_or_rent_your_home__c: "Do_you_own_or_rent_your_home__c",
  
  Second_Owner_First_Name__c: "Second_Owner_First_Name__c",
  Second_Owner_Last_Name__c: "Second_Owner_Last_Name__c",
  Second_Owner_Email__c: "Second_Owner_Email__c",
  Second_Owner_Phone_Number__c: "Second_Owner_Phone_Number__c",
  Second_Owner_Street__c: "Second_Owner_Street__c",
  Second_Owner_City__c: "Second_Owner_City__c",
  Second_Owner_State__c: "Second_Owner_State__c",
  Second_Owner_Zip__c: "Second_Owner_Zip__c",
  Second_Owner_Birth__c: "Second_Owner_Birth__c",
  Second_Owner_SSN__c: "Second_Owner_SSN__c",
  Seecond_Owner_Credit_Score__c: "Seecond_Owner_Credit_Score__c",
  Second_What_Percentage_Of_Ownership__c: "Second_What_Percentage_Of_Ownership__c",
};

let localRecordData: Record<string, any> = {
  Id: "00Q8C000001pMWMUA2",
  // Initial mocked data
  Company: "Acme Corp LLC",
  DBA_Name__c: "Acme Corp",
  Business_Operating_Time__c: "3-4 years",
  Gross_Monthly_Revenue__c: "$30,000-$50,000",
  Loan_Request__c: "50000",
  Email_Address__c: "john@acme.com",
  Mobile_Phone_Number__c: "(555) 123-4567",
  Website__c: "www.acmecorp.com",
  FirstName: "John",
  LastName: "Smith",
};

const MOCK_ADDRESSES = [
  { street: "120 Broadway", city: "New York", state: "New York", stateShort: "NY", zip: "10271" },
  { street: "1600 Amphitheatre Pkwy", city: "Mountain View", state: "California", stateShort: "CA", zip: "94043" },
  { street: "1600 Pennsylvania Avenue NW", city: "Washington", state: "District of Columbia", stateShort: "DC", zip: "20500" },
  { street: "100 Pine St", city: "San Francisco", state: "California", stateShort: "CA", zip: "94111" },
  { street: "233 S Wacker Dr", city: "Chicago", state: "Illinois", stateShort: "IL", zip: "60606" },
  { street: "350 5th Ave", city: "New York", state: "New York", stateShort: "NY", zip: "10118" },
  { street: "700 Bellevue Way NE", city: "Bellevue", state: "Washington", stateShort: "WA", zip: "98004" },
  { street: "123 Main St", city: "Austin", state: "Texas", stateShort: "TX", zip: "78701" },
  { street: "456 Elm St", city: "Miami", state: "Florida", stateShort: "FL", zip: "33101" },
  { street: "789 Oak Ave", city: "Seattle", state: "Washington", stateShort: "WA", zip: "98101" },
];

/** Verifies lead/opportunity exists and retrieves mappings */
export async function isLeadExist(recordId: string): Promise<LoanApplicationSettings | null> {
  if (useVisualforceRemoting()) {
    try {
      return await invokeRemoteAction<LoanApplicationSettings>("isLeadExist", recordId);
    } catch (e) {
      console.error("Salesforce API - isLeadExist failed:", e);
      return null;
    }
  }

  // Local fallback
  console.log('Visual force remoting Status :',useVisualforceRemoting);
  console.log("Local API -   configuration retrieved");
  await new Promise((resolve) => setTimeout(resolve, 300));
  return LOCAL_MOCK_CONFIG;
}

/** Preloads Contact / Application Information step fields */
export async function getDataForApplicationTab(recordId: string): Promise<any> {
  if (useVisualforceRemoting()) {
    return invokeRemoteAction<any>("getDataForApplicationTab", recordId);
  }

  console.log("Local API - getDataForApplicationTab prefilled");
  await new Promise((resolve) => setTimeout(resolve, 200));
  return localRecordData;
}

/** Preloads Business Information step fields */
export async function getDataForBusinessTab(recordId: string): Promise<any> {
  if (useVisualforceRemoting()) {
    return invokeRemoteAction<any>("getDataForBusinessTab", recordId);
  }

  console.log("Local API - getDataForBusinessTab prefilled");
  await new Promise((resolve) => setTimeout(resolve, 200));
  return localRecordData;
}

/** Preloads Owner Verification step fields */
export async function getDataForOwnersTab(recordId: string): Promise<any> {
  if (useVisualforceRemoting()) {
    return invokeRemoteAction<any>("getDataForOwnersTab", recordId);
  }

  console.log("Local API - getDataForOwnersTab prefilled");
  await new Promise((resolve) => setTimeout(resolve, 200));
  return localRecordData;
}

/** Saves application data values to Salesforce Lead/Opportunity */
export async function setDataForLead(payloadJson: string): Promise<void> {
  console.log("setDataForLead called with JSON:", payloadJson);
  if (useVisualforceRemoting()) {
    return invokeRemoteAction<void>("setDataForLead", payloadJson);
  }

  // Local fallback: update in-memory object
  try {
    const data = JSON.parse(payloadJson);
    localRecordData = { ...localRecordData, ...data };
    console.log("Local API - setDataForLead updated in-memory data:", localRecordData);
  } catch (e) {
    console.error("Local API - Failed to parse payload JSON:", e);
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
}

/** Logs current state to the Apex Tracker object */
export async function updateApexTracker(payloadJson: string, stageValue: string): Promise<void> {
  console.log(`updateApexTracker called for stage "${stageValue}" with JSON:`, payloadJson);
  if (useVisualforceRemoting()) {
    return invokeRemoteAction<void>("updateApexTracker", payloadJson, stageValue);
  }

  console.log(`Local API - updateApexTracker saved for stage: ${stageValue}`);
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/** Uploads bank statements in base64 format and links them to the Lead/Opportunity */
export async function uploadFiles(baseStr: string, filename: string, recordId: string): Promise<boolean> {
  console.log(`uploadFiles called for record ${recordId}:`, {
    filename,
    base64Size: `${(baseStr.length / 1024 / 1024).toFixed(2)} MB`,
  });

  if (useVisualforceRemoting()) {
    return invokeRemoteAction<boolean>("uploadFiles", baseStr, filename, recordId);
  }

  // Local fallback
  console.log(`Local API - uploadFiles completed successfully for ${filename}`);
  await new Promise((resolve) => setTimeout(resolve, 600));
  return true;
}

/** Set status when clicking Review & Submit button */
export async function getFundedAction(recordId: string): Promise<boolean> {
  console.log(`getFundedAction called for record: ${recordId}`);
  if (useVisualforceRemoting()) {
    return invokeRemoteAction<boolean>("getFundedAction", recordId);
  }

  console.log("Local API - getFundedAction completed successfully");
  await new Promise((resolve) => setTimeout(resolve, 400));
  return true;
}

/** Transitions status to finished and returns Lead Owner/User details */
export async function getOwnerInfo(recordId: string): Promise<UserOwnerInfo | null> {
  console.log(`getOwnerInfo called for record: ${recordId}`);
  if (useVisualforceRemoting()) {
    return invokeRemoteAction<UserOwnerInfo>("getOwnerInfo", recordId);
  }

  // Local fallback
  console.log("Local API - getOwnerInfo retrieved");
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    Id: "mock-user-123",
    Name: "Sarah Connor (Funding Specialist)",
    Email: "sconnor@kudofunding.com",
    Phone: "(800) 555-0199",
  };
}

/** Checks if email verification OTP popup is required */
export async function isLoanApplicationEmailVerificationRequired(): Promise<boolean> {
  if (useVisualforceRemoting()) {
    try {
      return await invokeRemoteAction<boolean>("isLoanApplicationEmailVerificationRequired");
    } catch (e) {
      console.error("Salesforce API - isLoanApplicationEmailVerificationRequired failed:", e);
      return false;
    }
  }

  // Local fallback
  console.log("Local API - Email OTP verification requirement checked (False)");
  return false;
}

/** Retrieves the current stage name of the Lead/Opportunity record */
export async function getStageFromRecord(recordId: string): Promise<string> {
  if (useVisualforceRemoting()) {
    return invokeRemoteAction<string>("getStageFromRecord", recordId);
  }

  // Local fallback
  console.log("Local API - getStageFromRecord retrieved current stage: Application Information");
  return "Application Information";
}

/** Client-side address autocomplete search mock */
export async function fetchPlaces(
  input: string,
  type: "autocomplete" | "details",
  placeId?: string
): Promise<{ success: boolean; data: any; error: string | null }> {
  console.log("Local API Address Search - fetchPlaces:", { input, type, placeId });

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (type === "autocomplete") {
    const s = input.toLowerCase().trim();
    const filtered = MOCK_ADDRESSES.filter(
      (addr) =>
        addr.street.toLowerCase().includes(s) ||
        addr.city.toLowerCase().includes(s) ||
        addr.state.toLowerCase().includes(s) ||
        addr.zip.includes(s)
    );

    const predictions = filtered.map((addr, idx) => ({
      place_id: `mock-place-${idx}`,
      description: `${addr.street}, ${addr.city}, ${addr.stateShort} ${addr.zip}`,
    }));

    return {
      success: true,
      data: { predictions },
      error: null,
    };
  } else if (type === "details") {
    if (!placeId) {
      return { success: false, data: null, error: "placeId is required for details query" };
    }
    const idx = parseInt(placeId.replace("mock-place-", ""), 10);
    const match = MOCK_ADDRESSES[idx];

    if (!match) {
      return { success: false, data: null, error: "Mock place not found" };
    }

    return {
      success: true,
      data: {
        street: match.street,
        city: match.city,
        state: match.state,
        stateShort: match.stateShort,
        zip: match.zip,
      },
      error: null,
    };
  }

  return { success: false, data: null, error: "Invalid query type" };
}
