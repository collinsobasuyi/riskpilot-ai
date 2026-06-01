# Sprint 1: Demo Report, 90-Day Action Plan, Shareable Link — Design Spec
_Date: 2026-06-01_

## Goal

Ship three self-contained features that increase the value and shareability of the results page, and reduce drop-off on the homepage by letting users preview a completed report before committing to the full assessment.

---

## Feature 2: Demo Report

### What it does
A "See sample report →" ghost button in the hero section loads a pre-built realistic assessment into localStorage and navigates to `/results`, letting users see a completed report without filling in the form.

### Entry point
In `app/page.tsx`, add a ghost button to the existing hero CTA row (alongside "Get Your Governance Score" and "Read the thesis"). The button calls `loadDemoReport()` and navigates to `/results?demo=1`.

### Demo data
A hardcoded `StoredSubmission` object lives in a new file `lib/risk/demo-data.ts`. It represents a realistic mid-size regulated firm:
- Company: "Acme Financial Ltd", industry: "financial", size: "51-200"
- System: "Credit Scoring Engine v2", use case: automated credit decisioning
- Risk profile: `decisionAuthority: "partial"`, `financialImpactTier: "100k_to_1m"`, `dataSensitivity: "sensitive"`
- Governance: `existingOversight: "periodic"`, `documentedProcess: false`, `incidentHistory: "none"`
- Produces a medium-risk score (~55/100) with meaningful recommendations and gaps

### loadDemoReport()
A helper function in `lib/risk/demo-data.ts` that writes the demo `StoredSubmission` to `localStorage` under `SUBMISSION_KEY` and returns `void`. Called from the homepage button's `onClick`.

### Demo banner on results page
When `?demo=1` is present in the URL, the results page renders a dismissible amber banner at the top: "You're viewing a sample report. Start your own assessment to generate real results." The "Book a consultation" footer CTA is hidden in demo mode.

---

## Feature 3: 90-Day Action Plan

### What it does
A new `ActionPlanPanel` component renders a three-column timeline card on the results page, mapping existing recommendation data to 30 / 60 / 90 day buckets.

### Mapping
- Critical recommendations → **30 days** (red, `border-red-500`, `bg-red-50`)
- High recommendations → **60 days** (amber, `border-amber-500`, `bg-amber-50`)
- Medium recommendations → **90 days** (blue, `border-blue-500`, `bg-blue-50`)

### Component
`components/results/ActionPlanPanel.tsx` accepts `recommendations: { critical: string[]; high: string[]; medium: string[] }`. It renders three columns each with a header (`"30 DAYS · CRITICAL"` etc.) and a list of action item cards. If all three arrays are empty the component returns `null`.

### Placement
Added as a new `<Card title="Your 90-Day Action Plan">` in `app/results/page.tsx`, between the Recommendations card and the Compliance Gaps card.

---

## Feature 4: Shareable Link

### What it does
A "🔗 Copy link" button in the results toolbar encodes the current assessment as a URL parameter so the results page can be shared without requiring the recipient to complete the assessment themselves.

### Encoding
On click, `AssessmentFormData` from the current submission is JSON-stringified, UTF-8 encoded, and base64url-encoded (`btoa(unescape(encodeURIComponent(...)))`), then appended to the current URL as `?s=<encoded>`. The full URL is copied to clipboard via `navigator.clipboard.writeText()`. Button label changes to `"✓ Copied!"` for 2 seconds then resets.

### Decoding on load
In `app/results/page.tsx`, `useEffect` checks `window.location.search` for `?s=`. If present, it decodes and parses the param as `AssessmentFormData`, wraps it in a synthetic `StoredSubmission` (with `id: "shared"`, `submittedAt: new Date().toISOString()`), and uses that as the submission state. If decoding fails (malformed URL), it falls back to localStorage silently.

### Shared view
No special banner for shared links — the report renders normally. The `?demo=1` banner is suppressed (shared links don't set `demo=1`). The Copy link button is still visible so the recipient can re-share.

### URL length
Base64 of a full `AssessmentFormData` object is ~1.5–2 KB encoded, well within browser URL limits (typically 2 MB). No compression needed.

---

## Data flow summary

```
Homepage hero
  └─ "See sample report" onClick
       └─ loadDemoReport() → writes SUBMISSION_KEY to localStorage
       └─ router.push("/results?demo=1")

Results page load
  1. Check ?s= param → decode AssessmentFormData → synthetic submission
  2. Else check ?demo=1 → read SUBMISSION_KEY (demo data) + show banner
  3. Else read SUBMISSION_KEY (real submission)
  4. computeResults(submission.data) → render

Results page toolbar
  └─ "Copy link" onClick
       └─ encode formData as base64url → append as ?s= → copy to clipboard
```

---

## Files created / modified

| Action | File |
|---|---|
| Create | `lib/risk/demo-data.ts` |
| Create | `components/results/ActionPlanPanel.tsx` |
| Modify | `app/page.tsx` — add demo CTA button |
| Modify | `app/results/page.tsx` — demo banner, share button, ?s= decode, ActionPlanPanel |

---

## Out of scope

- Email capture (Sprint 2 or later)
- Re-assessment history (Sprint 2)
- Server-side URL shortening
- PDF generation beyond existing print CSS

## Success criteria

- "See sample report" button on homepage loads results in under 1 second
- Demo banner visible on `/results?demo=1`, hidden on real/shared results
- Action plan renders for any assessment with at least one recommendation
- Copy link button copies a working URL; opening it in a new tab renders the same report
- Shared URL works with no localStorage data on the recipient's device
