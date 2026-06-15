import { describe, it, expect } from "vitest";
import { DEFAULT_ASSESSMENT_FORM } from "../schema";
import {
  isInsurancePurpose,
  isCustomerFacing,
  isRegulated,
  isFinancialRegulated,
  usesThirdPartyVendors,
  processesPersonalData,
} from "../conditionals";

const base = { ...DEFAULT_ASSESSMENT_FORM };

describe("isInsurancePurpose", () => {
  it("returns true for insurance-renewal", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: ["insurance-renewal"] })).toBe(true);
  });
  it("returns true for broker-review", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: ["broker-review"] })).toBe(true);
  });
  it("returns true for cyber-pi-review", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: ["cyber-pi-review"] })).toBe(true);
  });
  it("returns true when array contains an insurance purpose among others", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: ["internal-audit", "broker-review"] })).toBe(true);
  });
  it("returns false for internal-audit only", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: ["internal-audit"] })).toBe(false);
  });
  it("returns false when undefined", () => {
    expect(isInsurancePurpose({ ...base, assessmentPurpose: undefined })).toBe(false);
  });
});

describe("isCustomerFacing", () => {
  it("returns true for customer", () => {
    expect(isCustomerFacing({ ...base, deploymentType: "customer" })).toBe(true);
  });
  it("returns true for both", () => {
    expect(isCustomerFacing({ ...base, deploymentType: "both" })).toBe(true);
  });
  it("returns false for internal", () => {
    expect(isCustomerFacing({ ...base, deploymentType: "internal" })).toBe(false);
  });
});

describe("isRegulated", () => {
  it("returns true when regulatedEntity is true", () => {
    expect(isRegulated({ ...base, regulatedEntity: true })).toBe(true);
  });
  it("returns false when regulatedEntity is false", () => {
    expect(isRegulated({ ...base, regulatedEntity: false })).toBe(false);
  });
});

describe("isFinancialRegulated", () => {
  it("returns true for regulated financial services firm", () => {
    expect(isFinancialRegulated({ ...base, regulatedEntity: true, industry: "financial" })).toBe(true);
  });
  it("returns true for regulated insurance firm", () => {
    expect(isFinancialRegulated({ ...base, regulatedEntity: true, industry: "insurance" })).toBe(true);
  });
  it("returns false for regulated healthcare firm", () => {
    expect(isFinancialRegulated({ ...base, regulatedEntity: true, industry: "healthcare" })).toBe(false);
  });
  it("returns false for unregulated financial firm", () => {
    expect(isFinancialRegulated({ ...base, regulatedEntity: false, industry: "financial" })).toBe(false);
  });
});

describe("usesThirdPartyVendors", () => {
  it("returns true when thirdPartyVendors is non-empty string", () => {
    expect(usesThirdPartyVendors({ ...base, thirdPartyVendors: "OpenAI" })).toBe(true);
  });
  it("returns true when foundationModelSource is openai", () => {
    expect(usesThirdPartyVendors({ ...base, foundationModelSource: "openai" })).toBe(true);
  });
  it("returns true for third-party-api deploymentType", () => {
    expect(usesThirdPartyVendors({ ...base, deploymentType: "third-party-api" })).toBe(true);
  });
  it("returns false when proprietary and no vendor string", () => {
    expect(usesThirdPartyVendors({ ...base, foundationModelSource: "proprietary", thirdPartyVendors: "" })).toBe(false);
  });
  it("returns false with empty string vendor", () => {
    expect(usesThirdPartyVendors({ ...base, thirdPartyVendors: "   " })).toBe(false);
  });
});

describe("processesPersonalData", () => {
  it("returns true for basic sensitivity", () => {
    expect(processesPersonalData({ ...base, dataSensitivity: "basic" })).toBe(true);
  });
  it("returns true for sensitive data", () => {
    expect(processesPersonalData({ ...base, dataSensitivity: "sensitive" })).toBe(true);
  });
  it("returns true when thirdPartyData is true", () => {
    expect(processesPersonalData({ ...base, dataSensitivity: "none", thirdPartyData: true })).toBe(true);
  });
  it("returns false when none and no third-party data", () => {
    expect(processesPersonalData({ ...base, dataSensitivity: "none", thirdPartyData: false })).toBe(false);
  });
});
