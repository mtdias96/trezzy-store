import { integer } from 'drizzle-orm/pg-core';

// Dinheiro sempre em centavos inteiros (R$ 899,99 → 89999): float arredonda errado (0.1 + 0.2).
// `integer` vai até R$ 21 milhões por valor; somas em relatório saem como bigint no próprio SQL.
// O limite de cada coluna (> 0 no preço, >= 0 no frete) é regra da tabela: fica num `check()` dela.
export const moneyInCents = () => integer();
