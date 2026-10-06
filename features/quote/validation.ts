import { z } from "zod";

export const propertyTypes = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  SHARED_PROPERTY: "Shared property",
  OTHER: "Other",
} as const;
export const lawnSizes = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
  UNKNOWN: "Not sure",
} as const;
export const lawnConditions = {
  MAINTAINED: "Maintained",
  OVERGROWN: "Overgrown",
  HEAVILY_OVERGROWN: "Very overgrown",
  UNKNOWN: "Not sure",
} as const;
export const frequencies = {
  ONCE_OFF: "Once off",
  WEEKLY: "Weekly",
  FORTNIGHTLY: "Every two weeks",
  MONTHLY: "Monthly",
  UNKNOWN: "Not sure",
} as const;
const requiredText = (name: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${name}.`)
    .max(max, `Use at most ${max} characters.`)
    .refine(
      (value) => !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value),
      "Remove unsupported control characters.",
    );

export function normalizePhone(value: string) {
  const compact = value.trim().replace(/[\s()-]/g, "");
  if (/^0\d{9}$/.test(compact)) return `+27${compact.slice(1)}`;
  if (/^27\d{9}$/.test(compact)) return `+${compact}`;
  return compact;
}
export const contactSchema = z.strictObject({
  firstName: requiredText("your first name", 100),
  lastName: requiredText("your last name", 100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .pipe(z.email("Enter a valid email address.")),
  phone: z
    .string()
    .max(30)
    .transform(normalizePhone)
    .pipe(
      z
        .string()
        .regex(
          /^\+[1-9]\d{7,14}$/,
          "Use a South African mobile number or + followed by an international number.",
        ),
    ),
});
export const locationSchema = z.strictObject({
  addressLine1: requiredText("address line 1", 200),
  addressLine2: z.string().trim().max(200),
  suburb: requiredText("your suburb", 100),
  city: requiredText("your city", 100),
  province: requiredText("your province", 100),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Enter a four-digit South African postal code."),
});
export const servicesSchema = z.strictObject({
  serviceIds: z
    .array(z.uuid())
    .min(1, "Select at least one service.")
    .max(8)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Select each service only once.",
    ),
});
function enumKeys<T extends string>(values: Record<T, string>): [T, ...T[]] {
  return Object.keys(values) as [T, ...T[]];
}
export const propertySchema = z.strictObject({
  propertyType: z.enum(enumKeys(propertyTypes)),
  lawnSizeCategory: z.enum(enumKeys(lawnSizes)),
  lawnCondition: z.enum(enumKeys(lawnConditions)),
  frequency: z.enum(enumKeys(frequencies)),
});
export const notesSchema = z.strictObject({
  notes: z.string().trim().max(2000, "Use at most 2,000 characters."),
});
export const quoteSchema = z.strictObject({
  ...contactSchema.shape,
  ...locationSchema.shape,
  ...servicesSchema.shape,
  ...propertySchema.shape,
  ...notesSchema.shape,
  consent: z.literal(
    true,
    "Please acknowledge how your request details will be used.",
  ),
});
export const submissionSchema = z.strictObject({
  request: quoteSchema,
  token: z.string().regex(/^[a-f0-9]{64}$/),
});
export type QuoteDraft = Omit<z.input<typeof quoteSchema>, "consent"> & {
  consent: boolean;
};
export type QuoteRequest = z.output<typeof quoteSchema>;
export type QuoteServiceOption = {
  id: string;
  name: string;
  shortDescription: string;
};
export const privacyVersion = "quote-request-v1";
export const privacyNotice =
  "I understand LawnFlow will store my contact details, service address, notes and any photos to review this request and contact me about it. I will not upload sensitive documents or photos of people. This is not marketing consent.";
export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
