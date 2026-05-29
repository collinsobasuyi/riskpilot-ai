import { describe, it, expect } from "vitest";
import { calculatePreliminaryStatus, DEFAULT_ASSESSMENT_FORM } from "../schema";

const base = { ...DEFAULT_ASSESSMENT_FORM };

describe("calculatePreliminaryStatus", () => {
  it("score is never below 0 even with all negative conditions", () => {
    const result = calculatePreliminaryStatus({
      ...base,
      decisionAuthority: "full",
      systematicRisk: "global",
      mttd: "over_24_hours",
      explainabilityType: "black-box",
      humanIntervention: "autonomous",
      killSwitch: "none",
      auditTrailCompleteness: "none",
      trainingFrequency: "none",
      externalVerification: "none",
      financialImpactTier: "harm",
      deploymentType: "third-party-api",
      foundationModelSource: "openai",
      criticality: "regulatory",
      documentedProcess: false,
      incidentHistory: "multiple",
      biasTesting: ["No testing conducted"],
      monitoringHallucination: false,
      hasModelCards: false,
      hasExternalAudit: false,
      regulatedEntity: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("score is never above 100", () => {
    const result = calculatePreliminaryStatus(base);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("returns High Risk tier when score < 40", () => {
    const result = calculatePreliminaryStatus({
      ...base,
      decisionAuthority: "full",
      systematicRisk: "global",
      mttd: "over_24_hours",
      auditTrailCompleteness: "none",
      financialImpactTier: "harm",
      documentedProcess: false,
      incidentHistory: "multiple",
    });
    expect(result.status).toBe("High Risk");
  });

  it("returns Medium Risk at baseline with no negative signals", () => {
    const result = calculatePreliminaryStatus({
      ...base,
      decisionAuthority: "none",
      documentedProcess: true,
      hasModelCards: true,
      hasExternalAudit: true,
      regulatedEntity: true,
      monitoringHallucination: false,
      externalVerification: "external-audit",
      trainingFrequency: "quarterly",
    });
    expect(result.status).toBe("Medium Risk");
  });

  it("concerns array has at most 4 entries", () => {
    const result = calculatePreliminaryStatus({
      ...base,
      decisionAuthority: "full",
      systematicRisk: "global",
      mttd: "over_24_hours",
      explainabilityType: "black-box",
      humanIntervention: "autonomous",
      killSwitch: "none",
      auditTrailCompleteness: "none",
      documentedProcess: false,
      incidentHistory: "multiple",
    });
    expect(result.concerns.length).toBeLessThanOrEqual(4);
  });
});
