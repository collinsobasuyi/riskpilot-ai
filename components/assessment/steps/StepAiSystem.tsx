"use client";

import React from "react";
import { FileText, Database } from "lucide-react";
import { AssessmentFormData, AssessmentErrors } from "../../../lib/risk/schema";
import { Select, TextInput, Textarea, Hint, Label, CheckboxGroup } from "../FieldPrimitives";
import { SectionTitle } from "../SectionTitle";

export function StepAiSystem({
  data,
  errors,
  onChange,
  onArrayChange,
}: {
  data: AssessmentFormData;
  errors: AssessmentErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onArrayChange: (name: string, value: string) => void;
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
              selected={data.aiCapabilities ?? []}
              onChange={(val) => onArrayChange("aiCapabilities", val)} />
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
