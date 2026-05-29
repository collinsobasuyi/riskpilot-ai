"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { AssessmentFormData, PreliminaryStatus } from "../../../lib/risk/schema";

export function StepReview({
  data,
  preliminary,
}: {
  data: AssessmentFormData;
  preliminary: PreliminaryStatus;
}) {
  const statusColor = preliminary.status === "Low Risk" ? "text-green-700" : preliminary.status === "Medium Risk" ? "text-amber-700" : "text-red-700";
  const statusBg = preliminary.status === "Low Risk" ? "bg-green-50 border-green-200" : preliminary.status === "Medium Risk" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
  const statusBadge = preliminary.status === "Low Risk" ? "bg-green-700" : preliminary.status === "Medium Risk" ? "bg-amber-600" : "bg-red-700";

  const sections = [
    {
      title: "Firm & System",
      rows: [
        { label: "Company", value: data.companyName || "—" },
        { label: "Industry", value: data.industry },
        { label: "Regulated entity", value: data.regulatedEntity ? `Yes (${data.regulator?.toUpperCase() ?? "—"})` : "No" },
        { label: "AI system", value: data.systemName || "—" },
        { label: "Maturity stage", value: data.aiMaturity.replace(/-/g, " ") },
        { label: "Deployment", value: data.deploymentType.replace(/-/g, " ") },
        { label: "Frequency of use", value: data.frequencyOfUse },
        ...(data.aiCoverageCheck ? [{ label: "AI insurance coverage", value: data.aiCoverageCheck.replace(/-/g, " ") }] : []),
      ],
    },
    {
      title: "Risk Profile",
      rows: [
        { label: "Decision authority", value: data.decisionAuthority },
        { label: "Financial impact", value: data.financialImpactTier.replace(/_/g, " ") },
        { label: "Data sensitivity", value: data.dataSensitivity },
        { label: "Third-party data", value: data.thirdPartyData ? "Yes" : "No" },
        ...(data.systematicRisk ? [{ label: "Blast radius", value: data.systematicRisk }] : []),
        ...(data.mttd ? [{ label: "Time to detect failure", value: data.mttd.replace(/_/g, " ") }] : []),
        ...(data.explainabilityType ? [{ label: "Model explainability", value: data.explainabilityType.replace(/-/g, " ") }] : []),
        ...(data.consumerExplainability ? [{ label: "Consumer explanations", value: data.consumerExplainability.replace(/-/g, " ") }] : []),
        ...(data.vulnerableCustomerHandling ? [{ label: "Vulnerable customer handling", value: data.vulnerableCustomerHandling.replace(/-/g, " ") }] : []),
      ],
    },
    {
      title: "Governance & Controls",
      rows: [
        { label: "Human oversight", value: data.existingOversight },
        { label: "Documented process", value: data.documentedProcess ? "Yes" : "No" },
        { label: "SMF accountability", value: data.smfAccountability ? "Yes" : "No" },
        { label: "Formal AI policy", value: data.formalAiPolicy?.replace(/-/g, " ") ?? "Not specified" },
        { label: "Consumer redress", value: data.consumerRedress?.replace(/-/g, " ") ?? "Not specified" },
        { label: "Independent validation", value: data.independentValidation?.replace(/-/g, " ") ?? "Not specified" },
        ...(data.killSwitch ? [{ label: "Kill switch", value: data.killSwitch.replace(/-/g, " ") }] : []),
        { label: "Incident response plan", value: data.incidentResponsePlan ? "Yes" : "No" },
        { label: "Incident history", value: data.incidentHistory },
      ],
    },
    {
      title: "Evidence",
      rows: [
        { label: "Model documentation", value: data.modelDocs?.filter(d => d !== "None").join(", ") || "None" },
        { label: "Bias testing", value: data.biasTesting?.filter(d => d !== "No testing conducted").join(", ") || "None conducted" },
        { label: "Monitoring tools", value: data.monitoring?.filter(d => d !== "None").join(", ") || "None" },
        { label: "External audit", value: data.hasExternalAudit ? `Yes${data.externalAuditType ? ` (${data.externalAuditType})` : ""}` : "No" },
        { label: "Red-teaming", value: data.hasRedTeaming ? "Yes" : "No" },
        { label: "DPO in place", value: data.hasDpo ? "Yes" : "No" },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {/* Preliminary signal — tier only, no raw number */}
      <div className={`rounded-sm border p-5 ${statusBg}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Preliminary Signal</p>
          <span className={`rounded-sm px-2.5 py-1 text-xs font-bold text-white ${statusBadge}`}>
            {preliminary.status}
          </span>
        </div>
        <p className="text-xs text-slate-500">Full AI Governance Score calculated on submission — submit to see the complete breakdown.</p>
        {preliminary.concerns.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Concerns flagged so far</p>
            {preliminary.concerns.map((c) => (
              <div key={c} className="flex items-start gap-2 text-xs text-slate-700">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grouped answer summary */}
      {sections.map((section) => (
        <div key={section.title} className="rounded-sm border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{section.title}</p>
          <div className="divide-y divide-slate-100">
            {section.rows.map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 text-sm">
                <span className="text-slate-500 shrink-0 mr-4">{label}</span>
                <span className="font-medium text-slate-900 text-right capitalize">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-slate-400 text-center">Go back to any step to edit before submitting.</p>
    </div>
  );
}
