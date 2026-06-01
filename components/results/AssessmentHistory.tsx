import Link from "next/link";
import type { StoredSubmission } from "../../lib/risk/schema";
import { computeResults } from "../../lib/risk/scoring";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AssessmentHistory({
  history,
  currentId,
}: {
  history: StoredSubmission[];
  currentId: string;
}) {
  const previous = history.filter((e) => e.id !== currentId).slice(0, 3);
  if (previous.length === 0) return null;

  return (
    <div className="space-y-2">
      {previous.map((entry) => {
        const results = computeResults(entry.data);
        const scoreColor =
          results.riskLevel === "High"
            ? "text-red-600"
            : results.riskLevel === "Medium"
            ? "text-amber-600"
            : "text-green-600";
        const bgColor =
          results.riskLevel === "High"
            ? "bg-red-50"
            : results.riskLevel === "Medium"
            ? "bg-amber-50"
            : "bg-green-50";

        return (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-sm border border-slate-200 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">
                {entry.data.systemName || entry.data.companyName}
              </p>
              <p className="text-xs text-slate-400">{formatDate(entry.submittedAt)}</p>
            </div>
            <div
              className={`inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-semibold ${bgColor} ${scoreColor}`}
            >
              {results.riskScore}/100 · {results.riskLevel} Risk
            </div>
          </div>
        );
      })}
      <div className="pt-1">
        <Link
          href="/assessment"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Start new assessment →
        </Link>
      </div>
    </div>
  );
}
