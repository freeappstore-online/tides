/**
 * Moon phase calculations.
 *
 * Uses a precise astronomical algorithm based on the synodic month
 * (29.530588853 days) with a known reference new moon: 2000-01-06 18:14 UTC
 * (Julian Day 2451550.1).
 *
 * Phase categorization mirrors common almanac conventions.
 */

export type MoonPhaseName =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

export interface MoonPhase {
  /** 0..1 around the synodic month, where 0 = new, 0.5 = full. */
  fraction: number;
  /** Days since the most recent new moon (0..29.53). */
  ageDays: number;
  /** Illuminated portion of the disk, 0..1. */
  illumination: number;
  name: MoonPhaseName;
  /** True if the moon is currently waxing (growing). */
  waxing: boolean;
}

/** Length of a synodic month in days. */
export const SYNODIC_MONTH = 29.530588853;

/** Julian Day of a known new moon: 2000-01-06 18:14 UTC. */
const REFERENCE_NEW_MOON_JD = 2451550.1;

/** Convert a Date to Julian Day Number. */
export function toJulianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}

/** Convert Julian Day Number back to Date. */
export function fromJulianDay(jd: number): Date {
  return new Date((jd - 2440587.5) * 86_400_000);
}

export function moonPhase(date: Date = new Date()): MoonPhase {
  const jd = toJulianDay(date);
  const daysSinceRef = jd - REFERENCE_NEW_MOON_JD;
  // Modulo, keeping result non-negative.
  const ageDays = ((daysSinceRef % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const fraction = ageDays / SYNODIC_MONTH;

  // Illumination follows (1 - cos(phase angle)) / 2 where phase angle = 2π·fraction.
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const waxing = fraction < 0.5;

  return {
    fraction,
    ageDays,
    illumination,
    name: phaseName(fraction),
    waxing,
  };
}

export function phaseName(fraction: number): MoonPhaseName {
  // 8 equal phase windows centered on the cardinal phases.
  const f = ((fraction % 1) + 1) % 1;
  if (f < 0.0625 || f >= 0.9375) return "New Moon";
  if (f < 0.1875) return "Waxing Crescent";
  if (f < 0.3125) return "First Quarter";
  if (f < 0.4375) return "Waxing Gibbous";
  if (f < 0.5625) return "Full Moon";
  if (f < 0.6875) return "Waning Gibbous";
  if (f < 0.8125) return "Last Quarter";
  return "Waning Crescent";
}

/** Find the next time the moon reaches the target fraction (0=new, 0.5=full). */
export function nextPhase(from: Date, targetFraction: number): Date {
  const current = moonPhase(from);
  let delta = targetFraction - current.fraction;
  if (delta <= 0) delta += 1;
  const ms = delta * SYNODIC_MONTH * 86_400_000;
  return new Date(from.getTime() + ms);
}

export function nextNewMoon(from: Date = new Date()): Date {
  return nextPhase(from, 0);
}

export function nextFullMoon(from: Date = new Date()): Date {
  return nextPhase(from, 0.5);
}

/**
 * Approximate lunar distance in km using a simplified ELP-2000 first-order term.
 * Mean distance ~ 385,000 km, varies by ~±21,000 km over an anomalistic month
 * (27.55455 days). A supermoon roughly corresponds to a full moon within ~10%
 * of perigee (< ~362,000 km).
 */
export function lunarDistanceKm(date: Date): number {
  const jd = toJulianDay(date);
  // Mean anomaly of the Moon, simplified (degrees).
  const M = (134.9634114 + 13.0649929509 * (jd - 2451545.0)) % 360;
  const Mrad = (M * Math.PI) / 180;
  return 385000 - 21000 * Math.cos(Mrad);
}

/** Find next supermoon within `days` ahead. */
export function nextSupermoon(from: Date = new Date(), days = 400): Date | null {
  let best: { date: Date; dist: number } | null = null;
  // Walk forward, examining each full moon.
  let cursor = from;
  for (let i = 0; i < 14; i++) {
    const fm = nextFullMoon(cursor);
    if ((fm.getTime() - from.getTime()) / 86_400_000 > days) break;
    const d = lunarDistanceKm(fm);
    if (d < 362_000) {
      return fm;
    }
    if (!best || d < best.dist) best = { date: fm, dist: d };
    cursor = new Date(fm.getTime() + 86_400_000);
  }
  return best ? best.date : null;
}

/**
 * Find next blue moon (second full moon in a calendar month).
 * Scans up to ~3 years forward.
 */
export function nextBlueMoon(from: Date = new Date()): Date | null {
  let cursor = from;
  let prev: Date | null = null;
  for (let i = 0; i < 40; i++) {
    const fm = nextFullMoon(cursor);
    if (
      prev &&
      prev.getFullYear() === fm.getFullYear() &&
      prev.getMonth() === fm.getMonth()
    ) {
      return fm;
    }
    prev = fm;
    cursor = new Date(fm.getTime() + 86_400_000);
  }
  return null;
}
