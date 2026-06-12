import React from "react";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { EvidenceItem, EvidenceStatus, EVIDENCE_CATEGORIES } from "../../lib/risk/evidence";

const STATUS_BADGE: Record<EvidenceStatus, string> = {
  present: "bg-green-50 text-green-700 border-green-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  missing: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  present: "Present",
  partial: "Partial",
  missing: "Missing",
};

const STATUS_ICON: Record<EvidenceStatus, React.ReactNode> = {
  present: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />,
  partial: <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />,
  missing: <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />,
};

export function EvidenceChecklist({ items }: { items: EvidenceItem[] }) {
  const missingCount = items.filter((i) => i.status === "missing").length;
  const partialCount = items.filter((i) => i.status === "partial").length;
  const groups = EVIDENCE_CATEGORIES.map((category) => ({
    category,
    items: items.filter((i) => i.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <p className="mb-5 text-sm text-slate-600 leading-relaxed">
        {missingCount === 0 && partialCount === 0
          ? "All expected underwriting evidence was identified in this assessment."
          : `Of ${items.length} evidence items underwriters typically request, ${missingCount} ${
              missingCount === 1 ? "is" : "are"
            } missing${partialCount > 0 ? ` and ${partialCount} ${partialCount === 1 ? "is" : "are"} partial` : ""}.`}
      </p>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.category}>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {group.category}
            </p>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5">
                  {STATUS_ICON[item.status]}
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {item.label}
                      <span
                        className={`ml-2 rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_BADGE[item.status]}`}
                      >
                        {STATUS_LABEL[item.status]}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
