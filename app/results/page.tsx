// app/results/page.tsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Clock,
  FileText,
  BarChart3,
  Award,
  Users,
  Database,
  GitBranch,
  BookOpen,
  Target,
  TrendingUp,
  Layers,
  Scale,
  Building,
  AlertCircle,
  Printer,
} from "lucide-react";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import ButtonLink from "../../components/ui/ButtonLink";
import {
  AssessmentFormData,
  SUBMISSION_KEY,
  safeJsonParse,
  safeLocalStorageGet,
} from "../../lib/risk/schema";
import { useState } from "react";

// ─── Stored shape ─────────────────────────────────────────────────────────────

type StoredSubmission = {
  id: string;
  submittedAt: string;
  data: AssessmentFormData;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysAgoLabel(iso: string) {
  const t = new Date(iso).getTime();
  const diffDays = Math.max(0, Math.round((Date.now() - t) / 86_400_000));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function formatDate() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Scoring engine (uses AssessmentFormData) ─────────────────────────────────

function computeResults(data: AssessmentFormData) {
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
      ? `${fd_placeholder(data)} scores ${riskScore}/100. Generally eligible for coverage with ${coverageTier} terms. Address the ${critical.length} critical item${critical.length !== 1 ? "s" : ""} before renewal to improve terms and reduce exclusions.`
      : `${fd_placeholder(data)} scores ${riskScore}/100. Conditional coverage — address critical recommendations to achieve full eligibility before renewal.`;

  // --- Category scores ---
  const categoryScores = [
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

  const complianceGaps = [
    {
      standard: "FCA Consumer Duty",
      status: consumerDutyMissing.length === 0 ? "ok" : consumerDutyMissing.length <= 1 ? "partial" : "gap",
      missing: consumerDutyMissing,
    },
    {
      standard: "PRA Model Risk (SS1/23)",
      status: praMissing.length === 0 ? "ok" : praMissing.length <= 1 ? "partial" : "gap",
      missing: praMissing,
    },
    {
      standard: "ISO 42001",
      status: isoMissing.length === 0 ? "ok" : isoMissing.length <= 1 ? "partial" : "gap",
      missing: isoMissing,
    },
    {
      standard: "GDPR / UK GDPR",
      status: gdprMissing.length === 0 ? "ok" : gdprMissing.length <= 1 ? "partial" : "gap",
      missing: gdprMissing,
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

function fd_placeholder(data: AssessmentFormData): string {
  return data.systemName || data.companyName || "Your AI system";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [submission, setSubmission] = useState<StoredSubmission | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = safeLocalStorageGet(SUBMISSION_KEY);
    const parsed = safeJsonParse<StoredSubmission>(raw);
    setSubmission(parsed);
  }, []);

  const results = useMemo(() => {
    if (!submission) return null;
    return computeResults(submission.data);
  }, [submission]);

  const assessmentAge = useMemo(
    () => (submission ? daysAgoLabel(submission.submittedAt) : ""),
    [submission]
  );

  const handlePrint = () => window.print();

  const getScoreColor = (score: number) =>
    score >= 70 ? "text-red-600" : score >= 40 ? "text-amber-600" : "text-green-600";

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      high: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-amber-100 text-amber-700 border-amber-200",
      low: "bg-green-100 text-green-700 border-green-200",
      partial: "bg-amber-100 text-amber-700 border-amber-200",
      gap: "bg-red-100 text-red-700 border-red-200",
      ok: "bg-green-100 text-green-700 border-green-200",
    };
    return styles[status] || "bg-zinc-100 text-zinc-700 border-zinc-200";
  };

  if (!submission || !results) {
    return (
      <section className="py-16">
        <Container>
          <Card title="No assessment found">
            <p className="text-sm text-zinc-600">
              We couldn&apos;t find a submitted assessment. Complete a new assessment to generate your AI Governance Score.
            </p>
            <div className="mt-4">
              <Link href="/assessment" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Start assessment →
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  const fd = submission.data;
  const r = results;

  return (
    <>
      {/* ── Print styles ────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body { background: white !important; }
          nav, .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          .print-section { break-inside: avoid; }
          @page { margin: 20mm; size: A4; }
        }
      `}</style>

      {/* ── Screen header ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-200 no-print">
        <Container className="py-6">
          <div className="flex items-center justify-between">
            <Link href="/assessment" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              New assessment
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 transition"
                type="button"
              >
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Evidence pack (printed + visible on screen) ─────────────── */}
      <div ref={printRef}>

        {/* ── Evidence pack header — shown on print only ── */}
        <div className="hidden print:block border-b border-zinc-300 pb-6 mb-6 px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">RiskPilot AI</h1>
              <p className="text-sm text-zinc-500">AI Governance Evidence Pack</p>
            </div>
            <div className="text-right text-sm text-zinc-500">
              <p>Generated: {formatDate()}</p>
              <p>Ref: {submission.id}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-zinc-50 rounded border border-zinc-200 text-xs text-zinc-500">
            This document is an independent AI governance assessment prepared by RiskPilot AI for use in insurance renewal discussions. It does not constitute legal advice or guarantee coverage.
          </div>
        </div>

        {/* ── Page title ── */}
        <section className="bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-200">
          <Container className="py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 print:text-2xl">
                  AI Governance Assessment
                </h1>
                <p className="text-zinc-500 mt-1">
                  {fd.companyName || "Your firm"} • {fd.systemName || "AI System"}
                </p>
                {fd.regulatedEntity && fd.regulator && (
                  <div className="flex items-center gap-2 mt-2">
                    <Scale className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-zinc-600">
                      {fd.regulator === "fca" ? "FCA Regulated" :
                       fd.regulator === "pra" ? "PRA Regulated" :
                       fd.regulator === "both" ? "FCA + PRA Regulated" :
                       "Regulated Entity"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                    r.riskLevel === "High" ? "bg-red-50 text-red-700 border-red-200" :
                    r.riskLevel === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {r.riskLevel} Risk
                </span>
                <span className="text-sm text-zinc-400 no-print">Assessed {assessmentAge}</span>
                <span className="text-sm text-zinc-400 hidden print:inline">Assessed {formatDate()}</span>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container>

            {/* ── Hero score card ── */}
            <div className="mb-8 print-section">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <Shield className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100 font-medium">RiskPilot AI Governance Score</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">{r.riskScore}</span>
                        <span className="text-blue-200 text-lg">/100</span>
                      </div>
                      <p className="text-blue-100 text-sm mt-1">{r.summary}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="inline-block px-4 py-3 bg-white/20 rounded-xl">
                      <p className="text-sm font-semibold">{r.coverageEligibility} for coverage</p>
                      <p className="text-xs text-blue-100 mt-0.5">{r.coverageTier} terms apply</p>
                      <p className="text-xs text-blue-200 mt-1">Valid until {r.validUntil}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Coverage warnings ── */}
            {r.exclusions.length > 0 && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl print-section">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800">Coverage implications — discuss with your broker</p>
                    <ul className="mt-2 space-y-1">
                      {r.exclusions.map((ex, i) => (
                        <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                          <span className="h-1.5 w-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── Insurance coverage callout ── */}
            {fd.aiCoverageCheck && fd.aiCoverageCheck !== "covered" && (
              <div className={`mb-8 p-4 rounded-xl border print-section ${
                fd.aiCoverageCheck === "no-coverage" || fd.aiCoverageCheck === "gap-identified"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              }`}>
                <div className="flex items-start gap-3">
                  <Shield className={`h-5 w-5 shrink-0 mt-0.5 ${
                    fd.aiCoverageCheck === "no-coverage" || fd.aiCoverageCheck === "gap-identified"
                      ? "text-red-600"
                      : "text-amber-600"
                  }`} />
                  <div>
                    <p className={`font-semibold ${
                      fd.aiCoverageCheck === "no-coverage" || fd.aiCoverageCheck === "gap-identified"
                        ? "text-red-800"
                        : "text-amber-800"
                    }`}>
                      {fd.aiCoverageCheck === "no-coverage" && "No PI / D&O coverage in place"}
                      {fd.aiCoverageCheck === "gap-identified" && "AI coverage gap identified"}
                      {fd.aiCoverageCheck === "uncertain" && "Insurance coverage not verified"}
                    </p>
                    <p className={`mt-1 text-sm ${
                      fd.aiCoverageCheck === "no-coverage" || fd.aiCoverageCheck === "gap-identified"
                        ? "text-red-700"
                        : "text-amber-700"
                    }`}>
                      {fd.aiCoverageCheck === "no-coverage" && "This AI system is operating without relevant insurance coverage. Any AI-related claims, regulatory penalties, or third-party losses would be uninsured."}
                      {fd.aiCoverageCheck === "gap-identified" && "Your current policy has a confirmed gap in AI coverage. Discuss with your broker before the next renewal — exclusions for AI errors or automated decisions are common in legacy policies."}
                      {fd.aiCoverageCheck === "uncertain" && "Policy wording has not been checked for AI exclusions. Many legacy PI and D&O policies silently exclude AI-related claims. Verify with your broker."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── KPI strip ── */}
            <div className="grid gap-4 sm:grid-cols-4 mb-8 print-section">
              {[
                { label: "Risk Drivers", value: r.riskDrivers.length, sub: "flagged for underwriters", color: "border-blue-500", icon: <AlertTriangle className="h-5 w-5 text-blue-600" />, bg: "bg-blue-100" },
                { label: "Critical Actions", value: r.recommendations.critical.length, sub: "before renewal", color: "border-red-500", icon: <Target className="h-5 w-5 text-red-600" />, bg: "bg-red-100" },
                { label: "Controls Needed", value: r.recommendations.high.length + r.recommendations.medium.length, sub: "recommended", color: "border-amber-500", icon: <CheckCircle2 className="h-5 w-5 text-amber-600" />, bg: "bg-amber-100" },
                { label: "Valid Until", value: r.validUntil, sub: "reassess before renewal", color: "border-purple-500", icon: <Clock className="h-5 w-5 text-purple-600" />, bg: "bg-purple-100" },
              ].map((k) => (
                <div key={k.label} className={`rounded-2xl border bg-white shadow-sm p-4 border-l-4 ${k.color}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">{k.label}</p>
                      <p className="text-2xl font-bold text-zinc-900 mt-0.5">{k.value}</p>
                      <p className="text-xs text-zinc-400">{k.sub}</p>
                    </div>
                    <div className={`h-9 w-9 ${k.bg} rounded-lg flex items-center justify-center`}>
                      {k.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Main grid ── */}
            <div className="grid gap-8 lg:grid-cols-3">

              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Score breakdown */}
                <Card title="AI Governance Score Breakdown" icon={<BarChart3 className="h-5 w-5 text-blue-600" />}>
                  <div className="space-y-4">
                    {r.categoryScores.map((cat) => (
                      <div key={cat.name} className="print-section">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-zinc-700 font-medium">{cat.name}</span>
                          <span className={`font-semibold ${getScoreColor(cat.score)}`}>{cat.score}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 rounded-full">
                          <div
                            className={`h-2 rounded-full ${cat.score >= 70 ? "bg-red-500" : cat.score >= 40 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Risk drivers */}
                <Card title="Key Risk Drivers (for Underwriters)" icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}>
                  <div className="space-y-2">
                    {r.riskDrivers.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 p-2.5 bg-zinc-50 rounded-lg print-section">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-700">{d}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recommendations */}
                <Card title="Recommended Actions Before Renewal" icon={<Target className="h-5 w-5 text-blue-600" />}>
                  <div className="space-y-5">
                    {r.recommendations.critical.length > 0 && (
                      <div className="print-section">
                        <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                          <span className="h-2 w-2 bg-red-500 rounded-full" />
                          Critical — address before renewal
                        </h4>
                        <ul className="space-y-1.5">
                          {r.recommendations.critical.map((rec, i) => (
                            <li key={i} className="text-sm text-zinc-700 flex items-start gap-2">
                              <span className="h-1.5 w-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.recommendations.high.length > 0 && (
                      <div className="print-section">
                        <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                          <span className="h-2 w-2 bg-amber-500 rounded-full" />
                          High Priority
                        </h4>
                        <ul className="space-y-1.5">
                          {r.recommendations.high.map((rec, i) => (
                            <li key={i} className="text-sm text-zinc-700 flex items-start gap-2">
                              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.recommendations.medium.length > 0 && (
                      <div className="print-section">
                        <h4 className="text-sm font-semibold text-zinc-600 mb-2 flex items-center gap-2">
                          <span className="h-2 w-2 bg-zinc-400 rounded-full" />
                          Medium Priority
                        </h4>
                        <ul className="space-y-1.5">
                          {r.recommendations.medium.map((rec, i) => (
                            <li key={i} className="text-sm text-zinc-700 flex items-start gap-2">
                              <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full mt-1.5 shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Evidence summary */}
                {(fd.biasTesting?.length || fd.modelDocs?.length || fd.monitoring?.length) ? (
                  <Card title="Evidence Summary for Underwriters" icon={<GitBranch className="h-5 w-5 text-blue-600" />}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {fd.biasTesting && fd.biasTesting.length > 0 && (
                        <div className="border rounded-lg p-3 print-section">
                          <h4 className="text-xs font-semibold text-zinc-700 mb-2 flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-blue-600" />
                            Bias Testing
                          </h4>
                          <ul className="space-y-1">
                            {fd.biasTesting.map((item) => (
                              <li key={item} className="text-xs text-zinc-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {fd.modelDocs && fd.modelDocs.length > 0 && (
                        <div className="border rounded-lg p-3 print-section">
                          <h4 className="text-xs font-semibold text-zinc-700 mb-2 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                            Documentation
                          </h4>
                          <ul className="space-y-1">
                            {fd.modelDocs.map((item) => (
                              <li key={item} className="text-xs text-zinc-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {fd.monitoring && fd.monitoring.length > 0 && (
                        <div className="border rounded-lg p-3 sm:col-span-2 print-section">
                          <h4 className="text-xs font-semibold text-zinc-700 mb-2 flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                            Monitoring in Place
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {fd.monitoring.map((item) => (
                              <span key={item} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : null}

                {/* Capabilities declared */}
                {fd.aiCapabilities && fd.aiCapabilities.length > 0 && (
                  <Card title="AI Capabilities Declared" icon={<Layers className="h-5 w-5 text-blue-600" />}>
                    <div className="flex flex-wrap gap-2">
                      {fd.aiCapabilities.map((c) => (
                        <span key={c} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">
                          {c}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-6">

                {/* Benchmark */}
                <Card title="Industry Benchmark" icon={<BarChart3 className="h-5 w-5 text-blue-600" />}>
                  <div className="text-center py-2">
                    <p className="text-4xl font-bold text-zinc-900">{r.benchmark.percentile}th</p>
                    <p className="text-sm text-zinc-500 mt-1">percentile</p>
                    <p className="text-xs text-zinc-500 mt-3">
                      Your risk profile is{" "}
                      <span className="font-medium text-zinc-800">{r.benchmark.comparison}</span>
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Industry avg score: {r.benchmark.averageScore}
                    </p>
                  </div>
                </Card>

                {/* Regulatory gaps */}
                <Card title="Regulatory Gaps" icon={<BookOpen className="h-5 w-5 text-blue-600" />}>
                  <div className="space-y-4">
                    {r.complianceGaps.length === 0 ? (
                      <p className="text-sm text-zinc-500">No major regulatory gaps identified based on your answers.</p>
                    ) : (
                      r.complianceGaps.map((gap) => (
                        <div key={gap.standard} className="border-b border-zinc-100 last:border-0 pb-3 last:pb-0 print-section">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-zinc-900">{gap.standard}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(gap.status)}`}>
                              {gap.status === "ok" ? "OK" : gap.status === "partial" ? "Partial" : "Gap"}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {gap.missing.map((item, i) => (
                              <li key={i} className="text-xs text-zinc-600 flex items-start gap-1">
                                <span className="text-red-400 shrink-0">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Assessment context */}
                <Card title="Assessment Context" icon={<Building className="h-5 w-5 text-blue-600" />}>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Industry", value: fd.industry },
                      { label: "Firm Size", value: fd.companySize },
                      { label: "AI Maturity", value: fd.aiMaturity },
                      { label: "Deployment", value: fd.deploymentType },
                      { label: "Decision Authority", value: fd.decisionAuthority },
                      { label: "Data Sensitivity", value: fd.dataSensitivity },
                      { label: "Oversight", value: fd.existingOversight },
                      ...(fd.regulator ? [{ label: "Regulator", value: fd.regulator.toUpperCase() }] : []),
                      ...(fd.aiCoverageCheck ? [{ label: "AI Coverage", value: fd.aiCoverageCheck.replace(/-/g, " ") }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-zinc-500">{label}</span>
                        <span className="font-medium text-zinc-900 capitalize">{value.replace(/_/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Governance snapshot */}
                <Card title="Governance Snapshot" icon={<Users className="h-5 w-5 text-blue-600" />}>
                  <div className="space-y-2">
                    {[
                      { label: "Formal AI policy", ok: fd.formalAiPolicy === "yes" },
                      { label: "Documented governance process", ok: fd.documentedProcess },
                      { label: "Named SMF accountability", ok: !!fd.smfAccountability },
                      { label: "DPO in place", ok: fd.hasDpo },
                      { label: "Independent model validation", ok: fd.independentValidation === "internal-independent" || fd.independentValidation === "external" },
                      { label: "Consumer redress mechanism", ok: fd.consumerRedress === "formal" },
                      { label: "Incident response plan", ok: !!fd.incidentResponsePlan },
                      { label: "External audit", ok: !!fd.hasExternalAudit },
                      { label: "Model cards exist", ok: !!fd.hasModelCards },
                      { label: "Red-teaming done", ok: !!fd.hasRedTeaming },
                      { label: "Hallucination monitoring", ok: !!fd.monitoringHallucination },
                    ].map(({ label, ok }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600">{label}</span>
                        {ok
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                          : <AlertTriangle className="h-4 w-4 text-amber-500" />
                        }
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Data snapshot */}
                <Card title="Data Profile" icon={<Database className="h-5 w-5 text-blue-600" />}>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Sensitivity</span>
                      <span className="font-medium capitalize">{fd.dataSensitivity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Third-party data</span>
                      <span className="font-medium">{fd.thirdPartyData ? "Yes" : "No"}</span>
                    </div>
                    {fd.dataTypes && fd.dataTypes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {fd.dataTypes.map((t) => (
                          <span key={t} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* CTA — hidden on print */}
                <div className="no-print">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 text-center">
                    <Award className="h-10 w-10 mx-auto mb-3 opacity-90" />
                    <h3 className="text-lg font-semibold">Ready to discuss renewal?</h3>
                    <p className="text-sm text-blue-100 mt-1 mb-4">
                      Book a free 30-min call to review your score and prepare your evidence pack.
                    </p>
                    <ButtonLink
                      href="mailto:hello@riskpilot.ai"
                      variant="secondary"
                      className="w-full justify-center bg-white text-blue-700 hover:bg-blue-50 border-0"
                    >
                      Get in touch
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Print footer / screen export bar ── */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200 no-print">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <FileText className="h-4 w-4" />
                Save this page as a PDF to share with your broker or underwriter
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition"
                type="button"
              >
                <Download className="h-4 w-4" />
                Download Evidence Pack
              </button>
            </div>

            {/* Print footer */}
            <div className="hidden print:block mt-10 pt-6 border-t border-zinc-200 text-xs text-zinc-400 text-center">
              <p>RiskPilot AI — AI Governance Assessment</p>
              <p className="mt-1">This assessment is indicative only. Final insurance terms are subject to insurer underwriting. © {new Date().getFullYear()} RiskPilot AI.</p>
            </div>

            <p className="mt-6 text-xs text-zinc-400 text-center no-print">
              This assessment helps prepare for insurance discussions. Final terms depend on insurer underwriting.
            </p>
          </Container>
        </section>
      </div>
    </>
  );
}
