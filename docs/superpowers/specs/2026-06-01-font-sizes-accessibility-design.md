# Font Size Accessibility — Design Spec
_Date: 2026-06-01_

## Problem

The app uses `text-xs` (12px) in 85 places and `text-sm` (14px) in 79 places. WCAG 2.1 AA best practice requires 16px minimum for body/form text, 14px for secondary labels, and 1.5× line height on body copy. The current scale fails accessibility on every page.

## Goal

Bring all meaningful text up to WCAG-compliant sizes with consistent line heights, verified heading hierarchy, and proper caption/hint handling.

## Rules

| Current | New | Applied to |
|---|---|---|
| `text-xs` (12px) | `text-sm` (14px) | Labels, form hints, step content, result panel text, badge text |
| `text-xs` (12px) | `text-xs` (keep) | True captions, footnote-style subtext only |
| `text-sm` (14px) | `text-base` (16px) | Body copy, form labels, descriptions, paragraphs, result panels |
| `text-sm` (14px) | `text-sm` (keep) | Buttons, nav links, tab labels, step counter |
| body paragraphs | + `leading-relaxed` | All `<p>`, description text, form helper text |

## Heading Size Targets

Per responsive typography best practice:

| Level | Desktop | Mobile |
|---|---|---|
| H1 | 32–36px (`text-4xl` = 36px ✓) | 24–30px (`text-3xl` = 30px ✓) |
| H2 | 24–30px (`text-3xl` = 30px ✓) | 20–24px (`text-2xl` = 24px ✓) |
| H3 | 20–24px (`text-xl`/`text-2xl`) | 18–20px |

Headings will be verified and adjusted where they fall outside these ranges.

## Line Height

Add `leading-relaxed` (1.625) to all body paragraphs, form descriptions, and result panel text. WCAG minimum is 1.5×; `leading-relaxed` satisfies this.

## Exceptions — keep current size

- `StepNav` — "Step X of Y" / back / next counter line (`text-sm`)
- `StepIndicator` — tab labels (`text-sm`)
- `Navbar` — nav links (`text-sm`)
- `LiveRiskBadge` — bumping `text-xs` → `text-sm` only; stop there
- True captions and footnote subtext (`text-xs` acceptable)

## Affected Files

| Group | Files |
|---|---|
| High-volume pages | `app/page.tsx`, `app/about/page.tsx` |
| Assessment components | `assessment/page.tsx`, `FieldPrimitives.tsx`, `StepReview.tsx`, `StepNav.tsx`, `StepIndicator.tsx`, `LiveRiskBadge.tsx`, `SectionTitle.tsx`, `StepFirmDetails.tsx`, `StepAiSystem.tsx`, `StepRiskProfile.tsx`, `StepGovernance.tsx`, `StepEvidence.tsx` |
| Results components | `results/page.tsx`, `ReportHeader.tsx`, `RecommendationsPanel.tsx`, `CoveragePanel.tsx`, `ComplianceGaps.tsx`, `RiskDriversList.tsx`, `CategoryScores.tsx`, `BenchmarkPanel.tsx` |
| Layout / UI | `Navbar.tsx`, `Card.tsx`, `ButtonLink.tsx`, `SectionTitle.tsx` |

## Out of Scope

- Contrast ratio audit
- Print styles
- Font family or weight changes

## Success Criteria

- Zero `text-xs` on meaningful labels, body copy, or result text
- All body copy and form labels at `text-base` (16px) minimum
- All body paragraphs have `leading-relaxed`
- Heading sizes verified against the target table
- Visual browser check passes on homepage, assessment step 1, and results page
