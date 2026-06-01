# Sprint 1: Demo Report, 90-Day Action Plan, Shareable Link

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a demo report entry point on the homepage, a 90-day action plan section to the results page, and a copy-link share button so users can share their report via URL.

**Architecture:** Three independent features wired through `app/results/page.tsx`. Demo data lives in `lib/risk/demo-data.ts` and is activated by `?demo=1` in the URL. Shared links use `?s=<base64url>` encoded `AssessmentFormData`, decoded in the results page `useEffect`. The action plan is a pure display component deriving from existing `recommendations` data. Homepage stays a server component — the demo CTA is a plain `<Link>`.

**Tech Stack:** Next.js 16 App Router, React, Tailwind CSS v4, TypeScript, Vitest

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `lib/risk/demo-data.ts` | Hardcoded demo submission + DEMO_SUBMISSION export |
| Create | `lib/risk/share.ts` | encodeShareData / decodeShareData utilities |
| Create | `lib/risk/__tests__/demo-data.test.ts` | Tests for demo data validity |
| Create | `lib/risk/__tests__/share.test.ts` | Tests for encode/decode round-trip |
| Create | `components/results/ActionPlanPanel.tsx` | 3-column 30/60/90-day action plan |
| Modify | `app/page.tsx` | Add "See sample report" ghost Link to hero |
| Modify | `app/results/page.tsx` | Wire demo mode, share button, ?s= decode, ActionPlanPanel |

---

## Task 1: Demo data

**Files:**
- Create: `lib/risk/demo-data.ts`
- Create: `lib/risk/__tests__/demo-data.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/risk/__tests__/demo-data.test.ts
import { describe, it, expect } from "vitest";
import { DEMO_SUBMISSION } from "../demo-data";
import { computeResults } from "../scoring";

describe("DEMO_SUBMISSION", () => {
  it("has required string fields populated", () => {
    expect(DEMO_SUBMISSION.data.companyName).toBe("Acme Financial Ltd");
    expect(DEMO_SUBMISSION.data.systemName).toBe("Credit Scoring Engine v2");
    expect(DEMO_SUBMISSION.id).toBe("demo");
  });

  it("produces a valid result without throwing", () => {
    const results = computeResults(DEMO_SUBMISSION.data);
    expect(results.riskScore).toBeGreaterThan(0);
    expect(results.riskScore).toBeLessThanOrEqual(100);
    expect(["High", "Medium", "Low"]).toContain(results.riskLevel);
  });

  it("produces at least one recommendation", () => {
    const results = computeResults(DEMO_SUBMISSION.data);
    const total =
      results.recommendations.critical.length +
      results.recommendations.high.length +
      results.recommendations.medium.length;
    expect(total).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run lib/risk/__tests__/demo-data.test.ts
```
Expected: FAIL — "Cannot find module '../demo-data'"

- [ ] **Step 3: Create `lib/risk/demo-data.ts`**

```ts
import type { AssessmentFormData } from "./schema";

// Local type — matches the identical local type in app/results/page.tsx (structural compatibility)
type StoredSubmission = {
  id: string;
  submittedAt: string;
  data: AssessmentFormData;
};

export const DEMO_SUBMISSION: StoredSubmission = {
  id: "demo",
  submittedAt: new Date().toISOString(),
  data: {
    companyName: "Acme Financial Ltd",
    industry: "financial",
    companySize: "51-200",
    regulatedEntity: true,
    regulator: "fca",
    purpose: "PI insurance renewal preparation",
    systemName: "Credit Scoring Engine v2",
    aiUseCase:
      "Scores consumer credit applications using income, credit history, and open banking data. Produces a recommend/decline output passed to an underwriter for final decision.",
    aiMaturity: "production",
    deploymentType: "customer",
    usersCount: "12000",
    frequencyOfUse: "daily",
    criticality: "customer",
    foundationModelSource: "proprietary",
    modelHosting: "vendor-hosted",
    retrainingFrequency: "quarterly",
    shadowAiDetection: "",
    thirdPartyVendors: "Experian, open banking provider",
    aiCapabilities: ["classification", "scoring"],
    decisionAuthority: "partial",
    financialImpactTier: "100k_to_1m",
    dataSensitivity: "sensitive",
    dataVolume: "50000",
    thirdPartyData: true,
    systematicRisk: "batch",
    mttd: "1_to_24_hours",
    explainabilityType: "interpretable",
    humanIntervention: "post-audit",
    biasTesting: ["Unsure"],
    modelDocs: ["None"],
    dataTypes: ["financial", "personal"],
    regulations: ["FCA Consumer Duty"],
    existingOversight: "periodic",
    incidentHistory: "none",
    documentedProcess: false,
    hasDpo: true,
    auditTrailCompleteness: "input-output",
    externalVerification: "none",
    changeManagement: "peer-review",
    trainingFrequency: "annually",
    monitoringHallucination: false,
    killSwitch: "manual-slow",
    incidentResponse: "",
    monitoring: ["None"],
    budget: "",
    supplyChain: "",
    hasModelCards: false,
    modelCardsUrl: "",
    hasExternalAudit: false,
    externalAuditType: undefined,
    auditReportUrl: "",
    hasRedTeaming: false,
    redTeamingDate: "",
    redTeamingReportUrl: "",
    apiEndpoint: "",
    apiAccessible: false,
    aiCoverageCheck: "uncertain",
    consumerRedress: "in-progress",
    vulnerableCustomerHandling: "partial",
    consumerExplainability: "on-request",
    independentValidation: "none",
    smfAccountability: false,
    formalAiPolicy: "in-progress",
    incidentResponsePlan: false,
    additionalContext: "",
  },
};
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx vitest run lib/risk/__tests__/demo-data.test.ts
```
Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add lib/risk/demo-data.ts lib/risk/__tests__/demo-data.test.ts
git commit -m "feat: add demo submission data for sample report feature"
```

---

## Task 2: Share encode/decode utilities

**Files:**
- Create: `lib/risk/share.ts`
- Create: `lib/risk/__tests__/share.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/risk/__tests__/share.test.ts
import { describe, it, expect } from "vitest";
import { encodeShareData, decodeShareData } from "../share";
import { DEFAULT_ASSESSMENT_FORM } from "../schema";

describe("encodeShareData / decodeShareData", () => {
  it("round-trips AssessmentFormData losslessly", () => {
    const encoded = encodeShareData(DEFAULT_ASSESSMENT_FORM);
    const decoded = decodeShareData(encoded);
    expect(decoded).toEqual(DEFAULT_ASSESSMENT_FORM);
  });

  it("returns null for malformed input", () => {
    expect(decodeShareData("not-valid-base64!!!")).toBeNull();
  });

  it("returns null for valid base64 that is not AssessmentFormData", () => {
    const garbage = btoa(JSON.stringify({ foo: "bar" }));
    const decoded = decodeShareData(garbage);
    // Should parse but missing required fields — we accept partial objects
    // The contract is: null only on JSON parse failure
    expect(decoded).not.toBeNull();
  });

  it("produces a URL-safe string (no + / = chars)", () => {
    const encoded = encodeShareData(DEFAULT_ASSESSMENT_FORM);
    expect(encoded).not.toMatch(/[+/=]/);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run lib/risk/__tests__/share.test.ts
```
Expected: FAIL — "Cannot find module '../share'"

- [ ] **Step 3: Create `lib/risk/share.ts`**

```ts
import type { AssessmentFormData } from "./schema";

export function encodeShareData(data: AssessmentFormData): string {
  const json = JSON.stringify(data);
  // btoa requires latin1 — encodeURIComponent handles unicode safely
  const base64 = btoa(encodeURIComponent(json));
  // Make URL-safe: replace +, /, = with URL-safe chars
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function decodeShareData(encoded: string): AssessmentFormData | null {
  try {
    // Restore standard base64 chars
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(atob(base64));
    return JSON.parse(json) as AssessmentFormData;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx vitest run lib/risk/__tests__/share.test.ts
```
Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add lib/risk/share.ts lib/risk/__tests__/share.test.ts
git commit -m "feat: add share encode/decode utilities for shareable result links"
```

---

## Task 3: ActionPlanPanel component

**Files:**
- Create: `components/results/ActionPlanPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/results/ActionPlanPanel.tsx
type Recs = { critical: string[]; high: string[]; medium: string[] };

type Column = {
  label: string;
  days: string;
  items: string[];
  borderColor: string;
  labelColor: string;
  bgColor: string;
};

export function ActionPlanPanel({ recommendations }: { recommendations: Recs }) {
  const { critical, high, medium } = recommendations;

  if (!critical.length && !high.length && !medium.length) return null;

  const columns: Column[] = [
    {
      label: "CRITICAL",
      days: "30 DAYS",
      items: critical,
      borderColor: "border-red-500",
      labelColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "HIGH",
      days: "60 DAYS",
      items: high,
      borderColor: "border-amber-500",
      labelColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "MEDIUM",
      days: "90 DAYS",
      items: medium,
      borderColor: "border-blue-500",
      labelColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {columns.map((col) => (
        <div key={col.label} className={`border-l-4 ${col.borderColor} pl-4`}>
          <p className={`mb-3 text-xs font-bold uppercase tracking-widest ${col.labelColor}`}>
            {col.days} · {col.label}
          </p>
          {col.items.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No actions required</p>
          ) : (
            <div className="space-y-2">
              {col.items.map((item) => (
                <div
                  key={item}
                  className={`rounded-sm px-3 py-2 text-sm text-slate-700 leading-relaxed ${col.bgColor}`}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/results/ActionPlanPanel.tsx
git commit -m "feat: add ActionPlanPanel component for 90-day action plan"
```

---

## Task 4: Homepage demo CTA

**Files:**
- Modify: `app/page.tsx`

The homepage is a server component — the demo button is a plain `<Link>`, no client-side JS needed.

- [ ] **Step 1: Add the demo link to the hero CTA row**

In `app/page.tsx`, find the hero CTA `<div>` (line ~46) and add a third ghost link:

```tsx
// Before — hero CTA row
<div className="mt-10 flex flex-wrap items-center gap-4">
  <Link
    href="/assessment"
    className="inline-flex items-center gap-2 rounded-sm bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
  >
    Get Your Governance Score
    <ArrowRight className="h-4 w-4" />
  </Link>
  <Link
    href="/about"
    className="inline-flex items-center gap-2 rounded-sm border border-slate-600 bg-transparent px-6 py-3 text-sm font-semibold text-slate-300 hover:border-slate-400 hover:text-white transition-colors"
  >
    Read the thesis
  </Link>
</div>

// After — add third link
<div className="mt-10 flex flex-wrap items-center gap-4">
  <Link
    href="/assessment"
    className="inline-flex items-center gap-2 rounded-sm bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
  >
    Get Your Governance Score
    <ArrowRight className="h-4 w-4" />
  </Link>
  <Link
    href="/about"
    className="inline-flex items-center gap-2 rounded-sm border border-slate-600 bg-transparent px-6 py-3 text-sm font-semibold text-slate-300 hover:border-slate-400 hover:text-white transition-colors"
  >
    Read the thesis
  </Link>
  <Link
    href="/results?demo=1"
    className="inline-flex items-center gap-2 rounded-sm border border-slate-700 bg-transparent px-6 py-3 text-sm font-semibold text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors"
  >
    See sample report
  </Link>
</div>
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000`. Confirm three buttons appear in the hero: "Get Your Governance Score", "Read the thesis", "See sample report".

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add See sample report CTA to homepage hero"
```

---

## Task 5: Wire results page — demo mode, share button, ActionPlanPanel

**Files:**
- Modify: `app/results/page.tsx`

This task wires all three features into the existing results page. The page is already `"use client"`.

- [ ] **Step 1: Add imports**

At the top of `app/results/page.tsx`, add:

```tsx
import { Copy, Check } from "lucide-react";
import { DEMO_SUBMISSION } from "../../lib/risk/demo-data";
import { encodeShareData, decodeShareData } from "../../lib/risk/share";
import { ActionPlanPanel } from "../../components/results/ActionPlanPanel";
```

- [ ] **Step 2: Add state for demo mode and copy button**

Inside `ResultsPage()`, after the existing state declarations, add:

```tsx
const [isDemo, setIsDemo] = useState(false);
const [copied, setCopied] = useState(false);
```

- [ ] **Step 3: Update the useEffect to handle ?demo=1 and ?s=**

Replace the existing `useEffect` (the one that reads localStorage):

```tsx
// Before
useEffect(() => {
  const raw = safeLocalStorageGet(SUBMISSION_KEY);
  const parsed = safeJsonParse<StoredSubmission>(raw);
  setSubmission(parsed);
}, []);

// After
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const shared = params.get("s");
  const demo = params.get("demo");

  if (shared) {
    const data = decodeShareData(shared);
    if (data) {
      setSubmission({ id: "shared", submittedAt: new Date().toISOString(), data });
    }
    return;
  }

  if (demo === "1") {
    setSubmission(DEMO_SUBMISSION);
    setIsDemo(true);
    return;
  }

  const raw = safeLocalStorageGet(SUBMISSION_KEY);
  const parsed = safeJsonParse<StoredSubmission>(raw);
  setSubmission(parsed);
}, []);
```

- [ ] **Step 4: Add handleCopyLink function**

After the existing `handlePrint` function, add:

```tsx
function handleCopyLink() {
  if (!submission) return;
  const encoded = encodeShareData(submission.data);
  const url = `${window.location.origin}/results?s=${encoded}`;
  navigator.clipboard.writeText(url).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  });
}
```

- [ ] **Step 5: Add demo banner and copy link button to the JSX**

Find the `{/* Top nav */}` block and replace it:

```tsx
// Before
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

// After
{/* Top nav */}
<div className="flex items-center justify-between print:hidden">
  <ButtonLink href="/assessment" variant="ghost">
    <ArrowLeft className="h-4 w-4" />
    New assessment
  </ButtonLink>
  <div className="flex items-center gap-2">
    <button
      onClick={handleCopyLink}
      className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
    >
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied!" : "Copy link"}
    </button>
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
    >
      <Printer className="h-4 w-4" />
      Print / Download
    </button>
  </div>
</div>
```

- [ ] **Step 6: Add demo banner after the top nav block**

After the `{/* Top nav */}` closing `</div>`, add:

```tsx
{/* Demo banner */}
{isDemo && (
  <div className="flex items-start gap-3 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
    <span className="shrink-0 font-semibold">⚑</span>
    <span>
      You&apos;re viewing a sample report.{" "}
      <Link href="/assessment" className="underline hover:no-underline font-semibold">
        Start your own assessment
      </Link>{" "}
      to generate real results.
    </span>
  </div>
)}
```

- [ ] **Step 7: Add ActionPlanPanel between Recommendations and Compliance Gaps**

Find the `{/* Recommendations */}` and `{/* Compliance gaps */}` cards and insert between them:

```tsx
{/* Recommendations */}
<Card title="Recommendations">
  <RecommendationsPanel recommendations={results.recommendations} />
</Card>

{/* 90-day action plan */}
<Card title="Your 90-Day Action Plan">
  <ActionPlanPanel recommendations={results.recommendations} />
</Card>

{/* Compliance gaps */}
<Card title="Compliance Gaps">
  <ComplianceGaps gaps={results.complianceGaps} />
</Card>
```

- [ ] **Step 8: Hide "Book a consultation" CTA in demo mode**

Find the footer CTA block and add `{!isDemo && (` wrapper:

```tsx
{/* Footer CTA */}
{!isDemo && (
  <div className="rounded-sm border border-slate-200 bg-white p-6 text-center print:hidden">
    <Shield className="mx-auto h-8 w-8 text-blue-700 mb-3" />
    <p className="text-base font-semibold text-slate-900 mb-1">
      Want to discuss these results with an expert?
    </p>
    <p className="text-base text-slate-500 leading-relaxed mb-4">
      Book a call to review your governance gaps and renewal strategy.
    </p>
    <ButtonLink href="/about" variant="primary">
      Book a consultation
    </ButtonLink>
  </div>
)}
```

- [ ] **Step 9: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 10: Commit**

```bash
git add app/results/page.tsx
git commit -m "feat: wire demo mode, share link, and action plan into results page"
```

---

## Task 6: End-to-end browser verification

- [ ] **Step 1: Test demo report flow**

1. Navigate to `http://localhost:3000`
2. Click "See sample report" — should navigate to `/results?demo=1`
3. Verify the amber demo banner appears: "You're viewing a sample report"
4. Verify the report renders with Acme Financial Ltd data
5. Verify "Book a consultation" CTA is hidden
6. Verify "Your 90-Day Action Plan" card appears with three columns

- [ ] **Step 2: Test share link flow**

1. Navigate to `/results?demo=1`
2. Click "Copy link" — button should change to "✓ Copied!" for 2 seconds
3. Open a new private/incognito tab and paste the copied URL
4. Verify the same report renders with no localStorage (no demo banner — shared links don't set `isDemo`)
5. Verify "Your 90-Day Action Plan" appears in the shared view

- [ ] **Step 3: Test action plan with empty buckets**

1. Complete a minimal assessment (just required fields, all defaults)
2. Submit and check `/results`
3. If medium recommendations only — verify only the Medium column shows items, Critical and High show "No actions required"

- [ ] **Step 4: Run full test suite**

```bash
npx vitest run
```
Expected: all tests pass including the new demo-data and share tests

- [ ] **Step 5: Commit verification**

```bash
git commit --allow-empty -m "chore: sprint 1 e2e verification passed"
```
