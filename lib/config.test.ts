import { describe, expect, it } from "vitest";
import { getWhatsAppUrl, parseContactNumber } from "./config";

describe("business contact configuration", () => {
  it("keeps an unconfigured integration unavailable", () => {
    expect(parseContactNumber(undefined)).toBeNull();
    expect(parseContactNumber("  ")).toBeNull();
    expect(getWhatsAppUrl(null)).toBeNull();
  });
  it.each([
    "+27123456789",
    "123",
    "javascript:alert(1)",
    "0123456789",
    "2712 3456789",
  ])("rejects invalid contact %s", (value) => {
    expect(() => parseContactNumber(value)).toThrow();
    expect(() => getWhatsAppUrl(value)).toThrow();
  });
  it("builds an encoded enquiry without customer data", () => {
    const url = new URL(getWhatsAppUrl("27123456789")!);
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/27123456789");
    expect(url.searchParams.get("text")).toBe(
      "Hi LawnFlow, I'd like to enquire about lawn care.",
    );
  });
});
