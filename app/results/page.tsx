import Link from "next/link";
import { calculateRisk } from "../../lib/risk/scoring";
import { getRecommendedControls } from "../../lib/risk/controls";
import {
  RiskAssessmentInput,
  DecisionAuthority,
  ImpactLevel,
  DataSensitivity,
} from "../../lib/risk/types";

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

const decisionAuthorityValues: DecisionAuthority[] = ["none", "partial", "full"];
const impactLevelValues: ImpactLevel[] = ["minor", "financial", "legal", "harm"];
const dataSensitivityValues: DataSensitivity[] = ["none", "basic", "sensitive"];

function firstString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function asEnum<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  if (!value) return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function asBoolean(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  return value === "true";
}

function badgeStyle(level: "Low" | "Medium" | "High") {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 14,
    border: "1px solid #ddd",
  };

  if (level === "Low") return { ...base, background: "#f4f4f5" };
  if (level === "Medium") return { ...base, background: "#fff7ed" };
  return { ...base, background: "#fef2f2" };
}

export default function ResultsPage({ searchParams }: Props) {
  const industry = firstString(searchParams.industry) ?? "";
  const aiUseCase = firstString(searchParams.aiUseCase) ?? "";

  const decisionAuthority = asEnum(
    firstString(searchParams.decisionAuthority),
    decisionAuthorityValues,
    "none"
  );

  const impactLevel = asEnum(
    firstString(searchParams.impactLevel),
    impactLevelValues,
    "minor"
  );

  const dataSensitivity = asEnum(
    firstString(searchParams.dataSensitivity),
    dataSensitivityValues,
    "none"
  );

  const customerFacing = asBoolean(firstString(searchParams.customerFacing), false);

  const input: RiskAssessmentInput = {
    industry,
    aiUseCase,
    decisionAuthority,
    impactLevel,
    dataSensitivity,
    customerFacing,
  };

  const result = calculateRisk(input);
  const controls = getRecommendedControls(result);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          ← Back to Home
        </Link>
        <Link href="/assessment" style={{ textDecoration: "none" }}>
          Run another assessment →
        </Link>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 700, marginTop: 16 }}>
        Assessment Results
      </h1>

      <div style={{ marginTop: 16 }}>
        <span style={badgeStyle(result.level)}>Risk Level: {result.level}</span>
        <p style={{ marginTop: 10 }}>Score: {result.score}</p>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 14,
          border: "1px solid #eee",
          borderRadius: 12,
        }}
      >
        <p>
          <strong>Industry:</strong> {input.industry || "Not provided"}
        </p>
        <p>
          <strong>Customer-facing:</strong> {input.customerFacing ? "Yes" : "No"}
        </p>
        <p>
          <strong>Decision authority:</strong> {input.decisionAuthority}
        </p>
        <p>
          <strong>Impact level:</strong> {input.impactLevel}
        </p>
        <p>
          <strong>Data sensitivity:</strong> {input.dataSensitivity}
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>AI Use Case</h2>
        <p style={{ marginTop: 8, lineHeight: 1.6 }}>
          {input.aiUseCase || "Not provided"}
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Risk Drivers</h2>
        {result.riskDrivers.length ? (
          <ul style={{ marginTop: 8 }}>
            {result.riskDrivers.map((driver) => (
              <li key={driver}>{driver}</li>
            ))}
          </ul>
        ) : (
          <p style={{ marginTop: 8 }}>
            No major risk drivers detected based on the provided inputs.
          </p>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Recommended Controls</h2>
        <ul style={{ marginTop: 8 }}>
          {controls.map((control) => (
            <li key={control.title} style={{ marginBottom: 12 }}>
              <strong>
                {control.title} ({control.priority})
              </strong>
              <p style={{ marginTop: 4, lineHeight: 1.6 }}>
                {control.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}