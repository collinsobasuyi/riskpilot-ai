import React from "react";
import { RiskDriver } from "../../lib/risk/scoring";

const SEVERITY_BADGE: Record<RiskDriver["severity"], string> = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-green-50 text-green-700 border-green-200",
};

export function RiskDriversList({ drivers }: { drivers: RiskDriver[] }) {
  if (drivers.length === 0) {
    return <p className="text-base text-slate-500">No significant risk drivers identified.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <th className="py-2 pr-4 font-semibold">Risk driver</th>
            <th className="py-2 pr-4 font-semibold">Why it matters</th>
            <th className="py-2 font-semibold">Severity</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.driver} className="border-b border-slate-100 last:border-0 align-top">
              <td className="py-2.5 pr-4 font-medium text-slate-800">{d.driver}</td>
              <td className="py-2.5 pr-4 text-slate-600 leading-relaxed">{d.why}</td>
              <td className="py-2.5">
                <span
                  className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-medium ${SEVERITY_BADGE[d.severity]}`}
                >
                  {d.severity}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
