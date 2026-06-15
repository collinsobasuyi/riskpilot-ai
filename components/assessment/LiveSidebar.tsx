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
      <aside className="w-72 shrink-0 sticky top-8 rounded-sm border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Your report so far
        </p>
        <p className="text-sm text-slate-400">
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
    score >= 80 ? "text-green-400" : score >= 60 ? "text-amber-400" : "text-red-400";

  const readinessTone =
    brief.readiness.status === "Review-ready"
      ? "bg-emerald-900 text-emerald-300"
      : brief.readiness.status === "Conditionally ready"
        ? "bg-amber-900 text-amber-300"
        : "bg-red-900 text-red-300";

  const missingColor =
    missingCount === 0
      ? "text-green-400"
      : missingCount <= 3
        ? "text-amber-400"
        : "text-red-400";

  return (
    <aside className="w-72 shrink-0 sticky top-8 rounded-sm bg-slate-900 p-4 text-slate-200">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
        Your report so far
      </p>
      <div className={`text-4xl font-extrabold leading-none ${scoreColor}`}>
        {score}
        <span className="text-base font-normal text-slate-600">/100</span>
      </div>
      <span
        className={`mt-2 mb-4 inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold ${readinessTone}`}
      >
        {brief.readiness.status}
      </span>

      <div className="border-t border-slate-800 my-3" />

      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Evidence confidence</span>
          <span className="font-semibold text-slate-200">
            {presentCount} / {checklist.length}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Missing evidence</span>
          <span className={`font-semibold ${missingColor}`}>
            {missingCount} items
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Underwriting tier</span>
          <span className="font-semibold text-slate-200">
            {brief.verdict.underwritingTier}
          </span>
        </div>
      </div>

      {topBlocker && (
        <div className="mt-4 rounded-sm bg-slate-800 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Top blocker
          </p>
          <p className="text-xs text-red-400 leading-relaxed">{topBlocker.why}</p>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-600 leading-relaxed">
        Updates as you answer. Powered by the same engine as your final report.
      </p>
    </aside>
  );
}
