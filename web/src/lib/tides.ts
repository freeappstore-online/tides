/**
 * Simulated tide pattern.
 *
 * Without a real tide-gauge API we model a semi-diurnal tide as a sum of two
 * sine waves locked to the lunar synodic month:
 *   - principal lunar (M2): 12.4206-hour period
 *   - principal solar (S2): 12.0000-hour period
 *
 * Amplitude is modulated by the phase of the moon to capture the
 * spring/neap cycle. This is suitable for visualisation only; the UI must
 * clearly disclaim that values are approximate and not for navigation.
 */

import { moonPhase } from "./moon";

/** Lunar semi-diurnal period in milliseconds. */
const M2_PERIOD_MS = 12.4206 * 3600_000;
/** Solar semi-diurnal period in milliseconds. */
const S2_PERIOD_MS = 12 * 3600_000;

/**
 * Synthetic tide height (in arbitrary meters relative to mean sea level) at
 * the given time. Range ~ -1.6 .. +1.6.
 */
export function tideHeight(at: Date, longitude: number): number {
  const t = at.getTime();
  // Geographic phase offset so different longitudes are not all in lockstep.
  const lonOffsetMs = (longitude / 360) * M2_PERIOD_MS;
  const phaseAmp = 0.6 + 0.6 * Math.abs(Math.cos(2 * Math.PI * moonPhase(at).fraction));
  const m2 = Math.sin((2 * Math.PI * (t + lonOffsetMs)) / M2_PERIOD_MS);
  const s2 = 0.4 * Math.sin((2 * Math.PI * (t + lonOffsetMs)) / S2_PERIOD_MS);
  return phaseAmp * (m2 + s2);
}

export interface TideEvent {
  type: "high" | "low";
  time: Date;
  height: number;
}

/** Find next high and low tide events from `from`, scanning `hours` ahead. */
export function upcomingTideEvents(
  from: Date,
  longitude: number,
  hours = 24,
): TideEvent[] {
  const step = 5 * 60_000; // 5 minutes
  const samples = Math.ceil((hours * 3600_000) / step);
  const events: TideEvent[] = [];
  let prev2 = tideHeight(new Date(from.getTime() - step), longitude);
  let prev1 = tideHeight(from, longitude);

  for (let i = 1; i <= samples; i++) {
    const t = new Date(from.getTime() + i * step);
    const curr = tideHeight(t, longitude);
    if (prev1 > prev2 && prev1 > curr) {
      events.push({ type: "high", time: new Date(t.getTime() - step), height: prev1 });
    } else if (prev1 < prev2 && prev1 < curr) {
      events.push({ type: "low", time: new Date(t.getTime() - step), height: prev1 });
    }
    prev2 = prev1;
    prev1 = curr;
  }
  return events;
}

/** Sample a tide curve for charting. */
export function tideCurve(
  from: Date,
  longitude: number,
  hours = 24,
  samples = 96,
): { time: Date; height: number }[] {
  const out: { time: Date; height: number }[] = [];
  const totalMs = hours * 3600_000;
  for (let i = 0; i < samples; i++) {
    const t = new Date(from.getTime() + (i / (samples - 1)) * totalMs);
    out.push({ time: t, height: tideHeight(t, longitude) });
  }
  return out;
}
