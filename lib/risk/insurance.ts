// lib/risk/insurance.ts
//
// Derives the insurance-facing report sections (readiness status, broker
// summary, underwriter notes) from the assessment data and computed results.

import { AssessmentFormData } from "./schema";
import { ComputedResults } from "./scoring";

export type ReadinessStatus = "Review-ready" | "Conditionally ready" | "Not yet ready";

export interface InsuranceBrief {
  readiness: {
    status: ReadinessStatus;
    statusColor: "green" | "amber" | "red";
    headline: string;
    blockers: string[];
  };
  brokerSummary: string[];
  underwriterNotes: {
    riskProfile: string[];
    controlsInPlace: string[];
    outstandingConcerns: string[];
  };
}

// ── Label helpers ─────────────────────────────────────────────────────────────

const INDUSTRY_LABELS: Record<string, string> = {
  financial: "financial services",
  insurance: "insurance",
  healthcare: "healthcare",
  legal: "legal services",
  technology: "technology",
  retail: "retail",
  manufacturing: "manufacturing",
  public: "public sector",
  other: "professional services",
};

const SIZE_LABELS: Record<string, string> = {
  "1-10": "1–10 employees",
  "11-50": "11–50 employees",
  "51-200": "51–200 employees",
  "201-500": "201–500 employees",
  "500+": "500+ employees",
};

const AUTHORITY_LABELS: Record<string, string> = {
  none: "AI provides information only — all decisions are made by people",
  partial: "AI recommendations influence decisions, with human review",
  full: "AI makes decisions automatically without prior human approval",
};

const SENSITIVITY_LABELS: Record<string, string> = {
  none: "no personal data is processed",
  basic: "basic personal data is processed",
  sensitive: "sensitive personal data is processed",
};

const IMPACT_LABELS: Record<string, string> = {
  under_100k: "estimated worst-case financial impact below £100k",
  "100k_to_1m": "estimated worst-case financial impact of £100k–£1m",
  over_1m: "estimated worst-case financial impact above £1m",
  legal: "potential legal or regulatory exposure",
  harm: "potential for harm to individuals",
};

const KILL_SWITCH_LABELS: Record<string, string> = {
  automated: "Automated kill switch — the system can be halted instantly without human action",
  "manual-instant": "Manual kill switch with instant effect",
  "manual-slow": "Manual shutdown available, but not instant",
  "code-deploy": "Stopping the system requires a code deployment",
  none: "No defined mechanism to stop the system quickly",
};

const OVERSIGHT_LABELS: Record<string, string> = {
  continuous: "Continuous human oversight of AI outputs",
  periodic: "Periodic human review of AI outputs",
  none: "No formal human oversight of AI outputs",
};

function industryLabel(data: AssessmentFormData): string {
  return INDUSTRY_LABELS[data.industry] ?? data.industry;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ── Brief builder ─────────────────────────────────────────────────────────────

export function buildInsuranceBrief(
  data: AssessmentFormData,
  results: ComputedResults
): InsuranceBrief {
  const criticals = results.recommendations.critical;
  const coverageGap =
    data.aiCoverageCheck === "gap-identified" || data.aiCoverageCheck === "no-coverage";

  // Readiness status
  let status: ReadinessStatus;
  let statusColor: "green" | "amber" | "red";
  if (results.riskScore >= 70 || coverageGap) {
    status = "Not yet ready";
    statusColor = "red";
  } else if (criticals.length > 0 || results.coverageEligibility !== "Eligible") {
    status = "Conditionally ready";
    statusColor = "amber";
  } else {
    status = "Review-ready";
    statusColor = "green";
  }

  const headline =
    status === "Review-ready"
      ? `This assessment indicates ${data.companyName} can present its AI governance position for insurance or audit review with no critical items outstanding.`
      : status === "Conditionally ready"
        ? `This assessment indicates ${data.companyName} can be presented for review once the critical items below are addressed. Underwriters are likely to raise them.`
        : `This assessment indicates ${data.companyName} is not yet ready for insurance or audit review. Resolve the items below before submission to avoid declined or heavily excluded terms.`;

  // Broker summary — plain English a broker can lift into a submission email
  const brokerSummary = [
    `${data.companyName} is a ${industryLabel(data)} firm (${SIZE_LABELS[data.companySize] ?? data.companySize})${
      data.regulatedEntity ? ", operating as a regulated entity" : ""
    }. The assessed system, ${data.systemName}, is used for: ${data.aiUseCase.trim()}`,
    `The firm scores ${results.riskScore}/100 on the Verdictal AI risk assessment (${results.riskLevel.toLowerCase()} risk), placing it in the ${results.coverageTier} underwriting tier with ${results.coverageEligibility.toLowerCase()} eligibility. ${AUTHORITY_LABELS[data.decisionAuthority]}, and ${SENSITIVITY_LABELS[data.dataSensitivity]}.`,
    criticals.length > 0
      ? `Before submission, ${criticals.length} critical item${criticals.length !== 1 ? "s" : ""} should be addressed — these are the gaps most likely to affect terms, premium, or exclusions.`
      : `No critical gaps were identified. The full report below documents the firm's controls, residual risk drivers, and recommended improvements.`,
  ];

  // Underwriter notes — structured factual view
  const riskProfile: string[] = [
    AUTHORITY_LABELS[data.decisionAuthority],
    capitalize(IMPACT_LABELS[data.financialImpactTier] ?? data.financialImpactTier),
    capitalize(SENSITIVITY_LABELS[data.dataSensitivity]),
  ];
  if (data.deploymentType === "customer" || data.deploymentType === "both") {
    riskProfile.push("The system is customer-facing");
  }
  if (data.incidentHistory && data.incidentHistory !== "none") {
    riskProfile.push(
      data.incidentHistory === "minor"
        ? "One or more minor AI-related incidents reported"
        : "Significant or repeated AI-related incidents reported"
    );
  }

  const controlsInPlace: string[] = [];
  if (data.existingOversight !== "none")
    controlsInPlace.push(OVERSIGHT_LABELS[data.existingOversight]);
  if (data.documentedProcess)
    controlsInPlace.push("Documented AI governance process in place");
  if (data.hasDpo) controlsInPlace.push("Data Protection Officer appointed");
  if (data.killSwitch && data.killSwitch !== "none")
    controlsInPlace.push(KILL_SWITCH_LABELS[data.killSwitch]);
  if (data.externalVerification === "external-audit")
    controlsInPlace.push("Externally audited AI controls");
  if (data.auditTrailCompleteness && data.auditTrailCompleteness !== "none")
    controlsInPlace.push("Audit trail of AI inputs and outputs maintained");
  if (controlsInPlace.length === 0)
    controlsInPlace.push("No formal AI governance controls were evidenced in this assessment");

  const outstandingConcerns: string[] = [
    ...criticals,
    ...results.exclusions.map((ex) => `Potential exclusion: ${ex}`),
  ];
  if (outstandingConcerns.length === 0)
    outstandingConcerns.push("No critical concerns identified at the time of assessment");

  return {
    readiness: { status, statusColor, headline, blockers: criticals },
    brokerSummary,
    underwriterNotes: { riskProfile, controlsInPlace, outstandingConcerns },
  };
}
