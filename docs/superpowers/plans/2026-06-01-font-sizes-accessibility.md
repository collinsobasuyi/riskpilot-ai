# Font Size Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring all meaningful text up to WCAG 2.1 AA font-size standards across all 25 affected files by shifting `text-xs` → `text-sm` and `text-sm` → `text-base` on body copy, form labels, and result panels, while adding `leading-relaxed` to body paragraphs.

**Architecture:** Grouped into 6 tasks by file group. Each task is a focused find-and-replace pass on related files, followed by an immediate commit. No logic changes — CSS class changes only.

**Tech Stack:** Next.js 16, Tailwind CSS v4, TypeScript

---

## Decision Table (apply everywhere)

| Old class | New class | Applies to |
|---|---|---|
| `text-xs` | `text-sm` | Error messages, form labels, helper text, hint text, instructional text, list body items |
| `text-xs` | **keep** | Uppercase eyebrow labels (`font-semibold uppercase tracking-widest`), badge pills, character counters, date/metadata captions, footnotes |
| `text-sm` | `text-base` | Body paragraphs, form field option labels, result panel text, description copy |
| `text-sm` | **keep** | Buttons, nav links, tab labels, step counter line, link text |
| body `<p>` without `leading-relaxed` | + `leading-relaxed` | All body description paragraphs |

---

## Task 1: FieldPrimitives — form building blocks

**Files:**
- Modify: `components/assessment/FieldPrimitives.tsx`

- [ ] **Step 1: Apply changes**

In `components/assessment/FieldPrimitives.tsx` make these exact replacements:

Line 9 — error message (`text-xs` → `text-sm`):
```tsx
// Before
<p className="mt-1 flex items-center gap-1 text-xs text-red-600">
// After
<p className="mt-1 flex items-center gap-1 text-sm text-red-600">
```

Line 18 — field label (`text-xs` → `text-sm`):
```tsx
// Before
<label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
// After
<label className="mb-1.5 block text-sm font-semibold uppercase tracking-widest text-slate-500">
```

Line 26 — helper/hint text (`text-xs` → `text-sm`):
```tsx
// Before
return <p className="mb-2 text-xs text-slate-400">{children}</p>;
// After
return <p className="mb-2 text-sm text-slate-400">{children}</p>;
```

Line 184 — option label (`text-sm` → `text-base`):
```tsx
// Before
<p className="text-sm font-medium text-slate-800">{opt.label}</p>
// After
<p className="text-base font-medium text-slate-800">{opt.label}</p>
```

Line 185 — option hint (`text-xs` → `text-sm`):
```tsx
// Before
{opt.hint && <p className="text-xs text-slate-500">{opt.hint}</p>}
// After
{opt.hint && <p className="text-sm text-slate-500">{opt.hint}</p>}
```

- [ ] **Step 2: Commit**
```bash
git add components/assessment/FieldPrimitives.tsx
git commit -m "fix(a11y): bump font sizes in FieldPrimitives — labels, hints, errors"
```

---

## Task 2: Assessment step files

**Files:**
- Modify: `components/assessment/steps/StepFirmDetails.tsx`
- Modify: `components/assessment/steps/StepAiSystem.tsx` *(no body changes — character counter stays `text-xs`)*
- Modify: `components/assessment/steps/StepRiskProfile.tsx`
- Modify: `components/assessment/steps/StepGovernance.tsx`
- Modify: `components/assessment/steps/StepEvidence.tsx`

- [ ] **Step 1: Apply StepFirmDetails change**

`components/assessment/steps/StepFirmDetails.tsx` line 54:
```tsx
// Before
<label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
// After
<label className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700">
```

- [ ] **Step 2: Apply StepRiskProfile change**

`components/assessment/steps/StepRiskProfile.tsx` line 125:
```tsx
// Before
<label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
// After
<label className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700">
```

- [ ] **Step 3: Apply StepGovernance changes**

`components/assessment/steps/StepGovernance.tsx` — two occurrences (lines 40 and 152):
```tsx
// Before (both occurrences)
className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700"
// After (both occurrences)
className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700"
```

- [ ] **Step 4: Apply StepEvidence changes**

`components/assessment/steps/StepEvidence.tsx`:

Line 39 — checkbox label:
```tsx
// Before
<label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
// After
<label className="flex cursor-pointer items-start gap-3 text-base text-slate-700">
```

Line 45 — hint text (`text-xs` → `text-sm`):
```tsx
// Before
<p className="text-xs text-slate-500">{item.hint}</p>
// After
<p className="text-sm text-slate-500">{item.hint}</p>
```

- [ ] **Step 5: Commit**
```bash
git add components/assessment/steps/StepFirmDetails.tsx \
        components/assessment/steps/StepRiskProfile.tsx \
        components/assessment/steps/StepGovernance.tsx \
        components/assessment/steps/StepEvidence.tsx
git commit -m "fix(a11y): bump form label and hint sizes in assessment step components"
```

---

## Task 3: Assessment shell, StepReview, LiveRiskBadge, SectionTitle

**Files:**
- Modify: `app/assessment/page.tsx`
- Modify: `components/assessment/steps/StepReview.tsx`
- Modify: `components/assessment/LiveRiskBadge.tsx`
- Modify: `components/assessment/SectionTitle.tsx`

- [ ] **Step 1: assessment/page.tsx**

Line 155 — step progress text (`text-xs` → `text-sm`):
```tsx
// Before
<p className="mt-1 text-xs text-slate-500">
// After
<p className="mt-1 text-sm text-slate-500">
```

Line 167 — save-failure banner (`text-sm` → `text-base`):
```tsx
// Before
<div className="mb-4 flex items-start gap-3 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
// After
<div className="mb-4 flex items-start gap-3 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-base text-amber-800">
```

- [ ] **Step 2: StepReview.tsx**

Line 83 — note text (`text-xs` → `text-sm`):
```tsx
// Before
<p className="text-xs text-slate-500">Full AI Governance Score calculated on submission — submit to see the complete breakdown.</p>
// After
<p className="text-sm text-slate-500">Full AI Governance Score calculated on submission — submit to see the complete breakdown.</p>
```

Line 88 — concerns list items (`text-xs` → `text-sm`):
```tsx
// Before
<div key={c} className="flex items-start gap-2 text-xs text-slate-700">
// After
<div key={c} className="flex items-start gap-2 text-sm text-slate-700">
```

Line 103 — review summary rows (`text-sm` → `text-base`):
```tsx
// Before
<div key={label} className="flex justify-between py-2 text-sm">
// After
<div key={label} className="flex justify-between py-2 text-base">
```

Line 112 — bottom instruction (`text-xs` → `text-sm`):
```tsx
// Before
<p className="text-xs text-slate-400 text-center">Go back to any step to edit before submitting.</p>
// After
<p className="text-sm text-slate-400 text-center">Go back to any step to edit before submitting.</p>
```

- [ ] **Step 3: LiveRiskBadge.tsx**

Both `text-xs` occurrences → `text-sm` (the wrapper div controls overall size):
```tsx
// Before — placeholder state (line ~14)
<div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400">
  <span className="font-semibold text-slate-500">Live preview:</span> Fill in the form to see your risk score.
</div>

// After
<div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
  <span className="font-semibold text-slate-500">Live preview:</span> Fill in the form to see your risk score.
</div>
```

```tsx
// Before — active state (line ~21)
<div className={`rounded-sm border px-3 py-2 text-xs ${preliminary.bgColor} ${preliminary.borderColor}`}>
// After
<div className={`rounded-sm border px-3 py-2 text-sm ${preliminary.bgColor} ${preliminary.borderColor}`}>
```

- [ ] **Step 4: SectionTitle.tsx**

Line 19 — subtitle (`text-sm` → `text-base` + `leading-relaxed`):
```tsx
// Before
{subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
// After
{subtitle && <p className="mt-0.5 text-base leading-relaxed text-slate-500">{subtitle}</p>}
```

- [ ] **Step 5: Commit**
```bash
git add app/assessment/page.tsx \
        components/assessment/steps/StepReview.tsx \
        components/assessment/LiveRiskBadge.tsx \
        components/assessment/SectionTitle.tsx
git commit -m "fix(a11y): bump font sizes in assessment shell, StepReview, LiveRiskBadge, SectionTitle"
```

---

## Task 4: Results components

**Files:**
- Modify: `app/results/page.tsx`
- Modify: `components/results/RecommendationsPanel.tsx`
- Modify: `components/results/CoveragePanel.tsx`
- Modify: `components/results/ComplianceGaps.tsx`
- Modify: `components/results/RiskDriversList.tsx`
- Modify: `components/results/BenchmarkPanel.tsx`

*(ReportHeader.tsx and CategoryScores.tsx: all `text-xs` there are badges/captions — no changes needed)*

- [ ] **Step 1: results/page.tsx**

Line 74 — no-results description (`text-sm` → `text-base` + `leading-relaxed`):
```tsx
// Before
<p className="text-sm text-slate-600">
// After
<p className="text-base text-slate-600 leading-relaxed">
```

Line 124 — summary body text (`text-sm` → `text-base`):
```tsx
// Before
<p className="text-sm text-slate-700 leading-relaxed">{results.summary}</p>
// After
<p className="text-base text-slate-700 leading-relaxed">{results.summary}</p>
```

Line 165 — section heading (`text-sm` → `text-base`):
```tsx
// Before
<p className="text-sm font-semibold text-slate-900 mb-1">
// After
<p className="text-base font-semibold text-slate-900 mb-1">
```

Line 168 — section description (`text-sm` → `text-base` + `leading-relaxed`):
```tsx
// Before
<p className="text-sm text-slate-500 mb-4">
// After
<p className="text-base text-slate-500 leading-relaxed mb-4">
```

- [ ] **Step 2: RecommendationsPanel.tsx**

Line 16 — list item text (`text-sm` → `text-base` + `leading-relaxed`):
```tsx
// Before
<li className="flex items-start gap-2 text-sm text-slate-700">
// After
<li className="flex items-start gap-2 text-base text-slate-700 leading-relaxed">
```

*(Lines 29, 39, 49 are `text-xs font-semibold uppercase tracking-widest` section eyebrows — keep as-is)*

- [ ] **Step 3: CoveragePanel.tsx**

Lines 15 and 18 — coverage text (`text-sm` → `text-base` + `leading-relaxed`):
```tsx
// Before (both)
<p className="text-sm">
// After (both)
<p className="text-base leading-relaxed">
```

Line 28 — exclusion list items (`text-xs` → `text-sm`):
```tsx
// Before
<li key={ex} className="flex items-start gap-2 text-xs text-slate-700">
// After
<li key={ex} className="flex items-start gap-2 text-sm text-slate-700">
```

- [ ] **Step 4: ComplianceGaps.tsx**

Line 6 — empty state (`text-sm` → `text-base`):
```tsx
// Before
return <p className="text-sm text-slate-500">No compliance gaps identified.</p>;
// After
return <p className="text-base text-slate-500">No compliance gaps identified.</p>;
```

Line 20 — gap standard name (`text-sm` → `text-base`):
```tsx
// Before
<p className="text-sm font-semibold text-slate-900">{gap.standard}</p>
// After
<p className="text-base font-semibold text-slate-900">{gap.standard}</p>
```

Line 27 — gap mitigation items (`text-xs` → `text-sm` + `leading-relaxed`):
```tsx
// Before
<li key={m} className="text-xs text-slate-600">· {m}</li>
// After
<li key={m} className="text-sm text-slate-600 leading-relaxed">· {m}</li>
```

- [ ] **Step 5: RiskDriversList.tsx**

Line 6 — empty state (`text-sm` → `text-base`):
```tsx
// Before
return <p className="text-sm text-slate-500">No significant risk drivers identified.</p>;
// After
return <p className="text-base text-slate-500">No significant risk drivers identified.</p>;
```

Line 11 — driver items (`text-sm` → `text-base` + `leading-relaxed`):
```tsx
// Before
<li key={d} className="flex items-start gap-2 text-sm text-slate-700">
// After
<li key={d} className="flex items-start gap-2 text-base text-slate-700 leading-relaxed">
```

- [ ] **Step 6: BenchmarkPanel.tsx**

Line 7 — benchmark text (`text-sm` → `text-base` + `leading-relaxed`):
```tsx
// Before
<div className="space-y-2 text-sm text-slate-700">
// After
<div className="space-y-2 text-base text-slate-700 leading-relaxed">
```

- [ ] **Step 7: Commit**
```bash
git add app/results/page.tsx \
        components/results/RecommendationsPanel.tsx \
        components/results/CoveragePanel.tsx \
        components/results/ComplianceGaps.tsx \
        components/results/RiskDriversList.tsx \
        components/results/BenchmarkPanel.tsx
git commit -m "fix(a11y): bump font sizes across results components"
```

---

## Task 5: Homepage (app/page.tsx)

**Files:**
- Modify: `app/page.tsx`

Apply each change below in order. Lines are approximate — search for the exact string.

- [ ] **Step 1: Marketing copy and FAQ body text (`text-sm` → `text-base`)**

```tsx
// Line ~62 — supporting tagline below CTA buttons
// Before
<p className="mt-4 text-sm text-slate-500">
// After
<p className="mt-4 text-base text-slate-500">
```

```tsx
// Line ~127 — warning/alert text
// Before
<p className="text-sm font-medium text-amber-900">
// After
<p className="text-base font-medium text-amber-900">
```

```tsx
// Line ~179 — FAQ question text
// Before
<p className="text-sm font-semibold text-slate-900">{item.q}</p>
// After
<p className="text-base font-semibold text-slate-900">{item.q}</p>
```

```tsx
// Line ~239 — How-it-works step body
// Before
<p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.body}</p>
// After
<p className="mt-2 text-base text-slate-500 leading-relaxed">{item.body}</p>
```

```tsx
// Lines ~301-302 — feature title and body
// Before
<p className="text-sm font-semibold text-slate-900">{x.title}</p>
<p className="mt-0.5 text-sm text-slate-500">{x.body}</p>
// After
<p className="text-base font-semibold text-slate-900">{x.title}</p>
<p className="mt-0.5 text-base text-slate-500">{x.body}</p>
```

```tsx
// Line ~481 — section description
// Before
<p className="text-sm text-slate-500 leading-relaxed">
// After
<p className="text-base text-slate-500 leading-relaxed">
```

```tsx
// Line ~493 — persona title
// Before
<p className="text-sm font-semibold text-slate-900">{c.title}</p>
// After
<p className="text-base font-semibold text-slate-900">{c.title}</p>
```

- [ ] **Step 2: Industry card text (`text-xs` → `text-sm`)**

```tsx
// Lines ~454-461 — industry card title, description, risk, link
// Before
<h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
<p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
  <p className="text-xs text-amber-700 font-medium">{item.risk}</p>
  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
// After
<h3 className="text-base font-bold text-slate-900">{item.title}</h3>
<p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{item.desc}</p>
  <p className="text-sm text-amber-700 font-medium">{item.risk}</p>
  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
```

- [ ] **Step 3: FAQ note and report mock list items (`text-xs` → `text-sm`)**

```tsx
// Line ~180 — FAQ note
// Before
<p className="mt-1 text-xs text-slate-500">{item.note}</p>
// After
<p className="mt-1 text-sm text-slate-500">{item.note}</p>
```

```tsx
// Lines ~374, ~378, ~382 — report mock recommendation list items
// Before (three occurrences)
<li className="flex items-start gap-2 text-xs text-slate-700">
// After (three occurrences)
<li className="flex items-start gap-2 text-sm text-slate-700">
```

- [ ] **Step 4: Commit**
```bash
git add app/page.tsx
git commit -m "fix(a11y): bump font sizes on homepage — body copy, cards, FAQ, industry section"
```

---

## Task 6: About page (app/about/page.tsx)

**Files:**
- Modify: `app/about/page.tsx`

- [ ] **Step 1: Body copy (`text-sm` → `text-base`)**

```tsx
// Line ~198 — mission/values body
// Before
<p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
// After
<p className="text-base text-slate-600 leading-relaxed">{item.body}</p>
```

```tsx
// Lines ~272-273 — timeline item title and body
// Before
<p className="text-sm font-semibold text-slate-900">{item.title}</p>
<p className="mt-1 text-sm text-slate-500 leading-relaxed">{item.body}</p>
// After
<p className="text-base font-semibold text-slate-900">{item.title}</p>
<p className="mt-1 text-base text-slate-500 leading-relaxed">{item.body}</p>
```

```tsx
// Line ~320 — enforcement case firm name
// Before
<p className="text-sm font-bold text-slate-900">{f.firm}</p>
// After
<p className="text-base font-bold text-slate-900">{f.firm}</p>
```

```tsx
// Line ~332 — enforcement case "what happened" body
// Before
<p className="text-sm text-slate-700 leading-relaxed mb-3">{f.what}</p>
// After
<p className="text-base text-slate-700 leading-relaxed mb-3">{f.what}</p>
```

```tsx
// Line ~347 — enforcement case takeaway
// Before
<p className="text-sm text-blue-900">
// After
<p className="text-base text-blue-900">
```

```tsx
// Lines ~381 — roadmap item title
// Before
<p className="text-sm font-semibold text-slate-900 mt-0.5">{r.title}</p>
// After
<p className="text-base font-semibold text-slate-900 mt-0.5">{r.title}</p>
```

```tsx
// Lines ~440-441 — team/FAQ title and body
// Before
<p className="text-sm font-semibold text-slate-900">{item.title}</p>
<p className="mt-1 text-sm text-slate-500 leading-relaxed">{item.body}</p>
// After
<p className="text-base font-semibold text-slate-900">{item.title}</p>
<p className="mt-1 text-base text-slate-500 leading-relaxed">{item.body}</p>
```

```tsx
// Lines ~493-494, ~501 — persona description paragraphs
// Before
<p className="text-sm font-bold text-slate-900">Compliance or Risk Lead...</p>
<p className="mt-1 text-sm text-slate-600 leading-relaxed">
<p className="mt-3 text-sm text-slate-600 leading-relaxed">
// After
<p className="text-base font-bold text-slate-900">Compliance or Risk Lead...</p>
<p className="mt-1 text-base text-slate-600 leading-relaxed">
<p className="mt-3 text-base text-slate-600 leading-relaxed">
```

```tsx
// Lines ~557, ~573 — hypothesis list items
// Before (two occurrences)
<li key={s} className="flex items-start gap-2 text-sm text-slate-600">
// After (two occurrences)
<li key={s} className="flex items-start gap-2 text-base text-slate-600">
```

```tsx
// Line ~584 — hypothesis disclaimer paragraph
// Before
<p className="text-sm text-slate-600 leading-relaxed">
// After
<p className="text-base text-slate-600 leading-relaxed">
```

```tsx
// Lines ~648-649 — roadmap milestone title and body
// Before
<p className="text-sm font-semibold text-slate-900">{item.title}</p>
<p className="mt-0.5 text-sm text-slate-500">{item.body}</p>
// After
<p className="text-base font-semibold text-slate-900">{item.title}</p>
<p className="mt-0.5 text-base text-slate-500">{item.body}</p>
```

- [ ] **Step 2: `text-xs` body items → `text-sm`**

```tsx
// Line ~335 — enforcement case lesson text
// Before
<p className="text-xs text-slate-600 leading-relaxed">
// After
<p className="text-sm text-slate-600 leading-relaxed">
```

```tsx
// Line ~387 — roadmap item description
// Before
<p className="text-xs text-slate-500 leading-relaxed">{r.body}</p>
// After
<p className="text-sm text-slate-500 leading-relaxed">{r.body}</p>
```

```tsx
// Line ~475 — checklist items
// Before
<div key={item} className="flex items-start gap-2 text-sm text-slate-700">
// After
<div key={item} className="flex items-start gap-2 text-base text-slate-700">
```

```tsx
// Line ~514 — persona detail values
// Before
<p className="text-xs text-slate-700 mt-0.5">{x.value}</p>
// After
<p className="text-sm text-slate-700 mt-0.5">{x.value}</p>
```

- [ ] **Step 3: Commit**
```bash
git add app/about/page.tsx
git commit -m "fix(a11y): bump font sizes on about page — body copy, cards, enforcement cases, roadmap"
```

---

## Task 7: Browser verification

- [ ] **Step 1: Open homepage and check body text**

Navigate to `http://localhost:3000`. Verify:
- Hero supporting paragraph is clearly readable (should be 16px / `text-base`)
- Industry card descriptions are legible
- FAQ notes are readable
- Footer links are `text-sm` (kept intentionally)
- Section eyebrow labels (`uppercase tracking-widest`) are visually smaller — this is correct and intentional

- [ ] **Step 2: Open assessment and check form**

Navigate to `http://localhost:3000/assessment`. Verify:
- Form field labels are larger than before
- Helper/hint text under fields is readable
- Checkbox option labels are clearly legible
- Error messages (trigger by skipping a required field) are readable
- Live preview badge text is `text-sm`
- Step tabs (`StepIndicator`) are `text-xs` — correct, kept as exception
- "Step 1 of 6" progress line is `text-sm`

- [ ] **Step 3: Open results page and check panels**

Navigate to `http://localhost:3000/results` (or submit the assessment). Verify:
- Risk driver list items are `text-base`
- Recommendations list items are `text-base`
- Compliance gap entries are `text-base`
- Coverage panel items are readable
- Date/metadata captions (e.g. "Assessed X days ago") are `text-xs` — correct, kept as caption

- [ ] **Step 4: Commit verification note**
```bash
git commit --allow-empty -m "chore: visual a11y verification passed — font sizes WCAG compliant"
```
