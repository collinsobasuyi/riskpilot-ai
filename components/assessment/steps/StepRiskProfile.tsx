"use client";

import React from "react";
import { Shield, AlertTriangle, Database } from "lucide-react";
import { AssessmentFormData, AssessmentErrors } from "../../../lib/risk/schema";
import { Select, TextInput, Hint, Label, CheckboxGroup, RadioGroup } from "../FieldPrimitives";
import { SectionTitle } from "../SectionTitle";

export function StepRiskProfile({
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
        <SectionTitle icon={<Shield className="h-4 w-4" />} title="Decision Authority" subtitle="How much does the AI drive consequential decisions?" />
        <div className="space-y-5">
          <div>
            <Label required>Automation level</Label>
            <RadioGroup name="decisionAuthority" value={data.decisionAuthority}
              onChange={(val) => onChange({ target: { name: "decisionAuthority", value: val, type: "radio" } } as React.ChangeEvent<HTMLInputElement>)}
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
            <RadioGroup name="financialImpactTier" value={data.financialImpactTier}
              onChange={(val) => onChange({ target: { name: "financialImpactTier", value: val, type: "radio" } } as React.ChangeEvent<HTMLInputElement>)}
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
            <RadioGroup name="dataSensitivity" value={data.dataSensitivity}
              onChange={(val) => onChange({ target: { name: "dataSensitivity", value: val, type: "radio" } } as React.ChangeEvent<HTMLInputElement>)}
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
              selected={data.dataTypes ?? []}
              onChange={(val) => onArrayChange("dataTypes", val)} />
          </div>
          <div>
            <Label>Relevant regulatory frameworks (select all that apply)</Label>
            <CheckboxGroup name="regulations"
              options={["GDPR / UK GDPR", "FCA Consumer Duty", "PRA Model Risk (SS1/23)", "ISO 42001", "EU AI Act", "None / Unsure"]}
              selected={data.regulations ?? []}
              onChange={(val) => onArrayChange("regulations", val)} />
          </div>
          <div>
            <Label>Bias testing conducted (select all that apply)</Label>
            <CheckboxGroup name="biasTesting"
              options={["Pre-deployment bias testing", "Ongoing fairness monitoring", "Protected characteristic analysis", "No testing conducted", "Unsure"]}
              selected={data.biasTesting ?? []}
              onChange={(val) => onArrayChange("biasTesting", val)} />
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
