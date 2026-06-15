# Assessment Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/assessment` from a 6-step form into a 4-step momentum-driven wizard with a live report sidebar that shows the user's score, readiness, evidence count, and top blocker updating in real time.

**Architecture:** New step components replace the existing six (StepFirmDetails, StepAiSystem, StepRiskProfile, StepGovernance, StepEvidence, StepReview). A new `LiveSidebar` calls the real scoring engine on every form change. Conditional logic is extracted into a shared `lib/risk/conditionals.ts` module so step components and the sidebar read from a single source of truth.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Vitest

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `lib/risk/schema.ts` | 4 new types + fields + defaults |
| Create | `lib/risk/conditionals.ts` | 6 pure showIf helpers |
| Create | `lib/risk/__tests__/conditionals.test.ts` | Tests for conditionals |
| Rewrite | `components/assessment/steps/StepAiSystem.tsx` | New Step 1: org + AI system + vendor |
| Rewrite | `components/assessment/steps/StepGovernance.tsx` | New Step 2: governance + conditional Consumer Duty / PRA |
| Create | `components/assessment/steps/StepControlsEvidence.tsx` | New Step 3: controls + evidence status |
| Create | `components/assessment/steps/StepReviewGenerate.tsx` | New Step 4: read-only summary + generate |
| Create | `components/assessment/LiveSidebar.tsx` | Desktop rail: live score/readiness/evidence/tier/blocker |
| Modify | `components/assessment/StepNav.tsx` | Add optional `submitLabel` prop |
| Rewrite | `app/assessment/page.tsx` | 4 steps, two-column layout, LiveSidebar |
| Delete | `components/assessment/steps/StepFirmDetails.tsx` | Absorbed into new StepAiSystem |
| Delete | `components/assessment/steps/StepRiskProfile.tsx` | Absorbed into StepGovernance + StepControlsEvidence |
| Delete | `components/assessment/steps/StepEvidence.tsx` | Absorbed into StepControlsEvidence |
| Delete | `components/assessment/steps/StepReview.tsx` | Replaced by StepReviewGenerate |

---

## Task 1: Schema additions

**Files:**
- Modify: `lib/risk/schema.ts`

- [ ] **Step 1: Add new types and fields to schema.ts**

Add the following immediately before the `AssessmentFormData` interface definition (after the existing type exports):

```typescript
export type AssessmentPurpose =
  | "insurance-renewal"
  | "broker-review"
  | "cyber-pi-review"
  | "internal-audit"
  | "compliance-review"
  | "other";

export type DpiaStatus = "yes" | "in-progress" | "no" | "not-required";

export type VendorDueDiligenceStatus =
  | "formal"
  | "informal"
  | "none"
  | "not-applicable";

export type DataProcessingAgreementStatus =
  | "yes"
  | "partial"
  | "none"
  | "not-applicable";
```

Add these four optional fields at the end of `AssessmentFormData`, before the closing `}`:

```typescript
  // Assessment rebuild
  assessmentPurpose?: AssessmentPurpose;
  dpiaStatus?: DpiaStatus;
  vendorDueDiligenceStatus?: VendorDueDiligenceStatus;
  dataProcessingAgreementStatus?: DataProcessingAgreementStatus;
```

Add these four defaults at the end of `DEFAULT_ASSESSMENT_FORM`, before the closing `}`:

```typescript
  assessmentPurpose: undefined,
  dpiaStatus: undefined,
  vendorDueDiligenceStatus: undefined,
  dataProcessingAgreementStatus: undefined,
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit
```

Expected: no output (clean compile).

- [ ] **Step 3: Commit**

```bash
git add lib/risk/schema.ts
git commit -m "feat(schema): add assessmentPurpose, dpiaStatus, vendorDueDiligenceStatus, dataProcessingAgreementStatus"
```

---

## Task 2: Conditionals module (TDD)

**Files:**
- Create: `lib/risk/conditionals.ts`
- Create: `lib/risk/__tests__/conditionals.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/risk/__tests__/conditionals.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { DEFAULT_ASSESSMENT_FORM } from "../schema";
import {
  isInsurancePurpose,
  isCustomerFacing,
  isRegulated,
  isFinancialRegulated,
  usesThirdPartyVendors,
  processesPersonalData,
} from "../conditionals";

const base = { ...DEFAULT_ASSESSMENT_FORM };

describe("isInsurancePurpose", () => {
  it("returns true for insurance-renewal", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: "insurance-renewal" })).toBe(true);
  });
  it("returns true for broker-review", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: "broker-review" })).toBe(true);
  });
  it("returns true for cyber-pi-review", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: "cyber-pi-review" })).toBe(true);
  });
  it("returns false for internal-audit", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: "internal-audit" })).toBe(false);
  });
  it("returns false when undefined", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: undefined })).toBe(false);
  });
});

describe("isCustomerFacing", () => {
  it("returns true for customer", () => {
    expect(isCustomerFacing({ ...base, deploymentType: "customer" })).toBe(true);
  });
  it("returns true for both", () => {
    expect(isCustomerFacing({ ...base, deploymentType: "both" })).toBe(true);
  });
  it("returns false for internal", () => {
    expect(isCustomerFacing({ ...base, deploymentType: "internal" })).toBe(false);
  });
});

describe("isRegulated", () => {
  it("returns true when regulatedEntity is true", () => {
    expect(isRegulated({ ...base, regulatedEntity: true })).toBe(true);
  });
  it("returns false when regulatedEntity is false", () => {
    expect(isRegulated({ ...base, regulatedEntity: false })).toBe(false);
  });
});

describe("isFinancialRegulated", () => {
  it("returns true for regulated financial services firm", () => {
    expect(isFinancialRegulated({ ...base, regulatedEntity: true, industry: "financial" })).toBe(true);
  });
  it("returns true for regulated insurance firm", () => {
    expect(isFinancialRegulated({ ...base, regulatedEntity: true, industry: "insurance" })).toBe(true);
  });
  it("returns false for regulated healthcare firm", () => {
    expect(isFinancialRegulated({ ...base, regulatedEntity: true, industry: "healthcare" })).toBe(false);
  });
  it("returns false for unregulated financial firm", () => {
    expect(isFinancialRegulated({ ...base, regulatedEntity: false, industry: "financial" })).toBe(false);
  });
});

describe("usesThirdPartyVendors", () => {
  it("returns true when thirdPartyVendors is non-empty string", () => {
    expect(usesThirdPartyVendors({ ...base, thirdPartyVendors: "OpenAI" })).toBe(true);
  });
  it("returns true when foundationModelSource is openai", () => {
    expect(usesThirdPartyVendors({ ...base, foundationModelSource: "openai" })).toBe(true);
  });
  it("returns true for third-party-api deploymentType", () => {
    expect(usesThirdPartyVendors({ ...base, deploymentType: "third-party-api" })).toBe(true);
  });
  it("returns false when proprietary and no vendor string", () => {
    expect(usesThirdPartyVendors({ ...base, foundationModelSource: "proprietary", thirdPartyVendors: "" })).toBe(false);
  });
  it("returns false with empty string vendor", () => {
    expect(usesThirdPartyVendors({ ...base, thirdPartyVendors: "   " })).toBe(false);
  });
});

describe("processesPersonalData", () => {
  it("returns true for basic sensitivity", () => {
    expect(processesPersonalData({ ...base, dataSensitivity: "basic" })).toBe(true);
  });
  it("returns true for sensitive data", () => {
    expect(processesPersonalData({ ...base, dataSensitivity: "sensitive" })).toBe(true);
  });
  it("returns true when thirdPartyData is true", () => {
    expect(processesPersonalData({ ...base, dataSensitivity: "none", thirdPartyData: true })).toBe(true);
  });
  it("returns false when none and no third-party data", () => {
    expect(processesPersonalData({ ...base, dataSensitivity: "none", thirdPartyData: false })).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run lib/risk/__tests__/conditionals.test.ts
```

Expected: FAIL — "Cannot find module '../conditionals'"

- [ ] **Step 3: Implement conditionals.ts**

Create `lib/risk/conditionals.ts`:

```typescript
import { AssessmentFormData } from "./schema";

export function isInsurancePurpose(data: AssessmentFormData): boolean {
  return ["insurance-renewal", "broker-review", "cyber-pi-review"].includes(
    data.assessmentPurpose ?? ""
  );
}

export function isCustomerFacing(data: AssessmentFormData): boolean {
  return data.deploymentType === "customer" || data.deploymentType === "both";
}

export function isRegulated(data: AssessmentFormData): boolean {
  return data.regulatedEntity === true;
}

export function isFinancialRegulated(data: AssessmentFormData): boolean {
  return (
    isRegulated(data) &&
    (data.industry === "financial" || data.industry === "insurance")
  );
}

export function usesThirdPartyVendors(data: AssessmentFormData): boolean {
  return (
    (!!data.thirdPartyVendors && data.thirdPartyVendors.trim().length > 0) ||
    (!!data.foundationModelSource &&
      data.foundationModelSource !== "proprietary") ||
    data.deploymentType === "third-party-api"
  );
}

export function processesPersonalData(data: AssessmentFormData): boolean {
  return data.dataSensitivity !== "none" || data.thirdPartyData === true;
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run lib/risk/__tests__/conditionals.test.ts
```

Expected: 18 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/risk/conditionals.ts lib/risk/__tests__/conditionals.test.ts
git commit -m "feat(risk): add conditionals module with showIf helpers and tests"
```

---

## Task 3: Rewrite StepAiSystem (new Step 1)

**Files:**
- Rewrite: `components/assessment/steps/StepAiSystem.tsx`

Merges old StepFirmDetails + old StepAiSystem. Adds `assessmentPurpose` chips, moves `dataSensitivity` here, adds conditional vendor + insurance sections.

- [ ] **Step 1: Replace StepAiSystem.tsx with this content**

```tsx
"use client";

import React from "react";
import { Building, FileText, Database } from "lucide-react";
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
  CheckboxGroup,
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
  function setPurpose(value: AssessmentPurpose) {
    onChange({
      target: { name: "assessmentPurpose", value, type: "select-one" },
    } as React.ChangeEvent<HTMLSelectElement>);
  }

  return (
    <div className="space-y-8">
      {/* Organisation */}
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle
          icon={<Building className="h-4 w-4" />}
          title="Organisation"
          subtitle="Tell us about the firm undertaking this assessment."
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
            <Hint>Select the primary reason for this assessment — personalises the questions shown.</Hint>
            <div className="flex flex-wrap gap-2 mt-1">
              {PURPOSE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPurpose(opt.value)}
                  className={`rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors ${
                    data.assessmentPurpose === opt.value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI System */}
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle
          icon={<FileText className="h-4 w-4" />}
          title="AI System"
          subtitle="Describe the specific AI system being assessed."
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
            <CheckboxGroup
              name="aiCapabilities"
              options={["Classification", "Regression / prediction", "Generative / LLM", "Recommendation", "Computer vision", "NLP / text analysis", "Anomaly detection"]}
              selected={data.aiCapabilities ?? []}
              onChange={(val) => onArrayChange("aiCapabilities", val)}
            />
          </div>
        </div>
      </div>

      {/* Model & Data */}
      <div className="rounded-sm border border-slate-200 bg-white p-6">
        <SectionTitle
          icon={<Database className="h-4 w-4" />}
          title="Model, Data & Vendors"
          subtitle="Foundation model source, hosting, data profile, and any vendor dependencies."
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
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/assessment/steps/StepAiSystem.tsx
git commit -m "feat(assessment): rewrite StepAiSystem as merged Step 1 with org, system, vendor, and conditional sections"
```

---

## Task 4: Rewrite StepGovernance (new Step 2)

**Files:**
- Rewrite: `components/assessment/steps/StepGovernance.tsx`

Adds `decisionAuthority` and `humanIntervention` from old StepRiskProfile. Wraps Consumer Duty and PRA/SMF fields in conditional sections with visible rule badges.

- [ ] **Step 1: Replace StepGovernance.tsx with this content**

```tsx
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
              title="PRA SS1/23 &amp; Senior Management"
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
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/assessment/steps/StepGovernance.tsx
git commit -m "feat(assessment): rewrite StepGovernance as Step 2 with conditional Consumer Duty and PRA/SMF sections"
```

---

## Task 5: Create StepControlsEvidence (new Step 3)

**Files:**
- Create: `components/assessment/steps/StepControlsEvidence.tsx`

Combines fields from old StepRiskProfile (impact, explainability, bias testing) and old StepEvidence (audit certs). Adds conditional DPIA and vendor due diligence sections using new enum fields.

- [ ] **Step 1: Create StepControlsEvidence.tsx**

```tsx
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
          title="Validation &amp; Certification"
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
        <SectionTitle icon={<FileText className="h-4 w-4" />} title="Additional Context" />
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
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/assessment/steps/StepControlsEvidence.tsx
git commit -m "feat(assessment): create StepControlsEvidence as Step 3 with conditional DPIA and vendor due diligence sections"
```

---

## Task 6: Create StepReviewGenerate (new Step 4)

**Files:**
- Create: `components/assessment/steps/StepReviewGenerate.tsx`

Read-only step. Computes evidence checklist and underwriter questions internally. The generate button is in StepNav (last step shows submit).

- [ ] **Step 1: Create StepReviewGenerate.tsx**

```tsx
"use client";

import React from "react";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { AssessmentFormData } from "../../../lib/risk/schema";
import { buildEvidenceChecklist, EvidenceStatus } from "../../../lib/risk/evidence";
import { buildUnderwriterQuestions } from "../../../lib/risk/underwriting";
import { computeResults } from "../../../lib/risk/scoring";
import { buildInsuranceBrief } from "../../../lib/risk/insurance";

const STATUS_ICON: Record<EvidenceStatus, React.ReactNode> = {
  present: <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />,
  partial: <MinusCircle className="h-4 w-4 shrink-0 text-amber-500" />,
  missing: <XCircle className="h-4 w-4 shrink-0 text-red-500" />,
};

const STATUS_BADGE: Record<EvidenceStatus, string> = {
  present: "bg-green-50 text-green-700 border-green-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  missing: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  present: "Present",
  partial: "Partial",
  missing: "Missing",
};

const STATUS_ORDER: Record<EvidenceStatus, number> = {
  missing: 0,
  partial: 1,
  present: 2,
};

export function StepReviewGenerate({ data }: { data: AssessmentFormData }) {
  const results = computeResults(data);
  const brief = buildInsuranceBrief(data, results);
  const checklist = buildEvidenceChecklist(data).sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );
  const questions = buildUnderwriterQuestions(data);

  const missingCount = checklist.filter((i) => i.status === "missing").length;
  const presentCount = checklist.filter((i) => i.status === "present").length;

  const scoreColor =
    results.score >= 80
      ? "text-green-700"
      : results.score >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "AI Risk Score", value: `${results.score}/100`, color: scoreColor },
          { label: "Insurance Readiness", value: brief.readiness.status, color: "text-slate-800" },
          { label: "Evidence present", value: `${presentCount} / ${checklist.length}`, color: "text-slate-800" },
          { label: "Underwriting tier", value: brief.verdict.underwritingTier, color: "text-slate-800" },
        ].map((card) => (
          <div key={card.label} className="rounded-sm border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{card.label}</p>
            <p className={`mt-1 text-base font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Answer summary */}
      <div className="rounded-sm border border-slate-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">Assessment summary</h4>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            { label: "Entity", value: data.companyName || "—" },
            { label: "AI system", value: data.systemName || "—" },
            { label: "Sector", value: data.industry },
            { label: "Deployment", value: data.deploymentType },
            { label: "Regulated", value: data.regulatedEntity ? `Yes — ${data.regulator ?? ""}` : "No" },
            { label: "AI policy", value: data.formalAiPolicy ?? "Not specified" },
            { label: "Automation", value: data.decisionAuthority },
            { label: "Kill switch", value: data.killSwitch ?? "Not specified" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">{row.label}</span>
              <span className="font-semibold text-slate-800 text-right ml-4 max-w-[60%] truncate">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence checklist */}
      <div className="rounded-sm border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Evidence status</h4>
          {missingCount > 0 && (
            <span className="rounded-sm border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
              {missingCount} missing
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-100">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-start gap-2 min-w-0">
                <span className="mt-0.5">{STATUS_ICON[item.status]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
                </div>
              </div>
              <span className={`shrink-0 inline-flex rounded-sm border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status]}`}>
                {STATUS_LABEL[item.status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Underwriter questions */}
      <div className="rounded-sm border border-slate-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">
          Likely underwriter questions
        </h4>
        <p className="mb-3 text-xs text-slate-500">
          Based on your answers, these are the questions your underwriter is most likely to ask. Prepare evidence for each before your broker meeting.
        </p>
        <ol className="space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                {i + 1}
              </span>
              {q}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/assessment/steps/StepReviewGenerate.tsx
git commit -m "feat(assessment): create StepReviewGenerate as Step 4 with evidence status, underwriter questions, and summary"
```

---

## Task 7: Create LiveSidebar

**Files:**
- Create: `components/assessment/LiveSidebar.tsx`

Desktop rail showing live score, readiness, evidence confidence, missing count, underwriting tier, and top blocker. Calls the same real scoring engines as the final report.

- [ ] **Step 1: Create LiveSidebar.tsx**

```tsx
"use client";

import React from "react";
import { AssessmentFormData } from "../../lib/risk/schema";
import { computeResults } from "../../lib/risk/scoring";
import { buildEvidenceChecklist } from "../../lib/risk/evidence";
import { buildInsuranceBrief } from "../../lib/risk/insurance";

export function LiveSidebar({
  data,
  ready,
}: {
  data: AssessmentFormData;
  ready: boolean;
}) {
  if (!ready) {
    return (
      <aside className="w-72 shrink-0 sticky top-8 rounded-sm border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Your report so far
        </p>
        <p className="text-sm text-slate-400">
          Fill in the form to see your live score.
        </p>
      </aside>
    );
  }

  const results = computeResults(data);
  const checklist = buildEvidenceChecklist(data);
  const brief = buildInsuranceBrief(data, results);

  const score = results.score;
  const presentCount = checklist.filter((i) => i.status === "present").length;
  const missingCount = checklist.filter((i) => i.status === "missing").length;
  const topBlocker = results.riskDrivers.find((d) => d.severity === "High");

  const scoreColor =
    score >= 80 ? "text-green-400" : score >= 60 ? "text-amber-400" : "text-red-400";

  const readinessTone =
    brief.readiness.status === "Review-ready"
      ? "bg-emerald-900 text-emerald-300"
      : brief.readiness.status === "Conditionally ready"
        ? "bg-amber-900 text-amber-300"
        : "bg-red-900 text-red-300";

  const missingColor =
    missingCount === 0
      ? "text-green-400"
      : missingCount <= 3
        ? "text-amber-400"
        : "text-red-400";

  return (
    <aside className="w-72 shrink-0 sticky top-8 rounded-sm bg-slate-900 p-4 text-slate-200">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
        Your report so far
      </p>
      <div className={`text-4xl font-extrabold leading-none ${scoreColor}`}>
        {score}
        <span className="text-base font-normal text-slate-600">/100</span>
      </div>
      <span
        className={`mt-2 mb-4 inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold ${readinessTone}`}
      >
        {brief.readiness.status}
      </span>

      <div className="border-t border-slate-800 my-3" />

      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Evidence confidence</span>
          <span className="font-semibold text-slate-200">
            {presentCount} / {checklist.length}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Missing evidence</span>
          <span className={`font-semibold ${missingColor}`}>
            {missingCount} items
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Underwriting tier</span>
          <span className="font-semibold text-slate-200">
            {brief.verdict.underwritingTier}
          </span>
        </div>
      </div>

      {topBlocker && (
        <div className="mt-4 rounded-sm bg-slate-800 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Top blocker
          </p>
          <p className="text-xs text-red-400 leading-relaxed">{topBlocker.why}</p>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-600 leading-relaxed">
        Updates as you answer. Powered by the same engine as your final report.
      </p>
    </aside>
  );
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/assessment/LiveSidebar.tsx
git commit -m "feat(assessment): create LiveSidebar with live score, readiness, evidence count, tier, and top blocker"
```

---

## Task 8: Update StepNav submit label

**Files:**
- Modify: `components/assessment/StepNav.tsx`

Change hardcoded "Submit Assessment" to "Generate Report" to match the new Step 4 intent.

- [ ] **Step 1: Update StepNav.tsx**

Find the submit button in `StepNav.tsx` (line ~40) and change the label:

```tsx
// Change this:
{submitting ? "Submitting…" : "Submit Assessment"}

// To this:
{submitting ? "Generating…" : "Generate Report"}
```

Also update the icon on the submit button from `<Save>` to `<FileText>`:

```tsx
// Change import:
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

// Change icon on submit button:
<FileText className="h-4 w-4" />
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/assessment/StepNav.tsx
git commit -m "feat(assessment): update StepNav submit label to Generate Report"
```

---

## Task 9: Rewrite page.tsx (4 steps, two-column layout)

**Files:**
- Rewrite: `app/assessment/page.tsx`

Changes: 4 steps instead of 6, two-column flex layout with `LiveSidebar` rail on desktop, updated validation (only Step 1 requires fields), mobile uses existing `LiveRiskBadge` above form card.

- [ ] **Step 1: Replace app/assessment/page.tsx with this content**

```tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Building, FileCheck, BarChart3 } from "lucide-react";
import Container from "../../components/layout/Container";
import {
  AssessmentErrors,
  AssessmentFormData,
  DEFAULT_ASSESSMENT_FORM,
  DRAFT_KEY,
  StoredSubmission,
  SUBMISSION_KEY,
  appendToHistory,
  calculatePreliminaryStatus,
  getHistory,
  makeAssessmentId,
  safeJsonParse,
  safeLocalStorageGet,
  safeLocalStorageSet,
  toggleExclusive,
} from "../../lib/risk/schema";
import { StepAiSystem } from "../../components/assessment/steps/StepAiSystem";
import { StepGovernance } from "../../components/assessment/steps/StepGovernance";
import { StepControlsEvidence } from "../../components/assessment/steps/StepControlsEvidence";
import { StepReviewGenerate } from "../../components/assessment/steps/StepReviewGenerate";
import { StepIndicator } from "../../components/assessment/StepIndicator";
import { StepNav } from "../../components/assessment/StepNav";
import { LiveRiskBadge } from "../../components/assessment/LiveRiskBadge";
import { LiveSidebar } from "../../components/assessment/LiveSidebar";

// ── Validation ────────────────────────────────────────────────────────────────

function validateStep(s: number, formData: AssessmentFormData): AssessmentErrors {
  const e: AssessmentErrors = {};
  if (s === 0) {
    if (!formData.companyName.trim()) e.companyName = "Company name is required.";
    if (!formData.industry) e.industry = "Select an industry.";
    if (!formData.systemName.trim()) e.systemName = "System name is required.";
    if (!formData.aiUseCase.trim()) e.aiUseCase = "Describe the AI use case.";
  }
  return e;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AssessmentFormData>(DEFAULT_ASSESSMENT_FORM);
  const [errors, setErrors] = useState<AssessmentErrors>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [lastEntry, setLastEntry] = useState<StoredSubmission | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const raw = safeLocalStorageGet(DRAFT_KEY);
    const parsed = safeJsonParse<AssessmentFormData>(raw);
    if (parsed) setFormData(parsed);
  }, []);

  useEffect(() => {
    const history = getHistory();
    if (history.length > 0) setLastEntry(history[0]);
  }, []);

  useEffect(() => {
    const saved = safeLocalStorageSet(DRAFT_KEY, JSON.stringify(formData));
    setSaveFailed(!saved);
  }, [formData]);

  const steps = useMemo(
    () => [
      { title: "Your AI System", icon: <Building className="h-3.5 w-3.5" /> },
      { title: "Governance", icon: <Shield className="h-3.5 w-3.5" /> },
      { title: "Controls & Evidence", icon: <BarChart3 className="h-3.5 w-3.5" /> },
      { title: "Review & Generate", icon: <FileCheck className="h-3.5 w-3.5" /> },
    ],
    []
  );

  const preliminary = useMemo(() => calculatePreliminaryStatus(formData), [formData]);
  const liveReady = step > 0 || formData.companyName.trim().length > 0;

  const multiFields: Record<string, string[]> = {
    aiCapabilities: [],
    biasTesting: ["No testing conducted", "Unsure"],
    modelDocs: ["None"],
    dataTypes: [],
    regulations: ["None / Unsure"],
    monitoring: ["None"],
  };

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleArrayChange(name: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [name]: toggleExclusive(
        (prev[name as keyof AssessmentFormData] as string[]) ?? [],
        value,
        multiFields[name] ?? []
      ),
    }));
  }

  function goTo(i: number) {
    if (i <= step) {
      setStep(i);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    for (let s = step; s < i; s++) {
      const e = validateStep(s, formData);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    for (let s = 0; s < steps.length - 1; s++) {
      const e = validateStep(s, formData);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    setSubmitting(true);
    const id = makeAssessmentId();
    const submission: StoredSubmission = {
      id,
      submittedAt: new Date().toISOString(),
      data: formData,
    };
    safeLocalStorageSet(SUBMISSION_KEY, JSON.stringify(submission));
    appendToHistory(submission);
    router.push("/results");
  }

  const progressPct = Math.round(((step + 1) / steps.length) * 100);

  return (
    <section className="min-h-screen bg-slate-50 py-10">
      <Container>
        <div className="mx-auto max-w-[1140px]">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-700" />
              <h1 className="text-lg font-bold text-slate-900">AI Governance Assessment</h1>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full bg-blue-700 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Step {step + 1} of {steps.length} — {steps[step].title}
            </p>
          </div>

          {/* Step tabs */}
          <div className="mb-4">
            <StepIndicator steps={steps} current={step} onNavigate={goTo} />
          </div>

          {/* Last score banner */}
          {step === 0 && !bannerDismissed && lastEntry && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-sm border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <span>
                ↺ Last assessment:{" "}
                <strong>{lastEntry.data.systemName || lastEntry.data.companyName}</strong>
                {" — "}
                <a href="/results" className="underline hover:no-underline font-semibold">
                  View report →
                </a>
              </span>
              <button
                onClick={() => setBannerDismissed(true)}
                className="shrink-0 text-blue-500 hover:text-blue-700 font-bold text-base leading-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* Save failure banner */}
          {saveFailed && (
            <div className="mb-4 flex items-start gap-3 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="shrink-0 font-semibold">⚠</span>
              <span>
                Draft could not be saved — your browser storage may be full.{" "}
                <button onClick={() => setSaveFailed(false)} className="ml-1 underline hover:no-underline">
                  Dismiss
                </button>
              </span>
            </div>
          )}

          {/* Mobile: live badge above form (hidden on desktop) */}
          <div className="lg:hidden mb-4">
            <LiveRiskBadge preliminary={preliminary} ready={liveReady} />
          </div>

          {/* Two-column layout */}
          <div className="flex gap-8 items-start">

            {/* Form column */}
            <div className="flex-1 min-w-0">
              <div className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8">
                {step === 0 && (
                  <StepAiSystem
                    data={formData}
                    errors={errors}
                    onChange={handleChange}
                    onArrayChange={handleArrayChange}
                  />
                )}
                {step === 1 && (
                  <StepGovernance
                    data={formData}
                    onChange={handleChange}
                    onArrayChange={handleArrayChange}
                  />
                )}
                {step === 2 && (
                  <StepControlsEvidence
                    data={formData}
                    onChange={handleChange}
                    onArrayChange={handleArrayChange}
                  />
                )}
                {step === 3 && <StepReviewGenerate data={formData} />}

                <StepNav
                  step={step}
                  totalSteps={steps.length}
                  onBack={() => goTo(Math.max(step - 1, 0))}
                  onNext={() => goTo(step + 1)}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                />
              </div>
            </div>

            {/* Desktop sidebar (hidden on mobile) */}
            <div className="hidden lg:block">
              <LiveSidebar data={formData} ready={liveReady} />
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/assessment/page.tsx
git commit -m "feat(assessment): rewrite page with 4-step flow, two-column layout, and LiveSidebar"
```

---

## Task 10: Delete old step files

**Files:**
- Delete: `components/assessment/steps/StepFirmDetails.tsx`
- Delete: `components/assessment/steps/StepRiskProfile.tsx`
- Delete: `components/assessment/steps/StepEvidence.tsx`
- Delete: `components/assessment/steps/StepReview.tsx`

- [ ] **Step 1: Delete the replaced files**

```bash
rm components/assessment/steps/StepFirmDetails.tsx \
   components/assessment/steps/StepRiskProfile.tsx \
   components/assessment/steps/StepEvidence.tsx \
   components/assessment/steps/StepReview.tsx
```

- [ ] **Step 2: Verify no imports remain**

```bash
grep -r "StepFirmDetails\|StepRiskProfile\|StepEvidence\|StepReview" app/ components/ --include="*.tsx" --include="*.ts"
```

Expected: no output.

- [ ] **Step 3: Verify full type check still clean**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(assessment): remove replaced step components (StepFirmDetails, StepRiskProfile, StepEvidence, StepReview)"
```

---

## Task 11: Smoke test

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: all existing tests pass + 18 new conditionals tests pass.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

- [ ] **Step 3: Walk through the assessment manually**

Open `http://localhost:3000/assessment` and verify:

1. **Step 1** — company name, sector, regulated checkbox (shows regulator dropdown when checked), assessment purpose chips, system name, use case, deployment type, data sensitivity, third-party vendor field appears when OpenAI selected, insurance coverage field appears when "Insurance renewal" purpose selected
2. **Step 2** — Consumer Duty section shows only when deploymentType = customer or both; PRA/SMF section shows only when regulatedEntity = true and industry = financial or insurance; neither section shows for an internal-only, non-regulated tech firm
3. **Step 3** — DPIA section shows when dataSensitivity != none or thirdPartyData = true; vendor due diligence shows when third-party vendor is used
4. **Step 4** — evidence list shows Missing first, then Partial, then Present; underwriter questions list is populated; generate button is present
5. **LiveSidebar** (desktop) — score changes as you answer questions; readiness badge updates; top blocker shows most severe risk driver
6. **Mobile** (resize to <1024px) — sidebar is hidden, LiveRiskBadge shows above form card

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 5: Commit if clean**

```bash
git add -A
git commit -m "chore: verify assessment rebuild — all tests pass, build clean"
```
