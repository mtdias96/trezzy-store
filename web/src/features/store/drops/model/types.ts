export type Drop = {
  number: number;
  title: string;
  description: string;
  // ISO 8601 com fuso, como vem da API.
  startsAt: string;
  imageUrl: string;
  imageAlt: string;
  // Selo sobre a foto ("Só 400 pares!").
  sticker: string | null;
  // "Drop 07 · Sex 19h", no menu e na fita.
  shortLabel: string;
  // "Drop 07 — Sexta, 19h", no hero.
  longLabel: string;
};
