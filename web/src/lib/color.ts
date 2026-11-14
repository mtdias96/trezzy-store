// Amostras que o design desenha. A API guarda a cor como texto livre, em minúsculas e sem espaços nas pontas
// ("cinza mescla"): a amostra vem da sugestão de mesmo nome, e cor fora da lista fica com a amostra neutra.
export type ColorSwatch = 'black' | 'white' | 'off-white' | 'heather-gray' | 'green';

export type ColorSuggestion = {
  label: string;
  swatch: ColorSwatch;
};

export const COLOR_SUGGESTIONS: readonly ColorSuggestion[] = [
  { label: 'Preto', swatch: 'black' },
  { label: 'Branco', swatch: 'white' },
  { label: 'Off-white', swatch: 'off-white' },
  { label: 'Cinza mescla', swatch: 'heather-gray' },
  { label: 'Verde', swatch: 'green' },
];

export function colorSuggestionOf(color: string): ColorSuggestion | undefined {
  return COLOR_SUGGESTIONS.find(({ label }) => label.toLowerCase() === color);
}

// O nome que o cliente lê: o da sugestão, ou a cor da API com a primeira letra maiúscula ("preto-verde" → "Preto-verde").
export function colorLabel(color: string): string {
  return colorSuggestionOf(color)?.label ?? `${color.charAt(0).toLocaleUpperCase('pt-BR')}${color.slice(1)}`;
}
