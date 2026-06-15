"use client";

import React from "react";
import { AlertTriangle, FileCheck, ShieldCheck } from "lucide-react";
import { AssessmentFormData } from "../../../lib/risk/schema";
import {
  Select,
  TextInput,
  Textarea,
  Hint,
  Label,
  CheckboxGroup,
  RadioGroup,
} from "../FieldPrimitives";
import { SectionTitle } from "../SectionTitle";
import {
  processesPersonalData,
  usesThirdPartyVendors,
} from "../../../lib/risk/conditionals";

function ConditionalBadge({ rule }: { rule: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
      ⚡ {rule}
    </span>
  );
}

export function StepControlsEvidence({
  data,
  onChange,
  onArrayChange,
}: {
  data: AssessmentFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onArrayChange: (name: string, value: string) => void;
}) {
  const personalData = processesPersonalData(data);
  const thirdParty = usesThirdPartyVendors(data);

  return (
    <div className="space-y-8">
      {/* Risk controls */}
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Risk Controls"
          subtitle="How the system is contained, monitored, and tested."
        />
        <div className="space-y-5">
          <div>
            <Label required>Maximum financial impact if the AI causes harm or fails</Label>
            <RadioGroup
              name="financialImpactTier"
              value={data.financialImpactTier}
              onChange={(val) =>
                onChange({
                  target: { name: "financialImpactTier", value: val, type: "radio" },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              options={[
                { value: "under_100k", label: "Under £100k" },
                { value: "100k_to_1m", label: "£100k – £1m" },
                { value: "over_1m", label: "Over £1m" },
                { value: "legal", label: "Legal / regulatory penalties" },
                { value: "harm", label: "Individual harm — physical, financial, or reputational" },
              ]}
            />
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
            <Label>Bias testing conducted (select all that apply)</Label>
            <CheckboxGroup
              name="biasTesting"
              options={["Pre-deployment bias testing", "Ongoing fairness monitoring", "Protected characteristic analysis", "No testing conducted", "Unsure"]}
              selected={data.biasTesting ?? []}
              onChange={(val) => onArrayChange("biasTesting", val)}
            />
          </div>
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
            <Label>Monitoring tools in use (select all that apply)</Label>
            <CheckboxGroup
              name="monitoring"
              options={["Performance dashboards", "Drift detection", "Alert / paging system", "Manual sampling", "None"]}
              selected={data.monitoring ?? []}
              onChange={(val) => onArrayChange("monitoring", val)}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              name="monitoringHallucination"
              checked={data.monitoringHallucination ?? false}
              onChange={onChange}
              className="h-4 w-4 rounded-sm border-slate-300 text-blue-700"
            />
            <span>We monitor for hallucination / model drift in generative AI outputs</span>
          </label>
        </div>
      </div>

      {/* DPIA — conditional */}
      {personalData && (
        <div className="rounded-sm border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Data Protection (DPIA)"
              subtitle="Required when personal or sensitive data is processed."
            />
            <ConditionalBadge rule="Shown — personal data" />
          </div>
          <div className="space-y-4">
            <div>
              <Label>DPIA status</Label>
              <Hint>A Data Protection Impact Assessment is required under UK GDPR when personal data is processed at scale or with high risk.</Hint>
              <Select name="dpiaStatus" value={data.dpiaStatus ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="yes">Yes — DPIA completed and documented</option>
                <option value="in-progress">In progress — DPIA underway</option>
                <option value="no">No — DPIA not yet completed</option>
                <option value="not-required">Not required — assessed and confirmed out of scope</option>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Vendor due diligence — conditional */}
      {thirdParty && (
        <div className="rounded-sm border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle
              icon={<FileCheck className="h-4 w-4" />}
              title="Vendor Due Diligence"
              subtitle="Required when third-party AI providers or external models are used."
            />
            <ConditionalBadge rule="Shown — third-party vendor" />
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Vendor due diligence status</Label>
                <Select name="vendorDueDiligenceStatus" value={data.vendorDueDiligenceStatus ?? ""} onChange={onChange}>
                  <option value="">Not specified</option>
                  <option value="formal">Formal — documented assessment conducted</option>
                  <option value="informal">Informal — reviewed but not documented</option>
                  <option value="none">None — no due diligence performed</option>
                  <option value="not-applicable">Not applicable</option>
                </Select>
              </div>
              <div>
                <Label>Data processing agreement (DPA) status</Label>
                <Select name="dataProcessingAgreementStatus" value={data.dataProcessingAgreementStatus ?? ""} onChange={onChange}>
                  <option value="">Not specified</option>
                  <option value="yes">Yes — DPA in place with all AI vendors</option>
                  <option value="partial">Partial — DPA with some vendors only</option>
                  <option value="none">No — no DPA in place</option>
                  <option value="not-applicable">Not applicable</option>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation & certification */}
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle
          icon={<FileCheck className="h-4 w-4" />}
          title="Validation & Certification"
          subtitle="Evidence that can be shared with underwriters."
        />
        <div className="space-y-5">
          {[
            {
              name: "hasModelCards",
              label: "Model cards / technical documentation exist",
              hint: "Describes intended use, limitations, training data, and performance metrics",
              urlField: "modelCardsUrl",
              urlPlaceholder: "Link to documentation (optional)",
            },
            {
              name: "hasExternalAudit",
              label: "External audit or certification has been conducted",
              hint: "e.g. ISO 42001, SOC 2, third-party model review",
              urlField: "auditReportUrl",
              urlPlaceholder: "Report URL (optional)",
            },
            {
              name: "hasRedTeaming",
              label: "Red-teaming or adversarial testing has been performed",
              hint: "Deliberate attempts to break or misuse the system to uncover vulnerabilities",
              urlField: "redTeamingReportUrl",
              urlPlaceholder: "Report URL (optional)",
            },
          ].map((item) => (
            <div key={item.name} className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name={item.name}
                  checked={data[item.name as keyof AssessmentFormData] as boolean}
                  onChange={onChange}
                  className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-blue-700"
                />
                <div>
                  <span className="font-medium text-slate-900">{item.label}</span>
                  <p className="text-xs text-slate-500">{item.hint}</p>
                </div>
              </label>
              {data[item.name as keyof AssessmentFormData] && (
                <div className="ml-7">
                  <TextInput
                    name={item.urlField}
                    value={(data[item.urlField as keyof AssessmentFormData] as string) ?? ""}
                    onChange={onChange}
                    placeholder={item.urlPlaceholder}
                  />
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

      {/* Additional context */}
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle
          icon={<FileCheck className="h-4 w-4" />}
          title="Additional Context"
        />
        <div>
          <Label>Anything else relevant to this assessment?</Label>
          <Hint>e.g. upcoming regulatory submissions, known issues, recent model changes</Hint>
          <Textarea
            name="additionalContext"
            value={data.additionalContext}
            onChange={onChange}
            rows={3}
            placeholder="Optional — add context that would help assess your AI system accurately."
          />
        </div>
      </div>
    </div>
  );
}
