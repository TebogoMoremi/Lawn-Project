import type { QuoteDraft } from "./validation";
export const testService = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  name: "Grass cutting",
  shortDescription: "A tidy lawn.",
};
export const validDraft: QuoteDraft = {
  firstName: "Tebogo",
  lastName: "Example",
  email: "customer@example.test",
  phone: "082 123 4567",
  addressLine1: "12 Test Street",
  addressLine2: "",
  suburb: "Test suburb",
  city: "Benoni",
  province: "Gauteng",
  postalCode: "1501",
  serviceIds: [testService.id],
  propertyType: "RESIDENTIAL",
  lawnSizeCategory: "SMALL",
  lawnCondition: "MAINTAINED",
  frequency: "UNKNOWN",
  notes: "Please use the side gate.",
  consent: true,
};
