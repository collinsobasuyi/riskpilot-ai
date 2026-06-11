import React from "react";
import { Shield } from "lucide-react";
import { ComputedResults } from "../../lib/risk/scoring";

export function ReportHeader({
  systemName,
  companyName,
  assessmentDate,
  results,
  scoreDelta,
}: {
  systemName: string;
  companyName: string;
  assessmentDate: string;
  results: ComputedResults;
  scoreDelta?: number;
}) {
  const scoreColor =
    results.riskScore >= 70
      ? "text-red-400"
      : results.riskScore >= 45
      ? "text-amber-400"
      : "text-green-400";

  const tierColor =
    results.riskLevel === "High"
      ? "bg-red-500/20 text-red-300"
      : results.riskLevel === "Medium"
      ? "bg-amber-500/20 text-amber-300"
      : "bg-green-500/20 text-green-300";

  return (
    <div className="bg-slate-900 rounded-sm px-6 py-5 print:bg-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">
            Verdictal AI Governance Report
          </span>
        </div>
        <span className="text-xs text-slate-400">{assessmentDate}</span>
      </div>
      <div className="mt-3">
        <p className="text-xs text-slate-400">{companyName}</p>
        <p className="text-sm font-semibold text-white">{systemName}</p>
      </div>
      <div className="mt-4 flex items-end gap-3 flex-wrap">
        <span className={`text-5xl font-bold ${scoreColor}`}>{results.riskScore}</span>
        <div className="mb-1 flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 text-sm">/100</span>
          <div className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${tierColor}`}>
            {results.riskLevel} Risk
          </div>
          {scoreDelta !== undefined && (
            <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold ${
              scoreDelta > 0
                ? "bg-green-500/20 text-green-300"
                : scoreDelta < 0
                ? "bg-red-500/20 text-red-300"
                : "bg-slate-500/20 text-slate-400"
            }`}>
              {scoreDelta > 0 ? `↑ +${scoreDelta}` : scoreDelta < 0 ? `↓ ${scoreDelta}` : "= no change"} since last
            </span>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Valid until {results.validUntil} · {results.coverageTier} underwriting
      </p>
    </div>
  );
}
