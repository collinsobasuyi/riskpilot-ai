import { describe, it, expect } from "vitest";
import { computeResults } from "../scoring";
import { DEFAULT_ASSESSMENT_FORM } from "../schema";

const base = { ...DEFAULT_ASSESSMENT_FORM };

describe("computeResults", () => {
  it("riskScore is always in range [0, 100]", () => {
    const result = computeResults(base);
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it("full decision authority produces 'Fully automated' risk driver", () => {
    const result = computeResults({ ...base, decisionAuthority: "full" });
    expect(result.riskDrivers.some((d) => d.includes("Fully automated"))).toBe(true);
  });

  it("sensitive data produces relevant risk driver", () => {
    const result = computeResults({ ...base, dataSensitivity: "sensitive" });
    expect(result.riskDrivers.some((d) => d.includes("Sensitive data"))).toBe(true);
  });

  it("no documented process produces governance risk driver", () => {
    const result = computeResults({ ...base, documentedProcess: false });
    expect(result.riskDrivers.some((d) => d.includes("governance"))).toBe(true);
  });

  it("riskLevel is High when riskScore >= 70", () => {
    const result = computeResults({
      ...base,
      decisionAuthority: "full",
      financialImpactTier: "harm",
      dataSensitivity: "sensitive",
      deploymentType: "customer",
      documentedProcess: false,
      existingOversight: "none",
      incidentHistory: "multiple",
      biasTesting: ["No testing conducted"],
      monitoring: ["None"],
      modelDocs: ["None"],
      auditTrailCompleteness: "none",
      killSwitch: "none",
      aiCoverageCheck: "no-coverage",
      consumerRedress: "none",
      consumerExplainability: "none",
      vulnerableCustomerHandling: "none",
      regulatedEntity: true,
      independentValidation: "none",
      smfAccountability: false,
      formalAiPolicy: "no",
      incidentResponsePlan: false,
    });
    expect(result.riskLevel).toBe("High");
  });

  it("riskDrivers has at most 10 entries", () => {
    const result = computeResults({
      ...base,
      decisionAuthority: "full",
      financialImpactTier: "harm",
      dataSensitivity: "sensitive",
      deploymentType: "customer",
      documentedProcess: false,
      existingOversight: "none",
      incidentHistory: "multiple",
      biasTesting: ["No testing conducted"],
      monitoring: ["None"],
      modelDocs: ["None"],
    });
    expect(result.riskDrivers.length).toBeLessThanOrEqual(10);
  });

  it("riskLevel is Low when all signals are favourable", () => {
    const result = computeResults({
      ...base,
      decisionAuthority: "none",
      financialImpactTier: "under_100k",
      dataSensitivity: "none",
      deploymentType: "internal",
      documentedProcess: true,
      existingOversight: "continuous",
      hasDpo: true,
      incidentHistory: "none",
      biasTesting: ["Automated bias metrics"],
      monitoring: ["Performance monitoring", "Drift detection"],
      modelDocs: ["Model card", "Architecture doc", "Training data sheet"],
      auditTrailCompleteness: "decision-logic",
      killSwitch: "automated",
      aiCoverageCheck: "covered",
      formalAiPolicy: "yes",
      incidentResponsePlan: true,
    });
    expect(result.riskLevel).toBe("Low");
  });

  it("complianceGaps only includes frameworks with missing items", () => {
    const result = computeResults(base);
    result.complianceGaps.forEach((gap) => {
      expect(gap.missing.length).toBeGreaterThan(0);
    });
  });

  it("recommendations.critical is empty when no critical signals are present", () => {
    const result = computeResults({
      ...base,
      decisionAuthority: "none",
      financialImpactTier: "under_100k",
      dataSensitivity: "none",
      documentedProcess: true,
      biasTesting: ["Automated bias metrics"],
      killSwitch: "automated",
      aiCoverageCheck: "covered",
      consumerRedress: "formal",
      regulatedEntity: false,
    });
    expect(result.recommendations.critical).toHaveLength(0);
  });
});
