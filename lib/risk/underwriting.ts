// lib/risk/underwriting.ts
//
// Derives the broker/underwriter-facing summary cards and the likely
// underwriter questions from the assessment data and computed results.

import { AssessmentFormData } from "./schema";
import { ComputedResults } from "./scoring";

export type CardTone = "red" | "amber" | "blue" | "green";

export interface UnderwritingCard {
  label: string;
  value: string;
  supportingText: string;
  badge: string;
  tone: CardTone;
}

export function buildUnderwritingSummary(
  data: AssessmentFormData,
  results: ComputedResults
): UnderwritingCard[] {
  const isCustomerFacing = data.deploymentType === "customer" || data.deploymentType === "both";

  // System liability tier — from risk level, deployment, and data sensitivity
  const liabilityFactors: string[] = [];
  if (isCustomerFacing) liabilityFactors.push("customer-facing decisions");
  if (data.dataSensitivity === "sensitive") liabilityFactors.push("sensitive personal data");
  if (data.financialImpactTier === "harm" || data.financialImpactTier === "legal")
    liabilityFactors.push("potential legal or individual harm");
  else if (data.financialImpactTier !== "under_100k")
    liabilityFactors.push("material financial impact");
  const liability: UnderwritingCard = {
    label: "System Liability Tier",
    value: results.riskLevel,
    supportingText:
      liabilityFactors.length > 0
        ? `Handles ${liabilityFactors.join(", ")}.`
        : "Internal, low-impact use with no sensitive data reported.",
    badge:
      results.riskLevel === "High"
        ? "High exposure"
        : results.riskLevel === "Medium"
          ? "Moderate exposure"
          : "Low exposure",
    tone: results.riskLevel === "High" ? "red" : results.riskLevel === "Medium" ? "amber" : "green",
  };

  // Third-party model risk — from vendor/model/data dependencies
  const externalModel =
    !!data.foundationModelSource && data.foundationModelSource !== "proprietary";
  const vendorHosted = data.modelHosting === "vendor-hosted" || data.modelHosting === "hybrid";
  const thirdPartyExposed = data.thirdPartyData || externalModel || vendorHosted;
  const thirdParty: UnderwritingCard = {
    label: "Third-Party Model Risk",
    value: thirdPartyExposed ? "Exposed" : "Contained",
    supportingText: thirdPartyExposed
      ? "External AI, model, or data services require vendor assurance and contractual evidence."
      : "No external model or data dependencies were reported in this assessment.",
    badge: thirdPartyExposed ? "Review required" : "Contained",
    tone: thirdPartyExposed ? "amber" : "green",
  };

  // Audit trail verifiability — self-reported answers, so never "verified"
  const auditTrail = data.auditTrailCompleteness;
  const auditCard: UnderwritingCard =
    auditTrail === "input-output" || auditTrail === "decision-logic"
      ? {
          label: "Audit Trail Verifiability",
          value: "Self-reported",
          supportingText:
            "Audit logs are reported, but integrity controls and immutable storage are not verified by this assessment.",
          badge: "Unverified",
          tone: "amber",
        }
      : auditTrail === "metadata"
        ? {
            label: "Audit Trail Verifiability",
            value: "Partial",
            supportingText:
              "Only metadata logging is reported — decision inputs and outputs are not fully captured.",
            badge: "Evidence gap",
            tone: "amber",
          }
        : {
            label: "Audit Trail Verifiability",
            value: "Not evidenced",
            supportingText: "No audit trail of AI decisions was reported in this assessment.",
            badge: "Evidence gap",
            tone: "red",
          };

  // Target policy alignment — informational
  const policyAlignment: UnderwritingCard = {
    label: "Target Policy Alignment",
    value: "Cyber / Tech E&O / PI",
    supportingText:
      "Designed to support broker and underwriter review of AI-related exposure across these lines.",
    badge: "Broker review",
    tone: "blue",
  };

  return [liability, thirdParty, auditCard, policyAlignment];
}

export function buildUnderwriterQuestions(data: AssessmentFormData): string[] {
  const isCustomerFacing = data.deploymentType === "customer" || data.deploymentType === "both";
  const externalDependencies =
    data.thirdPartyData ||
    (!!data.foundationModelSource && data.foundationModelSource !== "proprietary") ||
    data.modelHosting === "vendor-hosted" ||
    data.modelHosting === "hybrid";

  const questions: string[] = [
    "Has the AI system been independently validated by a team separate from the build team?",
  ];
  if (data.dataSensitivity !== "none")
    questions.push("Has a DPIA been completed for this AI system?");
  questions.push(
    "Who is accountable for AI governance and risk acceptance?",
    "What human review process exists for AI-driven decisions?",
    "What happens if the model produces an unfair, harmful, or incorrect outcome?"
  );
  if (externalDependencies)
    questions.push("Are third-party AI vendors assessed and contractually governed?");
  questions.push("Is there a documented AI incident response process?");
  if (isCustomerFacing)
    questions.push("Are customer-facing AI decisions explainable?");
  questions.push(
    "Are model inputs, outputs, and overrides logged?",
    "Is there evidence of ongoing monitoring for drift, bias, and performance degradation?"
  );
  return questions;
}
