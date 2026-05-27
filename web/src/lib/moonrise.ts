/**
 * Approximate moonrise / moonset using a simplified algorithm.
 *
 * Computes the Moon's ecliptic longitude/latitude with low-order terms, then
 * converts to topocentric altitude over a 24-hour window and locates the
 * altitude zero crossings. Accurate to within ~10 minutes for most dates.
 */

const DEG = Math.PI / 180;

export interface MoonTimes {
  moonrise: Date | null;
  moonset: Date | null;
  /** True if the moon is up at the start of the day (UTC midnight). */
  alwaysUp: boolean;
  /** True if the moon never rises on this date. */
  alwaysDown: boolean;
}

/** Moon ecliptic position (low-precision, Meeus chapter 47 truncated). */
function moonEcliptic(jd: number): { lonDeg: number; latDeg: number; distKm: number } {
  const T = (jd - 2451545.0) / 36525;
  const Lp = (218.3164477 + 481267.88123421 * T) % 360;
  const D = (297.8501921 + 445267.1114034 * T) % 360;
  const M = (357.5291092 + 35999.0502909 * T) % 360;
  const Mp = (134.9633964 + 477198.8675055 * T) % 360;
  const F = (93.272095 + 483202.0175233 * T) % 360;

  const Dr = D * DEG;
  const Mr = M * DEG;
  const Mpr = Mp * DEG;
  const Fr = F * DEG;

  // Leading terms in longitude (deg).
  const lon =
    Lp +
    6.289 * Math.sin(Mpr) -
    1.274 * Math.sin(Mpr - 2 * Dr) +
    0.658 * Math.sin(2 * Dr) -
    0.186 * Math.sin(Mr) -
    0.059 * Math.sin(2 * Mpr - 2 * Dr) -
    0.057 * Math.sin(Mpr - 2 * Dr + Mr) +
    0.053 * Math.sin(Mpr + 2 * Dr) +
    0.046 * Math.sin(2 * Dr - Mr) +
    0.041 * Math.sin(Mpr - Mr) -
    0.035 * Math.sin(Dr);

  const lat =
    5.128 * Math.sin(Fr) +
    0.281 * Math.sin(Mpr + Fr) +
    0.278 * Math.sin(Mpr - Fr) +
    0.173 * Math.sin(2 * Dr - Fr);

  // Distance in km (mean 385000, varies).
  const dist =
    385000.56 -
    20905.355 * Math.cos(Mpr) -
    3699.111 * Math.cos(2 * Dr - Mpr) -
    2955.968 * Math.cos(2 * Dr);

  return { lonDeg: ((lon % 360) + 360) % 360, latDeg: lat, distKm: dist };
}

/** Mean obliquity of the ecliptic (deg). */
function obliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.439291 - 0.0130042 * T;
}

/** Convert ecliptic lon/lat to equatorial RA/Dec (radians). */
function eclipticToEquatorial(lonDeg: number, latDeg: number, eps: number): { ra: number; dec: number } {
  const l = lonDeg * DEG;
  const b = latDeg * DEG;
  const e = eps * DEG;
  const sinDec = Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l);
  const dec = Math.asin(sinDec);
  const y = Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e);
  const x = Math.cos(l);
  let ra = Math.atan2(y, x);
  if (ra < 0) ra += 2 * Math.PI;
  return { ra, dec };
}

/** Greenwich Mean Sidereal Time in radians for a given JD. */
function gmst(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  let gmstDeg =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    T * T * 0.000387933 -
    (T * T * T) / 38710000;
  gmstDeg = ((gmstDeg % 360) + 360) % 360;
  return gmstDeg * DEG;
}

/** Moon altitude (radians) at a given Date for an observer. */
function moonAltitude(date: Date, latRad: number, lonRad: number): number {
  const jd = date.getTime() / 86_400_000 + 2440587.5;
  const ecl = moonEcliptic(jd);
  const { ra, dec } = eclipticToEquatorial(ecl.lonDeg, ecl.latDeg, obliquity(jd));
  const lst = gmst(jd) + lonRad;
  const H = lst - ra;
  return Math.asin(
    Math.sin(latRad) * Math.sin(dec) + Math.cos(latRad) * Math.cos(dec) * Math.cos(H),
  );
}

/** Compute moonrise/moonset for the given UTC date and observer. */
export function moonTimes(date: Date, latitude: number, longitude: number): MoonTimes {
  const latRad = latitude * DEG;
  const lonRad = longitude * DEG;
  const base = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0,
  );

  // Sample altitude every 10 minutes through the day.
  const step = 10 * 60_000;
  const samples = 24 * 6 + 1;
  const alts: number[] = [];
  for (let i = 0; i < samples; i++) {
    alts.push(moonAltitude(new Date(base + i * step), latRad, lonRad));
  }

  let moonrise: Date | null = null;
  let moonset: Date | null = null;

  for (let i = 1; i < samples; i++) {
    const a0 = alts[i - 1];
    const a1 = alts[i];
    if (a0 === undefined || a1 === undefined) continue;
    // Use the standard refraction/parallax correction: -0.583° apparent radius + atmospheric refraction
    const h0 = -0.583 * DEG;
    if (a0 <= h0 && a1 > h0 && !moonrise) {
      const frac = (h0 - a0) / (a1 - a0);
      moonrise = new Date(base + (i - 1 + frac) * step);
    }
    if (a0 > h0 && a1 <= h0 && !moonset) {
      const frac = (a0 - h0) / (a0 - a1);
      moonset = new Date(base + (i - 1 + frac) * step);
    }
    if (moonrise && moonset) break;
  }

  const aboveAtStart = (alts[0] ?? 0) > -0.583 * DEG;
  const aboveAtEnd = (alts[alts.length - 1] ?? 0) > -0.583 * DEG;
  const everAbove = alts.some((a) => a > -0.583 * DEG);
  const everBelow = alts.some((a) => a <= -0.583 * DEG);

  return {
    moonrise,
    moonset,
    alwaysUp: !moonrise && !moonset && aboveAtStart && aboveAtEnd && !everBelow,
    alwaysDown: !moonrise && !moonset && !everAbove,
  };
}
