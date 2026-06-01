"use client";

import React from "react";
import { Users, FileCheck } from "lucide-react";
import { AssessmentFormData } from "../../../lib/risk/schema";
import { Select, Hint, Label, CheckboxGroup, RadioGroup } from "../FieldPrimitives";
import { SectionTitle } from "../SectionTitle";

export function StepGovernance({
  data,
  onChange,
  onArrayChange,
}: {
  data: AssessmentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onArrayChange: (name: string, value: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<Users className="h-4 w-4" />} title="Oversight & Controls" />
        <div className="space-y-5">
          <div>
            <Label required>Human oversight level</Label>
            <RadioGroup name="existingOversight" value={data.existingOversight}
              onChange={(val) => onChange({ target: { name: "existingOversight", value: val, type: "radio" } } as React.ChangeEvent<HTMLInputElement>)}
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
              <label key={cb.name} className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700">
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
          <label className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700">
            <input type="checkbox" name="monitoringHallucination"
              checked={data.monitoringHallucination ?? false} onChange={onChange}
              className="h-4 w-4 rounded-sm border-slate-300 text-blue-700" />
            <span>We monitor for hallucination / model drift in generative AI outputs</span>
          </label>
          <div>
            <Label>Monitoring tools in use (select all that apply)</Label>
            <CheckboxGroup name="monitoring"
              options={["Performance dashboards", "Drift detection", "Alert / paging system", "Manual sampling", "None"]}
              selected={data.monitoring ?? []}
              onChange={(val) => onArrayChange("monitoring", val)} />
          </div>
          <div>
            <Label>Model documentation in place (select all that apply)</Label>
            <CheckboxGroup name="modelDocs"
              options={["Model card", "Risk assessment", "Data lineage doc", "Performance benchmarks", "Bias / fairness report", "None"]}
              selected={data.modelDocs ?? []}
              onChange={(val) => onArrayChange("modelDocs", val)} />
          </div>
        </div>
      </div>
    </div>
  );
}
