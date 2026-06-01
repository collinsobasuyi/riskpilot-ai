"use client";

import React from "react";
import { Building } from "lucide-react";
import { AssessmentFormData, AssessmentErrors } from "../../../lib/risk/schema";
import { Select, TextInput, Hint, Label } from "../FieldPrimitives";
import { SectionTitle } from "../SectionTitle";

export function StepFirmDetails({
  data,
  errors,
  onChange,
}: {
  data: AssessmentFormData;
  errors: AssessmentErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle icon={<Building className="h-4 w-4" />} title="Organisation Details" subtitle="Tell us about the firm undertaking this assessment." />
        <div className="space-y-5">
          <div>
            <Label>Legal entity name</Label>
            <TextInput name="companyName" value={data.companyName} onChange={onChange} placeholder="e.g. Acme Financial Ltd" error={errors.companyName} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label required>Industry sector</Label>
              <Select name="industry" value={data.industry} onChange={onChange} error={errors.industry}>
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
            <label className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700">
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

    </div>
  );
}
