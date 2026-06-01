import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

type Recs = { critical: string[]; high: string[]; medium: string[] };

function RecItem({ text, level }: { text: string; level: "critical" | "high" | "medium" }) {
  const icon =
    level === "critical" ? (
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
    ) : level === "high" ? (
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
    ) : (
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
    );
  return (
    <li className="flex items-start gap-2 text-base text-slate-700 leading-relaxed">
      {icon}
      {text}
    </li>
  );
}

export function RecommendationsPanel({ recommendations }: { recommendations: Recs }) {
  const { critical, high, medium } = recommendations;
  return (
    <div className="space-y-5">
      {critical.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-600">
            Critical ({critical.length})
          </p>
          <ul className="space-y-2">
            {critical.map((r) => <RecItem key={r} text={r} level="critical" />)}
          </ul>
        </div>
      )}
      {high.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-600">
            High ({high.length})
          </p>
          <ul className="space-y-2">
            {high.map((r) => <RecItem key={r} text={r} level="high" />)}
          </ul>
        </div>
      )}
      {medium.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Medium ({medium.length})
          </p>
          <ul className="space-y-2">
            {medium.map((r) => <RecItem key={r} text={r} level="medium" />)}
          </ul>
        </div>
      )}
    </div>
  );
}
