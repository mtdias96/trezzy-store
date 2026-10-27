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

const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', timeZone: STORE_TIME_ZONE });

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

// Quando algo mudou: "agora", "há 5 min" e "há 11 h" no último dia; depois, "24 out".
export function formatRelativeDate(date: Date, now: Date): string {
  const elapsed = now.getTime() - date.getTime();

  if (elapsed < MINUTE) {
    return 'agora';
  }

  if (elapsed < HOUR) {
    return `há ${Math.floor(elapsed / MINUTE)} min`;
  }

  if (elapsed < 24 * HOUR) {
    return `há ${Math.floor(elapsed / HOUR)} h`;
  }

  return dayMonth.format(date).replace(' de ', ' ').replace('.', '');
}
