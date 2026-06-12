// lib/risk/projection.ts
//
// Projects how the risk profile could improve after remediation by
// re-running the real scoring engine against the assessment data with
// the recommended fixes applied. The 30-day state applies the critical
// fixes; the 90-day state additionally applies the high/medium fixes.
// Numbers are computed, not authored — but still illustrative, since
// they assume every listed action is completed and evidenced.

import { AssessmentFormData } from "./schema";
import { computeResults } from "./scoring";
import { buildInsuranceBrief, ReadinessStatus } from "./insurance";
import { buildEvidenceChecklist } from "./evidence";

export interface ProjectionPoint {
  label: string;
  riskScore: number;
  readiness: ReadinessStatus;
  tier: string;
  criticalGaps: number;
  missingEvidence: number;
}

function evidenceConfidence(missing: number): "Low" | "Medium" | "High" {
  return missing > 4 ? "Low" : missing > 1 ? "Medium" : "High";
}

function snapshot(label: string, data: AssessmentFormData): ProjectionPoint {
  const results = computeResults(data);
  const brief = buildInsuranceBrief(data, results);
  const missing = buildEvidenceChecklist(data).filter((i) => i.status === "missing").length;
  return {
    label,
    riskScore: results.riskScore,
    readiness: brief.readiness.status,
    tier: results.coverageTier,
    criticalGaps: results.recommendations.critical.length,
    missingEvidence: missing,
  };
}

// The critical-recommendation fixes, mirroring the conditions that
// generate critical items in computeResults.
function applyCriticalFixes(data: AssessmentFormData): AssessmentFormData {
  const fixed = { ...data };
  if (fixed.decisionAuthority === "full" && fixed.financialImpactTier !== "under_100k")
    fixed.decisionAuthority = "partial";
  if (fixed.dataSensitivity === "sensitive") fixed.documentedProcess = true;
  if (fixed.incidentHistory === "significant" || fixed.incidentHistory === "multiple")
    fixed.incidentResponsePlan = true;
  fixed.biasTesting =
    fixed.biasTesting && fixed.biasTesting.length > 0 && !fixed.biasTesting.includes("No testing conducted")
      ? fixed.biasTesting
      : ["Bias and fairness testing completed"];
  if (!fixed.killSwitch || fixed.killSwitch === "none" || fixed.killSwitch === "code-deploy")
    fixed.killSwitch = "manual-instant";
  if (fixed.aiCoverageCheck === "gap-identified" || fixed.aiCoverageCheck === "no-coverage")
    fixed.aiCoverageCheck = "covered";
  if (!fixed.consumerRedress || fixed.consumerRedress === "none")
    fixed.consumerRedress = "formal";
  return fixed;
}

// The high/medium-recommendation fixes on top of the critical ones.
function applyAllFixes(data: AssessmentFormData): AssessmentFormData {
  const fixed = applyCriticalFixes(data);
  fixed.documentedProcess = true;
  fixed.existingOversight = "continuous";
  fixed.modelDocs = ["Model card", "Architecture doc", "Training data sheet"];
  fixed.auditTrailCompleteness = "decision-logic";
  fixed.independentValidation = "internal-independent";
  fixed.smfAccountability = true;
  fixed.formalAiPolicy = "yes";
  fixed.aiCoverageCheck = "covered";
  fixed.consumerExplainability = "on-request";
  fixed.vulnerableCustomerHandling = "yes";
  fixed.incidentResponsePlan = true;
  fixed.monitoring = ["Performance monitoring", "Drift detection"];
  fixed.trainingFrequency = "annually";
  return fixed;
}

export interface RemediationProjection {
  current: ProjectionPoint;
  after30: ProjectionPoint;
  after90: ProjectionPoint;
  confidence: { current: string; after30: string; after90: string };
}

export function projectRemediation(data: AssessmentFormData): RemediationProjection {
  const current = snapshot("Current", data);
  const after30 = snapshot("After 30 days", applyCriticalFixes(data));
  const after90 = snapshot("After 90 days", applyAllFixes(data));
  return {
    current,
    after30,
    after90,
    confidence: {
      current: evidenceConfidence(current.missingEvidence),
      after30: evidenceConfidence(after30.missingEvidence),
      after90: evidenceConfidence(after90.missingEvidence),
    },
  };
}
