import { describe, it, expect } from "vitest";
import { DEMO_SUBMISSION } from "../demo-data";
import { computeResults } from "../scoring";

describe("DEMO_SUBMISSION", () => {
  it("has required string fields populated", () => {
    expect(DEMO_SUBMISSION.data.companyName).toBe("Acme Financial Ltd");
    expect(DEMO_SUBMISSION.data.systemName).toBe("Credit Scoring Engine v2");
    expect(DEMO_SUBMISSION.id).toBe("demo");
  });

  it("produces a valid result without throwing", () => {
    const results = computeResults(DEMO_SUBMISSION.data);
    expect(results.riskScore).toBeGreaterThan(0);
    expect(results.riskScore).toBeLessThanOrEqual(100);
    expect(["High", "Medium", "Low"]).toContain(results.riskLevel);
  });

  it("produces at least one recommendation", () => {
    const results = computeResults(DEMO_SUBMISSION.data);
    const total =
      results.recommendations.critical.length +
      results.recommendations.high.length +
      results.recommendations.medium.length;
    expect(total).toBeGreaterThan(0);
  });
});
