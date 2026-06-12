// lib/risk/evidence.ts
//
// Derives the underwriting evidence checklist from the assessment data:
// the documents and artefacts a broker or underwriter will ask for, and
// whether this assessment evidenced them, grouped by evidence category.

import { AssessmentFormData } from "./schema";

export type EvidenceStatus = "present" | "partial" | "missing";

export type EvidenceCategory =
  | "Governance Evidence"
  | "Model Risk Evidence"
  | "Data Protection Evidence"
  | "Vendor / Third-Party Evidence"
  | "Insurance Readiness Evidence"
  | "Monitoring & Incident Evidence";

export interface EvidenceItem {
  category: EvidenceCategory;
  label: string;
  status: EvidenceStatus;
  detail: string;
}

export const EVIDENCE_CATEGORIES: EvidenceCategory[] = [
  "Governance Evidence",
  "Model Risk Evidence",
  "Data Protection Evidence",
  "Vendor / Third-Party Evidence",
  "Insurance Readiness Evidence",
  "Monitoring & Incident Evidence",
];

export function buildEvidenceChecklist(data: AssessmentFormData): EvidenceItem[] {
  const isCustomerFacing = data.deploymentType === "customer" || data.deploymentType === "both";
  const modelDocs = (data.modelDocs || []).filter((d) => d !== "None");
  const biasTesting = data.biasTesting || [];
  const hasBiasTesting = biasTesting.length > 0 && !biasTesting.includes("No testing conducted");

  const policyStatus: EvidenceStatus =
    data.formalAiPolicy === "yes" ? "present" : data.formalAiPolicy === "in-progress" ? "partial" : "missing";

  const killSwitchStatus: EvidenceStatus =
    data.killSwitch === "automated" || data.killSwitch === "manual-instant"
      ? "present"
      : data.killSwitch === "manual-slow"
        ? "partial"
        : "missing";

  const auditTrailStatus: EvidenceStatus =
    data.auditTrailCompleteness === "input-output" || data.auditTrailCompleteness === "decision-logic"
      ? "present"
      : data.auditTrailCompleteness === "metadata"
        ? "partial"
        : "missing";

  const externalAuditStatus: EvidenceStatus =
    data.externalVerification === "external-audit"
      ? "present"
      : data.externalVerification === "internal-only"
        ? "partial"
        : "missing";

  const trainingStatus: EvidenceStatus =
    data.trainingFrequency === "quarterly" || data.trainingFrequency === "annually"
      ? "present"
      : data.trainingFrequency === "one-time"
        ? "partial"
        : "missing";

  const modelDocsStatus: EvidenceStatus =
    modelDocs.length >= 3 ? "present" : modelDocs.length > 0 ? "partial" : "missing";

  const consumerDutySignals = [
    !!data.consumerRedress && data.consumerRedress !== "none",
    data.consumerExplainability === "automated" || data.consumerExplainability === "on-request",
    data.vulnerableCustomerHandling === "yes" || data.vulnerableCustomerHandling === "partial",
  ].filter(Boolean).length;
  const consumerDutyStatus: EvidenceStatus =
    consumerDutySignals === 3 ? "present" : consumerDutySignals > 0 ? "partial" : "missing";

  const coverageStatus: EvidenceStatus =
    data.aiCoverageCheck === "covered"
      ? "present"
      : data.aiCoverageCheck === "uncertain"
        ? "partial"
        : "missing";

  const items: EvidenceItem[] = [
    {
      category: "Governance Evidence",
      label: "Formal AI policy",
      status: policyStatus,
      detail: "Board-approved policy covering acceptable AI use and accountability",
    },
    {
      category: "Governance Evidence",
      label: "Documented AI governance process",
      status: data.documentedProcess ? "present" : "missing",
      detail: "How AI systems are approved, reviewed, and retired",
    },
    {
      category: "Governance Evidence",
      label: "External audit report",
      status: externalAuditStatus,
      detail: "Independent assurance over AI controls",
    },
    {
      category: "Governance Evidence",
      label: "AI governance training records",
      status: trainingStatus,
      detail: "Recurring staff training evidencing governance maturity",
    },
    {
      category: "Model Risk Evidence",
      label: "Model documentation / model cards",
      status: modelDocsStatus,
      detail: "Technical documentation underwriters use to validate model risk",
    },
    {
      category: "Model Risk Evidence",
      label: "Bias and fairness testing results",
      status: hasBiasTesting ? "present" : "missing",
      detail: "Required to defend against discrimination claims on AI decisions",
    },
    {
      category: "Insurance Readiness Evidence",
      label: "AI coverage confirmation",
      status: coverageStatus,
      detail: "Policy wording checked with the broker for AI-related claims",
    },
    {
      category: "Monitoring & Incident Evidence",
      label: "Audit trail of AI decisions",
      status: auditTrailStatus,
      detail: "Decision logs insurers rely on during claims handling",
    },
    {
      category: "Monitoring & Incident Evidence",
      label: "AI incident response plan",
      status: data.incidentResponsePlan ? "present" : "missing",
      detail: "Documented escalation and remediation procedures for AI failures",
    },
    {
      category: "Monitoring & Incident Evidence",
      label: "Kill-switch / emergency stop procedure",
      status: killSwitchStatus,
      detail: "Evidence the system can be halted quickly if it misbehaves",
    },
  ];

  if (data.regulatedEntity) {
    items.push(
      {
        category: "Model Risk Evidence",
        label: "Independent model validation report",
        status:
          data.independentValidation === "internal-independent" ||
          data.independentValidation === "external"
            ? "present"
            : "missing",
        detail: "PRA SS1/23 expects validation separate from the build team",
      },
      {
        category: "Governance Evidence",
        label: "Named SMF accountability mapping",
        status: data.smfAccountability ? "present" : "missing",
        detail: "A Senior Manager accountable for this AI under SM&CR",
      }
    );
  }

  if (data.dataSensitivity === "sensitive") {
    items.push({
      category: "Data Protection Evidence",
      label: "DPIA (GDPR Article 35)",
      status: data.documentedProcess ? "present" : "missing",
      detail: "Required for high-risk processing of sensitive personal data",
    });
  }

  if (data.hasDpo !== undefined) {
    items.push({
      category: "Data Protection Evidence",
      label: "Data Protection Officer appointed",
      status: data.hasDpo ? "present" : "missing",
      detail: "Accountable owner for data protection obligations",
    });
  }

  if (data.thirdPartyData) {
    items.push({
      category: "Vendor / Third-Party Evidence",
      label: "Third-party vendor risk assessments",
      status: "missing",
      detail: "Due diligence on external data and model providers",
    });
  }

  if (isCustomerFacing) {
    items.push({
      category: "Insurance Readiness Evidence",
      label: "Consumer Duty evidence pack",
      status: consumerDutyStatus,
      detail: "Redress, explainability, and vulnerable customer handling for AI decisions",
    });
  }

  return items;
}
