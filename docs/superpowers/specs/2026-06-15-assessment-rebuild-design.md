# Assessment Rebuild Design
**Date:** 2026-06-15  
**Status:** Approved  
**Scope:** Rebuild `/assessment` from 6 dense steps to a 4-step momentum-driven flow with a live report sidebar

---

## Problem

The current 6-step assessment (Your Firm → AI System → Risk Profile → Governance → Evidence → Review) creates fatigue. Users skim, select "Not specified", and produce weak reports. There is no payoff visibility — users cannot see what they are building until they hit the final report page.

---

## Goal

Make the assessment feel like the user is actively building a Verdictal AI Risk Evidence Report as they answer. Each answer should visibly affect the live preview. The experience should feel shorter, smarter, and commercially aligned to brokers and compliance users.

---

## Layout

### Desktop
Two-column flex layout at `max-w-[1140px]`:
- **Left**: form card — `flex-1 min-w-0`
- **Right**: `<LiveSidebar>` — `w-72 shrink-0 sticky top-8`

### Mobile
Sidebar collapses to a compact strip (score + readiness badge + missing count) pinned above the single-column form card.

---

## Steps (4 total)

### Step 1 — Your AI System
Combines the old "Your Firm" + "AI System" steps.

**Fields:**
- `companyName` (required)
- `industry` (required)
- `companySize`
- `regulatedEntity` + `regulator`
- `assessmentPurpose` *(new enum — drives broker/insurance conditionals)*
- `systemName` (required)
- `aiUseCase` (required)
- `aiMaturity`
- `deploymentType`
- `foundationModelSource`
- `modelHosting`
- `dataSensitivity`
- `thirdPartyData`
- `thirdPartyVendors` *(conditional — shown when `usesThirdPartyVendors()`)*
- `usersCount`
- `frequencyOfUse`
- `criticality`

**Intent:** Front-loads the questions that most affect conditional logic downstream. By the end of Step 1 the sidebar has enough data to show a meaningful score.

---

### Step 2 — Governance & Accountability
**Fields (always shown):**
- `formalAiPolicy`
- `documentedProcess`
- `existingOversight`
- `decisionAuthority`
- `humanIntervention`
- `killSwitch`
- `modelDocs`
- `changeManagement`
- `trainingFrequency`
- `incidentResponsePlan`
- `incidentResponse`
- `hasDpo`

**Conditional — Consumer Duty** *(shown when `isCustomerFacing()`)*:
- `consumerRedress`
- `vulnerableCustomerHandling`
- `consumerExplainability`

**Conditional — PRA SS1/23 + SMF** *(shown when `isFinancialRegulated()`)*:
- `smfAccountability`
- `independentValidation`

---

### Step 3 — Controls & Evidence Status
Evidence fields use status enums (Missing / In Progress / Available / Partial / Not Applicable). No file uploads — those are deferred to a future Evidence Vault feature.

**Fields (always shown):**
- `biasTesting`
- `auditTrailCompleteness`
- `monitoring`
- `monitoringHallucination`
- `externalVerification`
- `hasExternalAudit` + `externalAuditType`
- `hasRedTeaming`
- `hasModelCards`
- `mttd`
- `explainabilityType`
- `systematicRisk`
- `financialImpactTier`
- `incidentHistory`

**Conditional — DPIA** *(shown when `processesPersonalData()`)*:
- `dpiaStatus` *(new enum)*

**Conditional — Vendor due diligence** *(shown when `usesThirdPartyVendors()`)*:
- `vendorDueDiligenceStatus` *(new enum)*
- `dataProcessingAgreementStatus` *(new enum)*

---

### Step 4 — Review & Generate Report
Read-only. No new fields.

**Shows:**
1. Answer summary grid (two columns: Your AI System, Governance)
2. Evidence status list — all items with Present / Partial / Missing badges, ordered Missing first, then Partial, then Present
3. Likely underwriter questions — pre-populated from `buildUnderwriterQuestions(data)` in `lib/risk/underwriting.ts`
4. "Generate Verdictal AI Risk Evidence Report" button (full width, prominent)

This step replaces `StepReview`. It makes the pre-report state feel like a final check, not a dead end.

---

## Live Sidebar

Calls `computeResults()`, `buildEvidenceChecklist()`, and `buildInsuranceBrief()` on every `formData` change. All three are pure synchronous functions — no debounce needed.

| Field | Source |
|-------|--------|
| AI Risk Score | `computeResults().score` |
| Insurance Readiness | `buildInsuranceBrief().readiness.status` |
| Evidence Confidence | `buildEvidenceChecklist()` → present / total |
| Missing Evidence Count | `buildEvidenceChecklist()` → missing count |
| Likely Underwriting Tier | `buildInsuranceBrief().verdict.underwritingTier` |
| Top Blocker | First High-severity driver from `computeResults().riskDrivers` |

Score color: red < 60, amber 60–79, green ≥ 80. Readiness badge tinted to match.

---

## Conditional Logic

Extracted into `lib/risk/conditionals.ts` — shared by step components and sidebar.

```typescript
isInsurancePurpose(data)       // assessmentPurpose in [insurance-renewal, broker-review, cyber-pi-review]
isCustomerFacing(data)         // deploymentType in [customer, both]
isRegulated(data)              // regulatedEntity === true
isFinancialRegulated(data)     // isRegulated + industry in [financial, insurance]
usesThirdPartyVendors(data)    // thirdPartyVendors non-empty OR foundationModelSource !== proprietary OR deploymentType === third-party-api
processesPersonalData(data)    // dataSensitivity !== none OR thirdPartyData === true
```

Conditional sections animate in/out with a CSS transition. Each conditional section shows a small rule badge ("Shown — customer-facing AI") so users understand why a section appeared.

---

## Schema Changes

Four additions to `AssessmentFormData` in `lib/risk/schema.ts`:

```typescript
// New types
export type AssessmentPurpose =
  | "insurance-renewal" | "broker-review" | "cyber-pi-review"
  | "internal-audit" | "compliance-review" | "other";

export type DpiaStatus = "yes" | "in-progress" | "no" | "not-required";

export type VendorDueDiligenceStatus = "formal" | "informal" | "none" | "not-applicable";

export type DataProcessingAgreementStatus = "yes" | "partial" | "none" | "not-applicable";

// New fields on AssessmentFormData
assessmentPurpose?: AssessmentPurpose;
dpiaStatus?: DpiaStatus;
vendorDueDiligenceStatus?: VendorDueDiligenceStatus;
dataProcessingAgreementStatus?: DataProcessingAgreementStatus;
```

The existing `purpose: string` field is kept for free-text context. `assessmentPurpose` is the structured enum that drives conditionals.

`DEFAULT_ASSESSMENT_FORM` gets four new `undefined` defaults.

---

## Validation

Step 1 requires: `companyName`, `industry`, `systemName`, `aiUseCase` (same as current).  
Steps 2–3: no required fields — partial answers still produce a valid (lower-scored) report.  
Step 4: no validation — generate is always enabled.

---

## Component Plan

### New files
| File | Purpose |
|------|---------|
| `lib/risk/conditionals.ts` | Six `showIf` helper functions |
| `components/assessment/LiveSidebar.tsx` | Right-rail live preview panel |
| `components/assessment/steps/StepControlsEvidence.tsx` | New Step 3 |
| `components/assessment/steps/StepReviewGenerate.tsx` | New Step 4 |

### Replaced files
| Old | New |
|-----|-----|
| `StepFirmDetails.tsx` + `StepAiSystem.tsx` | `StepAiSystem.tsx` (rewritten) |
| `StepGovernance.tsx` | `StepGovernance.tsx` (rewritten) |
| `StepEvidence.tsx` + `StepRiskProfile.tsx` | `StepControlsEvidence.tsx` |
| `StepReview.tsx` | `StepReviewGenerate.tsx` |

### Modified files
| File | Change |
|------|--------|
| `lib/risk/schema.ts` | 4 new types + fields + defaults |
| `app/assessment/page.tsx` | 4 steps, two-column layout, `LiveSidebar`, updated validation |

### Kept unchanged
`StepIndicator`, `StepNav`, `LiveRiskBadge` (repurposed as mobile strip inside `LiveSidebar`), all result/report components, scoring engine, insurance brief, evidence checklist, localStorage logic.

---

## Out of Scope

- File uploads / Evidence Vault — deferred
- Per-section sidebar mapping ("report sections affected by current answer") — deferred
- Any changes to the results/report page
