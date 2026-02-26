export type ImpactLevel = "minor" | "financial" | "legal" | "harm";
export type DataSensitivity = "none" | "basic" | "sensitive";
export type DecisionAuthority = "none" | "partial" | "full";

export interface RiskAssessmentInput {
  industry: string;
  aiUseCase: string;
  decisionAuthority: DecisionAuthority;
  impactLevel: ImpactLevel;
  dataSensitivity: DataSensitivity;
  customerFacing: boolean;
}