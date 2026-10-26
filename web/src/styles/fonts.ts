import { Archivo, JetBrains_Mono, Permanent_Marker } from 'next/font/google';

// As variáveis são lidas pelos tokens --font-* do globals.css.
// O eixo wdth permite o font-stretch: 125% do estilo display.
const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['wdth'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

const permanentMarker = Permanent_Marker({
  variable: '--font-permanent-marker',
  subsets: ['latin'],
  weight: '400',
});

// Vai no <html> do layout raiz e do global-error, que substitui o layout quando ele falha.
export const fontVariables = [archivo.variable, jetbrainsMono.variable, permanentMarker.variable].join(' ');
