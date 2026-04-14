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

// Extended assessment input for future growth
export interface EnhancedAssessmentInput extends RiskAssessmentInput {
  title?: string;
  additionalContext?: string;
  teamMembers?: string[];
  departments?: string[];
  hasExistingGovernance?: boolean;
  annualRevenue?: string;
  employeeCount?: number;
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

// Extended result for future persistence/reporting
export interface EnhancedAssessmentResult extends AssessmentResult {
  id?: string;
  assessmentDate: Date;
  expiresAt: Date;
  assessmentId: string;
  scoreBreakdown?: {
    decisionAuthority: number;
    impactLevel: number;
    dataSensitivity: number;
    customerFacing: number;
  };
  nextReviewDate?: Date;
  complianceFrameworks?: string[];
  industryBenchmarks?: {
    averageScore: number;
    percentileRank?: number;
  };
}

// Assessment record for storage
export interface AssessmentRecord {
  id: string;
  userId: string;
  title: string;
  status: AssessmentStatus;
  industry: string;
  aiUseCase: string;
  decisionAuthority: DecisionAuthority;
  impactLevel: ImpactLevel;
  dataSensitivity: DataSensitivity;
  customerFacing: boolean;
  additionalContext?: string;
  inherentRiskScore?: number;
  controlMaturityScore?: number;
  overallReadinessScore?: number;
  inherentRiskLevel?: InherentRiskLevel;
  readinessLevel?: ReadinessLevel;
  riskDrivers?: unknown;
  recommendations?: unknown;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

// Export/report options
export interface ExportOptions {
  format: "PDF" | "CSV" | "JSON";
  includeRecommendations: boolean;
  includeDrivers: boolean;
  includeMetadata: boolean;
  branding?: {
    companyName?: string;
    logo?: string;
    primaryColor?: string;
  };
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

// Dashboard statistics
export interface DashboardStats {
  totalAssessments: number;
  averageInherentRiskScore: number;
  averageReadinessScore: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
  };
  readinessDistribution: {
    weak: number;
    developing: number;
    strong: number;
  };
  recentAssessments: AssessmentRecord[];
  expiringAssessments: AssessmentRecord[];
  topRiskDrivers: Array<{ name: string; count: number }>;
}

// Industry benchmark
export interface IndustryBenchmark {
  industry: string;
  averageInherentRiskScore: number;
  averageReadinessScore: number;
  sampleSize: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  lastUpdated: Date;
}

// User preferences
export interface UserPreferences {
  userId: string;
  defaultExportFormat: "PDF" | "CSV" | "JSON";
  emailNotifications: boolean;
  reminderFrequency: "weekly" | "monthly" | "quarterly";
  theme: "light" | "dark" | "system";
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: "ASSESSMENT_EXPIRING" | "ASSESSMENT_COMPLETED" | "RECOMMENDATION_UPDATE";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, unknown>;
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