import { RiskAssessmentInput } from "./types";

export interface RiskAssessmentResult {
  score: number;
  level: "Low" | "Medium" | "High";
  riskDrivers: string[];
}

export function calculateRisk(input: RiskAssessmentInput): RiskAssessmentResult {
  let score = 0;
  const drivers: string[] = [];

  if (input.decisionAuthority === "full") {
    score += 3;
    drivers.push("Fully automated decision-making");
  } else if (input.decisionAuthority === "partial") {
    score += 2;
    drivers.push("Partially automated decisions");
  }

  if (input.impactLevel === "harm") {
    score += 4;
    drivers.push("Potential harm to individuals");
  } else if (input.impactLevel === "legal") {
    score += 3;
    drivers.push("Legal or regulatory exposure");
  } else if (input.impactLevel === "financial") {
    score += 2;
    drivers.push("Financial risk exposure");
  }

  if (input.dataSensitivity === "sensitive") {
    score += 3;
    drivers.push("Sensitive personal data processed");
  } else if (input.dataSensitivity === "basic") {
    score += 1;
    drivers.push("Personal data processed");
  }

  if (input.customerFacing) {
    score += 2;
    drivers.push("Customer-facing AI system");
  }

  let level: "Low" | "Medium" | "High";
  if (score <= 3) level = "Low";
  else if (score <= 7) level = "Medium";
  else level = "High";

  return { score, level, riskDrivers: drivers };
}