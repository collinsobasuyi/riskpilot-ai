import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { EvidenceItem } from "../../lib/risk/evidence";

export function EvidenceChecklist({ items }: { items: EvidenceItem[] }) {
  const missingCount = items.filter((i) => !i.evidenced).length;

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600 leading-relaxed">
        {missingCount === 0
          ? "All expected underwriting evidence was identified in this assessment."
          : `${missingCount} of ${items.length} evidence items underwriters typically request ${
              missingCount === 1 ? "was" : "were"
            } not evidenced in this assessment.`}
      </p>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5">
            {item.evidenced ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-800">
                {item.label}
                {!item.evidenced && (
                  <span className="ml-2 rounded-sm border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-700">
                    Missing
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
