"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ImpactLevel,
  DataSensitivity,
  DecisionAuthority,
} from "../../lib/risk/types";

export default function AssessmentPage() {
  const router = useRouter();

  const [industry, setIndustry] = useState("");
  const [aiUseCase, setAiUseCase] = useState("");
  const [decisionAuthority, setDecisionAuthority] =
    useState<DecisionAuthority>("none");
  const [impactLevel, setImpactLevel] = useState<ImpactLevel>("minor");
  const [dataSensitivity, setDataSensitivity] =
    useState<DataSensitivity>("none");
  const [customerFacing, setCustomerFacing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!industry.trim() || !aiUseCase.trim()) {
      alert("Please fill in Industry and AI use case.");
      return;
    }

    const query = new URLSearchParams({
      industry: industry.trim(),
      aiUseCase: aiUseCase.trim(),
      decisionAuthority,
      impactLevel,
      dataSensitivity,
      customerFacing: String(customerFacing),
    }).toString();

    router.push(`/results?${query}`);
  };

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 700, marginTop: 16 }}>
        AI Risk Assessment
      </h1>
      <p style={{ marginTop: 8 }}>
        Provide a few details about your AI system to receive a structured risk
        level and recommended governance controls.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Industry *</span>
          <input
            placeholder="e.g., Insurance, Retail, Healthcare"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>AI Use Case *</span>
          <textarea
            placeholder="Describe what the AI does, where it’s used, and what decision it supports."
            value={aiUseCase}
            onChange={(e) => setAiUseCase(e.target.value)}
            rows={5}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Decision Authority</span>
          <select
            value={decisionAuthority}
            onChange={(e) =>
              setDecisionAuthority(e.target.value as DecisionAuthority)
            }
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="none">No automated decisions</option>
            <option value="partial">Partially automated decisions</option>
            <option value="full">Fully automated decisions</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Impact Level if AI fails</span>
          <select
            value={impactLevel}
            onChange={(e) => setImpactLevel(e.target.value as ImpactLevel)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="minor">Minor impact</option>
            <option value="financial">Financial impact</option>
            <option value="legal">Legal / regulatory exposure</option>
            <option value="harm">Potential harm to individuals</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Data Sensitivity</span>
          <select
            value={dataSensitivity}
            onChange={(e) =>
              setDataSensitivity(e.target.value as DataSensitivity)
            }
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="none">No personal data</option>
            <option value="basic">Basic personal data</option>
            <option value="sensitive">Sensitive personal data</option>
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={customerFacing}
            onChange={(e) => setCustomerFacing(e.target.checked)}
          />
          <span style={{ fontWeight: 600 }}>Customer-facing AI system</span>
        </label>

        <button
          type="submit"
          style={{
            marginTop: 6,
            padding: 12,
            background: "black",
            color: "white",
            borderRadius: 10,
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Evaluate Risk
        </button>
      </form>
    </main>
  );
}