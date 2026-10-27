// Os ids são os da coluna `categories.grid` da API: a grade vem da categoria, e o produto a herda.
export type SizeGridId = 'num' | 'apparel' | 'one';

export type SizeGrid = {
  id: SizeGridId;
  label: string;
  examples: string;
  range: string;
};

export const SIZE_GRIDS: readonly SizeGrid[] = [
  { id: 'num', label: 'Numérica', examples: 'Calçados e calças', range: '34 – 46' },
  { id: 'apparel', label: 'Vestuário', examples: 'Camisetas e moletons', range: 'PP – XGG' },
  { id: 'one', label: 'Tamanho único', examples: 'Óculos e acessórios', range: 'U' },
];

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
