export function fmtMoney(n: number | string | null | undefined, currency: "UZS" | "USD" = "UZS") {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  if (!isFinite(v)) return "0";
  const formatted = new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(v);
  return currency === "USD" ? `$${formatted}` : `${formatted} so'm`;
}

export function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function fmtDateTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(date);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
