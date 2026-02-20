import {
  focusRing,
  focusRingDestructive,
  skipLinkStyles,
  generateA11yId,
  getErrorId,
  getHelperId,
  getSuccessId,
} from "@/lib/a11y";

describe("a11y utilities", () => {
  describe("focusRing", () => {
    it("should have correct focus ring classes", () => {
      expect(focusRing).toContain("focus-visible:ring-2");
      expect(focusRing).toContain("focus-visible:ring-ring");
    });
  });

  describe("focusRingDestructive", () => {
    it("should have destructive focus ring classes", () => {
      expect(focusRingDestructive).toContain("focus-visible:ring-destructive");
    });
  });

  describe("skipLinkStyles", () => {
    it("should have skip link classes", () => {
      expect(skipLinkStyles).toContain("sr-only");
      expect(skipLinkStyles).toContain("focus:not-sr-only");
    });
  });

  describe("generateA11yId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateA11yId("test");
      const id2 = generateA11yId("test");
      expect(id1).not.toBe(id2);
      expect(id1).toContain("test");
    });
  });

  describe("getErrorId", () => {
    it("should return error ID for input", () => {
      expect(getErrorId("email")).toBe("email-error");
      expect(getErrorId("name-input")).toBe("name-input-error");
    });
  });

  describe("getHelperId", () => {
    it("should return helper ID for input", () => {
      expect(getHelperId("email")).toBe("email-helper");
    });
  });

  describe("getSuccessId", () => {
    it("should return success ID for input", () => {
      expect(getSuccessId("email")).toBe("email-success");
    });
  });
});
