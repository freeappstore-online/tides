/** Formatting helpers for times, dates, distances. */

export function formatTime(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatRelativeDays(d: Date, now: Date = new Date()): string {
  const ms = d.getTime() - now.getTime();
  const days = Math.round(ms / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} ago`;
  if (days < 30) return `in ${days} days`;
  const months = Math.round(days / 30);
  if (months < 12) return `in ~${months} month${months === 1 ? "" : "s"}`;
  return `in ~${Math.round(days / 365)} years`;
}

export function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function formatPercent(p: number): string {
  return `${Math.round(p * 100)}%`;
}

export function formatKm(km: number): string {
  return `${km.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
}
