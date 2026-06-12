"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Printer, Shield } from "lucide-react";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import ButtonLink from "../../components/ui/ButtonLink";
import {
  StoredSubmission,
  SUBMISSION_KEY,
  getHistory,
  safeJsonParse,
  safeLocalStorageGet,
} from "../../lib/risk/schema";
import { computeResults } from "../../lib/risk/scoring";
import { ReportHeader } from "../../components/results/ReportHeader";
import { CategoryScores } from "../../components/results/CategoryScores";
import { RiskDriversList } from "../../components/results/RiskDriversList";
import { ComplianceGaps } from "../../components/results/ComplianceGaps";
import { BenchmarkPanel } from "../../components/results/BenchmarkPanel";
import { DEMO_SUBMISSION } from "../../lib/risk/demo-data";
import { encodeShareData, decodeShareData } from "../../lib/risk/share";
import { ActionPlanPanel } from "../../components/results/ActionPlanPanel";
import { AssessmentHistory } from "../../components/results/AssessmentHistory";
import { buildInsuranceBrief, industryDisplayLabel } from "../../lib/risk/insurance";
import {
  ReadinessVerdictPanel,
  BrokerSummaryPanel,
} from "../../components/results/InsuranceBriefPanel";
import { buildEvidenceChecklist } from "../../lib/risk/evidence";
import { EvidenceChecklist } from "../../components/results/EvidenceChecklist";
import { VerdictPanel } from "../../components/results/VerdictPanel";
import {
  buildUnderwritingSummary,
  buildUnderwriterQuestions,
} from "../../lib/risk/underwriting";
import { UnderwritingActionSummary } from "../../components/results/UnderwritingActionSummary";
import { UnderwriterQuestions } from "../../components/results/UnderwriterQuestions";
import { projectRemediation } from "../../lib/risk/projection";
import { ProjectionTable } from "../../components/results/ProjectionTable";
import { VerificationStamp } from "../../components/results/VerificationStamp";

// ── Export modes ──────────────────────────────────────────────────────────────

type ExportMode = "full" | "broker" | "underwriter" | "compliance" | "board";

const EXPORT_SECTIONS: Record<Exclude<ExportMode, "full">, readonly string[]> = {
  broker: ["actionSummary", "execSummary", "readiness", "brokerSummary", "questions", "verdict", "verification"],
  underwriter: ["actionSummary", "execSummary", "readiness", "scoreBreakdown", "riskDrivers", "compliance", "evidence", "questions", "actionPlan", "verdict", "verification"],
  compliance: ["execSummary", "compliance", "evidence", "actionPlan", "verification"],
  board: ["actionSummary", "execSummary", "readiness", "projection", "verdict", "verification"],
};

const EXPORT_OPTIONS: { value: ExportMode; label: string; description: string }[] = [
  { value: "full", label: "Full Report", description: "The complete evidence report" },
  { value: "broker", label: "Broker Summary", description: "Insurance readiness, blockers, and next actions" },
  { value: "underwriter", label: "Underwriter Pack", description: "Evidence-oriented report with risk drivers, gaps, and verification" },
  { value: "compliance", label: "Compliance Pack", description: "Framework mapping, evidence checklist, remediation plan" },
  { value: "board", label: "Board Summary", description: "Executive overview of risk status and required actions" },
];

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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [submission, setSubmission] = useState<StoredSubmission | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [history, setHistory] = useState<StoredSubmission[]>([]);
  const [copied, setCopied] = useState(false);
  const [exportMode, setExportMode] = useState<ExportMode>("full");

  // Audience exports temporarily hide non-relevant sections for printing;
  // restore the full report once the print dialog closes.
  useEffect(() => {
    const reset = () => setExportMode("full");
    window.addEventListener("afterprint", reset);
    return () => window.removeEventListener("afterprint", reset);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("s");
    const demo = params.get("demo");

    setHistory(getHistory());

    if (shared) {
      const data = decodeShareData(shared);
      if (data) {
        setSubmission({ id: "shared", submittedAt: new Date().toISOString(), data });
      }
      return;
    }

    if (demo === "1") {
      setSubmission(DEMO_SUBMISSION);
      setIsDemo(true);
      return;
    }

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

  const insuranceBrief = useMemo(() => {
    if (!submission || !results) return null;
    return buildInsuranceBrief(submission.data, results);
  }, [submission, results]);

  const evidenceChecklist = useMemo(
    () => (submission ? buildEvidenceChecklist(submission.data) : []),
    [submission]
  );

  const underwritingCards = useMemo(
    () => (submission && results ? buildUnderwritingSummary(submission.data, results) : []),
    [submission, results]
  );

  const underwriterQuestions = useMemo(
    () => (submission ? buildUnderwriterQuestions(submission.data) : []),
    [submission]
  );

  const projection = useMemo(
    () => (submission ? projectRemediation(submission.data) : null),
    [submission]
  );

  const scoreDelta = useMemo(() => {
    if (!submission || !results || isDemo || submission.id === "shared") return undefined;
    const prev = history.find(
      (e) => e.id !== submission.id && e.data.systemName === submission.data.systemName
    );
    if (!prev) return undefined;
    const prevResults = computeResults(prev.data);
    return results.riskScore - prevResults.riskScore;
  }, [submission, results, history, isDemo]);

  const handlePrint = () => window.print();

  function handleExport(mode: ExportMode) {
    setExportMode(mode);
    // Let React re-render with the filtered sections before opening the dialog
    setTimeout(() => window.print(), 150);
  }

  const show = (section: string) =>
    exportMode === "full" || EXPORT_SECTIONS[exportMode].includes(section);

  function handleCopyLink() {
    if (!submission) return;
    const encoded = encodeShareData(submission.data);
    const url = `${window.location.origin}/results?s=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!submission || !results) {
    return (
      <section className="py-16">
        <Container>
          <Card title="No assessment found">
            <p className="text-base text-slate-600 leading-relaxed">
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
          <div className="mx-auto max-w-[1120px] space-y-6">

            {/* Top nav */}
            <div className="flex items-center justify-between print:hidden">
              <ButtonLink href="/assessment" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                New assessment
              </ButtonLink>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <label className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                  Export
                  <select
                    aria-label="Export report for a specific audience"
                    className="cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleExport(e.target.value as ExportMode);
                    }}
                  >
                    <option value="" disabled>
                      Choose…
                    </option>
                    {EXPORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} title={opt.description}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Print / Download
                </button>
              </div>
            </div>

            {/* Prototype disclaimer */}
            <div className="rounded-sm border border-slate-300 bg-slate-100 px-4 py-3 text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">
                Prototype report — for validation only.
              </span>{" "}
              This is a sample prototype report created for product validation. It is not an
              official insurance, legal, or regulatory assessment.
            </div>

            {/* Demo banner */}
            {isDemo && (
              <div className="flex items-start gap-3 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
                <span className="shrink-0 font-semibold">⚑</span>
                <span>
                  You&apos;re viewing a sample report.{" "}
                  <Link href="/assessment" className="underline hover:no-underline font-semibold">
                    Start your own assessment
                  </Link>{" "}
                  to generate real results.
                </span>
              </div>
            )}

            {/* Report header */}
            <ReportHeader
              systemName={fd.systemName}
              companyName={fd.companyName}
              industry={industryDisplayLabel(fd.industry)}
              assessmentDate={formatDate()}
              results={results}
              scoreDelta={scoreDelta}
              readiness={insuranceBrief?.readiness}
            />

            {/* Underwriting action summary */}
            {show("actionSummary") && underwritingCards.length > 0 && (
              <Card title="Underwriting Action Summary">
                <UnderwritingActionSummary cards={underwritingCards} />
              </Card>
            )}

            {/* Summary */}
            {show("execSummary") && (
            <Card title="Executive Summary">
              <div className="space-y-3 text-base text-slate-700 leading-relaxed">
                <p>
                  <span className="font-semibold">{fd.companyName}</span>&apos;s{" "}
                  <span className="font-semibold">{fd.systemName}</span> has been assessed as{" "}
                  <span className="font-semibold">{results.riskLevel} Risk</span> with an AI Risk
                  Score of <span className="font-semibold">{results.riskScore}/100</span>.
                </p>
                {insuranceBrief && <p>{insuranceBrief.readiness.headline}</p>}
                <p>{results.summary}</p>
              </div>
              <p className="mt-3 text-xs text-slate-400">Assessed {assessmentAge}</p>
            </Card>
            )}

            {/* Insurance readiness verdict */}
            {show("readiness") && insuranceBrief && (
              <Card title="Insurance Readiness Verdict">
                <ReadinessVerdictPanel
                  brief={insuranceBrief}
                  missingEvidenceCount={
                    evidenceChecklist.filter((i) => i.status === "missing").length
                  }
                />
              </Card>
            )}

            {/* Score breakdown */}
            {show("scoreBreakdown") && (
              <Card title="AI Risk Score Breakdown">
                <CategoryScores scores={results.categoryScores} />
              </Card>
            )}

            {/* Broker summary */}
            {show("brokerSummary") && insuranceBrief && (
              <Card title="Broker Summary">
                <BrokerSummaryPanel brief={insuranceBrief} />
              </Card>
            )}

            {/* Risk drivers */}
            {show("riskDrivers") && (
              <Card title="Risk Drivers">
                <RiskDriversList drivers={results.riskDrivers} />
              </Card>
            )}

            {/* Compliance gaps */}
            {show("compliance") && (
              <Card title="Compliance Gaps">
                <ComplianceGaps gaps={results.complianceGaps} />
              </Card>
            )}

            {/* Evidence checklist */}
            {show("evidence") && (
              <Card title="Evidence Checklist">
                <EvidenceChecklist items={evidenceChecklist} />
              </Card>
            )}

            {/* Likely underwriter questions */}
            {show("questions") && (
              <Card title="Likely Underwriter Questions">
                <UnderwriterQuestions questions={underwriterQuestions} />
              </Card>
            )}

            {/* Recommendations / 30-60-90 action plan (merged — same underlying data) */}
            {show("actionPlan") && (
              <Card title="Recommendations — 30 / 60 / 90 Day Action Plan">
                <ActionPlanPanel recommendations={results.recommendations} />
              </Card>
            )}

            {/* Projected readiness */}
            {show("projection") && projection && (
              <Card title="Projected Readiness After Remediation">
                <ProjectionTable projection={projection} />
              </Card>
            )}

            {/* Benchmark */}
            {show("benchmark") && (
              <Card title="Industry Benchmark">
                <BenchmarkPanel
                  benchmark={results.benchmark}
                  industry={fd.industry}
                  riskScore={results.riskScore}
                />
              </Card>
            )}

            {/* Assessment history */}
            {exportMode === "full" && !isDemo && submission.id !== "shared" && (
              <Card title="Previous Assessments">
                <AssessmentHistory history={history} currentId={submission.id} />
              </Card>
            )}

            {/* Closing verdict */}
            {show("verdict") && insuranceBrief && (
              <VerdictPanel results={results} brief={insuranceBrief} />
            )}

            {/* Report verification */}
            {show("verification") && (
              <VerificationStamp
                data={fd}
                reportId={`VER-${new Date().getFullYear()}-${submission.id.slice(0, 6).toUpperCase()}`}
                generatedOn={formatDate()}
              />
            )}

            {/* Broker feedback prompt */}
            {exportMode === "full" && (
              <div className="rounded-sm border border-dashed border-blue-300 bg-blue-50/50 px-5 py-4 text-sm text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900">Broker feedback requested</p>
                <p className="mt-1.5">
                  This is a prototype report created for validation. We are seeking feedback from
                  brokers, underwriters, compliance professionals, and risk consultants.
                </p>
                <ol className="mt-2.5 list-decimal space-y-1 pl-5 text-slate-600">
                  <li>
                    Would this help prepare a client before Cyber, Professional Indemnity, or
                    Technology E&amp;O review?
                  </li>
                  <li>Which sections would be useful in a real broker or underwriting workflow?</li>
                  <li>Which sections would you ignore?</li>
                  <li>What evidence would an underwriter need before trusting this report?</li>
                  <li>What is missing?</li>
                  <li>Who would usually own this problem inside a client organisation?</li>
                  <li>What would make this commercially useful?</li>
                </ol>
              </div>
            )}

            {/* Report footer */}
            <p className="text-center text-xs text-slate-400">
              Generated by Verdictal · Prototype Report · For validation only · Report ID:{" "}
              VER-{new Date().getFullYear()}-{submission.id.slice(0, 6).toUpperCase()}
            </p>

            {/* Footer CTA */}
            {!isDemo && (
              <div className="rounded-sm border border-slate-200 bg-white p-6 text-center print:hidden">
                <Shield className="mx-auto h-8 w-8 text-blue-700 mb-3" />
                <p className="text-base font-semibold text-slate-900 mb-1">
                  Want to discuss these results with an expert?
                </p>
                <p className="text-base text-slate-500 leading-relaxed mb-4">
                  Book a call to review your governance gaps and renewal strategy.
                </p>
                <ButtonLink href="/about" variant="primary">
                  Book a consultation
                </ButtonLink>
              </div>
            )}

          </div>
        </Container>
      </section>
    </>
  );
}
