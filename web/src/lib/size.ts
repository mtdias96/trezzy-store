// A API guarda o tamanho único como "U", o id da grade `one`. As outras grades (34–46 e PP–XGG) já são o que o cliente lê.
export function sizeLabel(size: string): string {
  return size === 'U' ? 'Único' : size;
}
