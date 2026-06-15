"use client";

import React from "react";
import { Shield, Users, FileCheck } from "lucide-react";
import { AssessmentFormData } from "../../../lib/risk/schema";
import {
  Select,
  Hint,
  Label,
  CheckboxGroup,
  RadioGroup,
} from "../FieldPrimitives";
import { SectionTitle } from "../SectionTitle";
import {
  isCustomerFacing,
  isFinancialRegulated,
} from "../../../lib/risk/conditionals";

function ConditionalBadge({ rule }: { rule: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
      ⚡ {rule}
    </span>
  );
}

export function StepGovernance({
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
  const customerFacing = isCustomerFacing(data);
  const financialRegulated = isFinancialRegulated(data);

  return (
    <div className="space-y-8">
      {/* Core governance */}
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle
          icon={<Shield className="h-4 w-4" />}
          title="AI Governance"
          subtitle="Core controls and accountability for this AI system."
        />
        <div className="space-y-5">
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
            <Label required>Automation level</Label>
            <RadioGroup
              name="decisionAuthority"
              value={data.decisionAuthority}
              onChange={(val) =>
                onChange({
                  target: { name: "decisionAuthority", value: val, type: "radio" },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              options={[
                { value: "none", label: "No automation", hint: "AI provides information only — humans make all decisions" },
                { value: "partial", label: "Partial automation", hint: "AI recommends; a human reviews and approves before action" },
                { value: "full", label: "Full automation", hint: "AI decides and acts without a human in the loop" },
              ]}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Human oversight level</Label>
              <Select name="existingOversight" value={data.existingOversight} onChange={onChange}>
                <option value="none">No formal oversight</option>
                <option value="periodic">Periodic review</option>
                <option value="continuous">Continuous monitoring</option>
              </Select>
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
          <div className="grid gap-4 sm:grid-cols-2">
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
              <Label>Incident history</Label>
              <Select name="incidentHistory" value={data.incidentHistory} onChange={onChange}>
                <option value="none">No incidents</option>
                <option value="minor">Minor incidents only</option>
                <option value="significant">One significant incident</option>
                <option value="multiple">Multiple incidents</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "documentedProcess", label: "Documented AI governance process exists" },
              { name: "hasDpo", label: "Data Protection Officer (DPO) in place" },
              { name: "incidentResponsePlan", label: "Documented AI incident response plan" },
            ].map((cb) => (
              <label key={cb.name} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name={cb.name}
                  checked={data[cb.name as keyof AssessmentFormData] as boolean}
                  onChange={onChange}
                  className="h-4 w-4 rounded-sm border-slate-300 text-blue-700"
                />
                {cb.label}
              </label>
            ))}
          </div>
          <div>
            <Label>Model documentation in place (select all that apply)</Label>
            <CheckboxGroup
              name="modelDocs"
              options={["Model card", "Risk assessment", "Data lineage doc", "Performance benchmarks", "Bias / fairness report", "None"]}
              selected={data.modelDocs ?? []}
              onChange={(val) => onArrayChange("modelDocs", val)}
            />
          </div>
        </div>
      </div>

      {/* Consumer Duty — conditional */}
      {customerFacing && (
        <div className="rounded-sm border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle
              icon={<Users className="h-4 w-4" />}
              title="Consumer Duty"
              subtitle="FCA Consumer Duty obligations for customer-facing AI."
            />
            <ConditionalBadge rule="Shown — customer-facing AI" />
          </div>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Consumer redress mechanism</Label>
                <Hint>Can consumers affected by this AI challenge or appeal decisions?</Hint>
                <Select name="consumerRedress" value={data.consumerRedress ?? ""} onChange={onChange}>
                  <option value="">Not specified</option>
                  <option value="formal">Formal — documented complaints and appeals process</option>
                  <option value="in-progress">In progress — being implemented</option>
                  <option value="none">None — no consumer redress mechanism</option>
                </Select>
              </div>
              <div>
                <Label>Vulnerable customer handling</Label>
                <Hint>Does this AI identify or treat vulnerable customers differently?</Hint>
                <Select name="vulnerableCustomerHandling" value={data.vulnerableCustomerHandling ?? ""} onChange={onChange}>
                  <option value="">Not specified</option>
                  <option value="yes">Yes — formal identification and differentiated handling</option>
                  <option value="partial">Partial — some consideration, no formal process</option>
                  <option value="none">No — not specifically handled</option>
                  <option value="not-applicable">Not applicable</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>AI decision explainability to consumers</Label>
              <Hint>Can individuals receive an explanation of an AI-driven decision affecting them? (GDPR Art. 22 / Consumer Duty)</Hint>
              <Select name="consumerExplainability" value={data.consumerExplainability ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="automated">Yes — automated explanation at point of decision</option>
                <option value="on-request">On request only — available but not proactively provided</option>
                <option value="none">No — consumers cannot obtain an explanation</option>
                <option value="not-customer-facing">Not applicable</option>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* PRA / SMF — conditional */}
      {financialRegulated && (
        <div className="rounded-sm border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle
              icon={<FileCheck className="h-4 w-4" />}
              title="PRA SS1/23 & Senior Management"
              subtitle="Additional obligations for FCA / PRA regulated firms."
            />
            <ConditionalBadge rule="Shown — FCA/PRA regulated" />
          </div>
          <div className="space-y-5">
            <div>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="smfAccountability"
                  checked={data.smfAccountability ?? false}
                  onChange={onChange}
                  className="h-4 w-4 rounded-sm border-slate-300 text-blue-700"
                />
                <span>Named Senior Manager (SMF) individual is accountable for this AI system</span>
              </label>
            </div>
            <div>
              <Label>Independent model validation (PRA SS1/23)</Label>
              <Hint>Validation must be performed by people independent of those who built the model.</Hint>
              <Select name="independentValidation" value={data.independentValidation ?? ""} onChange={onChange}>
                <option value="">Not specified</option>
                <option value="internal-independent">Internal — validated by a team independent of the builders</option>
                <option value="external">External — third-party model validation conducted</option>
                <option value="not-yet">Not yet — validation not yet performed</option>
                <option value="none">None — validated only by the team that built it</option>
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
          </div>
        </div>
      )}
    </div>
  );
}
