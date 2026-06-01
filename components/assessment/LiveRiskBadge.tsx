"use client";

import { PreliminaryStatus } from "../../lib/risk/schema";

export function LiveRiskBadge({
  preliminary,
  ready,
}: {
  preliminary: PreliminaryStatus;
  ready: boolean;
}) {
  if (!ready) {
    return (
      <div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400">
        <span className="font-semibold text-slate-500">Live preview:</span> Fill in the form to see your risk score.
      </div>
    );
  }

  return (
    <div className={`rounded-sm border px-3 py-2 text-xs ${preliminary.bgColor} ${preliminary.borderColor}`}>
      <span className={`font-semibold ${preliminary.statusColor}`}>
        Live preview: {preliminary.status}
      </span>
      {preliminary.concerns.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-slate-600">
          {preliminary.concerns.map((c) => (
            <li key={c}>· {c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
