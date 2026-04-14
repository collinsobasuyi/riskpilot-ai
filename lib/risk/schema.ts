// lib/risk/schema.ts

export type IndustrySector =
  | "financial"
  | "healthcare"
  | "insurance"
  | "retail"
  | "technology"
  | "manufacturing"
  | "education"
  | "legal"
  | "other";

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";
export type FinancialImpactTier = "under_100k" | "100k_to_1m" | "over_1m" | "legal" | "harm";
export type DecisionAuthority = "none" | "partial" | "full";
export type DataSensitivity = "none" | "basic" | "sensitive";
export type AiMaturity = "pre-production" | "production" | "multiple" | "decommissioning";
export type DeploymentType = "internal" | "customer" | "both" | "third-party-api" | "self-hosted";
export type SystematicRisk = "isolated" | "batch" | "global";
export type MTTD = "under_1_hour" | "1_to_24_hours" | "over_24_hours";
export type ExplainabilityType = "black-box" | "interpretable" | "fully-transparent";
export type HumanIntervention = "pre-approval" | "post-audit" | "autonomous";
export type FoundationModelSource =
  | "proprietary"
  | "openai"
  | "anthropic"
  | "google"
  | "open-weights"
  | "other-api";
export type ModelHosting = "self-hosted" | "vendor-hosted" | "cloud-provider" | "hybrid";
export type RetrainingFrequency = "continuous" | "daily" | "weekly" | "monthly" | "quarterly" | "static";
export type KillSwitch = "automated" | "manual-instant" | "manual-slow" | "code-deploy" | "none";
export type Criticality = "minor" | "disruption" | "regulatory" | "customer";
export type AuditTrailCompleteness = "input-output" | "decision-logic" | "metadata" | "none";
export type ChangeManagement = "ad-hoc" | "peer-review" | "staged-gates";
export type TrainingFrequency = "quarterly" | "annually" | "one-time" | "none";
export type ExternalVerification = "internal-only" | "external-audit" | "none";
export type AuditType = "iso42001" | "soc2" | "none" | "pending";
export type Frequency = "hourly" | "daily" | "weekly" | "monthly" | "ongoing";
export type OversightLevel = "none" | "periodic" | "continuous";
export type IncidentHistory = "none" | "minor" | "significant" | "multiple";
export type Regulator = "fca" | "pra" | "both" | "other" | "none";

export interface AssessmentFormData {
  companyName: string;
  industry: IndustrySector;
  companySize: CompanySize;
  regulatedEntity: boolean;
  regulator?: Regulator;

  purpose?: string;

  wantsEmailCopy: boolean;
  contactEmail: string;

  systemName: string;
  aiUseCase: string;
  aiMaturity: AiMaturity;
  deploymentType: DeploymentType;
  usersCount: string;
  frequencyOfUse: Frequency;

  criticality?: Criticality;

  foundationModelSource?: FoundationModelSource;
  modelHosting?: ModelHosting;
  retrainingFrequency?: RetrainingFrequency;

  shadowAiDetection?: string;
  thirdPartyVendors?: string;
  aiCapabilities?: string[];

  decisionAuthority: DecisionAuthority;
  financialImpactTier: FinancialImpactTier;
  dataSensitivity: DataSensitivity;
  dataVolume: string;
  thirdPartyData: boolean;

  systematicRisk?: SystematicRisk;
  mttd?: MTTD;
  explainabilityType?: ExplainabilityType;
  humanIntervention?: HumanIntervention;

  biasTesting?: string[];
  modelDocs?: string[];
  dataTypes?: string[];
  regulations?: string[];

  existingOversight: OversightLevel;
  incidentHistory: IncidentHistory;
  documentedProcess: boolean;
  hasDpo: boolean;

  auditTrailCompleteness?: AuditTrailCompleteness;
  externalVerification?: ExternalVerification;
  changeManagement?: ChangeManagement;
  trainingFrequency?: TrainingFrequency;
  monitoringHallucination?: boolean;

  killSwitch?: KillSwitch;

  incidentResponse?: string;
  monitoring?: string[];
  budget?: string;
  supplyChain?: string;

  hasModelCards?: boolean;
  modelCardsUrl?: string;
  hasExternalAudit?: boolean;
  externalAuditType?: AuditType;
  auditReportUrl?: string;
  hasRedTeaming?: boolean;
  redTeamingDate?: string;
  redTeamingReportUrl?: string;
  apiEndpoint?: string;
  apiAccessible?: boolean;

  additionalContext: string;
}

export type AssessmentErrors = Partial<Record<keyof AssessmentFormData | "form", string>>;

export const DRAFT_KEY = "assessmentDraft_v1";
export const SUBMISSION_KEY = "assessmentSubmission_v1";

export const DEFAULT_ASSESSMENT_FORM: AssessmentFormData = {
  companyName: "",
  industry: "financial",
  companySize: "11-50",
  regulatedEntity: false,
  regulator: "none",

  purpose: "",

  wantsEmailCopy: false,
  contactEmail: "",

  systemName: "",
  aiUseCase: "",
  aiMaturity: "pre-production",
  deploymentType: "internal",
  usersCount: "",
  frequencyOfUse: "daily",

  criticality: undefined,
  foundationModelSource: undefined,
  modelHosting: undefined,
  retrainingFrequency: undefined,

  shadowAiDetection: "",
  thirdPartyVendors: "",
  aiCapabilities: [],

  decisionAuthority: "none",
  financialImpactTier: "under_100k",
  dataSensitivity: "none",
  dataVolume: "",
  thirdPartyData: false,

  systematicRisk: undefined,
  mttd: undefined,
  explainabilityType: undefined,
  humanIntervention: undefined,

  biasTesting: [],
  modelDocs: [],
  dataTypes: [],
  regulations: [],

  existingOversight: "none",
  incidentHistory: "none",
  documentedProcess: false,
  hasDpo: false,

  auditTrailCompleteness: undefined,
  externalVerification: undefined,
  changeManagement: undefined,
  trainingFrequency: undefined,
  monitoringHallucination: false,

  killSwitch: undefined,

  incidentResponse: "",
  monitoring: [],
  budget: "",
  supplyChain: "",

  hasModelCards: false,
  modelCardsUrl: "",
  hasExternalAudit: false,
  externalAuditType: undefined,
  auditReportUrl: "",
  hasRedTeaming: false,
  redTeamingDate: "",
  redTeamingReportUrl: "",
  apiEndpoint: "",
  apiAccessible: false,

  additionalContext: "",
};

export function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function safeLocalStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeLocalStorageRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function makeAssessmentId(prefix = "asmt") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export function toggleExclusive(
  currentValues: string[],
  value: string,
  exclusiveValues: string[] = ["None", "No testing conducted", "Unsure"]
): string[] {
  if (exclusiveValues.includes(value)) {
    if (!currentValues.includes(value)) {
      return [value];
    }
    return [];
  }

  const withoutExclusive = currentValues.filter((v) => !exclusiveValues.includes(v));

  if (withoutExclusive.includes(value)) {
    return withoutExclusive.filter((v) => v !== value);
  }

  return [...withoutExclusive, value];
}

export interface PreliminaryStatus {
  score: number;
  status: "Low Risk" | "Medium Risk" | "High Risk";
  statusColor: string;
  bgColor: string;
  borderColor: string;
  concerns: string[];
}

export function calculatePreliminaryStatus(formData: AssessmentFormData): PreliminaryStatus {
  let score = 50;
  const concerns: string[] = [];

  if (formData.decisionAuthority === "full") {
    score -= 20;
    concerns.push("Full automation without oversight");
  }

  if (formData.systematicRisk === "global") {
    score -= 25;
    concerns.push("Global blast radius - one mistake impacts entire product line");
  } else if (formData.systematicRisk === "batch") {
    score -= 15;
    concerns.push("Batch processing - can impact many customers at once");
  }

  if (formData.mttd === "over_24_hours") {
    score -= 20;
    concerns.push(">24 hours to detect or stop issues");
  } else if (formData.mttd === "1_to_24_hours") {
    score -= 10;
    concerns.push("1 to 24 hours to respond");
  }

  if (formData.explainabilityType === "black-box") {
    score -= 15;
    concerns.push("Black box model with limited explainability");
  }

  if (formData.humanIntervention === "autonomous") {
    score -= 15;
    concerns.push("No real-time human intervention possible");
  }

  if (formData.killSwitch === "none" || formData.killSwitch === "code-deploy") {
    score -= 20;
    concerns.push("No effective emergency kill switch");
  }

  if (formData.auditTrailCompleteness === "none") {
    score -= 25;
    concerns.push("No audit logs available");
  }

  if (formData.trainingFrequency === "none" || formData.trainingFrequency === "one-time") {
    score -= 10;
    concerns.push("AI governance training is outdated or missing");
  }

  if (formData.externalVerification === "none") {
    score -= 10;
    concerns.push("No external verification of controls");
  }

  if (formData.financialImpactTier === "over_1m") {
    score -= 15;
    concerns.push("Potential losses above £1m");
  } else if (formData.financialImpactTier === "100k_to_1m") {
    score -= 10;
    concerns.push("Potential losses between £100k and £1m");
  } else if (
    formData.financialImpactTier === "legal" ||
    formData.financialImpactTier === "harm"
  ) {
    score -= 25;
    concerns.push("Legal, regulatory, or harm-related exposure");
  }

  if (formData.deploymentType === "third-party-api") {
    score -= 10;
    concerns.push("Third-party API dependency");
  }

  if (
    formData.foundationModelSource &&
    ["openai", "anthropic", "google", "other-api"].includes(formData.foundationModelSource)
  ) {
    score -= 5;
    concerns.push("External foundation model dependency");
  }

  if (
    formData.criticality === "customer" ||
    formData.criticality === "regulatory"
  ) {
    score -= 15;
    concerns.push("High business criticality");
  }

  if (!formData.documentedProcess) {
    score -= 15;
    concerns.push("Missing documented governance process");
  }

  if (
    formData.incidentHistory === "significant" ||
    formData.incidentHistory === "multiple"
  ) {
    score -= 20;
    concerns.push("Prior significant incidents");
  }

  if (
    formData.biasTesting?.includes("No testing conducted") &&
    (formData.deploymentType === "customer" || formData.deploymentType === "both")
  ) {
    score -= 15;
    concerns.push("No bias testing for customer-facing AI");
  }

  if (
    !formData.monitoringHallucination &&
    (formData.aiCapabilities?.includes("generative") || formData.foundationModelSource)
  ) {
    score -= 15;
    concerns.push("No hallucination monitoring for generative AI");
  }

  if (!formData.hasModelCards) {
    score -= 5;
    concerns.push("Missing model cards or technical documentation");
  }

  if (!formData.hasExternalAudit && formData.regulatedEntity) {
    score -= 10;
    concerns.push("No external audit for regulated entity");
  }

  const status: PreliminaryStatus["status"] =
    score >= 60 ? "Low Risk" : score >= 40 ? "Medium Risk" : "High Risk";

  const statusColor =
    score >= 60 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-600";

  const bgColor =
    score >= 60 ? "bg-green-50" : score >= 40 ? "bg-amber-50" : "bg-red-50";

  const borderColor =
    score >= 60 ? "border-green-200" : score >= 40 ? "border-amber-200" : "border-red-200";

  return {
    score,
    status,
    statusColor,
    bgColor,
    borderColor,
    concerns: concerns.slice(0, 4),
  };
}