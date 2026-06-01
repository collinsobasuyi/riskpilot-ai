import React from "react";
import { ComplianceGap } from "../../lib/risk/scoring";

export function ComplianceGaps({ gaps }: { gaps: ComplianceGap[] }) {
  if (gaps.length === 0) {
    return <p className="text-base text-slate-500">No compliance gaps identified.</p>;
  }
  return (
    <div className="space-y-4">
      {gaps.map((gap) => {
        const badgeColor =
          gap.status === "ok"
            ? "bg-green-100 text-green-700 border-green-200"
            : gap.status === "partial"
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : "bg-red-100 text-red-700 border-red-200";
        return (
          <div key={gap.standard} className="rounded-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-base font-semibold text-slate-900">{gap.standard}</p>
              <span className={`rounded-sm border px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
                {gap.status === "ok" ? "Met" : gap.status === "partial" ? "Partial" : "Gap"}
              </span>
            </div>
            <ul className="space-y-1">
              {gap.missing.map((m) => (
                <li key={m} className="text-sm text-slate-600 leading-relaxed">· {m}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
