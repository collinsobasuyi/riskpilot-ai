import React from "react";
import { UnderwritingCard, CardTone } from "../../lib/risk/underwriting";

const TONE_BADGE: Record<CardTone, string> = {
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-green-50 text-green-700 border-green-200",
};

const TONE_VALUE: Record<CardTone, string> = {
  red: "text-red-700",
  amber: "text-amber-700",
  blue: "text-slate-900",
  green: "text-green-700",
};

export function UnderwritingActionSummary({ cards }: { cards: UnderwritingCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-sm border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {card.label}
          </p>
          <p className={`mt-2 text-lg font-bold ${TONE_VALUE[card.tone]}`}>{card.value}</p>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{card.supportingText}</p>
          <span
            className={`mt-3 inline-flex rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TONE_BADGE[card.tone]}`}
          >
            {card.badge}
          </span>
        </div>
      ))}
    </div>
  );
}
