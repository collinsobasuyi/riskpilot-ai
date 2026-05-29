// lib/risk/types.ts

// Core enums
export type ImpactLevel = "minor" | "financial" | "legal" | "harm";
export type DataSensitivity = "none" | "basic" | "sensitive";
export type DecisionAuthority = "none" | "partial" | "full";

export type InherentRiskLevel = "Low" | "Moderate" | "High";
export type ReadinessLevel = "Weak" | "Developing" | "Strong";

export type ControlPriority = "High" | "Medium" | "Low";
export type ControlCategory =
  | "GOVERNANCE"
  | "OPERATIONAL"
  | "MONITORING"
  | "VALIDATION"
  | "DATA_GOVERNANCE"
  | "RISK_MANAGEMENT"
  | "COMPLIANCE";

export type EffortLevel = "Low" | "Medium" | "High";
export type AssessmentStatus = "DRAFT" | "COMPLETED" | "ARCHIVED";

// Core assessment input
export interface RiskAssessmentInput {
  industry: string;
  aiUseCase: string;
  decisionAuthority: DecisionAuthority;
  impactLevel: ImpactLevel;
  dataSensitivity: DataSensitivity;
  customerFacing: boolean;
}

// Risk driver
export interface RiskDriver {
  id: string;
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  category?: string;
  impact?: string;
  likelihood?: "Rare" | "Unlikely" | "Possible" | "Likely" | "Almost Certain";
}

// Recommended control
export interface Control {
  id?: string;
  title: string;
  description: string;
  priority: ControlPriority;
  category?: ControlCategory;
  estimatedEffort?: EffortLevel;
  regulationReferences?: string[];
  implementationSteps?: string[];
  owner?: string;
  timeline?: string;
  status?: "Not Started" | "In Progress" | "Completed" | "Not Applicable";
}

// Main assessment result
export interface AssessmentResult {
  inherentRiskScore: number;
  controlMaturityScore: number;
  overallReadinessScore: number;
  inherentRiskLevel: InherentRiskLevel;
  readinessLevel: ReadinessLevel;
  riskDrivers: RiskDriver[];
  strengths: string[];
  gaps: string[];
  controls?: Control[];
  summary?: string;
  recommendations?: string[];
}

// Validation error
export interface ValidationError {
  field: keyof RiskAssessmentInput;
  message: string;
  code?: string;
}

// Generic API response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
  metadata?: {
    timestamp: string;
    version: string;
  };
}

// Reusable constants
export const IMPACT_LEVELS: ImpactLevel[] = ["minor", "financial", "legal", "harm"];
export const DATA_SENSITIVITY_LEVELS: DataSensitivity[] = ["none", "basic", "sensitive"];
export const DECISION_AUTHORITY_LEVELS: DecisionAuthority[] = ["none", "partial", "full"];
export const INHERENT_RISK_LEVELS: InherentRiskLevel[] = ["Low", "Moderate", "High"];
export const READINESS_LEVELS: ReadinessLevel[] = ["Weak", "Developing", "Strong"];

// Display labels
export const IMPACT_LEVEL_DISPLAY: Record<ImpactLevel, string> = {
  minor: "Minor Impact",
  financial: "Financial Impact",
  legal: "Legal / Regulatory Exposure",
  harm: "Potential Harm to Individuals",
};

export const DATA_SENSITIVITY_DISPLAY: Record<DataSensitivity, string> = {
  none: "No Personal Data",
  basic: "Basic Personal Data",
  sensitive: "Sensitive Personal Data",
};

export const DECISION_AUTHORITY_DISPLAY: Record<DecisionAuthority, string> = {
  none: "No Automation",
  partial: "Partial Automation",
  full: "Full Automation",
};

// Helper functions
export function getInherentRiskLevel(score: number): InherentRiskLevel {
  if (score <= 3) return "Low";
  if (score <= 7) return "Moderate";
  return "High";
}

export function getReadinessLevel(score: number): ReadinessLevel {
  if (score <= 2) return "Weak";
  if (score <= 5) return "Developing";
  return "Strong";
}

export function getInherentRiskLevelColor(level: InherentRiskLevel): string {
  switch (level) {
    case "Low":
      return "green";
    case "Moderate":
      return "amber";
    case "High":
      return "red";
    default:
      return "gray";
  }
}

export function getReadinessLevelColor(level: ReadinessLevel): string {
  switch (level) {
    case "Weak":
      return "red";
    case "Developing":
      return "amber";
    case "Strong":
      return "green";
    default:
      return "gray";
  }
}

export function getControlPriorityColor(priority: ControlPriority): string {
  switch (priority) {
    case "High":
      return "red";
    case "Medium":
      return "amber";
    case "Low":
      return "green";
    default:
      return "gray";
  }
}