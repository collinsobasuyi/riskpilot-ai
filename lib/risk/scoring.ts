import { AssessmentFormData } from "./schema";
import { clamp } from "../utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function displayName(data: AssessmentFormData): string {
  return data.systemName || data.companyName || "Your AI system";
}

// ── Return types ──────────────────────────────────────────────────────────────

export interface CategoryScore {
  name: string;
  score: number;
  status: "low" | "medium" | "high";
}

export interface ComplianceGap {
  standard: string;
  status: "ok" | "partial" | "gap";
  missing: string[];
  impact: string;
  suggestedOwner: string;
}

export interface ComputedResults {
  riskScore: number;
  riskLevel: "High" | "Medium" | "Low";
  coverageTier: string;
  coverageEligibility: string;
  exclusions: string[];
  summary: string;
  categoryScores: CategoryScore[];
  riskDrivers: string[];
  validUntil: string;
  recommendations: { critical: string[]; high: string[]; medium: string[] };
  complianceGaps: ComplianceGap[];
  benchmark: { percentile: number; averageScore: number; comparison: string };
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export function computeResults(data: AssessmentFormData): ComputedResults {
  const drivers: string[] = [];

  // Decision authority
  const decisionScore =
    data.decisionAuthority === "full" ? 85 :
    data.decisionAuthority === "partial" ? 55 : 25;

  if (data.decisionAuthority === "full")
    drivers.push("Fully automated decisions — insurers require human oversight for coverage");
  if (data.decisionAuthority === "partial")
    drivers.push("AI recommendations influence decisions — review controls needed");

  // Financial impact tier
  const impactScore =
    data.financialImpactTier === "harm" ? 90 :
    data.financialImpactTier === "legal" ? 75 :
    data.financialImpactTier === "over_1m" ? 65 :
    data.financialImpactTier === "100k_to_1m" ? 50 : 25;

  if (data.financialImpactTier === "harm")
    drivers.push("Potential individual harm — may trigger coverage exclusions without safeguards");
  if (data.financialImpactTier === "legal")
    drivers.push("Regulatory exposure — FCA/PRA will scrutinise at renewal");
  if (data.financialImpactTier === "over_1m")
    drivers.push("Potential losses over £1m — insurer will require strong controls evidence");
  if (data.financialImpactTier === "100k_to_1m")
    drivers.push("Financial impact risk — documented controls required");

  // Data sensitivity
  const dataScore =
    data.dataSensitivity === "sensitive" ? 85 :
    data.dataSensitivity === "basic" ? 55 : 20;

  if (data.dataSensitivity === "sensitive")
    drivers.push("Sensitive data processing — enhanced underwriting required");
  if (data.thirdPartyData)
    drivers.push("Third-party data — insurers will request vendor risk assessments");

  // Data types
  const dataTypesCount = data.dataTypes?.length || 0;
  const dataTypesScore = dataTypesCount > 3 ? 15 : dataTypesCount > 1 ? 8 : 0;
  if (dataTypesCount > 3)
    drivers.push("Multiple data types — increases underwriting complexity");
  if (data.dataTypes?.includes("Financial data") || data.dataTypes?.includes("Credit data"))
    drivers.push("Financial/Credit data — FCA Consumer Duty considerations apply");

  // Regulations
  const hasConsumerDuty = data.regulations?.includes("FCA Consumer Duty");
  const hasPRA = data.regulations?.includes("PRA Model Risk (SS1/23)");
  const hasGDPR = data.regulations?.includes("GDPR / UK GDPR");
  const hasISO = data.regulations?.includes("ISO 42001");

  if (hasGDPR && data.dataSensitivity === "sensitive")
    drivers.push("GDPR: Article 35 DPIA likely required for insurer due diligence");
  if (hasISO && !data.documentedProcess)
    drivers.push("ISO 42001: Evidence of governance framework needed");
  if (hasConsumerDuty && data.deploymentType !== "internal")
    drivers.push("FCA Consumer Duty: Transparency obligations apply to customer-facing AI");
  if (hasPRA && data.decisionAuthority === "full")
    drivers.push("PRA SS1/23: Model risk management expectations for automated decisions");

  // AI capabilities
  const caps = data.aiCapabilities || [];
  if (caps.includes("Generative / LLM"))
    drivers.push("Generative AI in use — hallucination and output validation required");

  // Bias testing
  const biasTesting = data.biasTesting || [];
  const noBiasTesting = biasTesting.includes("No testing conducted") || biasTesting.length === 0;
  if (noBiasTesting && data.deploymentType !== "internal")
    drivers.push("No bias testing — potential discrimination claims may be excluded");

  // Model docs
  const modelDocs = data.modelDocs || [];
  const noModelDocs = modelDocs.includes("None") || modelDocs.length === 0;
  const docScore = noModelDocs ? 20 : modelDocs.length >= 3 ? 0 : 10;
  if (noModelDocs)
    drivers.push("No model documentation — insurers cannot validate risk");

  // Monitoring
  const monitoring = data.monitoring || [];
  const noMonitoring = monitoring.includes("None") || monitoring.length === 0;
  if (noMonitoring)
    drivers.push("No continuous monitoring — insurers require evidence of oversight");

  // Training / governance maturity
  const noTraining =
    !data.trainingFrequency ||
    data.trainingFrequency === "none" ||
    data.trainingFrequency === "one-time";
  if (noTraining)
    drivers.push("Limited AI governance training — maturity concern for underwriters");

  // Governance
  const oversightPenalty =
    data.existingOversight === "continuous" ? -15 :
    data.existingOversight === "periodic" ? -8 : 0;
  const processPenalty = data.documentedProcess ? -8 : 0;
  const dpoPenalty = data.hasDpo ? -5 : 0;

  if (!data.documentedProcess)
    drivers.push("No documented governance — insurers will require evidence at renewal");
  if (data.existingOversight === "none")
    drivers.push("No formal oversight — likely coverage exclusion");

  // Incident history
  const incidentBoost =
    data.incidentHistory === "multiple" ? 12 :
    data.incidentHistory === "significant" ? 8 :
    data.incidentHistory === "minor" ? 4 : 0;

  if (data.incidentHistory === "significant" || data.incidentHistory === "multiple")
    drivers.push("Prior incidents — expect higher premiums or policy exclusions");

  // Deployment exposure
  const exposureBoost =
    data.deploymentType === "customer" ? 10 :
    data.deploymentType === "both" ? 12 : 0;

  if (data.deploymentType !== "internal" && data.deploymentType !== "self-hosted")
    drivers.push("Customer-facing AI — reputational risk affects insurability");

  // Maturity & frequency
  const maturityBoost =
    data.aiMaturity === "multiple" ? 8 :
    data.aiMaturity === "production" ? 5 : 0;

  const frequencyBoost =
    data.frequencyOfUse === "ongoing" ? 10 :
    data.frequencyOfUse === "hourly" ? 8 :
    data.frequencyOfUse === "daily" ? 5 : 0;

  // Auditability
  const noAuditTrail = !data.auditTrailCompleteness || data.auditTrailCompleteness === "none";
  if (noAuditTrail)
    drivers.push("No audit trail — insurers require decision logs for claims handling");

  // Kill switch
  const noKillSwitch = !data.killSwitch || data.killSwitch === "none" || data.killSwitch === "code-deploy";
  if (noKillSwitch)
    drivers.push("No effective kill switch — inability to stop AI quickly is a coverage concern");

  // ── NEW: Insurance coverage check ─────────────────────────────
  const coverageGap = data.aiCoverageCheck === "gap-identified" || data.aiCoverageCheck === "no-coverage";
  const coverageUncertain = !data.aiCoverageCheck || data.aiCoverageCheck === "uncertain";
  const coverageBoost = data.aiCoverageCheck === "no-coverage" ? 12 :
    data.aiCoverageCheck === "gap-identified" ? 10 :
    data.aiCoverageCheck === "uncertain" ? 6 : 0;
  if (coverageGap)
    drivers.push("AI coverage gap confirmed — current policy does not cover AI-related claims");
  else if (coverageUncertain)
    drivers.push("AI coverage unverified — policy wording has not been checked for AI exclusions");

  // ── NEW: Consumer Duty ─────────────────────────────────────────
  const isCustomerFacing = data.deploymentType === "customer" || data.deploymentType === "both";
  const noConsumerRedress = data.consumerRedress === "none" || !data.consumerRedress;
  const noConsumerExplainability = data.consumerExplainability === "none";
  const noVulnerableHandling = data.vulnerableCustomerHandling === "none";
  const consumerDutyPenalty =
    (isCustomerFacing && noConsumerRedress ? 10 : 0) +
    (isCustomerFacing && noConsumerExplainability ? 8 : 0) +
    (isCustomerFacing && noVulnerableHandling ? 6 : 0);

  if (isCustomerFacing && noConsumerRedress)
    drivers.push("No consumer redress mechanism — FCA Consumer Duty requires a complaints/appeals process for AI decisions");
  if (isCustomerFacing && noConsumerExplainability)
    drivers.push("No consumer-facing explanation of AI decisions — GDPR Article 22 and Consumer Duty obligation");
  if (isCustomerFacing && noVulnerableHandling)
    drivers.push("No vulnerable customer handling — Consumer Duty requires differentiated approach");

  // ── NEW: PRA SS1/23 — independent validation ──────────────────
  const noIndependentValidation = data.independentValidation === "none" || !data.independentValidation;
  const validationPenalty = noIndependentValidation && data.regulatedEntity ? 8 : 0;
  if (noIndependentValidation && data.regulatedEntity)
    drivers.push("No independent model validation — PRA SS1/23 requires validation separate from the build team");

  // ── NEW: SMF accountability ────────────────────────────────────
  const noSmf = !data.smfAccountability;
  const smfPenalty = noSmf && data.regulatedEntity ? 6 : 0;
  if (noSmf && data.regulatedEntity)
    drivers.push("No named Senior Manager accountable for this AI — SMF regime requires designated accountability");

  // ── NEW: Formal AI policy ─────────────────────────────────────
  const noFormalPolicy = data.formalAiPolicy === "no" || !data.formalAiPolicy;
  const policyPenalty = noFormalPolicy ? 6 : 0;
  if (noFormalPolicy)
    drivers.push("No formal AI policy — required by ISO 42001 and expected by auditors and underwriters");

  // ── NEW: Incident response plan ───────────────────────────────
  const noIncidentPlan = !data.incidentResponsePlan;
  const incidentPlanPenalty = noIncidentPlan ? 5 : 0;
  if (noIncidentPlan)
    drivers.push("No AI incident response plan — insurers need documented remediation procedures for claims");

  // --- Overall Risk Score ---
  const raw =
    decisionScore * 0.2 +
    impactScore * 0.2 +
    dataScore * 0.15 +
    50 * 0.1 +
    incidentBoost +
    exposureBoost +
    maturityBoost +
    frequencyBoost +
    dataTypesScore +
    docScore +
    oversightPenalty +
    processPenalty +
    dpoPenalty +
    coverageBoost +
    consumerDutyPenalty +
    validationPenalty +
    smfPenalty +
    policyPenalty +
    incidentPlanPenalty;

  const riskScore = clamp(Math.round(raw), 0, 100);
  const riskLevel: "High" | "Medium" | "Low" =
    riskScore >= 70 ? "High" : riskScore >= 45 ? "Medium" : "Low";

  // --- Insurability tier ---
  let coverageTier = "Standard";
  let coverageEligibility = "Eligible";
  let exclusions: string[] = [];

  if (riskScore >= 70) {
    coverageTier = "Specialist";
    coverageEligibility = "Conditional";
    exclusions = ["Autonomous decisions without documented oversight", "Unvalidated models in production", "Known incidents without remediation plan"];
  } else if (riskScore >= 45) {
    coverageTier = "Enhanced";
    coverageEligibility = "Eligible";
    exclusions = ["Specific high-risk use cases may carry sub-limits"];
  }

  if (data.decisionAuthority === "full" && data.financialImpactTier !== "under_100k")
    exclusions.push("Autonomous decisions in high-impact areas");
  if (noBiasTesting && data.deploymentType !== "internal")
    exclusions.push("Discrimination claims from untested customer-facing AI");
  if (data.incidentHistory === "significant" || data.incidentHistory === "multiple")
    exclusions.push("Known incident types without root cause analysis");

  // --- Recommendations ---
  const critical: string[] = [];
  const high: string[] = [];
  const medium: string[] = [];

  if (data.decisionAuthority === "full" && data.financialImpactTier !== "under_100k")
    critical.push("Implement human oversight for high-impact automated decisions before renewal");
  if (data.dataSensitivity === "sensitive" && !data.documentedProcess)
    critical.push("Complete DPIA and document controls for sensitive data processing");
  if (data.incidentHistory === "significant" || data.incidentHistory === "multiple")
    critical.push("Develop incident response plan with root cause analysis documentation");
  if (noBiasTesting && isCustomerFacing)
    critical.push("Conduct bias and fairness testing before renewal — required for customer-facing AI");
  if (noKillSwitch)
    critical.push("Implement an emergency stop mechanism — inability to halt AI is a key underwriting concern");
  if (coverageGap)
    critical.push("Resolve AI coverage gap with your broker before renewal — confirm AI errors and decisions are covered");
  if (isCustomerFacing && noConsumerRedress)
    critical.push("Establish a consumer redress mechanism — FCA Consumer Duty and GDPR require an appeals process for AI decisions");

  if (!data.documentedProcess)
    high.push("Document AI governance framework for insurer due diligence");
  if (data.existingOversight === "none")
    high.push("Implement continuous monitoring — insurers require evidence of active oversight");
  if (noModelDocs)
    high.push("Create model cards and technical documentation for underwriting review");
  if (data.thirdPartyData)
    high.push("Compile third-party vendor risk assessments for insurer questionnaire");
  if (hasConsumerDuty && isCustomerFacing)
    high.push("Prepare Consumer Duty evidence pack for FCA-supervised renewal");
  if (hasPRA)
    high.push("Align model documentation to PRA SS1/23 model risk management standards");
  if (noAuditTrail)
    high.push("Establish audit trails for all AI decisions — required for claims processing");
  if (noIndependentValidation && data.regulatedEntity)
    high.push("Arrange independent model validation — PRA SS1/23 requires validation separate from the build team");
  if (noSmf && data.regulatedEntity)
    high.push("Name a Senior Manager (SMF) accountable for this AI system — required under SM&CR for regulated firms");
  if (noFormalPolicy)
    high.push("Draft and approve a formal AI policy — expected by ISO 42001, auditors, and underwriters");
  if (coverageUncertain && !coverageGap)
    high.push("Check policy wording with your broker — confirm whether AI-related claims are explicitly covered");
  if (isCustomerFacing && noConsumerExplainability)
    high.push("Implement consumer-facing explanations for AI decisions — GDPR Article 22 and Consumer Duty obligation");

  medium.push("Document system boundaries and out-of-scope use cases for policy wording");
  medium.push("Schedule quarterly AI risk reviews aligned with your insurance renewal cycle");
  if (caps.includes("Generative / LLM"))
    medium.push("Implement output validation and hallucination monitoring for generative AI");
  if (data.frequencyOfUse === "ongoing" || data.frequencyOfUse === "hourly")
    medium.push("High-frequency use requires automated monitoring with alerting evidence");
  if (noTraining)
    medium.push("Deliver AI governance training programme — evidence for underwriters");
  if (noIncidentPlan)
    medium.push("Document an AI incident response plan — insurers need procedures for how failures are escalated and remediated");
  if (isCustomerFacing && noVulnerableHandling)
    medium.push("Implement vulnerable customer identification and handling — FCA Consumer Duty requirement");

  const summary =
    coverageEligibility === "Eligible"
      ? `${displayName(data)} has an AI Risk Score of ${riskScore}/100 (${riskLevel.toLowerCase()} risk). Generally eligible for coverage with ${coverageTier} terms. Address the ${critical.length} critical item${critical.length !== 1 ? "s" : ""} before renewal to improve terms and reduce exclusions.`
      : `${displayName(data)} has an AI Risk Score of ${riskScore}/100 (${riskLevel.toLowerCase()} risk). Conditional coverage — address critical recommendations to achieve full eligibility before renewal.`;

  // --- Category scores ---
  const categoryScores: CategoryScore[] = [
    {
      name: "Governance",
      score: clamp(100 + oversightPenalty + processPenalty + dpoPenalty, 0, 100),
      status: data.existingOversight === "continuous" ? "low" : data.existingOversight === "periodic" ? "medium" : "high",
    },
    {
      name: "Model Risk",
      score: clamp(100 - Math.round(decisionScore * 0.5) - docScore, 0, 100),
      status: decisionScore >= 70 ? "high" : decisionScore >= 40 ? "medium" : "low",
    },
    {
      name: "Auditability",
      score: clamp(50 + (modelDocs.length * 8) + (monitoring.length > 0 && !noMonitoring ? 15 : 0), 0, 100),
      status: noModelDocs ? "high" : modelDocs.length >= 3 ? "low" : "medium",
    },
    {
      name: "Human Oversight",
      score: data.decisionAuthority === "full" ? 30 : data.decisionAuthority === "partial" ? 65 : 90,
      status: data.decisionAuthority === "full" ? "high" : data.decisionAuthority === "partial" ? "medium" : "low",
    },
    {
      name: "Operational Monitoring",
      score: clamp(40 + (monitoring.length * 12) + (data.killSwitch && !noKillSwitch ? 15 : 0), 0, 100),
      status: noMonitoring ? "high" : monitoring.length >= 2 ? "low" : "medium",
    },
  ];

  // --- Compliance gaps ---
  const consumerDutyMissing: string[] = [];
  if (hasConsumerDuty || isCustomerFacing) {
    if (!data.documentedProcess) consumerDutyMissing.push("Governance evidence and documented process");
    if (noConsumerRedress) consumerDutyMissing.push("Consumer redress / appeals mechanism");
    if (noConsumerExplainability) consumerDutyMissing.push("Consumer-facing explanation of AI decisions (Article 22)");
    if (noVulnerableHandling) consumerDutyMissing.push("Vulnerable customer identification and handling");
  }

  const praMissing: string[] = [];
  if (hasPRA || data.regulatedEntity) {
    if (modelDocs.length === 0) praMissing.push("Model documentation standards");
    if (noIndependentValidation) praMissing.push("Independent model validation (separate from build team)");
    if (noSmf) praMissing.push("Named Senior Manager (SMF) accountability");
    if (data.existingOversight === "none") praMissing.push("Oversight framework and controls evidence");
  }

  const isoMissing: string[] = [];
  if (noFormalPolicy) isoMissing.push("Formal AI policy (approved and documented)");
  if (!data.documentedProcess) isoMissing.push("AI governance process documentation");
  if (noIncidentPlan) isoMissing.push("Incident response and remediation procedures");

  const gdprMissing: string[] = [];
  if (data.dataSensitivity === "sensitive") gdprMissing.push("Article 35 DPIA for high-risk processing");
  if (isCustomerFacing && noConsumerExplainability) gdprMissing.push("Article 22 automated decision safeguards and right to explanation");
  if (data.thirdPartyData) gdprMissing.push("Third-party data processor agreements and due diligence");

  const complianceGaps: ComplianceGap[] = [
    {
      standard: "FCA Consumer Duty",
      status: consumerDutyMissing.length === 0 ? "ok" : consumerDutyMissing.length <= 1 ? "partial" : "gap",
      missing: consumerDutyMissing,
      impact: "May affect approval of customer-facing AI and attract FCA scrutiny at renewal",
      suggestedOwner: "Compliance lead / SMF holder",
    },
    {
      standard: "PRA Model Risk (SS1/23)",
      status: praMissing.length === 0 ? "ok" : praMissing.length <= 1 ? "partial" : "gap",
      missing: praMissing,
      impact: "High underwriting concern — model risk framework expected for regulated firms",
      suggestedOwner: "Chief Risk Officer / model risk function",
    },
    {
      standard: "ISO 42001",
      status: isoMissing.length === 0 ? "ok" : isoMissing.length <= 1 ? "partial" : "gap",
      missing: isoMissing,
      impact: "Weakens the governance evidence relied on by auditors and underwriters",
      suggestedOwner: "Head of AI governance / CTO",
    },
    {
      standard: "GDPR / UK GDPR",
      status: gdprMissing.length === 0 ? "ok" : gdprMissing.length <= 1 ? "partial" : "gap",
      missing: gdprMissing,
      impact: "Regulatory exposure including ICO enforcement; affects insurability of data-related claims",
      suggestedOwner: "Data Protection Officer",
    },
  ];

  const benchmarkAvg =
    data.industry === "financial" ? 68 :
    data.industry === "insurance" ? 72 :
    data.industry === "technology" ? 64 : 70;

  const percentile = clamp(100 - Math.round((riskScore / 100) * 70), 5, 95);
  const comparison =
    riskScore > benchmarkAvg + 10 ? "higher risk than peers" :
    riskScore > benchmarkAvg ? "slightly higher risk than peers" :
    riskScore < benchmarkAvg - 10 ? "lower risk than peers" :
    riskScore < benchmarkAvg ? "slightly lower risk than peers" : "in line with peers";

  return {
    riskScore,
    riskLevel,
    coverageTier,
    coverageEligibility,
    exclusions: Array.from(new Set(exclusions)),
    summary,
    categoryScores,
    riskDrivers: Array.from(new Set(drivers)).slice(0, 10),
    validUntil: addDaysISO(riskLevel === "High" ? 30 : riskLevel === "Medium" ? 60 : 90),
    recommendations: { critical, high, medium },
    complianceGaps: complianceGaps.filter((g) => g.missing.length > 0),
    benchmark: { percentile, averageScore: benchmarkAvg, comparison },
  };
}
