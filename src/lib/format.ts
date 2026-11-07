export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export const STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  COMPLETED: "bg-sky-100 text-sky-800 ring-sky-200",
  CANCELLED: "bg-stone-200 text-stone-600 ring-stone-300",
};
