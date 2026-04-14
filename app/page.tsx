// app/page.tsx

"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Award,
  MessageCircle,
  ChevronRight,
  Shield,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  AlertCircle,
  Scale,
} from "lucide-react";
import Container from "../components/layout/Container";
import ButtonLink from "../components/ui/ButtonLink";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-50 to-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <Container className="pt-16 pb-24">
          <div className="mx-auto max-w-4xl text-center">
            {/* Niche identity badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm shadow-sm">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-zinc-900">
                AI Insurability • FCA Regulated • Financial Services
              </span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl md:text-7xl">
              Check Your AI Insurability
              <span className="mt-2 block text-blue-600">Before Your Next Renewal</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              As FCA-regulated firms deploy AI agents in credit, underwriting, and fraud detection,
              liability gaps emerge. Get your{" "}
              <span className="font-semibold text-zinc-900">Insurability Score</span> and evidence
              pack aligned with PRA expectations.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/assessment" variant="primary" className="group">
                Get Your Insurability Score
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ButtonLink>

              <ButtonLink href="#book" variant="secondary">
                <Calendar className="mr-2 h-4 w-4" />
                Book a free consultation
              </ButtonLink>
            </div>

            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
              {[
                "FCA/PRA aligned",
                "Designed for London Market",
                "10-minute assessment",
                "No commitment",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* The AI Liability Shift Section */}
      <section
        id="liability"
        className="scroll-mt-24 py-16 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200"
      >
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>The AI Liability Shift Is Happening Now</span>
            </div>

            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              Regulators Are Shifting Responsibility
            </h2>

            <p className="mt-4 text-lg text-zinc-700">
              Financial regulators are making it clear:{" "}
              <span className="font-semibold">if your AI system causes harm, your firm is responsible.</span>{" "}
              Not the model provider. Not the vendor. Your organisation.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  q: "How is your AI monitored?",
                  note: "Insurers now require continuous oversight evidence",
                },
                {
                  q: "Who approves AI decisions?",
                  note: "Accountability chains must be documented",
                },
                {
                  q: "Can the system be audited?",
                  note: "Full audit trails are non-negotiable",
                },
                {
                  q: "What happens if the model fails?",
                  note: "Incident response plans must be tested",
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="bg-white/80 backdrop-blur p-4 rounded-lg border border-amber-200"
                >
                  <p className="font-medium text-zinc-900">{item.q}</p>
                  <p className="text-sm text-zinc-600 mt-1">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>
                  <span className="font-bold">Without answers,</span> firms risk coverage exclusions,
                  higher premiums, or being unable to secure AI liability insurance at all.
                </span>
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <ButtonLink href="/assessment" variant="primary" className="group">
                Run the 10-minute assessment
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ButtonLink>
              <Link href="#book" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Or discuss your renewal
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="scroll-mt-24 py-16 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              The £1M Question for Financial Firms
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              Your D&O and PI insurers are starting to ask:
            </p>
            <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
              {[
                "If your credit AI discriminates, are you covered?",
                "If your trading agent hallucinates, who pays?",
                "If your underwriting model fails FCA principles, is it excluded?",
                "If your fraud detection misses, is it negligence?",
              ].map((q) => (
                <div key={q} className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-700">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="scroll-mt-24 py-24 bg-zinc-50">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              From Assessment to Insurability
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
              A clear path to proving your AI systems are safe to insure.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Free Insurability Assessment",
                body:
                  "Complete a 10-minute assessment. Get your Insurability Score (0-100) and gap analysis against FCA/PRA expectations.",
                linkHref: "/assessment",
                linkText: "Start assessment",
              },
              {
                step: "2",
                title: "Results Review",
                body:
                  "We review your score together. If below 70, we identify exactly what insurers will ask for at renewal.",
                linkHref: "#book",
                linkText: "Book free review",
              },
              {
                step: "3",
                title: "Evidence Pack & Certification",
                body:
                  "Get a documented evidence pack to share with insurers. Achieve 'RiskPilot Certified' status for better terms.",
                linkHref: "#book",
                linkText: "Discuss certification",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-zinc-600">{item.body}</p>
                <div className="mt-4">
                  <Link
                    href={item.linkHref}
                    className="inline-flex items-center font-medium text-blue-600 hover:text-blue-700"
                  >
                    {item.linkText}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Founder Credibility Section */}
      <section id="credibility" className="scroll-mt-24 py-16 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 flex justify-center">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  ⚡
                </div>
              </div>
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl mb-2">
                  Built by Someone Who Understands the London Market
                </h2>
                <p className="text-lg text-zinc-600">
                  RiskPilot was created by a professional with experience working in regulated
                  financial environments and the London insurance market.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {["AI governance practices", "Model risk management", "Insurance underwriting"].map(
                    (item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-zinc-700">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        <span>{item}</span>
                      </div>
                    )
                  )}
                </div>
                <p className="mt-4 text-sm text-zinc-500 italic">
                  The framework combines all three to evaluate AI systems the way insurers actually
                  think about risk.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Insurability Score Preview */}
      <section id="score" className="scroll-mt-24 bg-zinc-50 py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                Your Insurability Score in 10 Minutes
              </h2>

              <div className="mt-8 space-y-6">
                {[
                  {
                    icon: <Shield className="h-5 w-5 text-blue-600" />,
                    title: "Insurance-Ready Assessment",
                    body:
                      "Mapped to what Lloyd's syndicates and London Market insurers actually ask for at renewal.",
                  },
                  {
                    icon: <Scale className="h-5 w-5 text-blue-600" />,
                    title: "FCA & PRA Alignment",
                    body:
                      "Covers Model Risk Management, Operational Resilience, and Consumer Duty principles.",
                  },
                  {
                    icon: <FileCheck className="h-5 w-5 text-blue-600" />,
                    title: "Evidence-Grade Output",
                    body:
                      "Your results package is designed to be shared with compliance, auditors, and underwriters.",
                  },
                  {
                    icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
                    title: "Better Insurance Terms",
                    body:
                      "Certified firms typically secure better coverage and lower premiums at renewal.",
                  },
                ].map((x) => (
                  <div key={x.title} className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      {x.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">{x.title}</h3>
                      <p className="text-zinc-600">{x.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <ButtonLink href="#book" variant="primary" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Book a free consultation
                </ButtonLink>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-zinc-900">
                    RiskPilot Insurability Score
                  </span>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Example
                </span>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 transform -rotate-90">
                    <circle
                      className="text-zinc-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className="text-amber-500"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                      strokeDasharray={2 * Math.PI * 56}
                      strokeDashoffset={2 * Math.PI * 56 * (1 - 0.68)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-zinc-900">68</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  Risk Tier: Moderate • Conditional Coverage
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: "Governance", score: 80, color: "bg-green-500" },
                  { label: "Model Risk", score: 65, color: "bg-amber-500" },
                  { label: "Auditability", score: 70, color: "bg-amber-500" },
                  { label: "Human Oversight", score: 75, color: "bg-green-500" },
                  { label: "Operational Monitoring", score: 68, color: "bg-amber-500" },
                ].map((cat) => (
                  <div key={cat.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600">{cat.label}</span>
                      <span className="font-medium">{cat.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full">
                      <div
                        className={`h-1.5 rounded-full ${cat.color}`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-zinc-200 p-4">
                <h4 className="text-sm font-semibold text-zinc-900 mb-2">
                  Insurance Eligibility
                </h4>
                <ul className="space-y-2 text-xs text-zinc-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5" />
                    <span>Eligible for PI coverage up to £5m</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5" />
                    <span>Exclusion: Autonomous trading decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5" />
                    <span>Enhanced underwriting required for credit models</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/assessment"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Get your score
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Target Industries */}
      <section id="industries" className="scroll-mt-24 py-16 bg-white">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Built for Regulated Financial Firms
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
              If you&apos;re deploying AI in these areas, you need insurability.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🏦", title: "Credit Decisioning", desc: "AI lending, scoring, affordability" },
              { icon: "📈", title: "Trading Support", desc: "Algorithmic execution, market analysis" },
              { icon: "🛡️", title: "Fraud Detection", desc: "Transaction monitoring, AML" },
              { icon: "📋", title: "Underwriting", desc: "Insurance pricing, risk assessment" },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-zinc-200 rounded-xl p-6 text-center hover:shadow-md transition"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-zinc-900">{item.title}</h3>
                <p className="text-sm text-zinc-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Book a Call */}
      <section id="book" className="scroll-mt-24 py-24 bg-zinc-50">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Book a Free 30-Minute Consultation
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              We&apos;ll review your insurability score and identify exactly what your insurers will
              ask for.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4">
              <ButtonLink href="/assessment" variant="primary" className="group">
                Get your free insurability score first
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ButtonLink>

              <span className="text-sm text-zinc-400">or</span>

              <Link
                href="#calendar"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Calendar className="h-4 w-4" />
                Skip to booking
              </Link>
            </div>

            <div id="calendar" className="mt-12 rounded-2xl border border-zinc-200 bg-white p-8">
              <p className="mb-4 text-zinc-500">30-minute strategy call</p>
              <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400">
                [Calendly]
              </div>
              <p className="mt-4 text-xs text-zinc-400">
                Free • No commitment • Ask about your specific use case
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-bold text-zinc-900">RiskPilot AI</h3>
              <p className="mt-2 text-sm text-zinc-600">
                AI insurability assessments for regulated financial firms
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900">Services</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/assessment" className="text-zinc-600 hover:text-blue-600">
                    Free Insurability Score
                  </Link>
                </li>
                <li>
                  <Link href="#book" className="text-zinc-600 hover:text-blue-600">
                    Consultation
                  </Link>
                </li>
                <li>
                  <Link href="/certification" className="text-zinc-600 hover:text-blue-600">
                    Certification
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900">Contact</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="mailto:hello@riskpilot.ai" className="text-zinc-600 hover:text-blue-600">
                    hello@riskpilot.ai
                  </a>
                </li>
                <li className="text-zinc-600">London • UK Financial Services</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-600">
            <p>&copy; {new Date().getFullYear()} RiskPilot AI. All rights reserved.</p>
            <p className="mt-1 text-xs text-zinc-400">
              Not legal advice. For regulated firms seeking insurability guidance.
            </p>
          </div>
        </Container>
      </footer>
    </>
  );
}