export function formatPhone(value: string | null | undefined): string {
  if (!value) return "";

  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    // (11) 99999-9999
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    // (11) 9999-9999
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}
