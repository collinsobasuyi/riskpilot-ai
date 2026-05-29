import React from "react";
import { CategoryScore } from "../../lib/risk/scoring";
import { clamp } from "../../lib/utils";

export function CategoryScores({ scores }: { scores: CategoryScore[] }) {
  return (
    <div className="space-y-3">
      {scores.map((cat) => {
        const color =
          cat.status === "low"
            ? "bg-green-500"
            : cat.status === "medium"
            ? "bg-amber-500"
            : "bg-red-500";
        const clamped = clamp(cat.score, 0, 100);
        return (
          <div key={cat.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">{cat.name}</span>
              <span className="font-semibold text-slate-800">{clamped}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div
                className={`h-1.5 rounded-full ${color}`}
                style={{ width: `${clamped}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
