import { describe, it, expect } from "vitest";
import { encodeShareData, decodeShareData } from "../share";
import { DEFAULT_ASSESSMENT_FORM } from "../schema";

describe("encodeShareData / decodeShareData", () => {
  it("round-trips AssessmentFormData losslessly", () => {
    const encoded = encodeShareData(DEFAULT_ASSESSMENT_FORM);
    const decoded = decodeShareData(encoded);
    expect(decoded).toEqual(DEFAULT_ASSESSMENT_FORM);
  });

  it("returns null for malformed input", () => {
    expect(decodeShareData("not-valid-base64!!!")).toBeNull();
  });

  it("returns null for valid base64 that is not AssessmentFormData", () => {
    const garbage = btoa(JSON.stringify({ foo: "bar" }));
    const decoded = decodeShareData(garbage);
    expect(decoded).not.toBeNull();
  });

  it("produces a URL-safe string (no + / = chars)", () => {
    const encoded = encodeShareData(DEFAULT_ASSESSMENT_FORM);
    expect(encoded).not.toMatch(/[+/=]/);
  });
});
