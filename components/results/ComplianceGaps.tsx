import React from "react";
import { ComplianceGap } from "../../lib/risk/scoring";

const STATUS_BADGE: Record<ComplianceGap["status"], string> = {
  ok: "bg-green-50 text-green-700 border-green-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  gap: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<ComplianceGap["status"], string> = {
  ok: "Met",
  partial: "Partial",
  gap: "Gap",
};

export function ComplianceGaps({ gaps }: { gaps: ComplianceGap[] }) {
  if (gaps.length === 0) {
    return <p className="text-base text-slate-500">No compliance gaps identified.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <th className="py-2 pr-4 font-semibold">Framework</th>
            <th className="py-2 pr-4 font-semibold">Identified gap</th>
            <th className="py-2 pr-4 font-semibold">Impact</th>
            <th className="py-2 pr-4 font-semibold">Required evidence</th>
            <th className="py-2 pr-4 font-semibold">Priority</th>
            <th className="py-2 font-semibold">Suggested owner</th>
          </tr>
        </thead>
        <tbody>
          {gaps.map((gap) => (
            <tr key={gap.standard} className="border-b border-slate-100 last:border-0 align-top">
              <td className="py-3 pr-4 font-semibold text-slate-900 whitespace-nowrap">
                {gap.standard}
              </td>
              <td className="py-3 pr-4 text-slate-600 leading-relaxed">
                <ul className="space-y-1">
                  {gap.missing.map((m) => (
                    <li key={m}>· {m}</li>
                  ))}
                </ul>
              </td>
              <td className="py-3 pr-4 text-slate-600 leading-relaxed">
                <p>{gap.impact}</p>
                <p className="mt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Underwriting:
                  </span>{" "}
                  {gap.underwritingImpact}
                </p>
              </td>
              <td className="py-3 pr-4 text-slate-600 leading-relaxed">
                <ul className="space-y-1">
                  {gap.requiredEvidence.map((e) => (
                    <li key={e}>· {e}</li>
                  ))}
                </ul>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[gap.status]}`}
                >
                  {STATUS_LABEL[gap.status]}
                </span>
              </td>
              <td className="py-3 text-slate-600 leading-relaxed">{gap.suggestedOwner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
