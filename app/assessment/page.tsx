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
  AlertTriangle,
  FileText,
  FileCheck,
  Eye,
  Database,
  Globe,
} from "lucide-react";

import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";

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

// ─── small helpers ───────────────────────────────────────────────────────────

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
    <label className="mb-1 block text-sm font-medium text-zinc-800">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs text-zinc-500">{children}</p>;
}

function Select({
  name,
  value,
  onChange,
  children,
  error,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-400 bg-red-50" : "border-zinc-300 bg-white"
        }`}
      >
        {children}
      </select>
      <FieldError msg={error} />
    </>
  );
}

function TextInput({
  name,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}) {
  return (
    <>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-400 bg-red-50" : "border-zinc-300 bg-white"
        }`}
      />
      <FieldError msg={error} />
    </>
  );
}

function Textarea({
  name,
  value,
  onChange,
  placeholder,
  error,
  rows = 3,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
}) {
  return (
    <>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
          error ? "border-red-400 bg-red-50" : "border-zinc-300 bg-white"
        }`}
      />
      <FieldError msg={error} />
    </>
  );
}

function CheckboxGroup({
  name,
  options,
  selected,
  onChange,
}: {
  name: string;
  options: string[];
  selected: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={selected.includes(opt)}
            onChange={onChange}
            className="h-4 w-4 rounded border-zinc-300 text-blue-600"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string; hint?: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
            value === opt.value
              ? "border-blue-500 bg-blue-50"
              : "border-zinc-200 bg-white hover:border-zinc-300"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            className="mt-0.5 h-4 w-4 text-blue-600"
          />
          <div>
            <span className="font-medium text-zinc-900">{opt.label}</span>
            {opt.hint && <p className="mt-0.5 text-xs text-zinc-500">{opt.hint}</p>}
          </div>
        </label>
      ))}
    </div>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepFirmDetails({
  data,
  errors,
  onChange,
}: {
  data: AssessmentFormData;
  errors: AssessmentErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card title="About Your Organisation" icon={<Building className="h-5 w-5 text-blue-600" />}>
        <div className="space-y-4">
          <div>
            <Label>Company Name</Label>
            <TextInput name="companyName" value={data.companyName} onChange={onChange} placeholder="e.g. Acme Financial Ltd" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label required>Industry Sector</Label>
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
              <Label required>Company Size</Label>
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
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                name="regulatedEntity"
                checked={data.regulatedEntity}
                onChange={onChange}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600"
              />
              <span>This is an FCA / PRA regulated entity</span>
            </label>
          </div>

          {data.regulatedEntity && (
            <div>
              <Label>Primary Regulator</Label>
              <Select name="regulator" value={data.regulator ?? "none"} onChange={onChange}>
                <option value="fca">FCA</option>
                <option value="pra">PRA</option>
                <option value="both">FCA + PRA</option>
                <option value="other">Other</option>
                <option value="none">Not sure</option>
              </Select>
            </div>
          )}

          <div>
            <Label>What is the main purpose of this assessment? (optional)</Label>
            <Hint>e.g. insurance renewal, internal audit, regulatory prep</Hint>
            <TextInput name="purpose" value={data.purpose ?? ""} onChange={onChange} placeholder="Insurance renewal preparation" />
          </div>
        </div>
      </Card>

      <Card title="Contact (optional)" icon={<Globe className="h-5 w-5 text-blue-600" />}>
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              name="wantsEmailCopy"
              checked={data.wantsEmailCopy}
              onChange={onChange}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600"
            />
            <span>Send me a copy of the results by email</span>
          </label>

          {data.wantsEmailCopy && (
            <div>
              <Label required>Email address</Label>
              <TextInput
                type="email"
                name="contactEmail"
                value={data.contactEmail}
                onChange={onChange}
                placeholder="you@firm.com"
                error={errors.contactEmail}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StepAiSystem({
  data,
  errors,
  onChange,
}: {
  data: AssessmentFormData;
  errors: AssessmentErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card title="AI System Details" icon={<FileText className="h-5 w-5 text-blue-600" />}>
        <div className="space-y-4">
          <div>
            <Label required>System / Model Name</Label>
            <TextInput
              name="systemName"
              value={data.systemName}
              onChange={onChange}
              placeholder="e.g. Credit Scoring Engine v2"
              error={errors.systemName}
            />
          </div>

          <div>
            <Label required>Describe what this AI system does</Label>
            <Hint>Be specific — what decisions does it make, what data does it use, who is affected? (min 40 characters)</Hint>
            <Textarea
              name="aiUseCase"
              value={data.aiUseCase}
              onChange={onChange}
              placeholder="e.g. Scores consumer credit applications using income, credit history, and behavioural data. Output is a approve/decline recommendation passed to an underwriter."
              error={errors.aiUseCase}
              rows={4}
            />
            <p className="mt-1 text-right text-xs text-zinc-400">{data.aiUseCase.length} / 40 min</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>AI Maturity Stage</Label>
              <Select name="aiMaturity" value={data.aiMaturity} onChange={onChange}>
                <option value="pre-production">Pre-production / Testing</option>
                <option value="production">In production</option>
                <option value="multiple">Multiple models in production</option>
                <option value="decommissioning">Being decommissioned</option>
              </Select>
            </div>

            <div>
              <Label>Deployment Type</Label>
              <Select name="deploymentType" value={data.deploymentType} onChange={onChange}>
                <option value="internal">Internal only</option>
                <option value="customer">Customer-facing</option>
                <option value="both">Internal + Customer-facing</option>
                <option value="third-party-api">Via third-party API</option>
                <option value="self-hosted">Self-hosted</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Approx. number of users / decisions per day</Label>
              <TextInput
                name="usersCount"
                value={data.usersCount}
                onChange={onChange}
                placeholder="e.g. 500"
                error={errors.usersCount}
              />
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
        </div>
      </Card>

      <Card title="Model Lineage" icon={<Database className="h-5 w-5 text-blue-600" />}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Foundation Model / Source</Label>
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
              <Label>Model Hosting</Label>
              <Select name="modelHosting" value={data.modelHosting ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="self-hosted">Self-hosted</option>
                <option value="vendor-hosted">Vendor-hosted</option>
                <option value="cloud-provider">Cloud provider (AWS/Azure/GCP)</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Retraining / Update Frequency</Label>
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
            <Label>Business Criticality</Label>
            <Select name="criticality" value={data.criticality ?? ""} onChange={onChange}>
              <option value="">Not specified</option>
              <option value="minor">Minor — low impact if unavailable</option>
              <option value="disruption">Operational disruption if unavailable</option>
              <option value="regulatory">Regulatory obligations depend on it</option>
              <option value="customer">Customer outcomes directly depend on it</option>
            </Select>
          </div>

          <div>
            <Label>AI Capabilities (select all that apply)</Label>
            <CheckboxGroup
              name="aiCapabilities"
              options={["Classification", "Regression / prediction", "Generative / LLM", "Recommendation", "Computer vision", "NLP / text analysis", "Anomaly detection"]}
              selected={data.aiCapabilities ?? []}
              onChange={onChange}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepRiskProfile({
  data,
  errors,
  onChange,
}: {
  data: AssessmentFormData;
  errors: AssessmentErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card title="Decision Authority" icon={<Shield className="h-5 w-5 text-blue-600" />}>
        <div className="space-y-4">
          <div>
            <Label required>How much does the AI drive decisions?</Label>
            <RadioGroup
              name="decisionAuthority"
              value={data.decisionAuthority}
              onChange={onChange}
              options={[
                { value: "none", label: "No automation", hint: "AI provides information only — humans decide" },
                { value: "partial", label: "Partial automation", hint: "AI recommends; human reviews before action" },
                { value: "full", label: "Full automation", hint: "AI decides and acts with no human in the loop" },
              ]}
            />
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
        </div>
      </Card>

      <Card title="Impact & Exposure" icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}>
        <div className="space-y-4">
          <div>
            <Label required>Maximum financial impact if the AI fails or causes harm</Label>
            <RadioGroup
              name="financialImpactTier"
              value={data.financialImpactTier}
              onChange={onChange}
              options={[
                { value: "under_100k", label: "Under £100k" },
                { value: "100k_to_1m", label: "£100k – £1m" },
                { value: "over_1m", label: "Over £1m" },
                { value: "legal", label: "Legal / regulatory penalties" },
                { value: "harm", label: "Individual harm (physical, financial, reputational)" },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Blast radius / systematic risk</Label>
              <Select name="systematicRisk" value={data.systematicRisk ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="isolated">Isolated — affects one transaction at a time</option>
                <option value="batch">Batch — affects groups of customers</option>
                <option value="global">Global — affects all customers / the whole product</option>
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
      </Card>

      <Card title="Data" icon={<Database className="h-5 w-5 text-blue-600" />}>
        <div className="space-y-4">
          <div>
            <Label required>Data sensitivity</Label>
            <RadioGroup
              name="dataSensitivity"
              value={data.dataSensitivity}
              onChange={onChange}
              options={[
                { value: "none", label: "No personal data", hint: "Aggregated or synthetic data only" },
                { value: "basic", label: "Basic personal data", hint: "Names, contact details, behavioural data" },
                { value: "sensitive", label: "Special category / sensitive data", hint: "Health, financial records, biometrics, credit data" },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Approx. records processed per day</Label>
              <TextInput
                name="dataVolume"
                value={data.dataVolume}
                onChange={onChange}
                placeholder="e.g. 10000"
                error={errors.dataVolume}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  name="thirdPartyData"
                  checked={data.thirdPartyData}
                  onChange={onChange}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600"
                />
                <span>Uses third-party data sources</span>
              </label>
            </div>
          </div>

          <div>
            <Label>Data types processed (select all that apply)</Label>
            <CheckboxGroup
              name="dataTypes"
              options={["Financial data", "Credit data", "Health data", "Location data", "Behavioural data", "Biometric data", "Communications data"]}
              selected={data.dataTypes ?? []}
              onChange={onChange}
            />
          </div>

          <div>
            <Label>Relevant regulations (select all that apply)</Label>
            <CheckboxGroup
              name="regulations"
              options={["GDPR / UK GDPR", "FCA Consumer Duty", "PRA Model Risk (SS1/23)", "ISO 42001", "EU AI Act", "None / Unsure"]}
              selected={data.regulations ?? []}
              onChange={onChange}
            />
          </div>

          <div>
            <Label>Model explainability</Label>
            <Select name="explainabilityType" value={data.explainabilityType ?? ""} onChange={onChange}>
              <option value="">Not specified</option>
              <option value="black-box">Black box — output only, no explanation</option>
              <option value="interpretable">Interpretable — can explain in plain terms</option>
              <option value="fully-transparent">Fully transparent — decision logic is auditable</option>
            </Select>
          </div>

          <div>
            <Label>Bias testing (select all that apply)</Label>
            <CheckboxGroup
              name="biasTesting"
              options={["Pre-deployment bias testing", "Ongoing fairness monitoring", "Protected characteristic analysis", "No testing conducted", "Unsure"]}
              selected={data.biasTesting ?? []}
              onChange={onChange}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepGovernance({
  data,
  onChange,
}: {
  data: AssessmentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card title="Oversight & Controls" icon={<Users className="h-5 w-5 text-blue-600" />}>
        <div className="space-y-4">
          <div>
            <Label required>Human oversight level</Label>
            <RadioGroup
              name="existingOversight"
              value={data.existingOversight}
              onChange={onChange}
              options={[
                { value: "none", label: "No oversight", hint: "No formal monitoring in place" },
                { value: "periodic", label: "Periodic review", hint: "Regular scheduled reviews" },
                { value: "continuous", label: "Continuous monitoring", hint: "Real-time dashboards and alerting" },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" name="documentedProcess" checked={data.documentedProcess} onChange={onChange} className="h-4 w-4 rounded border-zinc-300 text-blue-600" />
                <span>We have a documented AI governance process</span>
              </label>
            </div>
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" name="hasDpo" checked={data.hasDpo} onChange={onChange} className="h-4 w-4 rounded border-zinc-300 text-blue-600" />
                <span>We have a Data Protection Officer (DPO)</span>
              </label>
            </div>
          </div>

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
            <Label>Kill switch / emergency stop capability</Label>
            <Select name="killSwitch" value={data.killSwitch ?? ""} onChange={onChange}>
              <option value="">Not specified</option>
              <option value="automated">Automated — triggers automatically on anomaly</option>
              <option value="manual-instant">Manual — can stop within minutes</option>
              <option value="manual-slow">Manual — takes hours to stop</option>
              <option value="code-deploy">Requires a code deployment to stop</option>
              <option value="none">No kill switch</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card title="Audit & Change Management" icon={<Eye className="h-5 w-5 text-blue-600" />}>
        <div className="space-y-4">
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
              <option value="staged-gates">Staged gates — testing, sign-off, rollout</option>
            </Select>
          </div>

          <div>
            <Label>External verification</Label>
            <Select name="externalVerification" value={data.externalVerification ?? ""} onChange={onChange}>
              <option value="">Not specified</option>
              <option value="none">Internal only</option>
              <option value="external-audit">External audit or third-party review</option>
            </Select>
          </div>

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

          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" name="monitoringHallucination" checked={data.monitoringHallucination ?? false} onChange={onChange} className="h-4 w-4 rounded border-zinc-300 text-blue-600" />
              <span>We monitor for hallucination / model drift in generative AI outputs</span>
            </label>
          </div>

          <div>
            <Label>Monitoring tools in use (select all that apply)</Label>
            <CheckboxGroup
              name="monitoring"
              options={["Performance dashboards", "Drift detection", "Alert / paging system", "Manual sampling", "None"]}
              selected={data.monitoring ?? []}
              onChange={onChange}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepEvidence({
  data,
  onChange,
}: {
  data: AssessmentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card title="Documentation & Validation" icon={<FileCheck className="h-5 w-5 text-blue-600" />}>
        <div className="space-y-4">
          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-700">
              <input type="checkbox" name="hasModelCards" checked={data.hasModelCards ?? false} onChange={onChange} className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600" />
              <div>
                <span className="font-medium">Model cards / technical documentation exist</span>
                <p className="text-xs text-zinc-500">Describes intended use, limitations, training data, and performance metrics</p>
              </div>
            </label>
            {data.hasModelCards && (
              <div className="mt-2">
                <TextInput name="modelCardsUrl" value={data.modelCardsUrl ?? ""} onChange={onChange} placeholder="Link to documentation (optional)" />
              </div>
            )}
          </div>

          <div>
            <Label>Model documentation in place (select all that apply)</Label>
            <CheckboxGroup
              name="modelDocs"
              options={["Model card", "Risk assessment", "Data lineage doc", "Performance benchmarks", "Bias / fairness report", "None"]}
              selected={data.modelDocs ?? []}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-700">
              <input type="checkbox" name="hasExternalAudit" checked={data.hasExternalAudit ?? false} onChange={onChange} className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600" />
              <div>
                <span className="font-medium">External audit or certification has been conducted</span>
                <p className="text-xs text-zinc-500">e.g. ISO 42001, SOC 2, third-party model review</p>
              </div>
            </label>
            {data.hasExternalAudit && (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Select name="externalAuditType" value={data.externalAuditType ?? ""} onChange={onChange}>
                  <option value="">Select type</option>
                  <option value="iso42001">ISO 42001</option>
                  <option value="soc2">SOC 2</option>
                  <option value="pending">Pending</option>
                  <option value="none">Other</option>
                </Select>
                <TextInput name="auditReportUrl" value={data.auditReportUrl ?? ""} onChange={onChange} placeholder="Report URL (optional)" />
              </div>
            )}
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-700">
              <input type="checkbox" name="hasRedTeaming" checked={data.hasRedTeaming ?? false} onChange={onChange} className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600" />
              <div>
                <span className="font-medium">Red-teaming or adversarial testing has been performed</span>
                <p className="text-xs text-zinc-500">Deliberate attempts to break or misuse the system</p>
              </div>
            </label>
            {data.hasRedTeaming && (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <TextInput name="redTeamingDate" value={data.redTeamingDate ?? ""} onChange={onChange} placeholder="Date (e.g. 2024-Q3)" />
                <TextInput name="redTeamingReportUrl" value={data.redTeamingReportUrl ?? ""} onChange={onChange} placeholder="Report URL (optional)" />
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="Additional Context" icon={<FileText className="h-5 w-5 text-blue-600" />}>
        <div className="space-y-4">
          <div>
            <Label>Anything else relevant for the assessment?</Label>
            <Hint>e.g. upcoming regulatory submissions, known issues, recent changes to the model</Hint>
            <Textarea
              name="additionalContext"
              value={data.additionalContext}
              onChange={onChange}
              placeholder="Optional — add any context that would help us assess your AI system accurately."
              rows={4}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepReview({
  data,
  preliminaryStatus,
}: {
  data: AssessmentFormData;
  preliminaryStatus: ReturnType<typeof calculatePreliminaryStatus>;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Company", value: data.companyName || "—" },
    { label: "Industry", value: data.industry },
    { label: "Company size", value: data.companySize },
    { label: "Regulated entity", value: data.regulatedEntity ? `Yes (${data.regulator ?? "—"})` : "No" },
    { label: "AI system", value: data.systemName || "—" },
    { label: "Maturity", value: data.aiMaturity },
    { label: "Deployment", value: data.deploymentType },
    { label: "Decision authority", value: data.decisionAuthority },
    { label: "Financial impact", value: data.financialImpactTier },
    { label: "Data sensitivity", value: data.dataSensitivity },
    { label: "Oversight", value: data.existingOversight },
    { label: "Documented process", value: data.documentedProcess ? "Yes" : "No" },
    { label: "External audit", value: data.hasExternalAudit ? "Yes" : "No" },
  ];

  return (
    <div className="space-y-6">
      <Card title="Preliminary Insurability Signal" icon={<Shield className="h-5 w-5 text-blue-600" />}>
        <div className={`rounded-lg border p-4 ${preliminaryStatus.bgColor} ${preliminaryStatus.borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg font-bold ${preliminaryStatus.statusColor}`}>
                {preliminaryStatus.status}
              </p>
              <p className="text-sm text-zinc-600">Preliminary signal — full score calculated on submission</p>
            </div>
            <div className={`text-3xl font-bold ${preliminaryStatus.statusColor}`}>
              {Math.max(0, preliminaryStatus.score)}
            </div>
          </div>

          {preliminaryStatus.concerns.length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Key concerns flagged</p>
              {preliminaryStatus.concerns.map((c) => (
                <div key={c} className="flex items-start gap-2 text-sm text-zinc-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card title="Your Answers" icon={<FileText className="h-5 w-5 text-blue-600" />}>
        <div className="divide-y divide-zinc-100">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 text-sm">
              <span className="text-zinc-500">{label}</span>
              <span className="font-medium text-zinc-900 text-right max-w-[55%] capitalize">{value.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-400">
          Go back to any step to edit your answers before submitting.
        </p>
      </Card>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<AssessmentErrors>({});
  const [savedProgress, setSavedProgress] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [formData, setFormData] = useState<AssessmentFormData>(DEFAULT_ASSESSMENT_FORM);

  const steps = useMemo(
    () => [
      { number: 1, title: "Firm Details", icon: <Building className="h-4 w-4" /> },
      { number: 2, title: "AI System", icon: <FileText className="h-4 w-4" /> },
      { number: 3, title: "Risk Profile", icon: <Shield className="h-4 w-4" /> },
      { number: 4, title: "Governance", icon: <Users className="h-4 w-4" /> },
      { number: 5, title: "Evidence", icon: <FileCheck className="h-4 w-4" /> },
      { number: 6, title: "Review", icon: <CheckCircle className="h-4 w-4" /> },
    ],
    []
  );

  useEffect(() => {
    const raw = safeLocalStorageGet(DRAFT_KEY);
    const parsed = safeJsonParse<AssessmentFormData>(raw);
    if (parsed) {
      setFormData({ ...DEFAULT_ASSESSMENT_FORM, ...parsed });
      setRestoredDraft(true);
      setTimeout(() => setRestoredDraft(false), 3500);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox" && name === "aiCapabilities") {
      setFormData((prev) => ({ ...prev, aiCapabilities: toggleExclusive(prev.aiCapabilities ?? [], value, []) }));
    } else if (type === "checkbox" && name === "biasTesting") {
      setFormData((prev) => ({ ...prev, biasTesting: toggleExclusive(prev.biasTesting ?? [], value, ["No testing conducted", "Unsure"]) }));
    } else if (type === "checkbox" && name === "modelDocs") {
      setFormData((prev) => ({ ...prev, modelDocs: toggleExclusive(prev.modelDocs ?? [], value, ["None"]) }));
    } else if (type === "checkbox" && name === "dataTypes") {
      setFormData((prev) => ({ ...prev, dataTypes: toggleExclusive(prev.dataTypes ?? [], value, []) }));
    } else if (type === "checkbox" && name === "regulations") {
      setFormData((prev) => ({ ...prev, regulations: toggleExclusive(prev.regulations ?? [], value, ["None / Unsure"]) }));
    } else if (type === "checkbox" && name === "monitoring") {
      setFormData((prev) => ({ ...prev, monitoring: toggleExclusive(prev.monitoring ?? [], value, ["None"]) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }

    if (errors[name as keyof AssessmentFormData]) {
      setErrors((prev) => { const next = { ...prev }; delete next[name as keyof AssessmentFormData]; return next; });
    }
    if (errors.form) {
      setErrors((prev) => { const next = { ...prev }; delete next.form; return next; });
    }
    if (savedProgress) setSavedProgress(false);
  };

  const validateStep = (step: number): { ok: boolean; newErrors: AssessmentErrors } => {
    const newErrors: AssessmentErrors = {};

    if (step === 0 && formData.wantsEmailCopy) {
      const email = formData.contactEmail.trim();
      if (!email) newErrors.contactEmail = "Email is required if you want a copy.";
      else if (!isValidEmail(email)) newErrors.contactEmail = "Please enter a valid email address.";
    }

    if (step === 1) {
      if (!formData.systemName.trim()) newErrors.systemName = "System name is required";
      const useCase = formData.aiUseCase.trim();
      if (!useCase) newErrors.aiUseCase = "AI use case is required";
      else if (useCase.length < 40) newErrors.aiUseCase = "Please add more detail (minimum 40 characters)";
      if (formData.usersCount && Number.isNaN(Number(formData.usersCount))) newErrors.usersCount = "Please enter a valid number";
    }

    if (step === 2 && formData.dataVolume && Number.isNaN(Number(formData.dataVolume))) {
      newErrors.dataVolume = "Please enter a valid number";
    }

    return { ok: Object.keys(newErrors).length === 0, newErrors };
  };

  const goToStep = (index: number) => {
    if (index <= currentStep) {
      setCurrentStep(index);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    for (let s = currentStep; s < index; s++) {
      const { ok, newErrors } = validateStep(s);
      if (!ok) {
        setErrors(newErrors);
        setCurrentStep(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => goToStep(Math.min(currentStep + 1, steps.length - 1));
  const handlePrevious = () => goToStep(Math.max(currentStep - 1, 0));

  const handleSaveProgress = () => {
    const ok = safeLocalStorageSet(DRAFT_KEY, JSON.stringify(formData));
    if (ok) {
      setSavedProgress(true);
      setTimeout(() => setSavedProgress(false), 3000);
    } else {
      setErrors({ form: "Unable to save progress. Please check browser privacy settings." });
    }
  };

  const progressPct = Math.round(((currentStep + 1) / steps.length) * 100);
  const preliminaryStatus = useMemo(() => calculatePreliminaryStatus(formData), [formData]);

  const handleSubmit = async () => {
    for (let i = 0; i < 4; i++) {
      const { ok, newErrors } = validateStep(i);
      if (!ok) {
        setErrors(newErrors);
        setCurrentStep(i);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const submissionId = makeAssessmentId("risk");
      const payload = { id: submissionId, submittedAt: new Date().toISOString(), data: formData };
      const ok = safeLocalStorageSet(SUBMISSION_KEY, JSON.stringify(payload));
      if (!ok) {
        setErrors({ form: "Unable to submit (storage blocked). Please check browser privacy settings." });
        return;
      }
      await new Promise((r) => setTimeout(r, 450));
      router.push("/results");
    } catch (err) {
      console.error(err);
      setErrors({ form: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <Container className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-zinc-900">AI Insurability Assessment</h1>
              <p className="text-sm text-zinc-500">Step {currentStep + 1} of {steps.length} — {steps[currentStep].title}</p>
            </div>
            <button
              onClick={handleSaveProgress}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 transition"
            >
              <Save className="h-4 w-4" />
              {savedProgress ? "Saved!" : "Save draft"}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100">
            <div
              className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Step tabs */}
          <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
            {steps.map((step, i) => (
              <button
                key={step.number}
                onClick={() => goToStep(i)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  i === currentStep
                    ? "bg-blue-600 text-white"
                    : i < currentStep
                    ? "bg-blue-50 text-blue-700"
                    : "text-zinc-400"
                }`}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.number}</span>
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Restored draft banner */}
      {restoredDraft && (
        <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-center text-sm text-blue-700">
          Draft restored — your previous progress has been loaded.
        </div>
      )}

      {/* Form error */}
      {errors.form && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-700">
          <AlertCircle className="mr-1 inline h-4 w-4" />
          {errors.form}
        </div>
      )}

      {/* Step content */}
      <Container className="mt-8 max-w-3xl">
        {currentStep === 0 && <StepFirmDetails data={formData} errors={errors} onChange={handleChange} />}
        {currentStep === 1 && <StepAiSystem data={formData} errors={errors} onChange={handleChange} />}
        {currentStep === 2 && <StepRiskProfile data={formData} errors={errors} onChange={handleChange} />}
        {currentStep === 3 && <StepGovernance data={formData} onChange={handleChange} />}
        {currentStep === 4 && <StepEvidence data={formData} onChange={handleChange} />}
        {currentStep === 5 && <StepReview data={formData} preliminaryStatus={preliminaryStatus} />}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-6 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Submitting…" : "Submit & get my score"}
              {!isSubmitting && <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>
      </Container>
    </div>
  );
}
