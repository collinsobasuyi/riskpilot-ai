import React from "react";

type Benchmark = { percentile: number; averageScore: number; comparison: string };

export function BenchmarkPanel({
  benchmark,
  industry,
  riskScore,
}: {
  benchmark: Benchmark;
  industry: string;
  riskScore: number;
}) {
  const interpretation =
    riskScore > benchmark.averageScore
      ? `The assessed AI system presents a ${
          riskScore > benchmark.averageScore + 10 ? "materially " : ""
        }higher risk profile than comparable ${industry} systems in the sample benchmark.`
      : riskScore < benchmark.averageScore
        ? `The assessed AI system presents a lower risk profile than comparable ${industry} systems in the sample benchmark.`
        : `The assessed AI system is in line with comparable ${industry} systems in the sample benchmark.`;

  return (
    <div className="space-y-2 text-base text-slate-700 leading-relaxed">
      <p>
        <span className="font-semibold">Industry average ({industry}):</span>{" "}
        {benchmark.averageScore}/100
      </p>
      <p>
        <span className="font-semibold">Client risk score:</span> {riskScore}/100
      </p>
      <p>
        <span className="font-semibold">Position:</span> {benchmark.comparison}
      </p>
      <p>
        <span className="font-semibold">Percentile:</span> top {benchmark.percentile}%
      </p>
      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Interpretation
        </p>
        <p className="mt-1 text-sm text-slate-600 leading-relaxed">{interpretation}</p>
      </div>
    </div>
  );
}
