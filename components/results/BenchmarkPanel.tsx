import React from "react";

type Benchmark = { percentile: number; averageScore: number; comparison: string };

export function BenchmarkPanel({ benchmark, industry }: { benchmark: Benchmark; industry: string }) {
  return (
    <div className="space-y-2 text-sm text-slate-700">
      <p>
        <span className="font-semibold">Industry average ({industry}):</span>{" "}
        {benchmark.averageScore}/100
      </p>
      <p>
        <span className="font-semibold">Your position:</span> {benchmark.comparison}
      </p>
      <p>
        <span className="font-semibold">Percentile:</span> top {benchmark.percentile}%
      </p>
    </div>
  );
}
