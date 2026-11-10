function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

// Busca de quem digita rápido: ignora acento e caixa, e cada palavra pode estar em qualquer ponto do texto.
export function matchesSearch(text: string, query: string): boolean {
  const haystack = normalize(text);

  return normalize(query).split(/\s+/).filter(Boolean).every((term) => haystack.includes(term));
}

export function words(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

export function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}
