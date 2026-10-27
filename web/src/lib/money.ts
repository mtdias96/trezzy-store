const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// A API manda dinheiro em centavos inteiros.
export function formatPrice(cents: number): string {
  return brl.format(cents / 100);
}
