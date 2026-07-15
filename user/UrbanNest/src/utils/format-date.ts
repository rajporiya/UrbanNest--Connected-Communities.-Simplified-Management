export function formatDate(value: Date | string | number | null | undefined, locale = "en-IN") {
  if (value === null || value === undefined || value === "") return "—"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(date)
}
