// lib/risk/scoring.ts

import {
  AssessmentResult,
  RiskAssessmentInput,
  RiskDriver,
  getInherentRiskLevel,
  getReadinessLevel,
} from "./types";

export function calculateAssessmentResult(
  input: RiskAssessmentInput
): AssessmentResult {
  let inherentRiskScore = 0;
  let controlMaturityScore = 0;

  const riskDrivers: RiskDriver[] = [];
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (input.decisionAuthority === "full") {
    inherentRiskScore += 3;
    riskDrivers.push({
      id: "decision-authority-full",
      title: "Fully automated decision-making",
      description:
        "The AI system can make or drive decisions without meaningful human approval in the workflow.",
      severity: "High",
      category: "GOVERNANCE",
      impact: "Reduced human intervention in consequential decisions",
      likelihood: "Likely",
    });
    gaps.push(
      "Introduce stronger human review or approval controls for critical or high-impact decisions."
    );
  } else if (input.decisionAuthority === "partial") {
    inherentRiskScore += 2;
    riskDrivers.push({
      id: "decision-authority-partial",
      title: "Partially automated decision-making",
      description:
        "The AI system influences decisions, but some human involvement remains in the process.",
      severity: "Medium",
      category: "GOVERNANCE",
      impact: "Potential over-reliance on AI-assisted decisions",
      likelihood: "Possible",
    });
  } else {
    strengths.push("Human-led decision-making remains in place.");
    controlMaturityScore += 1;
  }

  if (input.impactLevel === "harm") {
    inherentRiskScore += 4;
    riskDrivers.push({
      id: "impact-harm",
      title: "Potential harm to individuals",
      description:
        "The AI use case could materially affect individuals through harmful, unsafe, or unfair outcomes.",
      severity: "Critical",
      category: "RISK_MANAGEMENT",
      impact: "Direct impact on individuals and customer outcomes",
      likelihood: "Possible",
    });
    gaps.push(
      "High-impact use cases need documented oversight, escalation paths, and continuous monitoring."
    );
  } else if (input.impactLevel === "legal") {
    inherentRiskScore += 3;
    riskDrivers.push({
      id: "impact-legal",
      title: "Legal or regulatory exposure",
      description:
        "The AI use case may create regulatory, compliance, or legal risk if outcomes are not well governed.",
      severity: "High",
      category: "COMPLIANCE",
      impact: "Potential regulatory challenge or non-compliance exposure",
      likelihood: "Possible",
    });
  } else if (input.impactLevel === "financial") {
    inherentRiskScore += 2;
    riskDrivers.push({
      id: "impact-financial",
      title: "Financial risk exposure",
      description:
        "The AI use case could contribute to material financial loss, misjudgment, or operational cost.",
      severity: "Medium",
      category: "RISK_MANAGEMENT",
      impact: "Potential financial loss or business impact",
      likelihood: "Possible",
    });
  } else {
    strengths.push("Use case indicates lower direct impact exposure.");
    controlMaturityScore += 1;
  }

  if (input.dataSensitivity === "sensitive") {
    inherentRiskScore += 3;
    riskDrivers.push({
      id: "data-sensitive",
      title: "Sensitive personal data processed",
      description:
        "The AI system processes special category or otherwise sensitive personal data.",
      severity: "High",
      category: "DATA_GOVERNANCE",
      impact: "Higher privacy, governance, and compliance obligations",
      likelihood: "Likely",
    });
    gaps.push(
      "Sensitive data processing requires stronger governance, access controls, and documented handling standards."
    );
  } else if (input.dataSensitivity === "basic") {
    inherentRiskScore += 1;
    riskDrivers.push({
      id: "data-basic",
      title: "Personal data processed",
      description:
        "The AI system processes personal data, which still requires governance and accountability.",
      severity: "Medium",
      category: "DATA_GOVERNANCE",
      impact: "Privacy and data handling obligations apply",
      likelihood: "Likely",
    });
  } else {
    strengths.push("No personal data indicated.");
    controlMaturityScore += 1;
  }

  if (input.customerFacing) {
    inherentRiskScore += 2;
    riskDrivers.push({
      id: "customer-facing",
      title: "Customer-facing AI system",
      description:
        "The AI system directly affects customer interactions, outcomes, or experience.",
      severity: "High",
      category: "OPERATIONAL",
      impact: "Greater accountability for explainability, fairness, and monitoring",
      likelihood: "Likely",
    });
    gaps.push(
      "Customer-facing systems need clear accountability, outcome monitoring, and escalation processes."
    );
  } else {
    strengths.push("System is not directly customer-facing.");
    controlMaturityScore += 1;
  }

  const overallReadinessScore = Math.max(
    0,
    10 - inherentRiskScore + controlMaturityScore
  );

  const recommendations = [...gaps];

  const summary =
    inherentRiskScore >= 8
      ? "This use case shows elevated inherent risk and would likely require stronger governance evidence before being presented in formal risk, compliance, or insurance discussions."
      : inherentRiskScore >= 4
      ? "This use case shows moderate inherent risk. Governance maturity and documented controls will be important to support confidence in the deployment."
      : "This use case appears lower risk on the current input, though governance and accountability controls should still be documented.";

  return {
    inherentRiskScore,
    controlMaturityScore,
    overallReadinessScore,
    inherentRiskLevel: getInherentRiskLevel(inherentRiskScore),
    readinessLevel: getReadinessLevel(controlMaturityScore),
    riskDrivers,
    strengths,
    gaps,
    recommendations,
    summary,
  };
}