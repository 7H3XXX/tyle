const decimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const dateTime = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export const formatNumber = (value: number) => decimal.format(value);
export const formatPercent = (value: number) => `${Math.round(value)} %`;
export const formatDate = (iso: string) => dateTime.format(new Date(iso));
