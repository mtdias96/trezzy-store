const SLUG_MAX_LENGTH = 80;

// Mesmo formato do `slugFormatCheck` do banco.
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, '');
}

export function nextAvailableSlug(base: string, taken: readonly string[]): string {
  const used = new Set(taken);

  if (!used.has(base)) {
    return base;
  }

  let suffix = 2;

  while (used.has(`${base}-${suffix}`)) {
    suffix++;
  }

  return `${base}-${suffix}`;
}
