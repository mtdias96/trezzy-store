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

const weekdayHour = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  hour: 'numeric',
  hourCycle: 'h23',
  timeZone: STORE_TIME_ZONE,
});

export function formatWeekdayHour(date: Date): string {
  const parts = weekdayHour.formatToParts(date);
  const weekday = parts.find((part) => part.type === 'weekday')?.value.replace('.', '') ?? '';
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '';

  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${hour}h`;
}

const longWeekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: STORE_TIME_ZONE });

// Sem o "-feira" do pt-BR: "Sexta, 19h".
export function formatLongWeekdayHour(date: Date): string {
  const weekday = longWeekday.format(date).replace('-feira', '');
  const hour = Number(storeHour.format(date));

  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${hour}h`;
}

const DAY = 24 * HOUR;

function plural(count: number, one: string, many: string): string {
  return `há ${count} ${count === 1 ? one : many}`;
}

export function formatTimeAgo(date: Date, now: Date): string {
  const days = Math.floor((now.getTime() - date.getTime()) / DAY);

  if (days < 1) {
    return 'hoje';
  }

  if (days === 1) {
    return 'ontem';
  }

  if (days < 7) {
    return plural(days, 'dia', 'dias');
  }

  if (days < 30) {
    return plural(Math.floor(days / 7), 'semana', 'semanas');
  }

  if (days < 365) {
    return plural(Math.floor(days / 30), 'mês', 'meses');
  }

  return plural(Math.floor(days / 365), 'ano', 'anos');
}
