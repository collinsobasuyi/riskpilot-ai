# Sprint 2: Re-Assessment Tracking — Design Spec
_Date: 2026-06-01_

## Goal

Let users track their governance score over time. Every submission is saved to a history array. Returning users see a score delta badge on their report and a "last score" banner before they start a new assessment.

---

## Data Model

### StoredSubmission type — moved to schema.ts

`StoredSubmission` is currently a local type in `app/results/page.tsx` and `lib/risk/demo-data.ts`. The new history helpers in `schema.ts` need it, so it must be exported from there. Both existing files should be updated to import it from `schema.ts` instead of redefining it locally.

```ts
// lib/risk/schema.ts — new export
export type StoredSubmission = {
  id: string;
  submittedAt: string;
  data: AssessmentFormData;
};
```

### New storage key

Add to `lib/risk/schema.ts`:

```ts
export const HISTORY_KEY = "assessmentHistory_v1";
```

Stores `StoredSubmission[]`. The array is ordered newest-first (index 0 = most recent).

### Helper functions (also in `lib/risk/schema.ts`)

**`getHistory(): StoredSubmission[]`**
Reads `HISTORY_KEY` from localStorage, parses as array. Returns `[]` on any failure.

**`appendToHistory(submission: StoredSubmission): void`**
Prepends the new submission to the history array, trims to last 10, writes back to `HISTORY_KEY`. Called from `app/assessment/page.tsx` immediately before `router.push("/results")`.

### Existing keys unchanged

`SUBMISSION_KEY` and `DRAFT_KEY` continue to work exactly as before. `SUBMISSION_KEY` still holds the single most-recent submission for the results page.

---

## Feature 1: Score delta badge on results

### Where

In `ReportHeader`, next to the numeric score.

### Logic

On results page load, `getHistory()` is called. Entry at index `[1]` (second-most-recent) is the previous submission. If it exists and `previousSubmission.data.systemName === currentSubmission.data.systemName`, compute `delta = currentScore - previousScore`.

### Component

`ReportHeader` accepts a new optional prop `scoreDelta?: number`. It renders an inline badge:
- `delta > 0` → green `↑ +{delta}` with `bg-green-100 text-green-700`
- `delta < 0` → red `↓ {delta}` with `bg-red-100 text-red-700`  
- `delta === 0` → grey `= no change` with `bg-slate-100 text-slate-500`
- `scoreDelta` undefined → badge not rendered

### Demo / shared links

`scoreDelta` is not computed for demo mode (`?demo=1`) or shared links (`?s=`). Pass `undefined`.

---

## Feature 2: Previous assessments table on results

### Component

New file: `components/results/AssessmentHistory.tsx`

Accepts `history: StoredSubmission[]` (the full array from `getHistory()`) and `currentId: string` (the id of the submission currently being viewed).

Filters out `currentId`, takes the next 3 entries. Returns `null` if fewer than 1 entry remains after filtering.

Renders a simple table:
- Columns: Date | System | Score | Risk Level
- Score is colour-coded: green (Low), amber (Medium), red (High) — derived by running `computeResults(entry.data).riskLevel`
- "Start new assessment →" link at the bottom pointing to `/assessment`

### Placement

Rendered as `<Card title="Previous Assessments">` at the bottom of `app/results/page.tsx`, above the "Book a consultation" footer CTA. Hidden in demo mode (`isDemo`).

---

## Feature 3: Last-score banner on assessment start

### Where

`app/assessment/page.tsx`, above the step form (below the step tabs).

### Logic

On mount, `getHistory()` is called. If `history[0]` exists (there is at least one previous submission), show the banner.

### Banner content

```
↺ Last assessment: {systemName} scored {score}/100 on {date}   [View report →]
```

- "View report →" links to `/results` (the last submission is already in `SUBMISSION_KEY`)
- Banner is dismissible — clicking × sets local React state `bannerDismissed: true`
- Dismissal is not persisted (reappears on next visit)
- Hidden once the user has advanced past step 0 (to avoid cluttering the form)

### Styling

Blue info banner: `bg-blue-50 border-blue-200 text-blue-800`

---

## Data flow

```
Assessment submit (app/assessment/page.tsx)
  └─ makeAssessmentId() → new submission object
  └─ safeLocalStorageSet(SUBMISSION_KEY, ...)   ← unchanged
  └─ appendToHistory(submission)                ← NEW
  └─ router.push("/results")

Results page load (app/results/page.tsx)
  └─ read submission (existing: ?s= / ?demo=1 / SUBMISSION_KEY)
  └─ getHistory()                               ← NEW
  └─ find history[1] with matching systemName → compute scoreDelta
  └─ pass scoreDelta to ReportHeader
  └─ pass history to AssessmentHistory

Assessment page load (app/assessment/page.tsx)
  └─ getHistory()                               ← NEW
  └─ if history[0] exists → show last-score banner
```

---

## Files created / modified

| Action | File | Change |
|---|---|---|
| Modify | `lib/risk/schema.ts` | Export `StoredSubmission` type; add `HISTORY_KEY`, `getHistory`, `appendToHistory` |
| Modify | `lib/risk/demo-data.ts` | Import `StoredSubmission` from schema instead of local type |
| Modify | `app/results/page.tsx` | Import `StoredSubmission` from schema instead of local type |
| Create | `components/results/AssessmentHistory.tsx` | Previous assessments table |
| Modify | `components/results/ReportHeader.tsx` | Accept + render `scoreDelta?: number` |
| Modify | `app/assessment/page.tsx` | Call `appendToHistory` on submit; show last-score banner |
| Modify | `app/results/page.tsx` | Compute delta, pass to ReportHeader, render AssessmentHistory |

---

## Out of scope

- Cross-device sync (localStorage only)
- Deleting individual history entries
- Filtering history by system name
- "View all" history page
- Score trend chart

## Success criteria

- Every assessment submission appends to `HISTORY_KEY`; array never exceeds 10 entries
- Score delta badge appears on results when the same system was assessed before
- Previous assessments table shows up to 3 prior entries, hidden on first-ever assessment
- Last-score banner visible on assessment page when history exists, dismissible, hidden past step 0
- Demo mode and shared links show no history UI
- All existing tests continue to pass
