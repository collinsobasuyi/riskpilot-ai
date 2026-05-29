# RiskPilot AI — Codebase Fixes Design

**Date:** 2026-05-29  
**Approach:** B — Fix + component split  
**Status:** Approved

---

## Scope

Fix all issues identified in the code review across four priority tiers. No new features. No scoring behaviour changes.

---

## Layer 1 — `lib/risk/` (logic / data)

### Dead code removal
- Delete `lib/risk/recommendations.ts` (empty file)
- Delete `lib/risk/controls.ts` (unused by any page)
- Remove from `lib/risk/types.ts`: `AssessmentRecord`, `DashboardStats`, `IndustryBenchmark`, `UserPreferences`, `Notification`, `EnhancedAssessmentInput`, `ExportOptions`, `EnhancedAssessmentResult` — none are imported anywhere
- Delete `content/home.ts` (empty)
- Delete `components/home/` directory (HeroSection, ProblemSection, ScorePreviewSection, BookCallSection — all unused by app/page.tsx)

### Type deduplication
- `types.ts` is the single source for `DataSensitivity` and `DecisionAuthority`
- `schema.ts` re-exports both from `types.ts` instead of redefining them

### Score clamp
- In `calculatePreliminaryStatus` (schema.ts), clamp score to `[0, 100]` before returning:  
  `score = Math.max(0, Math.min(100, score))`

### Scoring consolidation
- Extract the inline `computeResults` function from `app/results/page.tsx` into `lib/risk/scoring.ts` as the canonical export `computeResults(data: AssessmentFormData): ResultsOutput`
- Delete `calculateAssessmentResult` (uses simplified `RiskAssessmentInput`, inconsistent with the full form)
- `app/results/page.tsx` imports `computeResults` from `lib/risk/scoring.ts`

---

## Layer 2 — `app/api/assessment/route.ts`

Replace the 501 stub with a real POST handler:
- Accepts `AssessmentFormData` JSON body
- Validates required fields (returns 400 on failure)
- Runs `computeResults` server-side and returns the scored result
- No email, no external service, no persistence — purely stateless compute

---

## Layer 3 — Component split

### `components/assessment/`
| File | Contents |
|---|---|
| `FieldPrimitives.tsx` | `Label`, `Hint`, `Select`, `TextInput`, `Textarea`, `CheckGroup`, `RadioGroup`, `FieldError` |
| `StepIndicator.tsx` | Step dots + titles bar |
| `StepNav.tsx` | Back / Next / Submit buttons |
| `LiveRiskBadge.tsx` | Live risk tier preview shown during the form |
| `steps/Step1Company.tsx` | Company info step |
| `steps/Step2System.tsx` | AI system info step |
| `steps/Step3Risk.tsx` | Risk factors step |
| `steps/Step4Governance.tsx` | Governance controls step |
| `steps/Step5Technical.tsx` | Technical controls step |
| `steps/Step6Review.tsx` | Final review + submit step |

### `components/results/`
| File | Contents |
|---|---|
| `RiskTierBadge.tsx` | Colour-coded High / Medium / Low badge |
| `ScoreGauge.tsx` | Score display bar |
| `RiskDriversList.tsx` | Flagged risk concerns list |
| `StrengthsList.tsx` | Positive signals list |
| `ControlsPanel.tsx` | Recommended remediation actions |
| `ReportHeader.tsx` | Company name, date, assessment ID |
| `PrintButton.tsx` | Print / download trigger |

`app/assessment/page.tsx` and `app/results/page.tsx` become thin shells (~150–200 lines) managing top-level state and routing only.

---

## Layer 4 — UX fixes in `app/assessment/page.tsx`

### Email feature removal
- Remove `wantsEmailCopy` and `contactEmail` fields from the form UI
- Remove both fields from `AssessmentFormData` interface in `schema.ts`
- Remove both from `DEFAULT_ASSESSMENT_FORM`
- Remove `isValidEmail` from validation logic (only used for contactEmail)
- Remove all references across the form steps and validation function

### localStorage save failure feedback
- When `safeLocalStorageSet` returns `false`, show an inline yellow warning banner:  
  _"Draft could not be saved — your browser storage may be full. Your progress is not persisted."_
- Banner dismissible, shown below the step header

---

## Tests

**Framework:** Vitest + `@vitest/coverage-v8`  
**Location:** `lib/risk/__tests__/`

| Test file | Covers |
|---|---|
| `scoring.test.ts` | `computeResults` — all risk driver branches, score clamping |
| `schema.test.ts` | `calculatePreliminaryStatus` — score floor (never < 0), tier thresholds, concern truncation |

Minimum coverage target: all scoring branches exercised.

---

## What does NOT change

- Homepage (`app/page.tsx`) — no changes
- Navbar, ButtonLink, Card, Container — no changes  
- Scoring values / output — behaviour is preserved, only location changes
- Tailwind config, PostCSS, tsconfig — no changes
- `lib/utils.ts` — no changes
