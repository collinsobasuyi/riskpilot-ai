// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  Shield,
  Target,
  TrendingUp,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Scale,
  BarChart3,
  Layers,
  DollarSign,
  Gavel,
  Eye,
} from "lucide-react";
import Container from "../../components/layout/Container";

export const metadata: Metadata = {
  title: "About RiskPilot AI — The Case for AI Governance Readiness",
  description:
    "The problem statement, solution, target market, and hypothesis behind RiskPilot AI — an AI governance readiness and evidence platform for regulated firms.",
};

// ─── Failure case data ────────────────────────────────────────────────────────

const failures = [
  {
    firm: "Merrill Lynch / Bank of America",
    year: "2017",
    regulator: "FCA",
    penalty: "£34.5m fine",
    icon: <Gavel className="h-4 w-4" />,
    what: "An algorithmic reporting error caused 68.5 million transactions to go unreported over a six-year period. The FCA found that the firm failed to identify and fix the failure for years.",
    why: "Model failure + no adequate monitoring or oversight. The algorithm ran unchecked. This is precisely the kind of failure that documented governance and continuous monitoring would have caught.",
    severity: "high",
  },
  {
    firm: "Goldman Sachs / Apple Card",
    year: "2019–2021",
    regulator: "NY DFS / CFPB",
    penalty: "Regulatory investigation + consent order",
    icon: <Scale className="h-4 w-4" />,
    what: "The Apple Card credit algorithm repeatedly assigned significantly lower credit limits to women than men with comparable or stronger credit profiles. The issue went viral after the creator of Ruby on Rails tweeted that his wife received a limit 20× lower than his own.",
    why: "Consumer-facing credit AI with no documented bias testing or oversight evidence. Goldman had no answer for regulators about how the model made its decisions. Consumer Duty equivalent — the firm could not evidence fairness.",
    severity: "high",
  },
  {
    firm: "Zillow Offers",
    year: "2021",
    regulator: "SEC / Investors",
    penalty: "$880m+ loss, business unit shut down, 25% workforce laid off",
    icon: <DollarSign className="h-4 w-4" />,
    what: "Zillow's AI-powered home-buying algorithm catastrophically misfired, over-estimating home values at scale. The firm acquired thousands of homes at inflated prices it could not sell, resulting in a $880m write-down and complete shutdown of the Zestimate-powered buying business.",
    why: "Overreliance on a model without adequate human oversight, validation, or circuit-breakers. The AI was trusted to make consequential financial decisions without sufficient governance controls around it.",
    severity: "high",
  },
  {
    firm: "Knight Capital Group",
    year: "2012",
    regulator: "SEC",
    penalty: "$12m fine, near-bankruptcy — emergency rescue capital required",
    icon: <AlertTriangle className="h-4 w-4" />,
    what: "A software deployment error accidentally reactivated a legacy trading algorithm (SMARS). In 45 minutes, it executed millions of erroneous trades, creating a $440m loss and bringing the firm to the brink of insolvency. Knight Capital was rescued only by an emergency capital injection.",
    why: "No deployment governance, no automated kill switch, no change management controls on the algorithm. A model risk management framework — of the kind PRA SS1/23 now mandates — would have required documented deployment controls and live monitoring.",
    severity: "critical",
  },
  {
    firm: "Lemonade Insurance",
    year: "2021",
    regulator: "ICO / Data regulators",
    penalty: "Major public backlash, regulatory inquiry, policy revision",
    icon: <Eye className="h-4 w-4" />,
    what: "Lemonade's CEO tweeted that the company used AI to analyse 'non-verbal cues' in video claims, scanning faces for signs of dishonesty. The tweet triggered immediate backlash over potential GDPR violations, biometric data processing, and discriminatory profiling. The tweet was deleted.",
    why: "Consumer-facing AI making decisions affecting claims — processed without consent, without a DPIA, and without documented governance. Exactly the scenario FCA Consumer Duty and GDPR Article 22 are designed to address.",
    severity: "medium",
  },
  {
    firm: "iTutor Group",
    year: "2023",
    regulator: "EEOC (US)",
    penalty: "$365k settlement — first AI discrimination case under US law",
    icon: <Gavel className="h-4 w-4" />,
    what: "iTutor Group used AI recruiting software that was programmed to automatically reject applicants over 55 (women) and 60 (men). The EEOC brought the first formal enforcement action targeting an employer's use of AI in hiring. The case settled for $365k.",
    why: "AI system used for consequential decisions (employment) with no bias testing, no documentation, and no human review. This was the first formal enforcement — not the last. UK equivalents exist under the Equality Act 2010.",
    severity: "medium",
  },
];

// ─── Regulatory signals data ───────────────────────────────────────────────────

const regulations = [
  {
    label: "PRA SS1/23",
    title: "Model Risk Management",
    body: "Mandates documented model governance, validation, and oversight for firms using models in credit, market, and operational risk. Effective from May 2024. Directly applies to AI models.",
    urgency: "In force",
  },
  {
    label: "FCA Consumer Duty",
    title: "Consumer Outcomes",
    body: "Places accountability for AI-driven consumer outcomes — including fair treatment, explainability, and redress — directly on the regulated firm, not the model vendor. Active enforcement.",
    urgency: "In force",
  },
  {
    label: "UK GDPR Article 22",
    title: "Automated Decision-Making",
    body: "Requires firms to identify, document, and provide redress for automated decisions with significant effects. ICO enforcement is increasing. DPIAs required for high-risk AI.",
    urgency: "Enforced — ICO active",
  },
  {
    label: "Lloyd's / LMA",
    title: "Underwriting Scrutiny",
    body: "Lloyd's syndicates and London Market underwriters are actively incorporating AI governance questions into PI and D&O renewal questionnaires. Firms without documented evidence face exclusions.",
    urgency: "Renewal conversations now",
  },
  {
    label: "EU AI Act",
    title: "High-Risk AI Systems",
    body: "UK-based firms servicing EU clients or operating cross-border face obligations for high-risk AI (credit, employment, insurance). Compliance timelines are active.",
    urgency: "Phase-in underway",
  },
  {
    label: "FCA AI Guidance",
    title: "Sector Supervisory Letters",
    body: "FCA has issued supervisory letters to insurance, consumer credit, and investment firms specifically addressing AI use, explainability, and consumer harm prevention.",
    urgency: "Supervisory priority",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-slate-900 pt-28 pb-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-sm border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium tracking-widest text-slate-300 uppercase">
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              About RiskPilot
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              The case for AI governance readiness.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-400 max-w-2xl">
              Regulated firms are adopting AI faster than they can evidence control, oversight, and
              accountability. RiskPilot exists to close that gap — starting with the firms where
              the consequences are most concrete.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Four-layer story ─────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-slate-200">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-8">
              The Four-Layer Story
            </p>
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4 rounded-sm overflow-hidden">
              {[
                {
                  num: "01",
                  label: "Big Problem",
                  body: "Firms are adopting AI faster than they can evidence control and accountability.",
                  color: "text-red-600",
                },
                {
                  num: "02",
                  label: "Product",
                  body: "A structured AI governance assessment and evidence tool for regulated firms.",
                  color: "text-blue-700",
                },
                {
                  num: "03",
                  label: "First Wedge",
                  body: "Insurance renewal and underwriting scrutiny — where the urgency is most immediate.",
                  color: "text-amber-600",
                },
                {
                  num: "04",
                  label: "Future Platform",
                  body: "Remediation plans, recurring reassessments, board reporting, vendor AI assurance.",
                  color: "text-green-600",
                },
              ].map((item) => (
                <div key={item.num} className="bg-white p-6">
                  <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${item.color}`}>
                    {item.num} — {item.label}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── The Problem ──────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 border-b border-slate-200">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              Problem Statement
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The gap between AI deployment and AI governance.
            </h2>
            <p className="mt-5 text-base text-slate-600 leading-relaxed">
              According to the Bank of England, 75% of UK financial services firms are already
              using AI — with a further 10% planning to deploy within three years. Adoption is
              fast, widespread, and accelerating. Governance is not keeping pace.
            </p>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Most firms cannot answer basic questions about their AI systems: Who approved this
              model? How was it tested for bias? What happens when it goes wrong? Is there a
              human in the loop? These are no longer theoretical questions. Regulators are asking
              them. Insurers are asking them. Boards are starting to ask them.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  stat: "75%",
                  label: "of UK financial firms using AI",
                  source: "Bank of England, 2024",
                },
                {
                  stat: "3 in 4",
                  label: "firms lack documented AI governance frameworks",
                  source: "FCA thematic review, 2023",
                },
                {
                  stat: "£34.5m",
                  label: "FCA fine for algorithmic failure — no monitoring in place",
                  source: "FCA v Merrill Lynch, 2017",
                },
              ].map((s) => (
                <div key={s.stat} className="rounded-sm border border-slate-200 bg-white p-5">
                  <p className="text-3xl font-bold text-slate-900">{s.stat}</p>
                  <p className="mt-1 text-sm text-slate-600">{s.label}</p>
                  <p className="mt-2 text-xs text-slate-400">{s.source}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              {[
                {
                  title: "Firms can't answer their insurers",
                  body: "D&O and PI underwriters are adding AI declarations to renewal questionnaires. Firms that lack documented governance face exclusions, premium loadings, or AI coverage gaps they don't even know about.",
                },
                {
                  title: "Firms can't answer their regulators",
                  body: "FCA Consumer Duty and PRA SS1/23 require firms to evidence that AI systems are fair, explainable, and overseen. Most firms have the AI. Almost none have the evidence pack.",
                },
                {
                  title: "Firms can't answer their boards",
                  body: "Board-level accountability for AI risk is increasing. Executives are being asked to sign off on AI governance. Without a structured assessment, sign-off is uninformed — and that itself is a liability.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-sm border border-slate-200 bg-white p-5">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Real-world failures ───────────────────────────────────── */}
      <section className="bg-white py-20 border-b border-slate-200">
        <Container>
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              Real-World Failures
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              This is not hypothetical.
            </h2>
            <p className="mt-4 text-base text-slate-500 max-w-2xl">
              The following cases are real. In most of them, documented AI governance — oversight,
              validation, monitoring, bias testing — would have prevented or significantly reduced
              the consequence.
            </p>

            <div className="mt-10 space-y-5">
              {failures.map((f) => (
                <div
                  key={f.firm}
                  className={`rounded-sm border p-6 ${
                    f.severity === "critical"
                      ? "border-red-200 bg-red-50"
                      : f.severity === "high"
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border ${
                        f.severity === "critical" ? "border-red-300 bg-red-100 text-red-700" :
                        f.severity === "high" ? "border-amber-300 bg-amber-100 text-amber-700" :
                        "border-slate-300 bg-white text-slate-600"
                      }`}>
                        {f.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{f.firm}</p>
                        <p className="text-xs text-slate-500">{f.year} · {f.regulator}</p>
                      </div>
                    </div>
                    <div className={`rounded-sm px-2.5 py-1 text-xs font-semibold ${
                      f.severity === "critical" ? "bg-red-700 text-white" :
                      f.severity === "high" ? "bg-amber-600 text-white" :
                      "bg-slate-200 text-slate-700"
                    }`}>
                      {f.penalty}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">{f.what}</p>
                  <div className="flex items-start gap-2 pt-3 border-t border-slate-200">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-700" />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-blue-700">Governance lesson: </span>
                      {f.why}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-sm border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Common thread across every case:</span> the AI
                  system made or influenced consequential decisions without adequate documentation,
                  monitoring, or oversight. RiskPilot is designed to surface and score exactly
                  these gaps — before they become a fine, a claim, or a headline.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Regulatory landscape ─────────────────────────────────── */}
      <section className="bg-slate-50 py-20 border-b border-slate-200">
        <Container>
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              Market Signals
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why the urgency is now.
            </h2>
            <p className="mt-4 text-base text-slate-500 max-w-2xl">
              Multiple regulatory and commercial drivers are converging simultaneously. Each one
              creates demand for exactly what RiskPilot produces — a structured assessment and
              defensible evidence pack.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regulations.map((r) => (
                <div key={r.label} className="rounded-sm border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">{r.label}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{r.title}</p>
                    </div>
                    <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 shrink-0 ml-2">
                      {r.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Solution ─────────────────────────────────────────────── */}
      <section className="bg-white py-20 border-b border-slate-200">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              The Solution
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              What RiskPilot does.
            </h2>
            <p className="mt-5 text-base text-slate-600 leading-relaxed">
              RiskPilot is a structured AI governance readiness assessment and evidence platform
              for regulated firms. You answer a structured set of questions about your AI system —
              decision authority, data handling, oversight controls, bias testing, incident history,
              and governance maturity. We produce a scored output and evidence pack.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: <BarChart3 className="h-5 w-5" />,
                  title: "AI Governance Score (0–100)",
                  body: "A single scored output across five dimensions: Governance, Model Risk, Auditability, Human Oversight, and Operational Monitoring. Each rated, explained, and benchmarked.",
                },
                {
                  icon: <Target className="h-5 w-5" />,
                  title: "Prioritised gap analysis",
                  body: "Critical, High, and Medium remediation actions ranked by impact. Mapped to FCA Consumer Duty, PRA SS1/23, and ISO 42001 — not generic compliance advice.",
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "Evidence-grade output",
                  body: "A downloadable PDF structured to be shared directly with compliance teams, internal audit, underwriters, and board risk committees.",
                },
                {
                  icon: <TrendingUp className="h-5 w-5" />,
                  title: "Future: Platform expansion",
                  body: "Remediation tracking, recurring reassessments, board-level reporting, and vendor AI assurance — turning a one-off assessment into a continuous governance function.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-sm border border-slate-200 p-5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-slate-200 bg-slate-50 text-blue-700">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Target market & buyer ─────────────────────────────────── */}
      <section className="bg-slate-50 py-20 border-b border-slate-200">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              Target Market
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Who this is built for.
            </h2>

            {/* Company profile */}
            <div className="mt-8 rounded-sm border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Target firm profile
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "FCA or PRA regulated — or dual regulated",
                  "Deploying AI in credit, underwriting, fraud, or trading",
                  "10–500 employees (too small for a full GRC team, too big to ignore governance)",
                  "Approaching PI or D&O renewal in the next 12 months",
                  "Received or expects an FCA supervisory letter on AI",
                  "Running AI models in production without a formal governance framework",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* First buyer */}
            <div className="mt-6 rounded-sm border border-blue-200 bg-blue-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
                First buyer persona
              </p>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-blue-700 text-white text-sm font-bold">
                  CR
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Compliance or Risk Lead at a mid-size regulated firm</p>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    Probably a Head of Compliance, Chief Risk Officer, or Head of Model Risk at a firm
                    between 50 and 300 employees. They know AI governance is a problem. They don&apos;t
                    have the budget for a Big Four engagement. They have a renewal conversation coming
                    up, a board that is starting to ask questions, or a regulator letter sitting in
                    their inbox.
                  </p>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    They need something structured, fast, and credible — not a 200-page framework
                    document, but a scored assessment with a clear action list and something they
                    can put in front of their broker, auditor, or board.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {[
                      { label: "Trigger", value: "Renewal, FCA letter, or board ask" },
                      { label: "Budget", value: "£2k–£10k per assessment cycle" },
                      { label: "Decision", value: "Individual or small team" },
                    ].map((x) => (
                      <div key={x.label} className="rounded-sm border border-blue-200 bg-white px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{x.label}</p>
                        <p className="text-xs text-slate-700 mt-0.5">{x.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Hypothesis ───────────────────────────────────────────── */}
      <section className="bg-white py-20 border-b border-slate-200">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              Hypothesis
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              What we are testing.
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-sm border border-slate-200 p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Core hypothesis</p>
                <p className="text-base text-slate-800 leading-relaxed font-medium">
                  Regulated firms in financial services are willing to pay for a structured AI
                  governance assessment tool that produces evidence they can use in renewal,
                  compliance, and board conversations — if it is faster, cheaper, and more credible
                  than building the documentation internally or hiring a consultant.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-sm border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-3">What success looks like early</p>
                  <ul className="space-y-2">
                    {[
                      "Compliance leads complete the assessment without prompting",
                      "Users say the output is something they could share with their broker",
                      "Renewal conversations reference the evidence pack",
                      "Repeat assessments as the firm's AI changes or governance improves",
                    ].map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-sm border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3">What would invalidate it</p>
                  <ul className="space-y-2">
                    {[
                      "Firms don't complete the assessment because the questions are too hard",
                      "The output isn't credible enough to use in a real conversation",
                      "Buyers say they already have this covered by their Big Four advisor",
                      "Insurers won't accept a startup's assessment as evidence",
                    ].map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-slate-600">
                        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-sm border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">What we are not claiming</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  RiskPilot is not a legal opinion, a regulatory audit, or a guarantee of
                  coverage. It is a structured evidence tool. The same way a fire risk assessment
                  does not make your building fireproof — it makes it insurable, defensible, and
                  auditable. That is what regulated firms need right now.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Expansion path ───────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 border-b border-slate-200">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              Platform Vision
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Where this goes.
            </h2>
            <p className="mt-4 text-base text-slate-500">
              The assessment is the entry point. The platform is what makes this a durable business.
            </p>

            <div className="mt-8 space-y-2">
              {[
                {
                  phase: "Now",
                  title: "Assessment + AI Governance Score",
                  body: "Structured 10-minute assessment, scored output across five dimensions, downloadable evidence pack.",
                  active: true,
                },
                {
                  phase: "Next",
                  title: "Remediation tracking",
                  body: "Track progress against identified gaps. Reassess after improvements. Show trajectory to insurers and regulators.",
                  active: false,
                },
                {
                  phase: "Next",
                  title: "Board & compliance reporting",
                  body: "Executive-level summaries for risk committees, audit functions, and board AI governance sign-off.",
                  active: false,
                },
                {
                  phase: "Later",
                  title: "Recurring reassessments",
                  body: "Annual or bi-annual reassessment cycles. Track governance maturity over time. Subscription model.",
                  active: false,
                },
                {
                  phase: "Later",
                  title: "Vendor AI assurance",
                  body: "Assess third-party AI tools on behalf of regulated firm buyers. Extend governance upstream to the supply chain.",
                  active: false,
                },
              ].map((item) => (
                <div key={item.title} className={`flex gap-4 rounded-sm border p-5 ${item.active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
                  <div className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-widest h-fit mt-0.5 ${item.active ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-500"}`}>
                    {item.phase}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Shield className="mx-auto mb-5 h-8 w-8 text-blue-400" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Run your assessment.
            </h2>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              Ten minutes. No obligation. A scored output you can use in your next renewal,
              compliance, or board conversation.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 rounded-sm bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
              >
                Get Your Governance Score
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:hello@riskpilot.ai"
                className="inline-flex items-center gap-2 rounded-sm border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-slate-400 hover:text-white transition-colors"
              >
                Get in touch
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
