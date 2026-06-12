import React from "react";
import { Shield } from "lucide-react";
import { ComputedResults } from "../../lib/risk/scoring";
import { InsuranceBrief } from "../../lib/risk/insurance";

const STATUS_TEXT: Record<InsuranceBrief["readiness"]["statusColor"], string> = {
  green: "text-green-400",
  amber: "text-amber-400",
  red: "text-red-400",
};

export function VerdictPanel({
  results,
  brief,
}: {
  results: ComputedResults;
  brief: InsuranceBrief;
}) {
  const rows = [
    { label: "Current status", value: brief.readiness.status, accent: true },
    { label: "Risk level", value: `${results.riskLevel} (${results.riskScore}/100)` },
    { label: "Insurance readiness", value: results.coverageEligibility },
    { label: "Underwriting tier", value: results.coverageTier },
  ];

  return (
    <div className="rounded-sm bg-slate-900 px-6 py-6 print:bg-slate-800">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-semibold uppercase tracking-widest text-white">
          Verdictal Verdict
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {row.label}
            </dt>
            <dd
              className={`mt-1 text-base font-semibold ${
                row.accent ? STATUS_TEXT[brief.readiness.statusColor] : "text-white"
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-700 pt-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Recommended action
          </p>
          <p className="mt-1 text-sm text-slate-200 leading-relaxed">
            {brief.verdict.recommendedAction}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Next recommended step
          </p>
          <p className="mt-1 text-sm text-slate-200 leading-relaxed">{brief.verdict.nextStep}</p>
        </div>
      </div>
    </div>
  );
}
