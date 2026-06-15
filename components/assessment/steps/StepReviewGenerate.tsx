"use client";

import React from "react";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { AssessmentFormData } from "../../../lib/risk/schema";
import { buildEvidenceChecklist, EvidenceStatus } from "../../../lib/risk/evidence";
import { buildUnderwriterQuestions } from "../../../lib/risk/underwriting";
import { computeResults } from "../../../lib/risk/scoring";
import { buildInsuranceBrief } from "../../../lib/risk/insurance";

const STATUS_ICON: Record<EvidenceStatus, React.ReactNode> = {
  present: <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />,
  partial: <MinusCircle className="h-4 w-4 shrink-0 text-amber-500" />,
  missing: <XCircle className="h-4 w-4 shrink-0 text-red-500" />,
};

const STATUS_BADGE: Record<EvidenceStatus, string> = {
  present: "bg-green-50 text-green-700 border-green-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  missing: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  present: "Present",
  partial: "Partial",
  missing: "Missing",
};

const STATUS_ORDER: Record<EvidenceStatus, number> = {
  missing: 0,
  partial: 1,
  present: 2,
};

export function StepReviewGenerate({ data }: { data: AssessmentFormData }) {
  const results = computeResults(data);
  const brief = buildInsuranceBrief(data, results);
  const checklist = buildEvidenceChecklist(data).sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );
  const questions = buildUnderwriterQuestions(data);

  const missingCount = checklist.filter((i) => i.status === "missing").length;
  const presentCount = checklist.filter((i) => i.status === "present").length;

  const scoreColor =
    results.riskScore >= 80
      ? "text-green-700"
      : results.riskScore >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "AI Risk Score", value: `${results.riskScore}/100`, color: scoreColor },
          { label: "Insurance Readiness", value: brief.readiness.status, color: "text-slate-800" },
          { label: "Evidence present", value: `${presentCount} / ${checklist.length}`, color: "text-slate-800" },
          { label: "Underwriting tier", value: brief.verdict.underwritingTier, color: "text-slate-800" },
        ].map((card) => (
          <div key={card.label} className="rounded-sm border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{card.label}</p>
            <p className={`mt-1 text-base font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Answer summary */}
      <div className="rounded-sm border border-slate-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">Assessment summary</h4>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            { label: "Entity", value: data.companyName || "—" },
            { label: "AI system", value: data.systemName || "—" },
            { label: "Sector", value: data.industry },
            { label: "Deployment", value: data.deploymentType },
            { label: "Regulated", value: data.regulatedEntity ? `Yes — ${data.regulator ?? ""}` : "No" },
            { label: "AI policy", value: data.formalAiPolicy ?? "Not specified" },
            { label: "Automation", value: data.decisionAuthority },
            { label: "Kill switch", value: data.killSwitch ?? "Not specified" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">{row.label}</span>
              <span className="font-semibold text-slate-800 text-right ml-4 max-w-[60%] truncate">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence checklist */}
      <div className="rounded-sm border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Evidence status</h4>
          {missingCount > 0 && (
            <span className="rounded-sm border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
              {missingCount} missing
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-100">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-start gap-2 min-w-0">
                <span className="mt-0.5">{STATUS_ICON[item.status]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
                </div>
              </div>
              <span className={`shrink-0 inline-flex rounded-sm border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status]}`}>
                {STATUS_LABEL[item.status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Underwriter questions */}
      <div className="rounded-sm border border-slate-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">
          Likely underwriter questions
        </h4>
        <p className="mb-3 text-xs text-slate-500">
          Based on your answers, these are the questions your underwriter is most likely to ask. Prepare evidence for each before your broker meeting.
        </p>
        <ol className="space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                {i + 1}
              </span>
              {q}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
