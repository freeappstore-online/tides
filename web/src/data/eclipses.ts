/**
 * Static table of upcoming lunar and solar eclipses (2025-2030).
 *
 * Source: NASA Eclipse Web Site (https://eclipse.gsfc.nasa.gov/). Dates are
 * given at greatest eclipse, UTC. Visibility shows the broad regional
 * footprint of the central path or maximum-magnitude band.
 */

export type EclipseKind = "lunar" | "solar";
export type EclipseSubtype =
  | "total"
  | "partial"
  | "annular"
  | "hybrid"
  | "penumbral";

export interface EclipseEvent {
  date: string; // ISO date
  kind: EclipseKind;
  subtype: EclipseSubtype;
  visibility: string;
}

export const ECLIPSES: EclipseEvent[] = [
  {
    date: "2025-03-14",
    kind: "lunar",
    subtype: "total",
    visibility: "Americas, western Europe & Africa, Pacific",
  },
  {
    date: "2025-03-29",
    kind: "solar",
    subtype: "partial",
    visibility: "Northern Europe, NE North America, NW Africa",
  },
  {
    date: "2025-09-07",
    kind: "lunar",
    subtype: "total",
    visibility: "Asia, Australia, Africa, Europe",
  },
  {
    date: "2025-09-21",
    kind: "solar",
    subtype: "partial",
    visibility: "Antarctica, southern Pacific, New Zealand",
  },
  {
    date: "2026-02-17",
    kind: "solar",
    subtype: "annular",
    visibility: "Antarctica (annular), South Africa & Indian Ocean (partial)",
  },
  {
    date: "2026-03-03",
    kind: "lunar",
    subtype: "total",
    visibility: "Pacific, Americas, eastern Asia & Australia",
  },
  {
    date: "2026-08-12",
    kind: "solar",
    subtype: "total",
    visibility: "Greenland, Iceland, Spain (total path); Europe & N. Africa (partial)",
  },
  {
    date: "2026-08-28",
    kind: "lunar",
    subtype: "partial",
    visibility: "Americas, Europe, Africa",
  },
  {
    date: "2027-02-06",
    kind: "solar",
    subtype: "annular",
    visibility: "South Atlantic, South America (annular path)",
  },
  {
    date: "2027-07-18",
    kind: "lunar",
    subtype: "penumbral",
    visibility: "Asia, Australia, western Americas",
  },
  {
    date: "2027-08-02",
    kind: "solar",
    subtype: "total",
    visibility: "North Africa, Middle East, Arabia (longest total of the century)",
  },
  {
    date: "2028-01-12",
    kind: "lunar",
    subtype: "penumbral",
    visibility: "Americas, Europe, Africa",
  },
  {
    date: "2028-01-26",
    kind: "solar",
    subtype: "annular",
    visibility: "Galapagos, north S. America, Iberia, North Africa",
  },
  {
    date: "2028-07-22",
    kind: "solar",
    subtype: "total",
    visibility: "Indian Ocean, Australia, New Zealand",
  },
  {
    date: "2028-12-31",
    kind: "lunar",
    subtype: "total",
    visibility: "Europe, Africa, Asia, Australia",
  },
  {
    date: "2029-01-14",
    kind: "solar",
    subtype: "partial",
    visibility: "North America",
  },
  {
    date: "2029-06-12",
    kind: "solar",
    subtype: "partial",
    visibility: "Arctic, northern Europe, NE North America",
  },
  {
    date: "2029-07-11",
    kind: "solar",
    subtype: "partial",
    visibility: "Southern South America",
  },
  {
    date: "2029-12-05",
    kind: "solar",
    subtype: "partial",
    visibility: "Southern Australia, Antarctica",
  },
  {
    date: "2030-06-01",
    kind: "solar",
    subtype: "annular",
    visibility: "North Africa, Greece, Russia, Japan",
  },
  {
    date: "2030-06-15",
    kind: "lunar",
    subtype: "partial",
    visibility: "Americas, Europe, Africa",
  },
  {
    date: "2030-11-25",
    kind: "solar",
    subtype: "total",
    visibility: "South Africa, Indian Ocean, Australia",
  },
];

/** Next `count` eclipses of the given kind, after `from`. */
export function upcomingEclipses(
  from: Date = new Date(),
  kind?: EclipseKind,
  count = 5,
): EclipseEvent[] {
  const cutoff = from.getTime();
  return ECLIPSES.filter(
    (e) => new Date(e.date + "T00:00:00Z").getTime() >= cutoff && (!kind || e.kind === kind),
  ).slice(0, count);
}
