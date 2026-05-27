/**
 * NOAA-style solar position calculations.
 *
 * Computes sunrise, sunset, solar noon, and day length for a given
 * date and latitude/longitude. Accurate to within ~1 minute for most
 * locations between 66.5°S and 66.5°N. Above the polar circles
 * sunrise/sunset may not exist on a given date (returns null).
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export interface SunTimes {
  /** Sunrise UTC, or null if sun never rises on this date. */
  sunrise: Date | null;
  /** Sunset UTC, or null if sun never sets on this date. */
  sunset: Date | null;
  /** Solar noon (UTC). */
  solarNoon: Date;
  /** Day length in minutes. 0 if polar night, 1440 if polar day. */
  dayLengthMinutes: number;
}

/** Days from J2000.0 (noon UT, 1 Jan 2000) for the given date. */
function daysFromJ2000(date: Date): number {
  return date.getTime() / 86_400_000 - 10957.5;
}

/** Compute fractional Julian century from J2000. */
function julianCentury(date: Date): number {
  return daysFromJ2000(date) / 36525;
}

/**
 * Solar declination in degrees (NOAA simplified formula).
 */
export function solarDeclination(date: Date): number {
  const T = julianCentury(date);
  // Geometric mean longitude of the Sun (deg)
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  // Mean anomaly of the Sun (deg)
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const Mrad = M * DEG;
  // Equation of center
  const C =
    Math.sin(Mrad) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * Mrad) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * Mrad) * 0.000289;
  // True longitude
  const trueLong = L0 + C;
  // Apparent longitude (corrected for nutation/aberration)
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG);
  // Mean obliquity of the ecliptic
  const epsilon0 =
    23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const epsilon = epsilon0 + 0.00256 * Math.cos(omega * DEG);
  // Declination
  return Math.asin(Math.sin(epsilon * DEG) * Math.sin(lambda * DEG)) * RAD;
}

/** Equation of time in minutes. */
export function equationOfTime(date: Date): number {
  const T = julianCentury(date);
  const epsilon =
    23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const y = Math.tan((epsilon / 2) * DEG) ** 2;
  const sin2L0 = Math.sin(2 * L0 * DEG);
  const sinM = Math.sin(M * DEG);
  const cos2L0 = Math.cos(2 * L0 * DEG);
  const sin4L0 = Math.sin(4 * L0 * DEG);
  const sin2M = Math.sin(2 * M * DEG);
  const eot =
    y * sin2L0 -
    2 * e * sinM +
    4 * e * y * sinM * cos2L0 -
    0.5 * y * y * sin4L0 -
    1.25 * e * e * sin2M;
  return eot * 4 * RAD; // minutes
}

/** Compute sunrise/sunset for the given UTC date and location. */
export function sunTimes(date: Date, latitude: number, longitude: number): SunTimes {
  // Start at local solar noon-ish: midnight UTC of the date plus 12h - lon offset.
  const dayStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0),
  );
  const decl = solarDeclination(dayStart);
  const eot = equationOfTime(dayStart);

  const latRad = latitude * DEG;
  const declRad = decl * DEG;

  // Hour angle for sunrise/sunset using -0.833° solar elevation (refraction + disk).
  const cosH =
    (Math.sin(-0.833 * DEG) - Math.sin(latRad) * Math.sin(declRad)) /
    (Math.cos(latRad) * Math.cos(declRad));

  const solarNoonMinutesUTC = 720 - 4 * longitude - eot;
  const solarNoon = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0) +
      solarNoonMinutesUTC * 60_000,
  );

  if (cosH > 1) {
    // Sun never rises (polar night).
    return { sunrise: null, sunset: null, solarNoon, dayLengthMinutes: 0 };
  }
  if (cosH < -1) {
    // Sun never sets (polar day).
    return { sunrise: null, sunset: null, solarNoon, dayLengthMinutes: 1440 };
  }

  const Hdeg = Math.acos(cosH) * RAD;
  const sunriseMinUTC = solarNoonMinutesUTC - Hdeg * 4;
  const sunsetMinUTC = solarNoonMinutesUTC + Hdeg * 4;

  const base = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0,
  );
  return {
    sunrise: new Date(base + sunriseMinUTC * 60_000),
    sunset: new Date(base + sunsetMinUTC * 60_000),
    solarNoon,
    dayLengthMinutes: Hdeg * 8,
  };
}

/** Day length in hours for each day of the given year. */
export function dayLengthForYear(year: number, latitude: number, longitude: number): number[] {
  const result: number[] = [];
  const daysInYear = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
  for (let i = 0; i < daysInYear; i++) {
    const d = new Date(Date.UTC(year, 0, 1 + i, 12, 0, 0));
    const t = sunTimes(d, latitude, longitude);
    result.push(t.dayLengthMinutes / 60);
  }
  return result;
}
