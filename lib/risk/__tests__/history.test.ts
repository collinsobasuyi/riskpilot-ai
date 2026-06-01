import { describe, it, expect } from "vitest";
import { buildUpdatedHistory } from "../schema";
import type { StoredSubmission } from "../schema";
import { DEFAULT_ASSESSMENT_FORM } from "../schema";

function makeEntry(id: string): StoredSubmission {
  return { id, submittedAt: new Date().toISOString(), data: DEFAULT_ASSESSMENT_FORM };
}

describe("buildUpdatedHistory", () => {
  it("prepends entry to empty array", () => {
    const result = buildUpdatedHistory([], makeEntry("a"));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a");
  });

  it("prepends entry to existing array, newest first", () => {
    const existing = [makeEntry("old")];
    const result = buildUpdatedHistory(existing, makeEntry("new"));
    expect(result[0].id).toBe("new");
    expect(result[1].id).toBe("old");
  });

  it("trims to maxLength", () => {
    const existing = Array.from({ length: 10 }, (_, i) => makeEntry(`e${i}`));
    const result = buildUpdatedHistory(existing, makeEntry("newest"), 10);
    expect(result).toHaveLength(10);
    expect(result[0].id).toBe("newest");
  });

  it("default maxLength is 10", () => {
    const existing = Array.from({ length: 10 }, (_, i) => makeEntry(`e${i}`));
    const result = buildUpdatedHistory(existing, makeEntry("newest"));
    expect(result).toHaveLength(10);
  });
});
