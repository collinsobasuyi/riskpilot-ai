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
  present: <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />,
  partial: <MinusCircle className="h-4 w-4 shrink-0 text-amber-500" />,
  missing: <XCircle className="h-4 w-4 shrink-0 text-red-500" />,
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
      <p className="mb-4 text-sm text-slate-600 leading-relaxed">
        {missingCount === 0 && partialCount === 0
          ? "All expected underwriting evidence was identified in this assessment."
          : `Of ${items.length} evidence items underwriters typically request, ${missingCount} ${
              missingCount === 1 ? "is" : "are"
            } missing${partialCount > 0 ? ` and ${partialCount} ${partialCount === 1 ? "is" : "are"} partial` : ""}.`}
      </p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <th className="py-2 pr-4 font-semibold">Evidence item</th>
            <th className="py-2 text-right font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <React.Fragment key={group.category}>
              <tr className="border-b border-slate-100 bg-slate-50">
                <td
                  colSpan={2}
                  className="py-2 pr-4 pl-2 text-xs font-semibold uppercase tracking-widest text-slate-500"
                >
                  {group.category}
                </td>
              </tr>
              {group.items.map((item) => (
                <tr key={item.label} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 pr-4 pl-2">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5">{STATUS_ICON[item.status]}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-right align-top">
                    <span
                      className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status]}`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
