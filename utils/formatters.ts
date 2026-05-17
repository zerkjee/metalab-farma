// Instâncias criadas uma única vez no módulo — reutilizadas em toda a app
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateShortFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function fmtCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function fmtDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function fmtDateShort(iso: string): string {
  return dateShortFormatter.format(new Date(iso));
}

export function fmtDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}
