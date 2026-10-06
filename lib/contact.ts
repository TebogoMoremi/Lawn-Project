export type ContactDraft = {
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
};
export type ContactErrors = Partial<Record<keyof ContactDraft, string>>;

export function validateContact(draft: ContactDraft): ContactErrors {
  const errors: ContactErrors = {};
  if (!draft.name.trim() || draft.name.trim().length > 100)
    errors.name = "Enter your name (up to 100 characters).";
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()) ||
    draft.email.length > 254
  )
    errors.email = "Enter a valid email address.";
  const phone = draft.mobile.trim();
  const digits = phone.replace(/\D/g, "");
  if (!/^\+?[\d\s()-]+$/.test(phone) || digits.length < 8 || digits.length > 15)
    errors.mobile =
      "Enter a mobile number with 8–15 digits; spaces and an optional leading + are allowed.";
  if (!draft.subject.trim() || draft.subject.trim().length > 120)
    errors.subject = "Enter a subject (up to 120 characters).";
  if (draft.message.trim().length < 10 || draft.message.trim().length > 2000)
    errors.message = "Enter a message between 10 and 2,000 characters.";
  return errors;
}
