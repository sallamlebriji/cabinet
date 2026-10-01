import type { AxiosError } from "axios";

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

export const money = (value: number | undefined | null) => `${number.format(value ?? 0)} MAD`;

export const fullName = (person?: { firstName?: string; lastName?: string } | null) => (person ? `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() : "—") || "—";

export function initials(label: string) {
  return (
    label
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export const fmtDate = (value: string | Date) => new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
export const fmtTime = (value: string | Date) => new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
export const fmtDateTime = (value: string | Date) => `${fmtDate(value)} · ${fmtTime(value)}`;

const pad = (value: number) => String(value).padStart(2, "0");
export const toDateInput = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const toTimeInput = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function apiError(error: unknown, fallback = "Une erreur est survenue. Réessayez.") {
  const response = (error as AxiosError<{ message?: string; errors?: { path?: string }[] }>).response;
  if (!response) return "Serveur injoignable.";
  if (response.data?.message) return response.data.message;
  if (response.data?.errors?.length) return `Champs invalides : ${response.data.errors.map((item) => item.path).join(", ")}`;
  return fallback;
}
