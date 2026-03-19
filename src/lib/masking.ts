/**
 * Masks an email address for display purposes.
 * Example: "yashneelbapna@gmail.com" → "y***********a@gmail.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "••••@••••";
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0]}${"•".repeat(Math.max(local.length - 1, 1))}@${domain}`;
  }
  return `${local[0]}${"•".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

/**
 * Masks a phone number for display purposes.
 * Example: "+919876543210" → "+91•••••••210"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || phone.length < 4) return "••••••••••";
  return `${phone.slice(0, 3)}${"•".repeat(phone.length - 6)}${phone.slice(-3)}`;
}
