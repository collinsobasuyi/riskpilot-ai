# Sprint 2: Re-Assessment Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store every assessment submission in a history array so returning users see a score delta badge on their report, a table of previous assessments, and a "last score" reminder before starting a new assessment.

**Architecture:** `StoredSubmission` is promoted to a shared export in `lib/risk/schema.ts` alongside a `buildUpdatedHistory` pure function (testable) and thin `getHistory`/`appendToHistory` wrappers over existing localStorage helpers. All UI reads history from client-side state; demo mode and shared links (`?s=`) are excluded from history UI.

**Tech Stack:** Next.js 16 App Router, React, Tailwind CSS v4, TypeScript, Vitest

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `lib/risk/schema.ts` | Export `StoredSubmission`; add `HISTORY_KEY`, `buildUpdatedHistory`, `getHistory`, `appendToHistory` |
| Modify | `lib/risk/demo-data.ts` | Import `StoredSubmission` from schema (remove local type) |
| Create | `lib/risk/__tests__/history.test.ts` | Tests for `buildUpdatedHistory` |
| Create | `components/results/AssessmentHistory.tsx` | Previous assessments table |
| Modify | `components/results/ReportHeader.tsx` | Accept + render `scoreDelta?: number` badge |
| Modify | `app/assessment/page.tsx` | Call `appendToHistory` on submit; show last-score banner |
| Modify | `app/results/page.tsx` | Import `StoredSubmission` from schema; load history; compute delta; render AssessmentHistory |

---

## Task 1: Schema — StoredSubmission export + history helpers + tests

**Files:**
- Modify: `lib/risk/schema.ts`
- Create: `lib/risk/__tests__/history.test.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/risk/__tests__/history.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildUpdatedHistory } from "../schema";
import type { StoredSubmission } from "../schema";
import { DEFAULT_ASSESSMENT_FORM } from "../schema";

function makeEntry(id: string): StoredSubmission {
  return { id, submittedAt: new Date().toISOString(), data: DEFAULT_ASSESSMENT_FORM };
}

describe("buildUpdatedHistory", () => {
  it("prepends entry to empty array", () => {
    const result = buildUpdatedHistory([], makeEntry("a"));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a");
  });

  it("prepends entry to existing array, newest first", () => {
    const existing = [makeEntry("old")];
    const result = buildUpdatedHistory(existing, makeEntry("new"));
    expect(result[0].id).toBe("new");
    expect(result[1].id).toBe("old");
  });

  it("trims to maxLength", () => {
    const existing = Array.from({ length: 10 }, (_, i) => makeEntry(`e${i}`));
    const result = buildUpdatedHistory(existing, makeEntry("newest"), 10);
    expect(result).toHaveLength(10);
    expect(result[0].id).toBe("newest");
  });

  it("default maxLength is 10", () => {
    const existing = Array.from({ length: 10 }, (_, i) => makeEntry(`e${i}`));
    const result = buildUpdatedHistory(existing, makeEntry("newest"));
    expect(result).toHaveLength(10);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run lib/risk/__tests__/history.test.ts
```
Expected: FAIL — "buildUpdatedHistory is not exported" or "StoredSubmission is not exported"

- [ ] **Step 3: Add exports to `lib/risk/schema.ts`**

After the `export type AssessmentErrors` line (~line 143), add:

```ts
export type StoredSubmission = {
  id: string;
  submittedAt: string;
  data: AssessmentFormData;
};

export const HISTORY_KEY = "assessmentHistory_v1";

export function buildUpdatedHistory(
  current: StoredSubmission[],
  entry: StoredSubmission,
  maxLength = 10
): StoredSubmission[] {
  return [entry, ...current].slice(0, maxLength);
}

export function getHistory(): StoredSubmission[] {
  const raw = safeLocalStorageGet(HISTORY_KEY);
  return safeJsonParse<StoredSubmission[]>(raw) ?? [];
}

export function appendToHistory(entry: StoredSubmission): void {
  const current = getHistory();
  const updated = buildUpdatedHistory(current, entry);
  safeLocalStorageSet(HISTORY_KEY, JSON.stringify(updated));
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run lib/risk/__tests__/history.test.ts
```
Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add lib/risk/schema.ts lib/risk/__tests__/history.test.ts
git commit -m "feat: export StoredSubmission and add history helpers to schema"
```

---

## Task 2: Update demo-data.ts to import StoredSubmission from schema

**Files:**
- Modify: `lib/risk/demo-data.ts`

- [ ] **Step 1: Replace local type with import**

```ts
// Before — top of file
import type { AssessmentFormData } from "./schema";

// Local type — matches the identical local type in app/results/page.tsx (structural compatibility)
type StoredSubmission = {
  id: string;
  submittedAt: string;
  data: AssessmentFormData;
};

// After — top of file
import type { AssessmentFormData, StoredSubmission } from "./schema";
```

Remove the 5-line local type block entirely. The `DEMO_SUBMISSION` constant stays identical.

- [ ] **Step 2: Verify TypeScript and tests**

```bash
npx tsc --noEmit && npx vitest run lib/risk/__tests__/demo-data.test.ts
```
Expected: no errors, 3 tests pass

- [ ] **Step 3: Commit**

```bash
git add lib/risk/demo-data.ts
git commit -m "refactor: import StoredSubmission from schema in demo-data"
```

---

## Task 3: AssessmentHistory component

**Files:**
- Create: `components/results/AssessmentHistory.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/results/AssessmentHistory.tsx
import Link from "next/link";
import type { StoredSubmission } from "../../lib/risk/schema";
import { computeResults } from "../../lib/risk/scoring";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AssessmentHistory({
  history,
  currentId,
}: {
  history: StoredSubmission[];
  currentId: string;
}) {
  const previous = history.filter((e) => e.id !== currentId).slice(0, 3);
  if (previous.length === 0) return null;

  return (
    <div className="space-y-2">
      {previous.map((entry) => {
        const results = computeResults(entry.data);
        const scoreColor =
          results.riskLevel === "High"
            ? "text-red-600"
            : results.riskLevel === "Medium"
            ? "text-amber-600"
            : "text-green-600";
        const bgColor =
          results.riskLevel === "High"
            ? "bg-red-50"
            : results.riskLevel === "Medium"
            ? "bg-amber-50"
            : "bg-green-50";

        return (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-sm border border-slate-200 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">
                {entry.data.systemName || entry.data.companyName}
              </p>
              <p className="text-xs text-slate-400">{formatDate(entry.submittedAt)}</p>
            </div>
            <div
              className={`inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-semibold ${bgColor} ${scoreColor}`}
            >
              {results.riskScore}/100 · {results.riskLevel} Risk
            </div>
          </div>
        );
      })}
      <div className="pt-1">
        <Link
          href="/assessment"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Start new assessment →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/results/AssessmentHistory.tsx
git commit -m "feat: add AssessmentHistory component for previous assessments table"
```

---

## Task 4: Add scoreDelta badge to ReportHeader

**Files:**
- Modify: `components/results/ReportHeader.tsx`

- [ ] **Step 1: Add `scoreDelta` prop and badge**

```tsx
// Before — function signature
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

// After — add optional scoreDelta
export function ReportHeader({
  systemName,
  companyName,
  assessmentDate,
  results,
  scoreDelta,
}: {
  systemName: string;
  companyName: string;
  assessmentDate: string;
  results: ComputedResults;
  scoreDelta?: number;
}) {
```

Then in the JSX, find the score + risk level row (the `<div className="mt-4 flex items-end gap-3">`) and add the delta badge after the risk tier badge:

```tsx
// Before
<div className="mt-4 flex items-end gap-3">
  <span className={`text-5xl font-bold ${scoreColor}`}>{results.riskScore}</span>
  <div className="mb-1">
    <span className="text-slate-400 text-sm">/100</span>
    <div className={`mt-0.5 ml-3 inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${tierColor}`}>
      {results.riskLevel} Risk
    </div>
  </div>
</div>

// After
<div className="mt-4 flex items-end gap-3 flex-wrap">
  <span className={`text-5xl font-bold ${scoreColor}`}>{results.riskScore}</span>
  <div className="mb-1 flex items-center gap-2 flex-wrap">
    <span className="text-slate-400 text-sm">/100</span>
    <div className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${tierColor}`}>
      {results.riskLevel} Risk
    </div>
    {scoreDelta !== undefined && (
      <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold ${
        scoreDelta > 0
          ? "bg-green-500/20 text-green-300"
          : scoreDelta < 0
          ? "bg-red-500/20 text-red-300"
          : "bg-slate-500/20 text-slate-400"
      }`}>
        {scoreDelta > 0 ? `↑ +${scoreDelta}` : scoreDelta < 0 ? `↓ ${scoreDelta}` : "= no change"} since last
      </span>
    )}
  </div>
</div>
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/results/ReportHeader.tsx
git commit -m "feat: add optional scoreDelta badge to ReportHeader"
```

---

## Task 5: Assessment page — appendToHistory on submit + last-score banner

**Files:**
- Modify: `app/assessment/page.tsx`

- [ ] **Step 1: Add imports**

Add to the existing import from `../../lib/risk/schema`:

```ts
// Before
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

// After — add StoredSubmission, getHistory, appendToHistory
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
```

- [ ] **Step 2: Add state for history banner**

After the existing state declarations (`formData`, `errors`, `step`, `submitting`, `saveFailed`), add:

```tsx
const [lastEntry, setLastEntry] = useState<StoredSubmission | null>(null);
const [bannerDismissed, setBannerDismissed] = useState(false);
```

- [ ] **Step 3: Load history on mount**

Add a new `useEffect` after the existing draft restore one:

```tsx
// Load last submission for history banner
useEffect(() => {
  const history = getHistory();
  if (history.length > 0) setLastEntry(history[0]);
}, []);
```

- [ ] **Step 4: Call appendToHistory in handleSubmit**

```tsx
// Before
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

// After — add appendToHistory call
async function handleSubmit() {
  for (let s = 0; s < steps.length - 1; s++) {
    const e = validateStep(s, formData);
    if (Object.keys(e).length) { setErrors(e); setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  }
  setSubmitting(true);
  const id = makeAssessmentId();
  const submission: StoredSubmission = { id, submittedAt: new Date().toISOString(), data: formData };
  safeLocalStorageSet(SUBMISSION_KEY, JSON.stringify(submission));
  appendToHistory(submission);
  router.push("/results");
}
```

- [ ] **Step 5: Add last-score banner to JSX**

In the JSX, after the `{/* Step tabs */}` block and before `{/* Save failure banner */}`, add:

```tsx
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
```

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add app/assessment/page.tsx
git commit -m "feat: append to history on submit and show last-score banner on assessment start"
```

---

## Task 6: Wire results page — history state, scoreDelta, AssessmentHistory

**Files:**
- Modify: `app/results/page.tsx`

- [ ] **Step 1: Update schema import — add StoredSubmission, getHistory; remove local type**

```tsx
// Before — schema import
import {
  AssessmentFormData,
  SUBMISSION_KEY,
  safeJsonParse,
  safeLocalStorageGet,
} from "../../lib/risk/schema";

// After
import {
  AssessmentFormData,
  StoredSubmission,
  SUBMISSION_KEY,
  getHistory,
  safeJsonParse,
  safeLocalStorageGet,
} from "../../lib/risk/schema";
```

Remove the local `type StoredSubmission` block (the 4-line type definition near line 42).

- [ ] **Step 2: Add AssessmentHistory import**

```tsx
import { AssessmentHistory } from "../../components/results/AssessmentHistory";
```

- [ ] **Step 3: Add history state**

After the existing `const [isDemo, setIsDemo] = useState(false);` line, add:

```tsx
const [history, setHistory] = useState<StoredSubmission[]>([]);
```

- [ ] **Step 4: Load history in useEffect**

In the existing `useEffect` (the one that reads `?s=`, `?demo=1`, or localStorage), add a history load at the end of each branch. Replace the entire useEffect:

```tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const shared = params.get("s");
  const demo = params.get("demo");

  setHistory(getHistory());

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

- [ ] **Step 5: Compute scoreDelta with useMemo**

After the existing `const assessmentAge = useMemo(...)` block, add:

```tsx
const scoreDelta = useMemo(() => {
  if (!submission || !results || isDemo || submission.id === "shared") return undefined;
  const prev = history.find(
    (e) => e.id !== submission.id && e.data.systemName === submission.data.systemName
  );
  if (!prev) return undefined;
  const prevResults = computeResults(prev.data);
  return results.riskScore - prevResults.riskScore;
}, [submission, results, history, isDemo]);
```

- [ ] **Step 6: Pass scoreDelta to ReportHeader**

```tsx
// Before
<ReportHeader
  systemName={fd.systemName}
  companyName={fd.companyName}
  assessmentDate={formatDate()}
  results={results}
/>

// After
<ReportHeader
  systemName={fd.systemName}
  companyName={fd.companyName}
  assessmentDate={formatDate()}
  results={results}
  scoreDelta={scoreDelta}
/>
```

- [ ] **Step 7: Add AssessmentHistory card above footer CTA**

Find the `{/* Footer CTA */}` block and insert before it:

```tsx
{/* Assessment history */}
{!isDemo && submission.id !== "shared" && (
  <Card title="Previous Assessments">
    <AssessmentHistory history={history} currentId={submission.id} />
  </Card>
)}

{/* Footer CTA */}
{!isDemo && (
  ...existing footer CTA...
)}
```

- [ ] **Step 8: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 9: Run full test suite**

```bash
npx vitest run
```
Expected: all tests pass (now 25 tests including the 4 new history tests)

- [ ] **Step 10: Commit**

```bash
git add app/results/page.tsx
git commit -m "feat: wire history state, score delta, and AssessmentHistory into results page"
```

---

## Task 7: Browser verification

- [ ] **Step 1: Verify first-ever assessment (no history)**

1. Open a fresh private/incognito window to avoid existing localStorage
2. Go to `http://localhost:3000/assessment` — confirm NO blue last-score banner
3. Complete the assessment (fill companyName, systemName, click through all steps, submit)
4. On results page: confirm NO delta badge on score, NO "Previous Assessments" card (only one entry exists)

- [ ] **Step 2: Verify second assessment shows history**

1. In the same window, click "New assessment"
2. Assessment page should now show the blue banner: "↺ Last assessment: {systemName} — View report →"
3. Advance to step 1 — banner should disappear (hidden on steps > 0)
4. Go back to step 0 — banner reappears (correct — only the × button permanently dismisses it)
5. Submit a new assessment
6. Results page should show:
   - Score delta badge: `↑ +N since last` (or `↓ -N`) next to the score
   - "Previous Assessments" card with 1 row showing the first assessment

- [ ] **Step 3: Verify demo mode excludes history UI**

1. Navigate to `http://localhost:3000/results?demo=1`
2. Confirm NO delta badge on score
3. Confirm NO "Previous Assessments" card

- [ ] **Step 4: Verify shared link excludes history UI**

1. On any results page, click "Copy link"
2. Open the copied URL in a new incognito tab
3. Confirm NO delta badge, NO "Previous Assessments" card

- [ ] **Step 5: Commit**

```bash
git commit --allow-empty -m "chore: sprint 2 e2e verification passed — history tracking working"
```
