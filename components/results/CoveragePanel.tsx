import React from "react";
import { AlertTriangle } from "lucide-react";

export function CoveragePanel({
  eligibility,
  tier,
  exclusions,
}: {
  eligibility: string;
  tier: string;
  exclusions: string[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-base leading-relaxed">
        <span className="font-semibold">Eligibility:</span> {eligibility}
      </p>
      <p className="text-base leading-relaxed">
        <span className="font-semibold">Underwriting tier:</span> {tier}
      </p>
      {exclusions.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Potential exclusions
          </p>
          <ul className="space-y-1.5">
            {exclusions.map((ex) => (
              <li key={ex} className="flex items-start gap-2 text-sm text-slate-700">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                {ex}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
