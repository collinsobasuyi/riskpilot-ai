// lib/risk/evidence.ts
//
// Derives the underwriting evidence checklist from the assessment data:
// the documents and artefacts a broker or underwriter will ask for, and
// whether this assessment evidenced them.

import { AssessmentFormData } from "./schema";

export interface EvidenceItem {
  label: string;
  evidenced: boolean;
  detail: string;
}

export function buildEvidenceChecklist(data: AssessmentFormData): EvidenceItem[] {
  const isCustomerFacing = data.deploymentType === "customer" || data.deploymentType === "both";
  const modelDocs = data.modelDocs || [];
  const hasModelDocs = modelDocs.length > 0 && !modelDocs.includes("None");
  const biasTesting = data.biasTesting || [];
  const hasBiasTesting = biasTesting.length > 0 && !biasTesting.includes("No testing conducted");
  const hasKillSwitch =
    !!data.killSwitch && data.killSwitch !== "none" && data.killSwitch !== "code-deploy";
  const hasConsumerDutyPack =
    !!data.consumerRedress &&
    data.consumerRedress !== "none" &&
    data.consumerExplainability !== "none" &&
    data.vulnerableCustomerHandling !== "none";
  const hasTrainingRecords =
    !!data.trainingFrequency &&
    data.trainingFrequency !== "none" &&
    data.trainingFrequency !== "one-time";

  const items: EvidenceItem[] = [
    {
      label: "Formal AI policy",
      evidenced: data.formalAiPolicy === "yes",
      detail: "Board-approved policy covering acceptable AI use and accountability",
    },
    {
      label: "Documented AI governance process",
      evidenced: data.documentedProcess,
      detail: "How AI systems are approved, reviewed, and retired",
    },
    {
      label: "Model documentation / model cards",
      evidenced: hasModelDocs,
      detail: "Technical documentation underwriters use to validate model risk",
    },
    {
      label: "Bias and fairness testing results",
      evidenced: hasBiasTesting,
      detail: "Required to defend against discrimination claims on AI decisions",
    },
    {
      label: "Audit trail of AI decisions",
      evidenced: !!data.auditTrailCompleteness && data.auditTrailCompleteness !== "none",
      detail: "Decision logs insurers rely on during claims handling",
    },
    {
      label: "AI incident response plan",
      evidenced: !!data.incidentResponsePlan,
      detail: "Documented escalation and remediation procedures for AI failures",
    },
    {
      label: "Kill-switch / emergency stop procedure",
      evidenced: hasKillSwitch,
      detail: "Evidence the system can be halted quickly if it misbehaves",
    },
    {
      label: "External audit report",
      evidenced: data.externalVerification === "external-audit",
      detail: "Independent assurance over AI controls",
    },
    {
      label: "AI governance training records",
      evidenced: hasTrainingRecords,
      detail: "Recurring staff training evidencing governance maturity",
    },
  ];

  if (data.regulatedEntity) {
    items.push(
      {
        label: "Independent model validation report",
        evidenced: !!data.independentValidation && data.independentValidation !== "none",
        detail: "PRA SS1/23 expects validation separate from the build team",
      },
      {
        label: "Named SMF accountability mapping",
        evidenced: !!data.smfAccountability,
        detail: "A Senior Manager accountable for this AI under SM&CR",
      }
    );
  }

  if (data.dataSensitivity === "sensitive") {
    items.push({
      label: "DPIA (GDPR Article 35)",
      evidenced: data.documentedProcess,
      detail: "Required for high-risk processing of sensitive personal data",
    });
  }

  if (data.thirdPartyData) {
    items.push({
      label: "Third-party vendor risk assessments",
      evidenced: false,
      detail: "Due diligence on external data and model providers",
    });
  }

  if (isCustomerFacing) {
    items.push({
      label: "Consumer Duty evidence pack",
      evidenced: hasConsumerDutyPack,
      detail: "Redress, explainability, and vulnerable customer handling for AI decisions",
    });
  }

  // Missing items first — that's what the reader needs to act on.
  return items.sort((a, b) => Number(a.evidenced) - Number(b.evidenced));
}
