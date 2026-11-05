export const CEP_PATTERN = /^\d{5}-?\d{3}$/;

export function formatCep(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);

  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}
