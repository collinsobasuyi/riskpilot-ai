import { AssessmentFormData } from "./schema";

export function isInsurancePurpose(data: AssessmentFormData): boolean {
  const purposes = data.assessmentPurpose ?? [];
  return purposes.some((p) =>
    ["insurance-renewal", "broker-review", "cyber-pi-review"].includes(p)
  );
}

export function isCustomerFacing(data: AssessmentFormData): boolean {
  return data.deploymentType === "customer" || data.deploymentType === "both";
}

export function isRegulated(data: AssessmentFormData): boolean {
  return data.regulatedEntity === true;
}

export function isFinancialRegulated(data: AssessmentFormData): boolean {
  return (
    isRegulated(data) &&
    (data.industry === "financial" || data.industry === "insurance")
  );
}

export function usesThirdPartyVendors(data: AssessmentFormData): boolean {
  return (
    (!!data.thirdPartyVendors && data.thirdPartyVendors.trim().length > 0) ||
    (!!data.foundationModelSource &&
      data.foundationModelSource !== "proprietary") ||
    data.deploymentType === "third-party-api"
  );
}

export function processesPersonalData(data: AssessmentFormData): boolean {
  return data.dataSensitivity !== "none" || data.thirdPartyData === true;
}
