import React from "react";

type Recs = { critical: string[]; high: string[]; medium: string[] };

const LEVELS = [
  {
    key: "critical" as const,
    label: "Critical",
    timeline: "30 days",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  {
    key: "high" as const,
    label: "High",
    timeline: "60 days",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    key: "medium" as const,
    label: "Medium",
    timeline: "90 days",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
];

export function RecommendationsPanel({ recommendations }: { recommendations: Recs }) {
  const rows = LEVELS.flatMap((level) =>
    recommendations[level.key].map((text) => ({ ...level, text }))
  );
  if (rows.length === 0) {
    return <p className="text-base text-slate-500">No recommendations at this time.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <th className="py-2 pr-4 font-semibold">Priority</th>
            <th className="py-2 pr-4 font-semibold">Recommendation</th>
            <th className="py-2 font-semibold whitespace-nowrap">Timeline</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.text} className="border-b border-slate-100 last:border-0 align-top">
              <td className="py-2.5 pr-4">
                <span
                  className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-medium ${row.badge}`}
                >
                  {row.label}
                </span>
              </td>
              <td className="py-2.5 pr-4 text-slate-700 leading-relaxed">{row.text}</td>
              <td className="py-2.5 text-slate-600 whitespace-nowrap">{row.timeline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
