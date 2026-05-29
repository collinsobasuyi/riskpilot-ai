"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Shield } from "lucide-react";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import ButtonLink from "../../components/ui/ButtonLink";
import {
  AssessmentFormData,
  SUBMISSION_KEY,
  safeJsonParse,
  safeLocalStorageGet,
} from "../../lib/risk/schema";
import { computeResults } from "../../lib/risk/scoring";
import { ReportHeader } from "../../components/results/ReportHeader";
import { CategoryScores } from "../../components/results/CategoryScores";
import { RiskDriversList } from "../../components/results/RiskDriversList";
import { RecommendationsPanel } from "../../components/results/RecommendationsPanel";
import { ComplianceGaps } from "../../components/results/ComplianceGaps";
import { BenchmarkPanel } from "../../components/results/BenchmarkPanel";
import { CoveragePanel } from "../../components/results/CoveragePanel";

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgoLabel(iso: string) {
  const diffDays = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function formatDate() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ── Types ─────────────────────────────────────────────────────────────────────

type StoredSubmission = {
  id: string;
  submittedAt: string;
  data: AssessmentFormData;
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [submission, setSubmission] = useState<StoredSubmission | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = safeLocalStorageGet(SUBMISSION_KEY);
    const parsed = safeJsonParse<StoredSubmission>(raw);
    setSubmission(parsed);
  }, []);

  const results = useMemo(() => {
    if (!submission) return null;
    return computeResults(submission.data);
  }, [submission]);

  const assessmentAge = useMemo(
    () => (submission ? daysAgoLabel(submission.submittedAt) : ""),
    [submission]
  );

  const handlePrint = () => window.print();

  if (!submission || !results) {
    return (
      <section className="py-16">
        <Container>
          <Card title="No assessment found">
            <p className="text-sm text-slate-600">
              We couldn&apos;t find a submitted assessment. Complete a new assessment to generate
              your AI Governance Score.
            </p>
            <div className="mt-4">
              <Link href="/assessment" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Start assessment →
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  const fd = submission.data;

  return (
    <>
      <style>{`@media print { body { background: white !important; } nav { display: none !important; } }`}</style>

      <section className="py-10 bg-slate-50 print:bg-white" ref={printRef}>
        <Container>
          <div className="mx-auto max-w-3xl space-y-6">

            {/* Top nav */}
            <div className="flex items-center justify-between print:hidden">
              <ButtonLink href="/assessment" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                New assessment
              </ButtonLink>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print / Download
              </button>
            </div>

            {/* Report header */}
            <ReportHeader
              systemName={fd.systemName}
              companyName={fd.companyName}
              assessmentDate={formatDate()}
              results={results}
            />

            {/* Summary */}
            <Card title="Executive Summary">
              <p className="text-sm text-slate-700 leading-relaxed">{results.summary}</p>
              <p className="mt-2 text-xs text-slate-400">Assessed {assessmentAge}</p>
            </Card>

            {/* Score breakdown */}
            <Card title="Score Breakdown">
              <CategoryScores scores={results.categoryScores} />
            </Card>

            {/* Coverage */}
            <Card title="Coverage Implications">
              <CoveragePanel
                eligibility={results.coverageEligibility}
                tier={results.coverageTier}
                exclusions={results.exclusions}
              />
            </Card>

            {/* Risk drivers */}
            <Card title="Risk Drivers">
              <RiskDriversList drivers={results.riskDrivers} />
            </Card>

            {/* Recommendations */}
            <Card title="Recommendations">
              <RecommendationsPanel recommendations={results.recommendations} />
            </Card>

            {/* Compliance gaps */}
            <Card title="Compliance Gaps">
              <ComplianceGaps gaps={results.complianceGaps} />
            </Card>

            {/* Benchmark */}
            <Card title="Industry Benchmark">
              <BenchmarkPanel benchmark={results.benchmark} industry={fd.industry} />
            </Card>

            {/* Footer CTA */}
            <div className="rounded-sm border border-slate-200 bg-white p-6 text-center print:hidden">
              <Shield className="mx-auto h-8 w-8 text-blue-700 mb-3" />
              <p className="text-sm font-semibold text-slate-900 mb-1">
                Want to discuss these results with an expert?
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Book a call to review your governance gaps and renewal strategy.
              </p>
              <ButtonLink href="/about" variant="primary">
                Book a consultation
              </ButtonLink>
            </div>

          </div>
        </Container>
      </section>
    </>
  );
}
