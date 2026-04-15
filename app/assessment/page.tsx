// app/assessment/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  Shield,
  Users,
  Building,
  FileText,
  FileCheck,
  Database,
  Globe,
  AlertTriangle,
} from "lucide-react";
import Container from "../../components/layout/Container";
import {
  AssessmentErrors,
  AssessmentFormData,
  DEFAULT_ASSESSMENT_FORM,
  DRAFT_KEY,
  SUBMISSION_KEY,
  calculatePreliminaryStatus,
  isValidEmail,
  makeAssessmentId,
  safeJsonParse,
  safeLocalStorageGet,
  safeLocalStorageSet,
  toggleExclusive,
} from "../../lib/risk/schema";

// ─── Field primitives ─────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs text-slate-400">{children}</p>;
}

const fieldBase = "w-full rounded-sm border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors";
const fieldNormal = "border-slate-300 bg-white focus:border-blue-700 focus:ring-blue-700";
const fieldError = "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500";

function Select({ name, value, onChange, children, error }: {
  name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode; error?: string;
}) {
  return (
    <>
      <select name={name} value={value} onChange={onChange}
        className={`${fieldBase} ${error ? fieldError : fieldNormal}`}>
        {children}
      </select>
      <FieldError msg={error} />
    </>
  );
}

function TextInput({ name, value, onChange, placeholder, error, type = "text" }: {
  name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; error?: string; type?: string;
}) {
  return (
    <>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`${fieldBase} ${error ? fieldError : fieldNormal}`} />
      <FieldError msg={error} />
    </>
  );
}

function Textarea({ name, value, onChange, placeholder, error, rows = 3 }: {
  name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; error?: string; rows?: number;
}) {
  return (
    <>
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        className={`${fieldBase} ${error ? fieldError : fieldNormal} resize-none`} />
      <FieldError msg={error} />
    </>
  );
}

function CheckboxGroup({ name, options, selected, onChange }: {
  name: string; options: string[]; selected: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <label key={opt} className={`flex cursor-pointer items-center gap-2.5 rounded-sm border px-3 py-2.5 text-sm transition-colors ${
          selected.includes(opt)
            ? "border-blue-600 bg-blue-50 text-blue-900 font-medium"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
        }`}>
          <input type="checkbox" name={name} value={opt} checked={selected.includes(opt)}
            onChange={onChange} className="h-3.5 w-3.5 rounded-sm border-slate-300 text-blue-700" />
          {opt}
        </label>
      ))}
    </div>
  );
}

function RadioGroup({ name, options, value, onChange }: {
  name: string;
  options: { value: string; label: string; hint?: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt.value} className={`flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3 text-sm transition-all ${
          value === opt.value
            ? "border-blue-600 bg-blue-50"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}>
          <input type="radio" name={name} value={opt.value} checked={value === opt.value}
            onChange={onChange} className="mt-0.5 h-4 w-4 text-blue-700 border-slate-300" />
          <div>
            <span className="font-semibold text-slate-900">{opt.label}</span>
            {opt.hint && <p className="mt-0.5 text-xs text-slate-500">{opt.hint}</p>}
          </div>
        </label>
      ))}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-slate-100 flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-slate-200 bg-slate-50 text-blue-700">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepFirmDetails({ data, errors, onChange }: {
  data: AssessmentFormData; errors: AssessmentErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<Building className="h-4 w-4" />} title="Organisation Details" subtitle="Tell us about the firm undertaking this assessment." />
        <div className="space-y-5">
          <div>
            <Label>Legal entity name</Label>
            <TextInput name="companyName" value={data.companyName} onChange={onChange} placeholder="e.g. Acme Financial Ltd" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label required>Industry sector</Label>
              <Select name="industry" value={data.industry} onChange={onChange}>
                <option value="financial">Financial Services</option>
                <option value="insurance">Insurance</option>
                <option value="healthcare">Healthcare</option>
                <option value="retail">Retail / E-commerce</option>
                <option value="technology">Technology</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="education">Education</option>
                <option value="legal">Legal</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <Label required>Firm size</Label>
              <Select name="companySize" value={data.companySize} onChange={onChange}>
                <option value="1-10">1–10 employees</option>
                <option value="11-50">11–50 employees</option>
                <option value="51-200">51–200 employees</option>
                <option value="201-500">201–500 employees</option>
                <option value="500+">500+ employees</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input type="checkbox" name="regulatedEntity" checked={data.regulatedEntity} onChange={onChange}
                className="h-4 w-4 rounded-sm border-slate-300 text-blue-700" />
              <span>This is an FCA / PRA regulated entity</span>
            </label>
          </div>
          {data.regulatedEntity && (
            <div>
              <Label>Primary regulator</Label>
              <Select name="regulator" value={data.regulator ?? "none"} onChange={onChange}>
                <option value="fca">FCA</option>
                <option value="pra">PRA</option>
                <option value="both">FCA + PRA (dual regulated)</option>
                <option value="other">Other</option>
                <option value="none">Not sure</option>
              </Select>
            </div>
          )}
          <div>
            <Label>Purpose of this assessment</Label>
            <Hint>e.g. PI renewal preparation, internal governance review, regulatory submission</Hint>
            <TextInput name="purpose" value={data.purpose ?? ""} onChange={onChange} placeholder="Insurance renewal preparation" />
          </div>
          <div>
            <Label>Does your current PI or D&amp;O policy cover AI-related claims?</Label>
            <Hint>Check your policy wording or ask your broker. Many legacy policies contain silent exclusions for AI errors, algorithmic decisions, or model failures.</Hint>
            <Select name="aiCoverageCheck" value={data.aiCoverageCheck ?? ""} onChange={onChange}>
              <option value="">Not checked / unsure</option>
              <option value="covered">Yes — confirmed AI is covered by existing policy</option>
              <option value="uncertain">Uncertain — haven&apos;t checked policy wording</option>
              <option value="gap-identified">Gap identified — AI not fully covered</option>
              <option value="no-coverage">No relevant PI or D&amp;O coverage in place</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<Globe className="h-4 w-4" />} title="Email Copy (Optional)" />
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <input type="checkbox" name="wantsEmailCopy" checked={data.wantsEmailCopy} onChange={onChange}
              className="h-4 w-4 rounded-sm border-slate-300 text-blue-700" />
            <span>Send me a copy of the results by email</span>
          </label>
          {data.wantsEmailCopy && (
            <div>
              <Label required>Work email address</Label>
              <TextInput type="email" name="contactEmail" value={data.contactEmail} onChange={onChange}
                placeholder="you@firm.com" error={errors.contactEmail} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepAiSystem({ data, errors, onChange }: {
  data: AssessmentFormData; errors: AssessmentErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<FileText className="h-4 w-4" />} title="AI System Details" subtitle="Describe the specific AI system being assessed." />
        <div className="space-y-5">
          <div>
            <Label required>System / model name</Label>
            <TextInput name="systemName" value={data.systemName} onChange={onChange}
              placeholder="e.g. Credit Scoring Engine v2, Fraud Detection Model" error={errors.systemName} />
          </div>
          <div>
            <Label required>Describe what this AI system does</Label>
            <Hint>Be specific: what decisions does it make, what data does it use, who is affected? Minimum 40 characters.</Hint>
            <Textarea name="aiUseCase" value={data.aiUseCase} onChange={onChange} rows={4}
              placeholder="e.g. Scores consumer credit applications using income, credit history, and open banking data. Produces a recommend/decline output passed to an underwriter for final decision."
              error={errors.aiUseCase} />
            <p className="mt-1 text-right text-xs text-slate-400">{data.aiUseCase.length} / 40 min</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>AI maturity stage</Label>
              <Select name="aiMaturity" value={data.aiMaturity} onChange={onChange}>
                <option value="pre-production">Pre-production / Testing</option>
                <option value="production">In production</option>
                <option value="multiple">Multiple models in production</option>
                <option value="decommissioning">Being decommissioned</option>
              </Select>
            </div>
            <div>
              <Label>Deployment type</Label>
              <Select name="deploymentType" value={data.deploymentType} onChange={onChange}>
                <option value="internal">Internal only</option>
                <option value="customer">Customer-facing</option>
                <option value="both">Internal + customer-facing</option>
                <option value="third-party-api">Via third-party API</option>
                <option value="self-hosted">Self-hosted</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Approx. decisions or users per day</Label>
              <TextInput name="usersCount" value={data.usersCount} onChange={onChange}
                placeholder="e.g. 500" error={errors.usersCount} />
            </div>
            <div>
              <Label>Frequency of use</Label>
              <Select name="frequencyOfUse" value={data.frequencyOfUse} onChange={onChange}>
                <option value="ongoing">Continuous / real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>AI capabilities (select all that apply)</Label>
            <CheckboxGroup name="aiCapabilities"
              options={["Classification", "Regression / prediction", "Generative / LLM", "Recommendation", "Computer vision", "NLP / text analysis", "Anomaly detection"]}
              selected={data.aiCapabilities ?? []} onChange={onChange} />
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<Database className="h-4 w-4" />} title="Model Lineage" subtitle="Foundation model source, hosting, and update cadence." />
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Foundation model / source</Label>
              <Select name="foundationModelSource" value={data.foundationModelSource ?? ""} onChange={onChange}>
                <option value="">Not applicable / bespoke</option>
                <option value="proprietary">Proprietary / in-house</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="open-weights">Open weights (e.g. Llama)</option>
                <option value="other-api">Other third-party API</option>
              </Select>
            </div>
            <div>
              <Label>Model hosting</Label>
              <Select name="modelHosting" value={data.modelHosting ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="self-hosted">Self-hosted</option>
                <option value="vendor-hosted">Vendor-hosted</option>
                <option value="cloud-provider">Cloud provider (AWS / Azure / GCP)</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Retraining / update frequency</Label>
              <Select name="retrainingFrequency" value={data.retrainingFrequency ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="continuous">Continuous / online learning</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="static">Static — no retraining</option>
              </Select>
            </div>
            <div>
              <Label>Business criticality</Label>
              <Select name="criticality" value={data.criticality ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="minor">Minor — low impact if unavailable</option>
                <option value="disruption">Operational disruption if unavailable</option>
                <option value="regulatory">Regulatory obligations depend on it</option>
                <option value="customer">Customer outcomes directly depend on it</option>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepRiskProfile({ data, errors, onChange }: {
  data: AssessmentFormData; errors: AssessmentErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<Shield className="h-4 w-4" />} title="Decision Authority" subtitle="How much does the AI drive consequential decisions?" />
        <div className="space-y-5">
          <div>
            <Label required>Automation level</Label>
            <RadioGroup name="decisionAuthority" value={data.decisionAuthority} onChange={onChange}
              options={[
                { value: "none", label: "No automation", hint: "AI provides information only — humans make all decisions" },
                { value: "partial", label: "Partial automation", hint: "AI recommends; a human reviews and approves before action" },
                { value: "full", label: "Full automation", hint: "AI decides and acts without a human in the loop" },
              ]} />
          </div>
          <div>
            <Label>Human intervention capability</Label>
            <Select name="humanIntervention" value={data.humanIntervention ?? ""} onChange={onChange}>
              <option value="">Not specified</option>
              <option value="pre-approval">Pre-approval — human signs off before AI acts</option>
              <option value="post-audit">Post-audit — human reviews after the fact</option>
              <option value="autonomous">Autonomous — no human intervention</option>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Blast radius / systematic risk</Label>
              <Select name="systematicRisk" value={data.systematicRisk ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="isolated">Isolated — one transaction at a time</option>
                <option value="batch">Batch — groups of customers</option>
                <option value="global">Global — all customers / entire product</option>
              </Select>
            </div>
            <div>
              <Label>Mean time to detect a failure (MTTD)</Label>
              <Select name="mttd" value={data.mttd ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="under_1_hour">Under 1 hour</option>
                <option value="1_to_24_hours">1–24 hours</option>
                <option value="over_24_hours">Over 24 hours</option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<AlertTriangle className="h-4 w-4" />} title="Impact & Exposure" />
        <div className="space-y-5">
          <div>
            <Label required>Maximum financial impact if the AI causes harm or fails</Label>
            <RadioGroup name="financialImpactTier" value={data.financialImpactTier} onChange={onChange}
              options={[
                { value: "under_100k", label: "Under £100k" },
                { value: "100k_to_1m", label: "£100k – £1m" },
                { value: "over_1m", label: "Over £1m" },
                { value: "legal", label: "Legal / regulatory penalties" },
                { value: "harm", label: "Individual harm — physical, financial, or reputational" },
              ]} />
          </div>
          <div>
            <Label>Model explainability</Label>
            <Select name="explainabilityType" value={data.explainabilityType ?? ""} onChange={onChange}>
              <option value="">Not specified</option>
              <option value="black-box">Black box — output only, no explanation available</option>
              <option value="interpretable">Interpretable — can explain in plain terms</option>
              <option value="fully-transparent">Fully transparent — decision logic is auditable</option>
            </Select>
          </div>
          <div>
            <Label>Consumer-facing explanations (GDPR Article 22 / Consumer Duty)</Label>
            <Hint>Can individuals receive an explanation of an AI-driven decision that affects them? This is a specific GDPR Article 22 and FCA Consumer Duty obligation — separate from whether the model is technically interpretable.</Hint>
            <Select name="consumerExplainability" value={data.consumerExplainability ?? ""} onChange={onChange}>
              <option value="">Not specified</option>
              <option value="not-customer-facing">Not applicable — AI does not affect individual consumers</option>
              <option value="automated">Yes — automated explanation provided at point of decision</option>
              <option value="on-request">On request only — available but not proactively provided</option>
              <option value="none">No — consumers cannot obtain an explanation</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<Database className="h-4 w-4" />} title="Data Profile" />
        <div className="space-y-5">
          <div>
            <Label required>Data sensitivity</Label>
            <RadioGroup name="dataSensitivity" value={data.dataSensitivity} onChange={onChange}
              options={[
                { value: "none", label: "No personal data", hint: "Aggregated or synthetic data only" },
                { value: "basic", label: "Basic personal data", hint: "Names, contact details, behavioural data" },
                { value: "sensitive", label: "Special category / sensitive data", hint: "Health, financial records, biometrics, credit data" },
              ]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Approximate records processed per day</Label>
              <TextInput name="dataVolume" value={data.dataVolume} onChange={onChange}
                placeholder="e.g. 10,000" error={errors.dataVolume} />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input type="checkbox" name="thirdPartyData" checked={data.thirdPartyData} onChange={onChange}
                  className="h-4 w-4 rounded-sm border-slate-300 text-blue-700" />
                <span>Uses third-party data sources</span>
              </label>
            </div>
          </div>
          <div>
            <Label>Data types processed (select all that apply)</Label>
            <CheckboxGroup name="dataTypes"
              options={["Financial data", "Credit data", "Health data", "Location data", "Behavioural data", "Biometric data", "Communications data"]}
              selected={data.dataTypes ?? []} onChange={onChange} />
          </div>
          <div>
            <Label>Relevant regulatory frameworks (select all that apply)</Label>
            <CheckboxGroup name="regulations"
              options={["GDPR / UK GDPR", "FCA Consumer Duty", "PRA Model Risk (SS1/23)", "ISO 42001", "EU AI Act", "None / Unsure"]}
              selected={data.regulations ?? []} onChange={onChange} />
          </div>
          <div>
            <Label>Bias testing conducted (select all that apply)</Label>
            <CheckboxGroup name="biasTesting"
              options={["Pre-deployment bias testing", "Ongoing fairness monitoring", "Protected characteristic analysis", "No testing conducted", "Unsure"]}
              selected={data.biasTesting ?? []} onChange={onChange} />
          </div>
          <div>
            <Label>Vulnerable customer handling (FCA Consumer Duty)</Label>
            <Hint>FCA Consumer Duty requires firms to consider consumers in vulnerable circumstances. Does this AI system identify or treat vulnerable customers differently?</Hint>
            <Select name="vulnerableCustomerHandling" value={data.vulnerableCustomerHandling ?? ""} onChange={onChange}>
              <option value="">Not specified</option>
              <option value="not-applicable">Not applicable — AI does not interact with or affect individual consumers</option>
              <option value="yes">Yes — vulnerable customer identification and differentiated handling in place</option>
              <option value="partial">Partial — some consideration but no formal process</option>
              <option value="none">No — vulnerable customers are not specifically identified or handled differently</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepGovernance({ data, onChange }: {
  data: AssessmentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<Users className="h-4 w-4" />} title="Oversight & Controls" />
        <div className="space-y-5">
          <div>
            <Label required>Human oversight level</Label>
            <RadioGroup name="existingOversight" value={data.existingOversight} onChange={onChange}
              options={[
                { value: "none", label: "No formal oversight", hint: "No monitoring programme in place" },
                { value: "periodic", label: "Periodic review", hint: "Regular scheduled reviews — weekly, monthly, quarterly" },
                { value: "continuous", label: "Continuous monitoring", hint: "Real-time dashboards and automated alerting" },
              ]} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "documentedProcess", label: "Documented AI governance process exists" },
              { name: "hasDpo", label: "Data Protection Officer (DPO) in place" },
              { name: "smfAccountability", label: "Named Senior Manager (SMF) accountable for this AI system" },
              { name: "incidentResponsePlan", label: "Documented incident response plan for AI failures" },
            ].map((cb) => (
              <label key={cb.name} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input type="checkbox" name={cb.name}
                  checked={data[cb.name as keyof AssessmentFormData] as boolean}
                  onChange={onChange} className="h-4 w-4 rounded-sm border-slate-300 text-blue-700" />
                {cb.label}
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Formal AI policy</Label>
              <Hint>A documented organisation-wide AI policy — distinct from a governance process. Required by ISO 42001.</Hint>
              <Select name="formalAiPolicy" value={data.formalAiPolicy ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="yes">Yes — formal AI policy in place and approved</option>
                <option value="in-progress">In progress — being developed</option>
                <option value="no">No — no formal AI policy exists</option>
              </Select>
            </div>
            <div>
              <Label>Consumer redress mechanism (FCA Consumer Duty)</Label>
              <Hint>Can consumers affected by this AI system challenge or appeal decisions made about them?</Hint>
              <Select name="consumerRedress" value={data.consumerRedress ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="formal">Formal — documented complaints and appeals process in place</option>
                <option value="in-progress">In progress — being implemented</option>
                <option value="none">None — no consumer redress mechanism exists</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Incident history</Label>
              <Select name="incidentHistory" value={data.incidentHistory} onChange={onChange}>
                <option value="none">No incidents</option>
                <option value="minor">Minor incidents only</option>
                <option value="significant">One significant incident</option>
                <option value="multiple">Multiple incidents</option>
              </Select>
            </div>
            <div>
              <Label>Emergency stop / kill switch</Label>
              <Select name="killSwitch" value={data.killSwitch ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="automated">Automated — triggers on anomaly detection</option>
                <option value="manual-instant">Manual — can stop within minutes</option>
                <option value="manual-slow">Manual — takes hours to stop</option>
                <option value="code-deploy">Requires a code deployment to stop</option>
                <option value="none">No kill switch</option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<FileCheck className="h-4 w-4" />} title="Audit & Change Management" />
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Audit trail completeness</Label>
              <Select name="auditTrailCompleteness" value={data.auditTrailCompleteness ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="none">No audit logs</option>
                <option value="input-output">Inputs and outputs only</option>
                <option value="decision-logic">Decision logic included</option>
                <option value="metadata">Full metadata — user, timestamp, version</option>
              </Select>
            </div>
            <div>
              <Label>Change management process</Label>
              <Select name="changeManagement" value={data.changeManagement ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="ad-hoc">Ad-hoc — no formal process</option>
                <option value="peer-review">Peer review before deployment</option>
                <option value="staged-gates">Staged gates — test, sign-off, rollout</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>External verification</Label>
              <Select name="externalVerification" value={data.externalVerification ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="none">Internal only</option>
                <option value="external-audit">External audit or third-party review</option>
              </Select>
            </div>
            <div>
              <Label>Independent model validation (PRA SS1/23)</Label>
              <Hint>PRA SS1/23 requires validation to be performed by people independent of those who built the model. This can be an internal independent team or an external validator.</Hint>
              <Select name="independentValidation" value={data.independentValidation ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="internal-independent">Internal — validated by a team independent of the builders</option>
                <option value="external">External — third-party model validation conducted</option>
                <option value="not-yet">Not yet — validation not yet performed</option>
                <option value="none">None — validated only by the team that built it</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>AI governance training frequency</Label>
              <Select name="trainingFrequency" value={data.trainingFrequency ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
                <option value="one-time">One-time only</option>
                <option value="none">No training programme</option>
              </Select>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <input type="checkbox" name="monitoringHallucination"
              checked={data.monitoringHallucination ?? false} onChange={onChange}
              className="h-4 w-4 rounded-sm border-slate-300 text-blue-700" />
            <span>We monitor for hallucination / model drift in generative AI outputs</span>
          </label>
          <div>
            <Label>Monitoring tools in use (select all that apply)</Label>
            <CheckboxGroup name="monitoring"
              options={["Performance dashboards", "Drift detection", "Alert / paging system", "Manual sampling", "None"]}
              selected={data.monitoring ?? []} onChange={onChange} />
          </div>
          <div>
            <Label>Model documentation in place (select all that apply)</Label>
            <CheckboxGroup name="modelDocs"
              options={["Model card", "Risk assessment", "Data lineage doc", "Performance benchmarks", "Bias / fairness report", "None"]}
              selected={data.modelDocs ?? []} onChange={onChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepEvidence({ data, onChange }: {
  data: AssessmentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<FileCheck className="h-4 w-4" />} title="Validation & Certification" subtitle="Evidence that can be shared with underwriters." />
        <div className="space-y-5">
          {[
            {
              name: "hasModelCards", label: "Model cards / technical documentation exist",
              hint: "Describes intended use, limitations, training data, and performance metrics",
              urlField: "modelCardsUrl", urlPlaceholder: "Link to documentation (optional)"
            },
            {
              name: "hasExternalAudit", label: "External audit or certification has been conducted",
              hint: "e.g. ISO 42001, SOC 2, third-party model review",
              urlField: "auditReportUrl", urlPlaceholder: "Report URL (optional)"
            },
            {
              name: "hasRedTeaming", label: "Red-teaming or adversarial testing has been performed",
              hint: "Deliberate attempts to break or misuse the system to uncover vulnerabilities",
              urlField: "redTeamingReportUrl", urlPlaceholder: "Report URL (optional)"
            },
          ].map((item) => (
            <div key={item.name} className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                <input type="checkbox" name={item.name}
                  checked={data[item.name as keyof AssessmentFormData] as boolean}
                  onChange={onChange} className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-blue-700" />
                <div>
                  <span className="font-medium text-slate-900">{item.label}</span>
                  <p className="text-xs text-slate-500">{item.hint}</p>
                </div>
              </label>
              {data[item.name as keyof AssessmentFormData] && (
                <div className="ml-7">
                  <TextInput name={item.urlField} value={(data[item.urlField as keyof AssessmentFormData] as string) ?? ""}
                    onChange={onChange} placeholder={item.urlPlaceholder} />
                </div>
              )}
            </div>
          ))}
          {data.hasExternalAudit && (
            <div className="ml-7">
              <Label>Audit type</Label>
              <Select name="externalAuditType" value={data.externalAuditType ?? ""} onChange={onChange}>
                <option value="">Select type</option>
                <option value="iso42001">ISO 42001</option>
                <option value="soc2">SOC 2</option>
                <option value="pending">Pending</option>
                <option value="none">Other / informal</option>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<FileText className="h-4 w-4" />} title="Additional Context" />
        <div>
          <Label>Anything else relevant to this assessment?</Label>
          <Hint>e.g. upcoming regulatory submissions, known issues, recent changes to the model</Hint>
          <Textarea name="additionalContext" value={data.additionalContext} onChange={onChange} rows={4}
            placeholder="Optional — add context that would help assess your AI system accurately." />
        </div>
      </div>
    </div>
  );
}

function StepReview({ data, preliminary }: {
  data: AssessmentFormData;
  preliminary: ReturnType<typeof calculatePreliminaryStatus>;
}) {
  const statusColor = preliminary.status === "Low Risk" ? "text-green-700" : preliminary.status === "Medium Risk" ? "text-amber-700" : "text-red-700";
  const statusBg = preliminary.status === "Low Risk" ? "bg-green-50 border-green-200" : preliminary.status === "Medium Risk" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
  const statusBadge = preliminary.status === "Low Risk" ? "bg-green-700" : preliminary.status === "Medium Risk" ? "bg-amber-600" : "bg-red-700";

  const sections = [
    {
      title: "Firm & System",
      rows: [
        { label: "Company", value: data.companyName || "—" },
        { label: "Industry", value: data.industry },
        { label: "Regulated entity", value: data.regulatedEntity ? `Yes (${data.regulator?.toUpperCase() ?? "—"})` : "No" },
        { label: "AI system", value: data.systemName || "—" },
        { label: "Maturity stage", value: data.aiMaturity.replace(/-/g, " ") },
        { label: "Deployment", value: data.deploymentType.replace(/-/g, " ") },
        { label: "Frequency of use", value: data.frequencyOfUse },
        ...(data.aiCoverageCheck ? [{ label: "AI insurance coverage", value: data.aiCoverageCheck.replace(/-/g, " ") }] : []),
      ],
    },
    {
      title: "Risk Profile",
      rows: [
        { label: "Decision authority", value: data.decisionAuthority },
        { label: "Financial impact", value: data.financialImpactTier.replace(/_/g, " ") },
        { label: "Data sensitivity", value: data.dataSensitivity },
        { label: "Third-party data", value: data.thirdPartyData ? "Yes" : "No" },
        ...(data.systematicRisk ? [{ label: "Blast radius", value: data.systematicRisk }] : []),
        ...(data.mttd ? [{ label: "Time to detect failure", value: data.mttd.replace(/_/g, " ") }] : []),
        ...(data.explainabilityType ? [{ label: "Model explainability", value: data.explainabilityType.replace(/-/g, " ") }] : []),
        ...(data.consumerExplainability ? [{ label: "Consumer explanations", value: data.consumerExplainability.replace(/-/g, " ") }] : []),
        ...(data.vulnerableCustomerHandling ? [{ label: "Vulnerable customer handling", value: data.vulnerableCustomerHandling.replace(/-/g, " ") }] : []),
      ],
    },
    {
      title: "Governance & Controls",
      rows: [
        { label: "Human oversight", value: data.existingOversight },
        { label: "Documented process", value: data.documentedProcess ? "Yes" : "No" },
        { label: "SMF accountability", value: data.smfAccountability ? "Yes" : "No" },
        { label: "Formal AI policy", value: data.formalAiPolicy?.replace(/-/g, " ") ?? "Not specified" },
        { label: "Consumer redress", value: data.consumerRedress?.replace(/-/g, " ") ?? "Not specified" },
        { label: "Independent validation", value: data.independentValidation?.replace(/-/g, " ") ?? "Not specified" },
        ...(data.killSwitch ? [{ label: "Kill switch", value: data.killSwitch.replace(/-/g, " ") }] : []),
        { label: "Incident response plan", value: data.incidentResponsePlan ? "Yes" : "No" },
        { label: "Incident history", value: data.incidentHistory },
      ],
    },
    {
      title: "Evidence",
      rows: [
        { label: "Model documentation", value: data.modelDocs?.filter(d => d !== "None").join(", ") || "None" },
        { label: "Bias testing", value: data.biasTesting?.filter(d => d !== "No testing conducted").join(", ") || "None conducted" },
        { label: "Monitoring tools", value: data.monitoring?.filter(d => d !== "None").join(", ") || "None" },
        { label: "External audit", value: data.hasExternalAudit ? `Yes${data.externalAuditType ? ` (${data.externalAuditType})` : ""}` : "No" },
        { label: "Red-teaming", value: data.hasRedTeaming ? "Yes" : "No" },
        { label: "DPO in place", value: data.hasDpo ? "Yes" : "No" },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {/* Preliminary signal — tier only, no raw number */}
      <div className={`rounded-sm border p-5 ${statusBg}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Preliminary Signal</p>
          <span className={`rounded-sm px-2.5 py-1 text-xs font-bold text-white ${statusBadge}`}>
            {preliminary.status}
          </span>
        </div>
        <p className="text-xs text-slate-500">Full AI Governance Score calculated on submission — submit to see the complete breakdown.</p>
        {preliminary.concerns.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Concerns flagged so far</p>
            {preliminary.concerns.map((c) => (
              <div key={c} className="flex items-start gap-2 text-xs text-slate-700">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grouped answer summary */}
      {sections.map((section) => (
        <div key={section.title} className="rounded-sm border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{section.title}</p>
          <div className="divide-y divide-slate-100">
            {section.rows.map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 text-sm">
                <span className="text-slate-500 shrink-0 mr-4">{label}</span>
                <span className="font-medium text-slate-900 text-right capitalize">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-slate-400 text-center">Go back to any step to edit before submitting.</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<AssessmentErrors>({});
  const [saved, setSaved] = useState(false);
  const [restored, setRestored] = useState(false);
  const [formData, setFormData] = useState<AssessmentFormData>(DEFAULT_ASSESSMENT_FORM);

  const steps = useMemo(() => [
    { number: 1, title: "Firm Details", icon: <Building className="h-4 w-4" /> },
    { number: 2, title: "AI System", icon: <FileText className="h-4 w-4" /> },
    { number: 3, title: "Risk Profile", icon: <Shield className="h-4 w-4" /> },
    { number: 4, title: "Governance", icon: <Users className="h-4 w-4" /> },
    { number: 5, title: "Evidence", icon: <FileCheck className="h-4 w-4" /> },
    { number: 6, title: "Review", icon: <CheckCircle className="h-4 w-4" /> },
  ], []);

  useEffect(() => {
    const raw = safeLocalStorageGet(DRAFT_KEY);
    const parsed = safeJsonParse<AssessmentFormData>(raw);
    if (parsed) {
      setFormData({ ...DEFAULT_ASSESSMENT_FORM, ...parsed });
      setRestored(true);
      setTimeout(() => setRestored(false), 3500);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const multiFields: Record<string, string[]> = {
      aiCapabilities: [],
      biasTesting: ["No testing conducted", "Unsure"],
      modelDocs: ["None"],
      dataTypes: [],
      regulations: ["None / Unsure"],
      monitoring: ["None"],
    };

    if (type === "checkbox" && name in multiFields) {
      setFormData((prev) => ({
        ...prev,
        [name]: toggleExclusive((prev[name as keyof AssessmentFormData] as string[]) ?? [], value, multiFields[name]),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }

    if (errors[name as keyof AssessmentFormData]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name as keyof AssessmentFormData]; return n; });
    }
    if (errors.form) setErrors((prev) => { const n = { ...prev }; delete n.form; return n; });
    if (saved) setSaved(false);
  };

  const validate = (s: number): { ok: boolean; newErrors: AssessmentErrors } => {
    const e: AssessmentErrors = {};
    if (s === 0 && formData.wantsEmailCopy) {
      const em = formData.contactEmail.trim();
      if (!em) e.contactEmail = "Email required.";
      else if (!isValidEmail(em)) e.contactEmail = "Enter a valid email address.";
    }
    if (s === 1) {
      if (!formData.systemName.trim()) e.systemName = "System name is required.";
      const uc = formData.aiUseCase.trim();
      if (!uc) e.aiUseCase = "AI use case description is required.";
      else if (uc.length < 40) e.aiUseCase = "Please provide more detail (minimum 40 characters).";
      if (formData.usersCount && Number.isNaN(Number(formData.usersCount))) e.usersCount = "Enter a valid number.";
    }
    if (s === 2 && formData.dataVolume && Number.isNaN(Number(formData.dataVolume))) {
      e.dataVolume = "Enter a valid number.";
    }
    return { ok: Object.keys(e).length === 0, newErrors: e };
  };

  const goTo = (i: number) => {
    if (i <= step) { setStep(i); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    for (let s = step; s < i; s++) {
      const { ok, newErrors } = validate(s);
      if (!ok) { setErrors(newErrors); setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    }
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveDraft = () => {
    if (safeLocalStorageSet(DRAFT_KEY, JSON.stringify(formData))) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const progressPct = Math.round(((step + 1) / steps.length) * 100);
  const preliminary = useMemo(() => calculatePreliminaryStatus(formData), [formData]);

  const handleSubmit = async () => {
    for (let i = 0; i < 4; i++) {
      const { ok, newErrors } = validate(i);
      if (!ok) { setErrors(newErrors); setStep(i); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    }
    setSubmitting(true);
    try {
      const payload = { id: makeAssessmentId("risk"), submittedAt: new Date().toISOString(), data: formData };
      if (!safeLocalStorageSet(SUBMISSION_KEY, JSON.stringify(payload))) {
        setErrors({ form: "Unable to submit — storage blocked. Check browser privacy settings." });
        return;
      }
      await new Promise((r) => setTimeout(r, 400));
      router.push("/results");
    } catch {
      setErrors({ form: "An unexpected error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <Container className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-base font-bold text-slate-900">AI Governance Assessment</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Step {step + 1} of {steps.length} — {steps[step].title}
              </p>
            </div>
            <button onClick={saveDraft}
              className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Save className="h-3.5 w-3.5" />
              {saved ? "Draft saved" : "Save draft"}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 w-full rounded-full bg-slate-100">
            <div className="h-1 rounded-full bg-blue-700 transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>

          {/* Step tabs */}
          <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5">
            {steps.map((s, i) => (
              <button key={s.number} onClick={() => goTo(i)}
                className={`flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === step ? "bg-blue-700 text-white" :
                  i < step ? "bg-blue-50 text-blue-700" : "text-slate-400 hover:text-slate-600"
                }`}>
                {s.icon}
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden">{s.number}</span>
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Banners */}
      {restored && (
        <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-center text-xs font-medium text-blue-700">
          Draft restored — your previous progress has been loaded.
        </div>
      )}
      {errors.form && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-xs text-red-700">
          <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
          {errors.form}
        </div>
      )}

      {/* Step content */}
      <Container className="mt-8 max-w-3xl pb-24">
        {step === 0 && <StepFirmDetails data={formData} errors={errors} onChange={handleChange} />}
        {step === 1 && <StepAiSystem data={formData} errors={errors} onChange={handleChange} />}
        {step === 2 && <StepRiskProfile data={formData} errors={errors} onChange={handleChange} />}
        {step === 3 && <StepGovernance data={formData} onChange={handleChange} />}
        {step === 4 && <StepEvidence data={formData} onChange={handleChange} />}
        {step === 5 && <StepReview data={formData} preliminary={preliminary} />}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
          <button onClick={() => goTo(Math.max(step - 1, 0))} disabled={step === 0}
            className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {step < steps.length - 1 ? (
            <button onClick={() => goTo(step + 1)}
              className="flex items-center gap-1.5 rounded-sm bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors">
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1.5 rounded-sm bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              {submitting ? "Submitting…" : "Submit & get my score"}
              {!submitting && <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>
      </Container>
    </div>
  );
}
