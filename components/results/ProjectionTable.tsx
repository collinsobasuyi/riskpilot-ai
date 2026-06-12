import React from "react";
import { RemediationProjection } from "../../lib/risk/projection";

export function ProjectionTable({ projection }: { projection: RemediationProjection }) {
  const { current, after30, after90, confidence } = projection;
  const cols = [current, after30, after90];
  const rows: { metric: string; values: (string | number)[] }[] = [
    { metric: "AI Risk Score", values: cols.map((c) => `${c.riskScore}/100`) },
    { metric: "Insurance Readiness", values: cols.map((c) => c.readiness) },
    {
      metric: "Evidence Confidence",
      values: [confidence.current, confidence.after30, confidence.after90],
    },
    { metric: "Critical Gaps", values: cols.map((c) => c.criticalGaps) },
    { metric: "Underwriting Tier", values: cols.map((c) => c.tier) },
  ];

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600 leading-relaxed">
        Computed by re-running this assessment with the 30-day critical actions applied, then
        with the full 30/60/90 plan applied.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <th className="py-2 pr-4 font-semibold">Metric</th>
              {cols.map((c) => (
                <th key={c.label} className="py-2 pr-4 text-right font-semibold">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.metric} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 pr-4 font-medium text-slate-800">{row.metric}</td>
                {row.values.map((v, i) => (
                  <td
                    key={cols[i].label}
                    className={`py-2.5 pr-4 text-right ${i === 0 ? "text-slate-700" : "text-slate-600"}`}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Projection is illustrative and subject to evidence quality, broker review, and
        underwriting assessment. It assumes every listed action is completed and evidenced.
      </p>
    </div>
  );
}
