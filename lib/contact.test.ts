import { describe, expect, it } from "vitest";
import { validateContact, type ContactDraft } from "./contact";

const valid: ContactDraft = {
  name: "Test Gardener",
  email: "test@example.com",
  mobile: "+27 82 123 4567",
  subject: "Garden cleanup",
  message: "A sample enquiry about garden cleanup.",
};
describe("contact draft validation", () => {
  it("accepts a complete draft and common phone formatting", () => {
    expect(validateContact(valid)).toEqual({});
    expect(validateContact({ ...valid, mobile: "082-123-4567" })).toEqual({});
  });
  it("rejects empty or whitespace-only required fields", () => {
    expect(
      Object.keys(
        validateContact({
          name: " ",
          email: " ",
          mobile: " ",
          subject: " ",
          message: " ",
        }),
      ),
    ).toHaveLength(5);
  });
  it.each(["test", "test@", "a b@example.com"])(
    "rejects invalid email %s",
    (email) => {
      expect(validateContact({ ...valid, email }).email).toBeDefined();
    },
  );
  it.each(["123", "1234567890123456", "call0821234567", "082+1234567"])(
    "rejects invalid mobile %s",
    (mobile) => {
      expect(validateContact({ ...valid, mobile }).mobile).toBeDefined();
    },
  );
  it("rejects oversized fields and too-short messages", () => {
    const errors = validateContact({
      ...valid,
      name: "x".repeat(101),
      subject: "x".repeat(121),
      message: "x".repeat(2001),
    });
    expect(Object.keys(errors)).toEqual(["name", "subject", "message"]);
    expect(
      validateContact({ ...valid, message: "short" }).message,
    ).toBeDefined();
  });
});
