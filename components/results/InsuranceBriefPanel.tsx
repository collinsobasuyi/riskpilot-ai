import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Minus } from "lucide-react";
import { InsuranceBrief } from "../../lib/risk/insurance";

const STATUS_BADGE: Record<InsuranceBrief["readiness"]["statusColor"], string> = {
  green: "border-green-200 bg-green-50 text-green-800",
  amber: "border-amber-300 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
};

const STATUS_ICON: Record<InsuranceBrief["readiness"]["statusColor"], React.ReactNode> = {
  green: <CheckCircle2 className="h-4 w-4 shrink-0" />,
  amber: <AlertTriangle className="h-4 w-4 shrink-0" />,
  red: <XCircle className="h-4 w-4 shrink-0" />,
};

function NotesList({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        {heading}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
            <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const STATUS_PANEL: Record<InsuranceBrief["readiness"]["statusColor"], string> = {
  green: "border-green-200 bg-green-50/60",
  amber: "border-amber-300 bg-amber-50/60",
  red: "border-red-200 bg-red-50/60",
};

export function InsuranceBriefPanel({ brief }: { brief: InsuranceBrief }) {
  const { readiness, verdict, brokerSummary, underwriterNotes } = brief;

  return (
    <div className="space-y-5">
      {/* Readiness verdict */}
      <div className={`rounded-sm border p-4 sm:p-5 ${STATUS_PANEL[readiness.statusColor]}`}>
        <span
          className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-sm font-semibold ${STATUS_BADGE[readiness.statusColor]}`}
        >
          {STATUS_ICON[readiness.statusColor]}
          {readiness.status}
        </span>
        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Underwriting tier
            </dt>
            <dd className="mt-0.5 text-base font-semibold text-slate-900">
              {verdict.underwritingTier}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Likely outcome
            </dt>
            <dd className="mt-0.5 text-base text-slate-800">{verdict.likelyOutcome}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Reason
            </dt>
            <dd className="mt-0.5 text-base text-slate-800">{verdict.reason}</dd>
          </div>
        </dl>
        <p className="mt-4 text-base text-slate-700 leading-relaxed">{readiness.headline}</p>
        {readiness.blockers.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              What blocks readiness
            </p>
            <ul className="space-y-1.5">
              {readiness.blockers.map((blocker) => (
                <li key={blocker} className="flex items-start gap-2 text-sm text-slate-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  {blocker}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Broker summary */}
      <div className="border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Broker summary
        </p>
        <div className="space-y-2">
          {brokerSummary.map((paragraph) => (
            <p key={paragraph} className="text-sm text-slate-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Underwriter notes */}
      <div className="space-y-4 border-t border-slate-100 pt-4">
        <NotesList heading="Risk profile" items={underwriterNotes.riskProfile} />
        <NotesList heading="Controls in place" items={underwriterNotes.controlsInPlace} />
        <NotesList heading="Outstanding concerns" items={underwriterNotes.outstandingConcerns} />
      </div>
    </div>
  );
}
