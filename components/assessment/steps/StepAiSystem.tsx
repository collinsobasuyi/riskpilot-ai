"use client";

import React from "react";
import { Building, FileText, Database, CheckCircle2 } from "lucide-react";
import {
  AssessmentFormData,
  AssessmentErrors,
  AssessmentPurpose,
} from "../../../lib/risk/schema";
import {
  Select,
  TextInput,
  Textarea,
  Hint,
  Label,
  RadioGroup,
} from "../FieldPrimitives";
import { SectionTitle } from "../SectionTitle";
import {
  usesThirdPartyVendors,
  isInsurancePurpose,
} from "../../../lib/risk/conditionals";

const PURPOSE_OPTIONS: { value: AssessmentPurpose; label: string }[] = [
  { value: "insurance-renewal", label: "Insurance renewal" },
  { value: "broker-review", label: "Broker review" },
  { value: "cyber-pi-review", label: "Cyber / PI / D&O" },
  { value: "internal-audit", label: "Internal audit" },
  { value: "compliance-review", label: "Compliance review" },
  { value: "other", label: "Other" },
];

const AI_CAPABILITIES: { value: string; desc: string }[] = [
  { value: "Classification", desc: "Group or label records based on patterns" },
  { value: "Regression / prediction", desc: "Estimate an outcome, score, or future value" },
  { value: "Generative / LLM", desc: "Generate text, summaries, or recommendations" },
  { value: "Recommendation", desc: "Suggest actions or content to users" },
  { value: "Computer vision", desc: "Analyse images, video, or documents" },
  { value: "NLP / text analysis", desc: "Extract meaning or sentiment from text" },
  { value: "Anomaly detection", desc: "Identify unusual patterns or outliers" },
];

function SectionProgress({ data }: { data: AssessmentFormData }) {
  const orgComplete = !!data.companyName.trim() && !!data.industry;
  const aiComplete = !!data.systemName.trim() && !!data.aiUseCase.trim();
  const modelComplete = !!data.foundationModelSource || data.dataSensitivity !== "none";

  return (
    <div className="mb-6 flex flex-wrap gap-4 rounded-sm border border-slate-100 bg-slate-50 px-4 py-3">
      {[
        { label: "Organisation", done: orgComplete },
        { label: "AI System", done: aiComplete },
        { label: "Model & Data", done: modelComplete },
      ].map((s) => (
        <div key={s.label} className="flex items-center gap-1.5 text-xs">
          {s.done ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
          ) : (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 shrink-0" />
          )}
          <span className={s.done ? "font-medium text-slate-700" : "text-slate-400"}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function StepAiSystem({
  data,
  errors,
  onChange,
  onArrayChange,
}: {
  data: AssessmentFormData;
  errors: AssessmentErrors;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onArrayChange: (name: string, value: string) => void;
}) {
  const selectedPurposes = data.assessmentPurpose ?? [];

  return (
    <div className="space-y-8">
      <SectionProgress data={data} />

      {/* Organisation */}
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle
          icon={<Building className="h-4 w-4" />}
          title="Organisation"
          subtitle="Determines applicable regulatory, insurance, and benchmark context for your assessment."
        />
        <div className="space-y-5">
          <div>
            <Label required>Legal entity name</Label>
            <TextInput
              name="companyName"
              value={data.companyName}
              onChange={onChange}
              placeholder="e.g. Acme Financial Ltd"
              error={errors.companyName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label required>Industry sector</Label>
              <Select
                name="industry"
                value={data.industry}
                onChange={onChange}
                error={errors.industry}
              >
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
              <Label>Firm size</Label>
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
              <input
                type="checkbox"
                name="regulatedEntity"
                checked={data.regulatedEntity}
                onChange={onChange}
                className="h-4 w-4 rounded-sm border-slate-300 text-blue-700"
              />
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
                <option value="other">Other regulator</option>
                <option value="none">Not sure</option>
              </Select>
            </div>
          )}
          <div>
            <Label>Assessment purpose</Label>
            <Hint>Select all that apply — personalises the questions shown.</Hint>
            <div className="flex flex-wrap gap-2 mt-1">
              {PURPOSE_OPTIONS.map((opt) => {
                const selected = selectedPurposes.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onArrayChange("assessmentPurpose", opt.value)}
                    className={`rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {selected && <span className="mr-1.5">✓</span>}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI System */}
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle
          icon={<FileText className="h-4 w-4" />}
          title="AI System"
          subtitle="Identifies customer impact, decision risk, and operating context — the core risk signals."
        />
        <div className="space-y-5">
          <div>
            <Label required>System / model name</Label>
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
            <Hint>What decisions does it make, what data does it use, who is affected?</Hint>
            <Textarea
              name="aiUseCase"
              value={data.aiUseCase}
              onChange={onChange}
              rows={3}
              placeholder="e.g. Scores consumer credit applications using income and credit history. Produces a recommend/decline output passed to an underwriter."
              error={errors.aiUseCase}
            />
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
              <Label>Deployment scope</Label>
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
              <TextInput name="usersCount" value={data.usersCount} onChange={onChange} placeholder="e.g. 500" />
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
            <div className="grid gap-2 sm:grid-cols-2">
              {AI_CAPABILITIES.map((cap) => {
                const checked = (data.aiCapabilities ?? []).includes(cap.value);
                return (
                  <label
                    key={cap.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-sm border p-3 transition-colors ${
                      checked
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onArrayChange("aiCapabilities", cap.value)}
                      className="mt-0.5 accent-blue-700 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{cap.value}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{cap.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Model & Data */}
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle
          icon={<Database className="h-4 w-4" />}
          title="Model, Data & Vendors"
          subtitle="Assesses model risk, data protection exposure, vendor dependency, and evidence requirements."
        />
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
          <div>
            <Label required>Data sensitivity</Label>
            <RadioGroup
              name="dataSensitivity"
              value={data.dataSensitivity}
              onChange={(val) =>
                onChange({
                  target: { name: "dataSensitivity", value: val, type: "radio" },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              options={[
                { value: "none", label: "No personal data", hint: "Aggregated or synthetic data only" },
                { value: "basic", label: "Basic personal data", hint: "Names, contact details, behavioural data" },
                { value: "sensitive", label: "Sensitive personal data", hint: "Health, financial records, biometrics, credit data" },
              ]}
            />
          </div>
          <div>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                name="thirdPartyData"
                checked={data.thirdPartyData}
                onChange={onChange}
                className="h-4 w-4 rounded-sm border-slate-300 text-blue-700"
              />
              <span>This system uses or shares third-party data</span>
            </label>
          </div>
          {usesThirdPartyVendors(data) && (
            <div>
              <Label>Third-party AI vendor(s)</Label>
              <Hint>Name the vendor(s) and describe how they are used in this system.</Hint>
              <TextInput
                name="thirdPartyVendors"
                value={data.thirdPartyVendors ?? ""}
                onChange={onChange}
                placeholder="e.g. OpenAI GPT-4o via API for document summarisation"
              />
            </div>
          )}
          {isInsurancePurpose(data) && (
            <div>
              <Label>Does your current PI or D&amp;O policy cover AI-related claims?</Label>
              <Hint>Check your policy wording or ask your broker. Many legacy policies contain silent exclusions for AI errors.</Hint>
              <Select name="aiCoverageCheck" value={data.aiCoverageCheck ?? ""} onChange={onChange}>
                <option value="">Not checked / unsure</option>
                <option value="covered">Yes — confirmed AI is covered by existing policy</option>
                <option value="uncertain">Uncertain — haven&apos;t checked policy wording</option>
                <option value="gap-identified">Gap identified — AI not fully covered</option>
                <option value="no-coverage">No relevant PI or D&amp;O coverage in place</option>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
