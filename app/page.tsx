// app/page.tsx
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  Scale,
  ChevronRight,
  BarChart3,
  Lock,
  Eye,
} from "lucide-react";
import Container from "../components/layout/Container";
import ButtonLink from "../components/ui/ButtonLink";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-slate-900 pt-20 pb-14">
        <Container>
          <div className="mx-auto max-w-4xl">

            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-sm border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium tracking-widest text-slate-300 uppercase">
              <Shield className="h-3.5 w-3.5 text-blue-400" />
              AI Governance Readiness — UK Regulated Firms
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl">
              Know Where Your AI
              <span className="block text-blue-400">Governance Stands.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              Regulated firms are adopting AI faster than they can evidence control, oversight, and
              accountability. RiskPilot gives you a structured governance assessment and the evidence
              pack your compliance team, board, and insurers need.
            </p>

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

            <p className="mt-4 text-sm text-slate-500">
              Used for PI renewal preparation, FCA compliance reviews, board AI sign-off, and internal risk assurance.
            </p>

            {/* Trust bar */}
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-slate-700/60 pt-8 text-xs font-medium tracking-wide text-slate-500 uppercase">
              {[
                "FCA / PRA aligned",
                "Compliance, Risk & Insurance ready",
                "10-minute assessment",
                "Evidence-grade output",
                "No commitment",
              ].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-blue-600" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Market signal bar ─────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-slate-50">
        <Container>
          <div className="grid divide-y sm:divide-y-0 sm:divide-x divide-slate-200 sm:grid-cols-3 text-center">
            {[
              { stat: "SS1/23", label: "PRA model risk management standard — effective now" },
              { stat: "Consumer Duty", label: "FCA accountability for AI-driven consumer outcomes" },
              { stat: "Renewal", label: "Insurers increasingly asking for AI governance evidence" },
            ].map((item) => (
              <div key={item.stat} className="px-6 py-5">
                <p className="text-sm font-bold text-slate-900">{item.stat}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* ── The Problem ───────────────────────────────────────────── */}
      <section id="problem" className="scroll-mt-20 py-14 bg-white">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 items-start">

            {/* Left — statement */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
                The Problem
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl leading-tight">
                Your insurers are asking questions your team cannot yet answer.
              </h2>
              <p className="mt-5 text-base text-slate-600 leading-relaxed">
                D&amp;O and PI underwriters are adding AI declarations to renewal questionnaires. Firms
                that lack documented governance, audit trails, and oversight evidence face exclusions,
                premium loadings, or uninsurable AI exposure.
              </p>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                The regulatory direction is clear. FCA Consumer Duty places accountability for
                AI-driven consumer outcomes directly on the firm. PRA SS1/23 mandates model risk
                management. The liability sits with your organisation — not the model provider.
              </p>

              <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-500">
                <p className="text-sm font-medium text-amber-900">
                  Without documented governance, firms risk coverage exclusions, higher premiums,
                  or being uninsurable for specific AI use cases entirely.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                >
                  Run the 10-minute assessment
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right — questions */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Questions underwriters are now asking
              </p>
              <div className="space-y-3">
                {[
                  {
                    q: "If your credit AI discriminates, are you covered?",
                    note: "Consumer Duty places fair outcome responsibility on the firm.",
                  },
                  {
                    q: "If your trading agent hallucinates, who pays?",
                    note: "Generative AI errors in execution are not covered by default.",
                  },
                  {
                    q: "If your underwriting model fails FCA principles, is it excluded?",
                    note: "Model explainability and oversight are now underwriting criteria.",
                  },
                  {
                    q: "If your fraud detection misses, is it negligence?",
                    note: "AML failures linked to AI models face increasing regulatory scrutiny.",
                  },
                  {
                    q: "Can you demonstrate your AI was operating within approved parameters?",
                    note: "Audit trails and change management records required for claims.",
                  },
                ].map((item) => (
                  <div
                    key={item.q}
                    className="rounded-sm border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.q}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 py-14 bg-slate-50 border-y border-slate-200">
        <Container>
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">
              How It Works
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From assessment to evidence pack in three steps.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
              Designed for compliance teams and technical leads who need something they can
              put in front of their broker.
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line */}
            <div className="absolute top-8 left-1/6 right-1/6 hidden h-px bg-slate-300 md:block" style={{ left: "18%", right: "18%" }} />

            {[
              {
                step: "01",
                title: "Free Governance Assessment",
                body: "Complete a structured 10-minute assessment covering your AI system, governance controls, data handling, and oversight mechanisms.",
                cta: "Start assessment",
                href: "/assessment",
              },
              {
                step: "02",
                title: "Scored Results & Gap Analysis",
                body: "Receive your AI Governance Score (0–100) with a breakdown by category, identified risk drivers, and a ranked list of remediation actions.",
                cta: "See example output",
                href: "/#score",
              },
              {
                step: "03",
                title: "Evidence Pack for Stakeholders",
                body: "Download a formatted evidence document to share with your broker, compliance team, or board. Use it for renewal discussions, regulatory reviews, and governance sign-off.",
                cta: "See what's covered",
                href: "/about",
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white border border-slate-200 rounded-sm p-6">
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-blue-700 text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.body}</p>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                >
                  {item.cta}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Score Preview ─────────────────────────────────────────── */}
      <section id="score" className="scroll-mt-20 py-14 bg-white">
        <Container>
          <div className="grid items-start gap-16 lg:grid-cols-2">

            {/* Left — description */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
                The Output
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl leading-tight">
                A score your compliance team, board, and broker can act on.
              </h2>
              <p className="mt-5 text-base text-slate-600 leading-relaxed">
                The AI Governance Score is calculated against the specific factors regulators,
                auditors, and insurers evaluate — decision authority, oversight maturity,
                auditability, and regulatory alignment. One assessment, useful across
                multiple governance conversations.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  {
                    icon: <BarChart3 className="h-5 w-5" />,
                    title: "Five scored dimensions",
                    body: "Governance, Model Risk, Auditability, Human Oversight, and Operational Monitoring — each rated and explained.",
                  },
                  {
                    icon: <Scale className="h-5 w-5" />,
                    title: "FCA, PRA & ISO 42001 mapped",
                    body: "Gaps are mapped directly to Consumer Duty, PRA SS1/23, and ISO 42001 requirements.",
                  },
                  {
                    icon: <FileCheck className="h-5 w-5" />,
                    title: "Evidence-grade output",
                    body: "The PDF output is structured to be shared directly with compliance, auditors, and underwriters.",
                  },
                  {
                    icon: <TrendingUp className="h-5 w-5" />,
                    title: "Prioritised remediation",
                    body: "Critical, High, and Medium actions ranked by renewal impact — not generic governance advice.",
                  },
                ].map((x) => (
                  <div key={x.title} className="flex gap-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-slate-200 bg-slate-50 text-blue-700">
                      {x.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{x.title}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{x.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <ButtonLink href="/assessment" variant="primary">
                  Get your governance score
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>

            {/* Right — mock report */}
            <div className="rounded-sm border border-slate-200 bg-white shadow-xl overflow-hidden">

              {/* Report header */}
              <div className="bg-slate-900 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white">RiskPilot AI Governance Report</span>
                  </div>
                  <span className="rounded-sm bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                    Example
                  </span>
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-5xl font-bold text-white">68</span>
                  <div className="mb-1">
                    <span className="text-slate-400 text-sm">/100</span>
                    <div className="mt-0.5 inline-flex ml-3 items-center rounded-sm bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300">
                      Moderate Risk
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400">Enhanced terms apply · Valid 60 days</p>
              </div>

              {/* Score breakdown */}
              <div className="px-6 pt-5 pb-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                  Score Breakdown
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Governance", score: 80, color: "bg-green-500" },
                    { label: "Model Risk", score: 65, color: "bg-amber-500" },
                    { label: "Auditability", score: 70, color: "bg-amber-500" },
                    { label: "Human Oversight", score: 75, color: "bg-green-500" },
                    { label: "Operational Monitoring", score: 68, color: "bg-amber-500" },
                  ].map((cat) => (
                    <div key={cat.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">{cat.label}</span>
                        <span className="font-semibold text-slate-800">{cat.score}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full ${cat.color}`} style={{ width: `${cat.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coverage */}
              <div className="mx-6 my-4 rounded-sm border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  Coverage Implications
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                    Eligible for PI coverage — enhanced underwriting applies
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-700">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    Exclusion: Autonomous decisions without documented oversight
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-700">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    Enhanced underwriting required for credit decisioning models
                  </li>
                </ul>
              </div>

              <div className="px-6 pb-6">
                <Link
                  href="/assessment"
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
                >
                  Run your assessment
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-2 text-center text-xs text-slate-400">
                  Takes 10 minutes · Downloadable PDF output
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Industries ────────────────────────────────────────────── */}
      <section id="industries" className="scroll-mt-20 py-14 bg-slate-50 border-y border-slate-200">
        <Container>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">Industries</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Built for regulated financial firms.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
              If you are deploying AI in any of these areas and are regulated by the FCA or PRA,
              you have a governance question to answer.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Scale className="h-5 w-5" />,
                title: "Credit Decisioning",
                desc: "AI lending, affordability scoring, and automated credit decisions.",
                risk: "Consumer Duty fair outcome accountability applies directly.",
              },
              {
                icon: <TrendingUp className="h-5 w-5" />,
                title: "Trading Support",
                desc: "Algorithmic execution, market analysis, and order routing.",
                risk: "Hallucination and model failure in execution may not be covered.",
              },
              {
                icon: <Eye className="h-5 w-5" />,
                title: "Fraud Detection",
                desc: "Transaction monitoring, AML screening, and anomaly detection.",
                risk: "AML failures linked to AI models face increasing FCA scrutiny.",
              },
              {
                icon: <Lock className="h-5 w-5" />,
                title: "Underwriting",
                desc: "AI-assisted insurance pricing, risk classification, and referral.",
                risk: "Model explainability is now an active underwriting criterion.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-sm border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-slate-50 text-blue-700">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-amber-700 font-medium">{item.risk}</p>
                </div>
                <Link
                  href="/assessment"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                >
                  Assess this use case
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Credibility ───────────────────────────────────────────── */}
      <section className="py-10 bg-white border-b border-slate-200">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-8 sm:grid-cols-3 text-center sm:text-left">
              <div className="sm:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">
                  Why RiskPilot
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Built by someone with direct experience in regulated financial environments
                  and the London insurance market.
                </p>
              </div>
              <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3">
                {[
                  { title: "AI Governance", body: "Practical understanding of how AI risk is assessed and documented in regulated environments." },
                  { title: "Model Risk", body: "Familiarity with PRA model risk management expectations and internal validation frameworks." },
                  { title: "London Market", body: "Direct experience with insurance placement, underwriting criteria, and renewal processes." },
                ].map((c) => (
                  <div key={c.title} className="border-l border-slate-200 pl-4">
                    <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-slate-900 py-10">
        <Container>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-white">RiskPilot AI</span>
              </div>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                AI governance readiness assessments and evidence for FCA and PRA regulated firms.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Services</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/assessment", label: "Free Governance Assessment" },
                  { href: "/about", label: "About RiskPilot" },
                  { href: "/#how-it-works", label: "How It Works" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-slate-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Contact</p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="mailto:hello@riskpilot.ai" className="text-slate-400 hover:text-white transition-colors">
                    hello@riskpilot.ai
                  </a>
                </li>
                <li className="text-slate-500">London, United Kingdom</li>
                <li className="text-slate-500">UK Financial Services</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>&copy; {new Date().getFullYear()} RiskPilot AI. All rights reserved.</p>
            <p>Not legal advice. For regulated firms seeking AI governance guidance.</p>
          </div>
        </Container>
      </footer>
    </>
  );
}
