import { describe, expect, it } from "vitest";
import { quoteSchema } from "./validation";
import { validDraft } from "./test-data";
import {
  formatQuoteReference,
  referenceYear,
  quoteWhatsAppMessage,
} from "./helpers";
import { photoSelectionError } from "./photo-rules";

describe("quote validation", () => {
  it("trims contact details and normalizes email and local phone", () => {
    const request = quoteSchema.parse({
      ...validDraft,
      firstName: " Tebogo ",
      email: " CUSTOMER@EXAMPLE.TEST ",
    });
    expect(request.firstName).toBe("Tebogo");
    expect(request.email).toBe("customer@example.test");
    expect(request.phone).toBe("+27821234567");
  });
  it.each([
    { firstName: " " },
    { lastName: "" },
    { email: "no-email" },
    { phone: "abc" },
    { phone: "+0123456789" },
    { serviceIds: [] },
    { serviceIds: ["fake"] },
    { serviceIds: [...validDraft.serviceIds, ...validDraft.serviceIds] },
    { propertyType: "CASTLE" },
    { lawnCondition: "PERFECT" },
    { lawnSizeCategory: "123sqm" },
    { frequency: "DAILY" },
    { postalCode: "12345" },
    { notes: "x".repeat(2001) },
    { consent: false },
    { finalPrice: 1 },
    { status: "BOOKED" },
  ])("rejects invalid/mass-assigned input %j", (invalid) => {
    expect(quoteSchema.safeParse({ ...validDraft, ...invalid }).success).toBe(
      false,
    );
  });
  it("allows unknown property estimates, optional empty notes and any city", () => {
    expect(
      quoteSchema.safeParse({
        ...validDraft,
        lawnSizeCategory: "UNKNOWN",
        city: "Other city",
        notes: "",
      }).success,
    ).toBe(true);
  });
});
describe("references and handoff", () => {
  it("pads references without truncating large counters", () => {
    expect(formatQuoteReference(2026, BigInt(1))).toBe("LF-2026-000001");
    expect(formatQuoteReference(2026, BigInt(1000000))).toBe("LF-2026-1000000");
    expect(() => formatQuoteReference(2026, BigInt(0))).toThrow();
  });
  it("uses the South African year at midnight", () => {
    expect(referenceYear(new Date("2026-12-31T22:01:00Z"))).toBe(2027);
  });
  it("only includes reference and service names in handoff", () => {
    const message = quoteWhatsAppMessage("LF-2026-000001", ["Grass cutting"]);
    expect(message).toContain("LF-2026-000001");
    expect(message).toContain("Grass cutting");
    expect(message).not.toContain(validDraft.addressLine1);
    expect(message).not.toContain(validDraft.email);
  });
});
describe("photo selection", () => {
  const limits = { maxFiles: 2, maxFileBytes: 1048576 };
  const photo = { name: "garden.JPG", type: "image/jpeg", size: 100 };
  it("allows optional photos and matching formats", () => {
    expect(photoSelectionError([], limits)).toBeNull();
    expect(photoSelectionError([photo], limits)).toBeNull();
  });
  it.each(
    [
      [{ ...photo, size: 0 }],
      [{ ...photo, size: 1048577 }],
      [{ ...photo, name: "evil.svg" }],
      [{ ...photo, type: "text/html" }],
      [photo, photo, photo],
    ].map((files) => ({ files })),
  )("rejects unsafe metadata $files", ({ files }) => {
    expect(photoSelectionError(files, limits)).not.toBeNull();
  });
});
