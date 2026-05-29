"use client";

import { ChevronLeft, ChevronRight, Save } from "lucide-react";

export function StepNav({
  step,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  submitting,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
      <button
        onClick={onBack}
        disabled={step === 0}
        className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>
      {step < totalSteps - 1 ? (
        <button
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-sm bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-sm bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          <Save className="h-4 w-4" />
          {submitting ? "Submitting…" : "Submit Assessment"}
        </button>
      )}
    </div>
  );
}
