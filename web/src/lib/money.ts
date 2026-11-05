const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const amount = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const wholeAmount = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

// R$ 9.999.999,99: cabe no `integer` da API (até R$ 21 milhões) e no campo sem quebrar a linha.
export const MAX_PRICE_DIGITS = 9;

// A API manda dinheiro em centavos inteiros.
export function formatPrice(cents: number): string {
  return brl.format(cents / 100);
}

export function formatAmount(cents: number): string {
  return amount.format(cents / 100);
}

// Valor redondo, sem centavos e sem o "R$" (faixas de preço: "R$ 700 – 1.200").
export function formatWholeAmount(cents: number): string {
  return wholeAmount.format(Math.trunc(cents / 100));
}

// Como no caixa: cada dígito entra pela direita e empurra a vírgula ("123" → 1,23). null: passou do limite de dígitos.
export function parsePriceInput(text: string): number | null {
  const digits = text.replace(/\D/g, '').replace(/^0+/, '');

  if (digits.length > MAX_PRICE_DIGITS) {
    return null;
  }

  return Number(digits);
}

export function discountPercent(fromCents: number, toCents: number): number {
  if (fromCents <= 0 || toCents >= fromCents) {
    return 0;
  }

  return Math.round(((fromCents - toCents) / fromCents) * 100);
}
