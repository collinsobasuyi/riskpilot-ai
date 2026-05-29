import React from "react";
import { AlertTriangle } from "lucide-react";

export function RiskDriversList({ drivers }: { drivers: string[] }) {
  if (drivers.length === 0) {
    return <p className="text-sm text-slate-500">No significant risk drivers identified.</p>;
  }
  return (
    <ul className="space-y-2">
      {drivers.map((d) => (
        <li key={d} className="flex items-start gap-2 text-sm text-slate-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          {d}
        </li>
      ))}
    </ul>
  );
}
