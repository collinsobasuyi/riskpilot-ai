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

function asEnum<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  if (!value) return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function asBoolean(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  return value === "true";
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
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Assessment Results</h1>

      <p style={{ marginTop: 12 }}>
        Risk Level: <strong>{result.level}</strong>
      </p>
      <p>Score: {result.score}</p>

      <h2 style={{ marginTop: 24 }}>Risk Drivers</h2>
      {result.riskDrivers.length ? (
        <ul>
          {result.riskDrivers.map((driver) => (
            <li key={driver}>{driver}</li>
          ))}
        </ul>
      ) : (
        <p>No major risk drivers detected based on the provided inputs.</p>
      )}

      <h2 style={{ marginTop: 24 }}>Recommended Controls</h2>
      <ul>
        {controls.map((control) => (
          <li key={control.title} style={{ marginBottom: 12 }}>
            <strong>
              {control.title} ({control.priority})
            </strong>
            <p style={{ marginTop: 4 }}>{control.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}