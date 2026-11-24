import { describe, expect, it } from "vitest";

import {
  DEFAULT_CASE_DESK_LANGUAGE,
  translateCaseDeskCopy,
} from "@/lib/case-desk-language";

describe("Case Desk language", () => {
  it("uses Bangla as the default language", () => {
    expect(DEFAULT_CASE_DESK_LANGUAGE).toBe("bn");
  });

  it("translates dashboard labels in Bangla and keeps English available", () => {
    expect(translateCaseDeskCopy("bn", "Patient cases")).toBe("রোগীর কেস");
    expect(translateCaseDeskCopy("en", "Patient cases")).toBe("Patient cases");
  });
});