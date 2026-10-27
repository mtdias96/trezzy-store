// O "hoje" do painel é o da loja, mesmo para quem acessa de outro fuso.
const STORE_TIME_ZONE = 'America/Sao_Paulo';

const storeHour = new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hourCycle: 'h23', timeZone: STORE_TIME_ZONE });

export function greetingFor(date: Date): string {
  const hour = Number(storeHour.format(date));

  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  }

  return hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite';
}

const shortDate = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: STORE_TIME_ZONE,
});

// "25 out 2026", sem o "de" e o ponto do formato padrão do pt-BR.
export function formatShortDate(date: Date): string {
  const parts = shortDate.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';

  return `${part('day')} ${part('month').replace('.', '')} ${part('year')}`;
}
