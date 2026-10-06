export function parseContactNumber(value: string | undefined): string | null {
  const number = value?.trim();
  if (!number) return null;
  if (!/^[1-9]\d{7,14}$/.test(number)) {
    throw new Error(
      "NEXT_PUBLIC_WHATSAPP_NUMBER must contain 8–15 international digits without spaces or +.",
    );
  }
  return number;
}

export function getWhatsAppUrl(number: string | null): string | null {
  if (!number) return null;
  const validated = parseContactNumber(number);
  return `https://wa.me/${validated}?text=${encodeURIComponent("Hi LawnFlow, I'd like to enquire about lawn care.")}`;
}

export const siteConfig = {
  name: "LawnFlow",
  description:
    "Professional lawn care, without the hassle. Grass cutting, garden maintenance and lawn care, with a personal touch.",
  whatsappNumber: parseContactNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
};
