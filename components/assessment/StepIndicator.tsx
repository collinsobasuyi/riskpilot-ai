"use client";

import React from "react";

type StepMeta = { title: string; icon: React.ReactNode };

export function StepIndicator({
  steps,
  current,
  onNavigate,
}: {
  steps: StepMeta[];
  current: number;
  onNavigate: (index: number) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          className={`flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-medium transition-colors ${
            i === current
              ? "bg-blue-700 text-white"
              : i < current
              ? "bg-blue-50 text-blue-700"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="hidden sm:inline">{s.icon}</span>
          <span className="hidden sm:inline">{s.title}</span>
          <span className="sm:hidden">{i + 1}</span>
        </button>
      ))}
    </div>
  );
}
