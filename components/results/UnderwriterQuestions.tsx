import React from "react";

export function UnderwriterQuestions({ questions }: { questions: string[] }) {
  return (
    <div>
      <p className="mb-4 text-sm text-slate-600 leading-relaxed">
        These are potential questions a broker or underwriter may ask before accepting
        AI-related exposure, based on this assessment.
      </p>
      <ol className="space-y-2.5">
        {questions.map((q, i) => (
          <li key={q} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-xs font-semibold text-slate-600">
              {i + 1}
            </span>
            {q}
          </li>
        ))}
      </ol>
    </div>
  );
}
