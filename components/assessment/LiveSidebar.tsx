"use client";

import React from "react";
import { AssessmentFormData } from "../../lib/risk/schema";
import { computeResults } from "../../lib/risk/scoring";
import { buildEvidenceChecklist } from "../../lib/risk/evidence";
import { buildInsuranceBrief } from "../../lib/risk/insurance";

export function LiveSidebar({
  data,
  ready,
}: {
  data: AssessmentFormData;
  ready: boolean;
}) {
  if (!ready) {
    return (
      <aside className="w-72 shrink-0 rounded-sm border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Preliminary preview
        </p>
        <p className="text-sm text-slate-500">
          Fill in the form to see your live score.
        </p>
      </aside>
    );
  }

  const results = computeResults(data);
  const checklist = buildEvidenceChecklist(data);
  const brief = buildInsuranceBrief(data, results);

  const score = results.riskScore;
  const presentCount = checklist.filter((i) => i.status === "present").length;
  const missingCount = checklist.filter((i) => i.status === "missing").length;
  const topBlocker = results.riskDrivers.find((d) => d.severity === "High");

  const scoreColor =
    score >= 80 ? "text-green-300" : score >= 60 ? "text-amber-300" : "text-red-300";

  const earlyStage = presentCount === 0;
  const displayReadiness = earlyStage ? "Incomplete" : brief.readiness.status;
  const readinessTone = earlyStage
    ? "bg-slate-600 text-slate-100"
    : brief.readiness.status === "Review-ready"
      ? "bg-green-400 text-slate-950"
      : brief.readiness.status === "Conditionally ready"
        ? "bg-amber-400 text-slate-950"
        : "bg-red-500 text-white";

  const missingColor =
    missingCount === 0
      ? "text-green-300"
      : missingCount <= 3
        ? "text-amber-300"
        : "text-red-300";

  return (
    <aside className="w-72 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-sm bg-slate-900 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
        Preliminary preview
      </p>
      <p className="text-xs text-slate-400 mb-3">Based on answers so far</p>

      <div className={`text-4xl font-extrabold leading-none ${scoreColor}`}>
        {score}
        <span className="text-base font-normal text-slate-500">/100</span>
      </div>

      <div className="mt-2 mb-4">
        <span className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold ${readinessTone}`}>
          {displayReadiness}
        </span>
      </div>

      <div className="border-t border-slate-700 my-3" />

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-300">Evidence confidence</span>
          <span className="text-xs font-semibold text-white">
            {presentCount} / {checklist.length}
          </span>
        </div>
        <div className="border-t border-slate-800" />
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-300">Missing evidence</span>
          <span className={`text-xs font-semibold ${missingColor}`}>
            {missingCount} items
          </span>
        </div>
        <div className="border-t border-slate-800" />
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-300">Underwriting tier</span>
          <span className="text-xs font-semibold text-white">
            {brief.verdict.underwritingTier}
          </span>
        </div>
      </div>

      {topBlocker && (
        <div className="mt-4 rounded-sm border border-red-800 bg-red-950/40 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-red-300 mb-1.5">
            Current likely blocker
          </p>
          <p className="text-xs text-slate-100 leading-relaxed">{topBlocker.why}</p>
          <p className="mt-1.5 text-xs text-slate-400">
            May update after Governance and Evidence steps.
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400 leading-relaxed">
        Updates as you answer. Powered by the same engine as your final report.
      </p>
    </aside>
  );
}
