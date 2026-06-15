"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Building, FileCheck, BarChart3 } from "lucide-react";
import Container from "../../components/layout/Container";
import {
  AssessmentErrors,
  AssessmentFormData,
  DEFAULT_ASSESSMENT_FORM,
  DRAFT_KEY,
  StoredSubmission,
  SUBMISSION_KEY,
  appendToHistory,
  calculatePreliminaryStatus,
  getHistory,
  makeAssessmentId,
  safeJsonParse,
  safeLocalStorageGet,
  safeLocalStorageSet,
  toggleExclusive,
} from "../../lib/risk/schema";
import { StepAiSystem } from "../../components/assessment/steps/StepAiSystem";
import { StepGovernance } from "../../components/assessment/steps/StepGovernance";
import { StepControlsEvidence } from "../../components/assessment/steps/StepControlsEvidence";
import { StepReviewGenerate } from "../../components/assessment/steps/StepReviewGenerate";
import { StepIndicator } from "../../components/assessment/StepIndicator";
import { StepNav } from "../../components/assessment/StepNav";
import { LiveRiskBadge } from "../../components/assessment/LiveRiskBadge";
import { LiveSidebar } from "../../components/assessment/LiveSidebar";

// ── Validation ────────────────────────────────────────────────────────────────

function validateStep(s: number, formData: AssessmentFormData): AssessmentErrors {
  const e: AssessmentErrors = {};
  if (s === 0) {
    if (!formData.companyName.trim()) e.companyName = "Company name is required.";
    if (!formData.industry) e.industry = "Select an industry.";
    if (!formData.systemName.trim()) e.systemName = "System name is required.";
    if (!formData.aiUseCase.trim()) e.aiUseCase = "Describe the AI use case.";
  }
  return e;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AssessmentFormData>(DEFAULT_ASSESSMENT_FORM);
  const [errors, setErrors] = useState<AssessmentErrors>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [lastEntry, setLastEntry] = useState<StoredSubmission | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const raw = safeLocalStorageGet(DRAFT_KEY);
    const parsed = safeJsonParse<AssessmentFormData>(raw);
    if (parsed) setFormData(parsed);
  }, []);

  useEffect(() => {
    const history = getHistory();
    if (history.length > 0) setLastEntry(history[0]);
  }, []);

  useEffect(() => {
    const saved = safeLocalStorageSet(DRAFT_KEY, JSON.stringify(formData));
    setSaveFailed(!saved);
  }, [formData]);

  const steps = useMemo(
    () => [
      { title: "Your AI System", icon: <Building className="h-3.5 w-3.5" /> },
      { title: "Governance", icon: <Shield className="h-3.5 w-3.5" /> },
      { title: "Controls & Evidence", icon: <BarChart3 className="h-3.5 w-3.5" /> },
      { title: "Review & Generate", icon: <FileCheck className="h-3.5 w-3.5" /> },
    ],
    []
  );

  const preliminary = useMemo(() => calculatePreliminaryStatus(formData), [formData]);
  const liveReady = step > 0 || formData.companyName.trim().length > 0;

  const multiFields: Record<string, string[]> = {
    assessmentPurpose: [],
    aiCapabilities: [],
    biasTesting: ["No testing conducted", "Unsure"],
    modelDocs: ["None"],
    dataTypes: [],
    regulations: ["None / Unsure"],
    monitoring: ["None"],
  };

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleArrayChange(name: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [name]: toggleExclusive(
        (prev[name as keyof AssessmentFormData] as string[]) ?? [],
        value,
        multiFields[name] ?? []
      ),
    }));
  }

  function goTo(i: number) {
    if (i <= step) {
      setStep(i);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    for (let s = step; s < i; s++) {
      const e = validateStep(s, formData);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    for (let s = 0; s < steps.length - 1; s++) {
      const e = validateStep(s, formData);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    setSubmitting(true);
    const id = makeAssessmentId();
    const submission: StoredSubmission = {
      id,
      submittedAt: new Date().toISOString(),
      data: formData,
    };
    safeLocalStorageSet(SUBMISSION_KEY, JSON.stringify(submission));
    appendToHistory(submission);
    router.push("/results");
  }

  const progressPct = Math.round(((step + 1) / steps.length) * 100);

  return (
    <section className="min-h-screen bg-slate-50 py-10">
      <Container>
        <div className="mx-auto max-w-[1140px]">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-700" />
              <h1 className="text-lg font-bold text-slate-900">AI Governance Assessment</h1>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full bg-blue-700 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Step {step + 1} of {steps.length} — {steps[step].title}
            </p>
          </div>

          {/* Step tabs */}
          <div className="mb-4">
            <StepIndicator steps={steps} current={step} onNavigate={goTo} />
          </div>

          {/* Last score banner */}
          {step === 0 && !bannerDismissed && lastEntry && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-sm border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <span>
                ↺ Last assessment:{" "}
                <strong>{lastEntry.data.systemName || lastEntry.data.companyName}</strong>
                {" — "}
                <a href="/results" className="underline hover:no-underline font-semibold">
                  View report →
                </a>
              </span>
              <button
                onClick={() => setBannerDismissed(true)}
                className="shrink-0 text-blue-500 hover:text-blue-700 font-bold text-base leading-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* Save failure banner */}
          {saveFailed && (
            <div className="mb-4 flex items-start gap-3 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="shrink-0 font-semibold">⚠</span>
              <span>
                Draft could not be saved — your browser storage may be full.{" "}
                <button onClick={() => setSaveFailed(false)} className="ml-1 underline hover:no-underline">
                  Dismiss
                </button>
              </span>
            </div>
          )}

          {/* Mobile: live badge above form (hidden on desktop) */}
          <div className="lg:hidden mb-4">
            <LiveRiskBadge preliminary={preliminary} ready={liveReady} />
          </div>

          {/* Two-column layout */}
          <div className="flex gap-8 items-start">

            {/* Form column */}
            <div className="flex-1 min-w-0">
              <div className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8">
                {step === 0 && (
                  <StepAiSystem
                    data={formData}
                    errors={errors}
                    onChange={handleChange}
                    onArrayChange={handleArrayChange}
                  />
                )}
                {step === 1 && (
                  <StepGovernance
                    data={formData}
                    onChange={handleChange}
                    onArrayChange={handleArrayChange}
                  />
                )}
                {step === 2 && (
                  <StepControlsEvidence
                    data={formData}
                    onChange={handleChange}
                    onArrayChange={handleArrayChange}
                  />
                )}
                {step === 3 && <StepReviewGenerate data={formData} />}

                <StepNav
                  step={step}
                  totalSteps={steps.length}
                  onBack={() => goTo(Math.max(step - 1, 0))}
                  onNext={() => goTo(step + 1)}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                />
              </div>
            </div>

            {/* Desktop sidebar (hidden on mobile) */}
            <div className="hidden lg:block sticky top-8 self-start">
              <LiveSidebar data={formData} ready={liveReady} />
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}
