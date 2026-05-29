# RiskPilot AI — Codebase Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all P0–P3 issues from the code review: dead code removal, type deduplication, score clamping, scoring consolidation, email feature removal, localStorage failure feedback, API stub replacement, and component splitting of both 1090-line page files.

**Architecture:** Pure-function scoring logic lives in `lib/risk/scoring.ts` and is imported by both the API route and the results page. Both page files become thin shells (~150–200 lines) delegating to focused components in `components/assessment/` and `components/results/`. Tests live in `lib/risk/__tests__/` and cover all scoring branches.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Vitest 2

---

## File Map

### Delete entirely
- `lib/risk/recommendations.ts` (empty)
- `lib/risk/controls.ts` (unused)
- `content/home.ts` (empty)
- `components/home/HeroSection.tsx`
- `components/home/ProblemSection.tsx`
- `components/home/ScorePreviewSection.tsx`
- `components/home/BookCallSection.tsx`

### Create
- `vitest.config.ts`
- `lib/risk/__tests__/schema.test.ts`
- `lib/risk/__tests__/scoring.test.ts`
- `components/assessment/FieldPrimitives.tsx`
- `components/assessment/SectionTitle.tsx`
- `components/assessment/StepIndicator.tsx`
- `components/assessment/StepNav.tsx`
- `components/assessment/LiveRiskBadge.tsx`
- `components/assessment/steps/StepFirmDetails.tsx`
- `components/assessment/steps/StepAiSystem.tsx`
- `components/assessment/steps/StepRiskProfile.tsx`
- `components/assessment/steps/StepGovernance.tsx`
- `components/assessment/steps/StepEvidence.tsx`
- `components/assessment/steps/StepReview.tsx`
- `components/results/ReportHeader.tsx`
- `components/results/CategoryScores.tsx`
- `components/results/RiskDriversList.tsx`
- `components/results/RecommendationsPanel.tsx`
- `components/results/ComplianceGaps.tsx`
- `components/results/BenchmarkPanel.tsx`
- `components/results/CoveragePanel.tsx`

### Modify
- `lib/utils.ts` — add `clamp` helper
- `lib/risk/types.ts` — remove 8 unused type definitions
- `lib/risk/schema.ts` — re-export types from types.ts, remove email fields, fix score clamp
- `lib/risk/scoring.ts` — replace `calculateAssessmentResult` with extracted `computeResults`
- `app/api/assessment/route.ts` — replace 501 stub with real POST handler
- `app/assessment/page.tsx` — thin shell, remove email fields, add save-failure banner
- `app/results/page.tsx` — thin shell importing from lib and components
- `package.json` — add vitest

---

## Task 1: Delete dead files and unused types

**Files:**
- Delete: `lib/risk/recommendations.ts`, `lib/risk/controls.ts`, `content/home.ts`
- Delete: `components/home/` (entire directory)
- Modify: `lib/risk/types.ts`

- [ ] **Step 1: Delete empty and unused files**

```bash
rm lib/risk/recommendations.ts
rm lib/risk/controls.ts
rm content/home.ts
rm -rf components/home
```

- [ ] **Step 2: Remove unused type definitions from `lib/risk/types.ts`**

Open `lib/risk/types.ts`. Delete the following type definitions and their associated JSDoc (they are not imported anywhere in the codebase):

- `EnhancedAssessmentInput` interface
- `AssessmentRecord` interface
- `ExportOptions` interface
- `EnhancedAssessmentResult` interface
- `DashboardStats` interface
- `IndustryBenchmark` interface
- `UserPreferences` interface
- `Notification` interface

Keep everything else. The file should still export: `ImpactLevel`, `DataSensitivity`, `DecisionAuthority`, `InherentRiskLevel`, `ReadinessLevel`, `ControlPriority`, `ControlCategory`, `EffortLevel`, `AssessmentStatus`, `RiskAssessmentInput`, `RiskDriver`, `Control`, `AssessmentResult`, `ApiResponse`, `ValidationError`, all constants and display maps, and all helper functions.

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (the deleted types were never imported).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete dead files and unused type definitions"
```

---

## Task 2: Deduplicate types and add clamp utility

**Files:**
- Modify: `lib/utils.ts`
- Modify: `lib/risk/schema.ts`
- Modify: `lib/risk/types.ts`

- [ ] **Step 1: Add `clamp` to `lib/utils.ts`**

Append to `lib/utils.ts`:

```ts
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
```

- [ ] **Step 2: Make `types.ts` the single source for `DataSensitivity` and `DecisionAuthority`**

In `lib/risk/types.ts`, the two types already exist correctly:
```ts
export type DataSensitivity = "none" | "basic" | "sensitive";
export type DecisionAuthority = "none" | "partial" | "full";
```
No changes needed to types.ts.

- [ ] **Step 3: Remove the duplicate definitions from `schema.ts` and re-export**

In `lib/risk/schema.ts`, find these two lines near the top of the file:
```ts
export type DataSensitivity = "none" | "basic" | "sensitive";
```
and
```ts
export type DecisionAuthority = "none" | "partial" | "full";
```

Delete both lines. Then add this re-export near the top of the file (after existing imports):

```ts
export type { DataSensitivity, DecisionAuthority } from "./types";
```

- [ ] **Step 4: Verify TypeScript still compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/utils.ts lib/risk/schema.ts lib/risk/types.ts
git commit -m "refactor: deduplicate types, add clamp utility"
```

---

## Task 3: Set up Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest @vitest/coverage-v8
```

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` section of `package.json`, add:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["**/__tests__/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create the test directory**

```bash
mkdir -p lib/risk/__tests__
```

- [ ] **Step 5: Verify vitest runs (no tests yet)**

```bash
npm test
```

Expected: `No test files found` or exits 0.

- [ ] **Step 6: Commit**

```bash
git add package.json vitest.config.ts
git commit -m "chore: add vitest test setup"
```

---

## Task 4: TDD — fix calculatePreliminaryStatus score clamp

**Files:**
- Create: `lib/risk/__tests__/schema.test.ts`
- Modify: `lib/risk/schema.ts`

- [ ] **Step 1: Write failing tests for score clamping and tier thresholds**

Create `lib/risk/__tests__/schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { calculatePreliminaryStatus, DEFAULT_ASSESSMENT_FORM } from "../schema";

const base = { ...DEFAULT_ASSESSMENT_FORM };

describe("calculatePreliminaryStatus", () => {
  it("score is never below 0 even with all negative conditions", () => {
    const result = calculatePreliminaryStatus({
      ...base,
      decisionAuthority: "full",
      systematicRisk: "global",
      mttd: "over_24_hours",
      explainabilityType: "black-box",
      humanIntervention: "autonomous",
      killSwitch: "none",
      auditTrailCompleteness: "none",
      trainingFrequency: "none",
      externalVerification: "none",
      financialImpactTier: "harm",
      deploymentType: "third-party-api",
      foundationModelSource: "openai",
      criticality: "regulatory",
      documentedProcess: false,
      incidentHistory: "multiple",
      biasTesting: ["No testing conducted"],
      monitoringHallucination: false,
      hasModelCards: false,
      hasExternalAudit: false,
      regulatedEntity: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("score is never above 100", () => {
    const result = calculatePreliminaryStatus(base);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("returns High Risk tier when score < 40", () => {
    const result = calculatePreliminaryStatus({
      ...base,
      decisionAuthority: "full",
      systematicRisk: "global",
      mttd: "over_24_hours",
      auditTrailCompleteness: "none",
      financialImpactTier: "harm",
      documentedProcess: false,
      incidentHistory: "multiple",
    });
    expect(result.status).toBe("High Risk");
  });

  it("returns Low Risk tier when score >= 60 with no negative signals", () => {
    const result = calculatePreliminaryStatus({
      ...base,
      decisionAuthority: "none",
      documentedProcess: true,
      hasModelCards: true,
      hasExternalAudit: true,
      regulatedEntity: true,
      monitoringHallucination: false,
      externalVerification: "external-audit",
      trainingFrequency: "quarterly",
    });
    expect(result.status).toBe("Low Risk");
  });

  it("concerns array has at most 4 entries", () => {
    const result = calculatePreliminaryStatus({
      ...base,
      decisionAuthority: "full",
      systematicRisk: "global",
      mttd: "over_24_hours",
      explainabilityType: "black-box",
      humanIntervention: "autonomous",
      killSwitch: "none",
      auditTrailCompleteness: "none",
      documentedProcess: false,
      incidentHistory: "multiple",
    });
    expect(result.concerns.length).toBeLessThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npm test
```

Expected: score clamp tests fail (score goes negative).

- [ ] **Step 3: Fix `calculatePreliminaryStatus` in `lib/risk/schema.ts`**

Find the `return {` statement at the end of `calculatePreliminaryStatus`. Just before it, add the clamp:

```ts
score = Math.max(0, Math.min(100, score));
```

So the end of the function looks like:

```ts
  score = Math.max(0, Math.min(100, score));

  const status: PreliminaryStatus["status"] =
    score >= 60 ? "Low Risk" : score >= 40 ? "Medium Risk" : "High Risk";

  const statusColor =
    score >= 60 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-600";

  const bgColor =
    score >= 60 ? "bg-green-50" : score >= 40 ? "bg-amber-50" : "bg-red-50";

  const borderColor =
    score >= 60 ? "border-green-200" : score >= 40 ? "border-amber-200" : "border-red-200";

  return {
    score,
    status,
    statusColor,
    bgColor,
    borderColor,
    concerns: concerns.slice(0, 4),
  };
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npm test
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/risk/schema.ts lib/risk/__tests__/schema.test.ts
git commit -m "fix: clamp calculatePreliminaryStatus score to [0, 100], add tests"
```

---

## Task 5: Remove email fields

**Files:**
- Modify: `lib/risk/schema.ts`
- Modify: `app/assessment/page.tsx`

- [ ] **Step 1: Remove email fields from `AssessmentFormData` in `lib/risk/schema.ts`**

In the `AssessmentFormData` interface, delete these two lines:
```ts
  wantsEmailCopy: boolean;
  contactEmail: string;
```

In `DEFAULT_ASSESSMENT_FORM`, delete these two lines:
```ts
  wantsEmailCopy: false,
  contactEmail: "",
```

Delete the `isValidEmail` function entirely (it is only used for contactEmail validation):
```ts
export function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}
```

- [ ] **Step 2: Remove email UI from `app/assessment/page.tsx`**

In `app/assessment/page.tsx`:

a) Remove the import of `isValidEmail` from the import block at the top.

b) Find and delete the email UI block — it looks like this (around line 254):
```tsx
<input type="checkbox" name="wantsEmailCopy" checked={data.wantsEmailCopy} onChange={onChange}
```
Delete that checkbox and the conditional `{data.wantsEmailCopy && ( ... )}` block that follows.

c) Find the validation block that references `contactEmail` (around line 946):
```ts
if (s === 0 && formData.wantsEmailCopy) {
  const em = formData.contactEmail.trim();
  if (!em) e.contactEmail = "Email required.";
  else if (!isValidEmail(em)) e.contactEmail = "Enter a valid email address.";
}
```
Delete this entire `if` block.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/risk/schema.ts app/assessment/page.tsx
git commit -m "feat: remove unimplemented email copy feature from form"
```

---

## Task 6: Add localStorage save-failure feedback

**Files:**
- Modify: `app/assessment/page.tsx`

- [ ] **Step 1: Add a `saveFailed` state to `AssessmentPage`**

In `AssessmentPage` component (around line 889), add a new state variable after the existing state declarations:

```ts
const [saveFailed, setSaveFailed] = useState(false);
```

- [ ] **Step 2: Check the return value of `safeLocalStorageSet` in the draft-save effect**

Find the `useEffect` that saves the draft — it calls `safeLocalStorageSet`. Replace the call so it checks the return value:

```ts
const saved = safeLocalStorageSet(DRAFT_KEY, JSON.stringify(formData));
setSaveFailed(!saved);
```

- [ ] **Step 3: Add the warning banner to the JSX**

In the JSX, just below the step header `<div>` (before the step content area), add:

```tsx
{saveFailed && (
  <div className="mb-4 flex items-start gap-3 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    <span className="shrink-0 font-semibold">⚠</span>
    <span>
      Draft could not be saved — your browser storage may be full. Your progress is not
      persisted.{" "}
      <button
        onClick={() => setSaveFailed(false)}
        className="ml-1 underline hover:no-underline"
      >
        Dismiss
      </button>
    </span>
  </div>
)}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/assessment/page.tsx
git commit -m "feat: show warning banner when localStorage draft save fails"
```

---

## Task 7: Extract computeResults to lib/risk/scoring.ts

**Files:**
- Modify: `lib/utils.ts` (clamp already added in Task 2)
- Modify: `lib/risk/scoring.ts`

- [ ] **Step 1: Define the `ComputedResults` return type in `lib/risk/scoring.ts`**

Replace the entire content of `lib/risk/scoring.ts` with the following (start of file):

```ts
import { AssessmentFormData } from "./schema";
import { clamp } from "../utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function displayName(data: AssessmentFormData): string {
  return data.systemName || data.companyName || "Your AI system";
}

// ── Return type ───────────────────────────────────────────────────────────────

export interface CategoryScore {
  name: string;
  score: number;
  status: "low" | "medium" | "high";
}

export interface ComplianceGap {
  standard: string;
  status: "ok" | "partial" | "gap";
  missing: string[];
}

export interface ComputedResults {
  riskScore: number;
  riskLevel: "High" | "Medium" | "Low";
  coverageTier: string;
  coverageEligibility: string;
  exclusions: string[];
  summary: string;
  categoryScores: CategoryScore[];
  riskDrivers: string[];
  validUntil: string;
  recommendations: { critical: string[]; high: string[]; medium: string[] };
  complianceGaps: ComplianceGap[];
  benchmark: { percentile: number; averageScore: number; comparison: string };
}
```

- [ ] **Step 2: Add the `computeResults` function**

Continue the file by pasting the full `computeResults` function. Take the body of the existing `computeResults` function from `app/results/page.tsx` (lines 77–498) and wrap it as an exported function:

```ts
export function computeResults(data: AssessmentFormData): ComputedResults {
  // === paste the entire body of computeResults from app/results/page.tsx here ===
  // The function body is lines 78–497 of app/results/page.tsx (everything between the
  // opening brace and the closing brace of the function).
  // Replace the final `return { ... }` to match ComputedResults type.
}
```

The exact body to copy is from `app/results/page.tsx` line 78 (`const drivers: string[] = [];`) through line 497 (the closing `};` of `return { ... }`), replacing the internal `return` object property names so they match `ComputedResults` exactly (they already match — no changes needed).

After pasting, the full file is: imports → helpers → type definitions → `computeResults` function.

**Do not keep `calculateAssessmentResult` or any of the old scoring.ts content.**

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/risk/scoring.ts
git commit -m "refactor: extract computeResults to lib/risk/scoring.ts as canonical scorer"
```

---

## Task 8: Tests for computeResults

**Files:**
- Create: `lib/risk/__tests__/scoring.test.ts`

- [ ] **Step 1: Create scoring tests**

Create `lib/risk/__tests__/scoring.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeResults } from "../scoring";
import { DEFAULT_ASSESSMENT_FORM } from "../schema";

const base = { ...DEFAULT_ASSESSMENT_FORM };

describe("computeResults", () => {
  it("riskScore is always in range [0, 100]", () => {
    const result = computeResults(base);
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it("full decision authority produces 'Fully automated' risk driver", () => {
    const result = computeResults({ ...base, decisionAuthority: "full" });
    expect(result.riskDrivers.some((d) => d.includes("Fully automated"))).toBe(true);
  });

  it("sensitive data produces relevant risk driver", () => {
    const result = computeResults({ ...base, dataSensitivity: "sensitive" });
    expect(result.riskDrivers.some((d) => d.includes("Sensitive data"))).toBe(true);
  });

  it("no documented process produces governance risk driver", () => {
    const result = computeResults({ ...base, documentedProcess: false });
    expect(result.riskDrivers.some((d) => d.includes("governance"))).toBe(true);
  });

  it("riskLevel is High when riskScore >= 70", () => {
    const result = computeResults({
      ...base,
      decisionAuthority: "full",
      financialImpactTier: "harm",
      dataSensitivity: "sensitive",
      deploymentType: "customer",
      documentedProcess: false,
      existingOversight: "none",
      incidentHistory: "multiple",
      biasTesting: ["No testing conducted"],
      monitoring: ["None"],
      modelDocs: ["None"],
      auditTrailCompleteness: "none",
      killSwitch: "none",
      aiCoverageCheck: "no-coverage",
      consumerRedress: "none",
      consumerExplainability: "none",
      vulnerableCustomerHandling: "none",
      regulatedEntity: true,
      independentValidation: "none",
      smfAccountability: false,
      formalAiPolicy: "no",
      incidentResponsePlan: false,
    });
    expect(result.riskLevel).toBe("High");
  });

  it("riskDrivers has at most 10 entries", () => {
    const result = computeResults({
      ...base,
      decisionAuthority: "full",
      financialImpactTier: "harm",
      dataSensitivity: "sensitive",
      deploymentType: "customer",
      documentedProcess: false,
      existingOversight: "none",
      incidentHistory: "multiple",
      biasTesting: ["No testing conducted"],
      monitoring: ["None"],
      modelDocs: ["None"],
    });
    expect(result.riskDrivers.length).toBeLessThanOrEqual(10);
  });

  it("riskLevel is Low when all signals are favourable", () => {
    const result = computeResults({
      ...base,
      decisionAuthority: "none",
      financialImpactTier: "under_100k",
      dataSensitivity: "none",
      deploymentType: "internal",
      documentedProcess: true,
      existingOversight: "continuous",
      hasDpo: true,
      incidentHistory: "none",
      biasTesting: ["Automated bias metrics"],
      monitoring: ["Performance monitoring", "Drift detection"],
      modelDocs: ["Model card", "Architecture doc", "Training data sheet"],
      auditTrailCompleteness: "decision-logic",
      killSwitch: "automated",
      aiCoverageCheck: "covered",
      formalAiPolicy: "yes",
      incidentResponsePlan: true,
    });
    expect(result.riskLevel).toBe("Low");
  });

  it("complianceGaps only includes frameworks with missing items", () => {
    const result = computeResults(base);
    result.complianceGaps.forEach((gap) => {
      expect(gap.missing.length).toBeGreaterThan(0);
    });
  });

  it("recommendations.critical is empty when no critical signals are present", () => {
    const result = computeResults({
      ...base,
      decisionAuthority: "none",
      financialImpactTier: "under_100k",
      dataSensitivity: "none",
      documentedProcess: true,
      biasTesting: ["Automated bias metrics"],
      killSwitch: "automated",
      aiCoverageCheck: "covered",
      consumerRedress: "formal",
      regulatedEntity: false,
    });
    expect(result.recommendations.critical).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: all 8 scoring tests pass plus the 5 schema tests from Task 4.

- [ ] **Step 3: Commit**

```bash
git add lib/risk/__tests__/scoring.test.ts
git commit -m "test: add computeResults unit tests"
```

---

## Task 9: Implement real API route

**Files:**
- Modify: `app/api/assessment/route.ts`

- [ ] **Step 1: Replace the 501 stub**

Replace the entire content of `app/api/assessment/route.ts` with:

```ts
import { NextRequest, NextResponse } from "next/server";
import { AssessmentFormData } from "../../../lib/risk/schema";
import { computeResults } from "../../../lib/risk/scoring";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as AssessmentFormData;

  if (!data.companyName || !data.systemName || !data.aiUseCase) {
    return NextResponse.json(
      { error: "Missing required fields: companyName, systemName, aiUseCase" },
      { status: 400 }
    );
  }

  const results = computeResults(data);
  return NextResponse.json(results);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/assessment/route.ts
git commit -m "feat: implement POST /api/assessment with computeResults"
```

---

## Task 10: Extract assessment field primitives

**Files:**
- Create: `components/assessment/FieldPrimitives.tsx`
- Create: `components/assessment/SectionTitle.tsx`

- [ ] **Step 1: Create `components/assessment/FieldPrimitives.tsx`**

```tsx
"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  );
}

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs text-slate-400">{children}</p>;
}

const fieldBase =
  "w-full rounded-sm border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors";
const fieldNormal =
  "border-slate-300 bg-white focus:border-blue-700 focus:ring-blue-700";
const fieldError =
  "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500";

export function Select({
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
        className={`${fieldBase} ${error ? fieldError : fieldNormal}`}
      >
        {children}
      </select>
      <FieldError msg={error} />
    </>
  );
}

export function TextInput({
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
        className={`${fieldBase} ${error ? fieldError : fieldNormal}`}
      />
      <FieldError msg={error} />
    </>
  );
}

export function Textarea({
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
        className={`${fieldBase} ${error ? fieldError : fieldNormal}`}
      />
      <FieldError msg={error} />
    </>
  );
}

export function CheckboxGroup({
  name,
  options,
  selected,
  onChange,
}: {
  name: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex cursor-pointer items-center gap-2.5 rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
        >
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={selected.includes(opt)}
            onChange={() => onChange(opt)}
            className="accent-blue-700"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string; hint?: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex cursor-pointer items-start gap-2.5 rounded-sm border border-slate-200 bg-white px-3 py-2.5 hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 accent-blue-700"
          />
          <div>
            <p className="text-sm font-medium text-slate-800">{opt.label}</p>
            {opt.hint && <p className="text-xs text-slate-500">{opt.hint}</p>}
          </div>
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/assessment/SectionTitle.tsx`**

```tsx
import React from "react";

export function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-blue-700 text-white">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/assessment/FieldPrimitives.tsx components/assessment/SectionTitle.tsx
git commit -m "refactor: extract assessment field primitives and SectionTitle"
```

---

## Task 11: Extract assessment step components

**Files:**
- Create: `components/assessment/steps/StepFirmDetails.tsx`
- Create: `components/assessment/steps/StepAiSystem.tsx`
- Create: `components/assessment/steps/StepRiskProfile.tsx`
- Create: `components/assessment/steps/StepGovernance.tsx`
- Create: `components/assessment/steps/StepEvidence.tsx`
- Create: `components/assessment/steps/StepReview.tsx`

- [ ] **Step 1: Create step components directory**

```bash
mkdir -p components/assessment/steps
```

- [ ] **Step 2: Extract each step**

For each step below, create the file and move the corresponding function body from `app/assessment/page.tsx` into it. Add `"use client";` at the top and import field primitives from `../FieldPrimitives` and `../SectionTitle`. Import any lucide icons used. Import types from `../../../lib/risk/schema`.

**Array change handler pattern:** Steps that contain `CheckboxGroup` fields (StepRiskProfile, StepGovernance, StepEvidence) receive an additional `onArrayChange: (name: string, value: string) => void` prop. They pass this directly to each `CheckboxGroup`'s `onChange`. Steps without checkbox groups (StepFirmDetails, StepAiSystem, StepReview) do not need this prop.

**`StepFirmDetails`** — copy the `StepFirmDetails` function body from `app/assessment/page.tsx` (lines 173–269). The component signature is:

```tsx
"use client";
import React from "react";
import { Building } from "lucide-react";
import { AssessmentFormData, AssessmentErrors } from "../../../lib/risk/schema";
import { Select, TextInput, Textarea } from "../FieldPrimitives";
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
  // === paste body from assessment/page.tsx lines 174–269 here ===
  // Note: this step has no CheckboxGroup fields, so onArrayChange is not needed.
}
```

**`StepAiSystem`** — lines 271–395 of `app/assessment/page.tsx`. Same signature as StepFirmDetails (no checkbox groups, no `onArrayChange`). Imports `Globe, Users, FileText` from lucide.

**`StepRiskProfile`** — lines 397–543. Uses `CheckboxGroup` fields. Signature:

```tsx
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
})
```

Pass `onArrayChange` to each `CheckboxGroup`'s `onChange` prop. Imports `Database, AlertTriangle` from lucide.

**`StepGovernance`** — lines 545–704. Uses `CheckboxGroup`. Same signature as StepRiskProfile but without `errors`. Imports `FileCheck, Shield` from lucide.

**`StepEvidence`** — lines 706–776. Uses `CheckboxGroup`. Same signature as StepRiskProfile but without `errors`. Imports `FileCheck` from lucide.

**`StepReview`** — lines 778–885. No checkbox groups. Imports `CheckCircle, AlertCircle` from lucide. Receives `preliminary: PreliminaryStatus` prop — import `PreliminaryStatus` from `../../../lib/risk/schema`.

Signature:
```tsx
export function StepReview({
  data,
  preliminary,
}: {
  data: AssessmentFormData;
  preliminary: PreliminaryStatus;
})
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/assessment/steps/
git commit -m "refactor: extract assessment step components"
```

---

## Task 12: Extract assessment navigation components

**Files:**
- Create: `components/assessment/StepIndicator.tsx`
- Create: `components/assessment/StepNav.tsx`
- Create: `components/assessment/LiveRiskBadge.tsx`

- [ ] **Step 1: Create `components/assessment/StepIndicator.tsx`**

```tsx
"use client";

type StepMeta = { title: string; icon: React.ReactNode };

export function StepIndicator({
  steps,
  current,
  onNavigate,
}: {
  steps: StepMeta[];
  current: number;
  onNavigate: (index: number) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          className={`flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-medium transition-colors ${
            i === current
              ? "bg-blue-700 text-white"
              : i < current
              ? "bg-blue-50 text-blue-700"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="hidden sm:inline">{s.icon}</span>
          <span className="hidden sm:inline">{s.title}</span>
          <span className="sm:hidden">{i + 1}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/assessment/StepNav.tsx`**

```tsx
"use client";

import { ChevronLeft, ChevronRight, Save } from "lucide-react";

export function StepNav({
  step,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  submitting,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
      <button
        onClick={onBack}
        disabled={step === 0}
        className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>
      {step < totalSteps - 1 ? (
        <button
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-sm bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-sm bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          <Save className="h-4 w-4" />
          {submitting ? "Submitting…" : "Submit Assessment"}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `components/assessment/LiveRiskBadge.tsx`**

```tsx
"use client";

import { PreliminaryStatus } from "../../lib/risk/schema";

export function LiveRiskBadge({ preliminary }: { preliminary: PreliminaryStatus }) {
  return (
    <div className={`rounded-sm border px-3 py-2 text-xs ${preliminary.bgColor} ${preliminary.borderColor}`}>
      <span className={`font-semibold ${preliminary.statusColor}`}>
        Live preview: {preliminary.status}
      </span>
      {preliminary.concerns.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-slate-600">
          {preliminary.concerns.map((c) => (
            <li key={c}>· {c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add components/assessment/StepIndicator.tsx components/assessment/StepNav.tsx components/assessment/LiveRiskBadge.tsx
git commit -m "refactor: extract StepIndicator, StepNav, LiveRiskBadge components"
```

---

## Task 13: Thin out app/assessment/page.tsx

**Files:**
- Modify: `app/assessment/page.tsx`

- [ ] **Step 1: Replace `app/assessment/page.tsx` with the thin shell**

The page keeps only: state management, validation logic, draft save/restore, and navigation logic. All UI primitives, step components, and nav components are imported. The full replacement:

```tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Building, Globe, FileText, Database, FileCheck } from "lucide-react";
import Container from "../../components/layout/Container";
import {
  AssessmentErrors,
  AssessmentFormData,
  DEFAULT_ASSESSMENT_FORM,
  DRAFT_KEY,
  SUBMISSION_KEY,
  calculatePreliminaryStatus,
  makeAssessmentId,
  safeJsonParse,
  safeLocalStorageGet,
  safeLocalStorageSet,
  toggleExclusive,
} from "../../lib/risk/schema";
import { StepFirmDetails } from "../../components/assessment/steps/StepFirmDetails";
import { StepAiSystem } from "../../components/assessment/steps/StepAiSystem";
import { StepRiskProfile } from "../../components/assessment/steps/StepRiskProfile";
import { StepGovernance } from "../../components/assessment/steps/StepGovernance";
import { StepEvidence } from "../../components/assessment/steps/StepEvidence";
import { StepReview } from "../../components/assessment/steps/StepReview";
import { StepIndicator } from "../../components/assessment/StepIndicator";
import { StepNav } from "../../components/assessment/StepNav";
import { LiveRiskBadge } from "../../components/assessment/LiveRiskBadge";

// ── Validation ────────────────────────────────────────────────────────────────

function validateStep(s: number, formData: AssessmentFormData): AssessmentErrors {
  const e: AssessmentErrors = {};
  if (s === 0) {
    if (!formData.companyName.trim()) e.companyName = "Company name is required.";
    if (!formData.industry) e.industry = "Select an industry.";
  }
  if (s === 1) {
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

  // Restore draft
  useEffect(() => {
    const raw = safeLocalStorageGet(DRAFT_KEY);
    const parsed = safeJsonParse<AssessmentFormData>(raw);
    if (parsed) setFormData(parsed);
  }, []);

  // Save draft
  useEffect(() => {
    const saved = safeLocalStorageSet(DRAFT_KEY, JSON.stringify(formData));
    setSaveFailed(!saved);
  }, [formData]);

  const steps = useMemo(
    () => [
      { title: "Your Firm", icon: <Building className="h-3.5 w-3.5" /> },
      { title: "AI System", icon: <Globe className="h-3.5 w-3.5" /> },
      { title: "Risk Profile", icon: <FileText className="h-3.5 w-3.5" /> },
      { title: "Governance", icon: <Shield className="h-3.5 w-3.5" /> },
      { title: "Evidence", icon: <Database className="h-3.5 w-3.5" /> },
      { title: "Review", icon: <FileCheck className="h-3.5 w-3.5" /> },
    ],
    []
  );

  const preliminary = useMemo(() => calculatePreliminaryStatus(formData), [formData]);

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
    if (i <= step) { setStep(i); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    for (let s = step; s < i; s++) {
      const e = validateStep(s, formData);
      if (Object.keys(e).length) { setErrors(e); setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    }
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    for (let s = 0; s < steps.length - 1; s++) {
      const e = validateStep(s, formData);
      if (Object.keys(e).length) { setErrors(e); setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    }
    setSubmitting(true);
    const id = makeAssessmentId();
    safeLocalStorageSet(SUBMISSION_KEY, JSON.stringify({ id, submittedAt: new Date().toISOString(), data: formData }));
    router.push("/results");
  }

  const progressPct = Math.round(((step + 1) / steps.length) * 100);

  return (
    <section className="min-h-screen bg-slate-50 py-10">
      <Container>
        <div className="mx-auto max-w-3xl">

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
            <p className="mt-1 text-xs text-slate-500">
              Step {step + 1} of {steps.length} — {steps[step].title}
            </p>
          </div>

          {/* Step tabs */}
          <div className="mb-4">
            <StepIndicator steps={steps} current={step} onNavigate={goTo} />
          </div>

          {/* Save failure banner */}
          {saveFailed && (
            <div className="mb-4 flex items-start gap-3 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="shrink-0 font-semibold">⚠</span>
              <span>
                Draft could not be saved — your browser storage may be full. Your progress is not persisted.{" "}
                <button onClick={() => setSaveFailed(false)} className="ml-1 underline hover:no-underline">
                  Dismiss
                </button>
              </span>
            </div>
          )}

          {/* Live risk badge */}
          <div className="mb-4">
            <LiveRiskBadge preliminary={preliminary} />
          </div>

          {/* Step content */}
          <div className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8">
            {step === 0 && <StepFirmDetails data={formData} errors={errors} onChange={handleChange} />}
            {step === 1 && <StepAiSystem data={formData} errors={errors} onChange={handleChange} />}
            {step === 2 && <StepRiskProfile data={formData} errors={errors} onChange={handleChange} onArrayChange={handleArrayChange} />}
            {step === 3 && <StepGovernance data={formData} onChange={handleChange} onArrayChange={handleArrayChange} />}
            {step === 4 && <StepEvidence data={formData} onChange={handleChange} onArrayChange={handleArrayChange} />}
            {step === 5 && <StepReview data={formData} preliminary={preliminary} />}

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
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Verify tests still pass**

```bash
npm test
```

- [ ] **Step 4: Commit**

```bash
git add app/assessment/page.tsx
git commit -m "refactor: thin out assessment page to shell (~180 lines)"
```

---

## Task 14: Extract results components

**Files:**
- Create: `components/results/ReportHeader.tsx`
- Create: `components/results/CategoryScores.tsx`
- Create: `components/results/RiskDriversList.tsx`
- Create: `components/results/RecommendationsPanel.tsx`
- Create: `components/results/ComplianceGaps.tsx`
- Create: `components/results/BenchmarkPanel.tsx`
- Create: `components/results/CoveragePanel.tsx`

- [ ] **Step 1: Create results components directory**

```bash
mkdir -p components/results
```

- [ ] **Step 2: Create `components/results/ReportHeader.tsx`**

```tsx
import React from "react";
import { Shield } from "lucide-react";
import { ComputedResults } from "../../lib/risk/scoring";

export function ReportHeader({
  systemName,
  companyName,
  assessmentDate,
  results,
}: {
  systemName: string;
  companyName: string;
  assessmentDate: string;
  results: ComputedResults;
}) {
  const scoreColor =
    results.riskScore >= 70
      ? "text-red-400"
      : results.riskScore >= 45
      ? "text-amber-400"
      : "text-green-400";

  const tierColor =
    results.riskLevel === "High"
      ? "bg-red-500/20 text-red-300"
      : results.riskLevel === "Medium"
      ? "bg-amber-500/20 text-amber-300"
      : "bg-green-500/20 text-green-300";

  return (
    <div className="bg-slate-900 rounded-sm px-6 py-5 print:bg-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">
            RiskPilot AI Governance Report
          </span>
        </div>
        <span className="text-xs text-slate-400">{assessmentDate}</span>
      </div>
      <div className="mt-3">
        <p className="text-xs text-slate-400">{companyName}</p>
        <p className="text-sm font-semibold text-white">{systemName}</p>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <span className={`text-5xl font-bold ${scoreColor}`}>{results.riskScore}</span>
        <div className="mb-1">
          <span className="text-slate-400 text-sm">/100</span>
          <div className={`mt-0.5 ml-3 inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${tierColor}`}>
            {results.riskLevel} Risk
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Valid until {results.validUntil} · {results.coverageTier} underwriting
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/results/CategoryScores.tsx`**

```tsx
import React from "react";
import { CategoryScore } from "../../lib/risk/scoring";
import { clamp } from "../../lib/utils";

export function CategoryScores({ scores }: { scores: CategoryScore[] }) {
  return (
    <div className="space-y-3">
      {scores.map((cat) => {
        const color =
          cat.status === "low"
            ? "bg-green-500"
            : cat.status === "medium"
            ? "bg-amber-500"
            : "bg-red-500";
        const clamped = clamp(cat.score, 0, 100);
        return (
          <div key={cat.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">{cat.name}</span>
              <span className="font-semibold text-slate-800">{clamped}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div
                className={`h-1.5 rounded-full ${color}`}
                style={{ width: `${clamped}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create `components/results/RiskDriversList.tsx`**

```tsx
import React from "react";
import { AlertTriangle } from "lucide-react";

export function RiskDriversList({ drivers }: { drivers: string[] }) {
  if (drivers.length === 0) {
    return <p className="text-sm text-slate-500">No significant risk drivers identified.</p>;
  }
  return (
    <ul className="space-y-2">
      {drivers.map((d) => (
        <li key={d} className="flex items-start gap-2 text-sm text-slate-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          {d}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: Create `components/results/RecommendationsPanel.tsx`**

```tsx
import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

type Recs = { critical: string[]; high: string[]; medium: string[] };

function RecItem({ text, level }: { text: string; level: "critical" | "high" | "medium" }) {
  const icon =
    level === "critical" ? (
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
    ) : level === "high" ? (
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
    ) : (
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
    );
  return (
    <li className="flex items-start gap-2 text-sm text-slate-700">
      {icon}
      {text}
    </li>
  );
}

export function RecommendationsPanel({ recommendations }: { recommendations: Recs }) {
  const { critical, high, medium } = recommendations;
  return (
    <div className="space-y-5">
      {critical.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-600">
            Critical ({critical.length})
          </p>
          <ul className="space-y-2">
            {critical.map((r) => <RecItem key={r} text={r} level="critical" />)}
          </ul>
        </div>
      )}
      {high.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-600">
            High ({high.length})
          </p>
          <ul className="space-y-2">
            {high.map((r) => <RecItem key={r} text={r} level="high" />)}
          </ul>
        </div>
      )}
      {medium.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Medium ({medium.length})
          </p>
          <ul className="space-y-2">
            {medium.map((r) => <RecItem key={r} text={r} level="medium" />)}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create `components/results/ComplianceGaps.tsx`**

```tsx
import React from "react";
import { ComplianceGap } from "../../lib/risk/scoring";

export function ComplianceGaps({ gaps }: { gaps: ComplianceGap[] }) {
  if (gaps.length === 0) {
    return <p className="text-sm text-slate-500">No compliance gaps identified.</p>;
  }
  return (
    <div className="space-y-4">
      {gaps.map((gap) => {
        const badgeColor =
          gap.status === "ok"
            ? "bg-green-100 text-green-700 border-green-200"
            : gap.status === "partial"
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : "bg-red-100 text-red-700 border-red-200";
        return (
          <div key={gap.standard} className="rounded-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-900">{gap.standard}</p>
              <span className={`rounded-sm border px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
                {gap.status === "ok" ? "Met" : gap.status === "partial" ? "Partial" : "Gap"}
              </span>
            </div>
            <ul className="space-y-1">
              {gap.missing.map((m) => (
                <li key={m} className="text-xs text-slate-600">· {m}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 7: Create `components/results/BenchmarkPanel.tsx`**

```tsx
import React from "react";

type Benchmark = { percentile: number; averageScore: number; comparison: string };

export function BenchmarkPanel({ benchmark, industry }: { benchmark: Benchmark; industry: string }) {
  return (
    <div className="space-y-2 text-sm text-slate-700">
      <p>
        <span className="font-semibold">Industry average ({industry}):</span>{" "}
        {benchmark.averageScore}/100
      </p>
      <p>
        <span className="font-semibold">Your position:</span> {benchmark.comparison}
      </p>
      <p>
        <span className="font-semibold">Percentile:</span> top {benchmark.percentile}%
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Create `components/results/CoveragePanel.tsx`**

```tsx
import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function CoveragePanel({
  eligibility,
  tier,
  exclusions,
}: {
  eligibility: string;
  tier: string;
  exclusions: string[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm">
        <span className="font-semibold">Eligibility:</span> {eligibility}
      </p>
      <p className="text-sm">
        <span className="font-semibold">Underwriting tier:</span> {tier}
      </p>
      {exclusions.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Potential exclusions
          </p>
          <ul className="space-y-1.5">
            {exclusions.map((ex) => (
              <li key={ex} className="flex items-start gap-2 text-xs text-slate-700">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                {ex}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 10: Commit**

```bash
git add components/results/
git commit -m "refactor: extract results section components"
```

---

## Task 15: Thin out app/results/page.tsx

**Files:**
- Modify: `app/results/page.tsx`

- [ ] **Step 1: Replace `app/results/page.tsx` with the thin shell**

The page keeps: localStorage read, `useMemo` for results, print handler, empty-state render, and the top-level layout. All sections delegate to imported components.

```tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Shield } from "lucide-react";
import Container from "../../components/layout/Container";
import Card from "../../components/ui/Card";
import ButtonLink from "../../components/ui/ButtonLink";
import {
  AssessmentFormData,
  SUBMISSION_KEY,
  safeJsonParse,
  safeLocalStorageGet,
} from "../../lib/risk/schema";
import { computeResults } from "../../lib/risk/scoring";
import { ReportHeader } from "../../components/results/ReportHeader";
import { CategoryScores } from "../../components/results/CategoryScores";
import { RiskDriversList } from "../../components/results/RiskDriversList";
import { RecommendationsPanel } from "../../components/results/RecommendationsPanel";
import { ComplianceGaps } from "../../components/results/ComplianceGaps";
import { BenchmarkPanel } from "../../components/results/BenchmarkPanel";
import { CoveragePanel } from "../../components/results/CoveragePanel";

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgoLabel(iso: string) {
  const diffDays = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function formatDate() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ── Types ─────────────────────────────────────────────────────────────────────

type StoredSubmission = {
  id: string;
  submittedAt: string;
  data: AssessmentFormData;
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [submission, setSubmission] = useState<StoredSubmission | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = safeLocalStorageGet(SUBMISSION_KEY);
    const parsed = safeJsonParse<StoredSubmission>(raw);
    setSubmission(parsed);
  }, []);

  const results = useMemo(() => {
    if (!submission) return null;
    return computeResults(submission.data);
  }, [submission]);

  const assessmentAge = useMemo(
    () => (submission ? daysAgoLabel(submission.submittedAt) : ""),
    [submission]
  );

  const handlePrint = () => window.print();

  if (!submission || !results) {
    return (
      <section className="py-16">
        <Container>
          <Card title="No assessment found">
            <p className="text-sm text-slate-600">
              We couldn&apos;t find a submitted assessment. Complete a new assessment to generate
              your AI Governance Score.
            </p>
            <div className="mt-4">
              <Link href="/assessment" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Start assessment →
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  const fd = submission.data;

  return (
    <>
      <style>{`@media print { body { background: white !important; } nav { display: none !important; } }`}</style>

      <section className="py-10 bg-slate-50 print:bg-white" ref={printRef}>
        <Container>
          <div className="mx-auto max-w-3xl space-y-6">

            {/* Top nav */}
            <div className="flex items-center justify-between print:hidden">
              <ButtonLink href="/assessment" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                New assessment
              </ButtonLink>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print / Download
              </button>
            </div>

            {/* Report header */}
            <ReportHeader
              systemName={fd.systemName}
              companyName={fd.companyName}
              assessmentDate={formatDate()}
              results={results}
            />

            {/* Summary */}
            <Card title="Executive Summary">
              <p className="text-sm text-slate-700 leading-relaxed">{results.summary}</p>
              <p className="mt-2 text-xs text-slate-400">Assessed {assessmentAge}</p>
            </Card>

            {/* Score breakdown */}
            <Card title="Score Breakdown">
              <CategoryScores scores={results.categoryScores} />
            </Card>

            {/* Coverage */}
            <Card title="Coverage Implications">
              <CoveragePanel
                eligibility={results.coverageEligibility}
                tier={results.coverageTier}
                exclusions={results.exclusions}
              />
            </Card>

            {/* Risk drivers */}
            <Card title="Risk Drivers">
              <RiskDriversList drivers={results.riskDrivers} />
            </Card>

            {/* Recommendations */}
            <Card title="Recommendations">
              <RecommendationsPanel recommendations={results.recommendations} />
            </Card>

            {/* Compliance gaps */}
            <Card title="Compliance Gaps">
              <ComplianceGaps gaps={results.complianceGaps} />
            </Card>

            {/* Benchmark */}
            <Card title="Industry Benchmark">
              <BenchmarkPanel benchmark={results.benchmark} industry={fd.industry} />
            </Card>

            {/* Footer CTA */}
            <div className="rounded-sm border border-slate-200 bg-white p-6 text-center print:hidden">
              <Shield className="mx-auto h-8 w-8 text-blue-700 mb-3" />
              <p className="text-sm font-semibold text-slate-900 mb-1">
                Want to discuss these results with an expert?
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Book a call to review your governance gaps and renewal strategy.
              </p>
              <ButtonLink href="/about" variant="primary">
                Book a consultation
              </ButtonLink>
            </div>

          </div>
        </Container>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: 13 tests pass, 0 failures.

- [ ] **Step 4: Commit**

```bash
git add app/results/page.tsx
git commit -m "refactor: thin out results page to shell using extracted components"
```

---

## Task 16: Final verification

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 2: Full test run with coverage**

```bash
npm run test:coverage
```

Expected: 13 tests pass.

- [ ] **Step 3: Check line counts on refactored files**

```bash
wc -l app/assessment/page.tsx app/results/page.tsx
```

Expected: both under 220 lines.

- [ ] **Step 4: Verify no references to deleted files**

```bash
grep -r "controls\|recommendations\|home/Hero\|home/Problem\|home/Score\|home/Book\|wantsEmailCopy\|contactEmail\|isValidEmail\|calculateAssessmentResult" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v .next | grep -v __tests__ | grep -v ".md"
```

Expected: no output.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification pass"
```
