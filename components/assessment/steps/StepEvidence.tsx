"use client";

import React from "react";
import { FileCheck, FileText } from "lucide-react";
import { AssessmentFormData } from "../../../lib/risk/schema";
import { Select, TextInput, Textarea, Hint, Label } from "../FieldPrimitives";
import { SectionTitle } from "../SectionTitle";

export function StepEvidence({
  data,
  onChange,
}: {
  data: AssessmentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
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
              <label className="flex cursor-pointer items-start gap-3 text-base text-slate-700">
                <input type="checkbox" name={item.name}
                  checked={data[item.name as keyof AssessmentFormData] as boolean}
                  onChange={onChange} className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-blue-700" />
                <div>
                  <span className="font-medium text-slate-900">{item.label}</span>
                  <p className="text-sm text-slate-500">{item.hint}</p>
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
