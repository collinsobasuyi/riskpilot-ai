# Font Size Accessibility — Design Spec
_Date: 2026-06-01_

## Problem

The app uses `text-xs` (12px) in 85 places and `text-sm` (14px) in 79 places. WCAG 2.1 AA best practice is 16px minimum for body/form text and 14px for secondary labels. The current scale fails accessibility on every page.

## Goal

Bring all meaningful text up to WCAG-compliant sizes with a single consistent global pass.

## Approach

Shift text size classes up one step everywhere, with explicit exceptions for compact one-line metadata.

## Rules

| Current | New | Applied to |
|---|---|---|
| `text-xs` (12px) | `text-sm` (14px) | All 85 occurrences — no exceptions |
| `text-sm` (14px) | `text-base` (16px) | Body copy, form labels, descriptions, step content, result panels |
| `text-sm` (14px) | `text-sm` (keep) | One-line metadata: step counter, tab labels, nav links |

Headings (`text-lg` and above) are untouched.

## Exceptions — keep at `text-sm`

- `StepNav` — "Step X of Y" / "Back" / "Next" counter line
- `StepIndicator` — tab labels ("Your Firm", "AI System", etc.)
- `Navbar` — nav links
- `LiveRiskBadge` — already bumping from `text-xs` → `text-sm`; stop there

## Affected Files

| Group | Files |
|---|---|
| High-volume pages | `app/page.tsx`, `app/about/page.tsx` |
| Assessment components | `assessment/page.tsx`, `FieldPrimitives.tsx`, `StepReview.tsx`, `StepNav.tsx`, `StepIndicator.tsx`, `LiveRiskBadge.tsx`, `SectionTitle.tsx`, `StepFirmDetails.tsx`, `StepAiSystem.tsx`, `StepRiskProfile.tsx`, `StepGovernance.tsx`, `StepEvidence.tsx` |
| Results components | `results/page.tsx`, `ReportHeader.tsx`, `RecommendationsPanel.tsx`, `CoveragePanel.tsx`, `ComplianceGaps.tsx`, `RiskDriversList.tsx`, `CategoryScores.tsx`, `BenchmarkPanel.tsx` |
| Layout / UI | `Navbar.tsx`, `Card.tsx`, `ButtonLink.tsx`, `SectionTitle.tsx` |

## Out of Scope

- Line height and spacing (separate concern)
- Contrast ratio audit (separate concern)
- Heading sizes (already accessible)
- Print styles

## Success Criteria

- Zero `text-xs` occurrences on meaningful content
- All body copy and form labels at `text-base` (16px) or above
- Layout remains intact across all pages after changes
- Visual browser check on homepage, assessment step 1, and results page
