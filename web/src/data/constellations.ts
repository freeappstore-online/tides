/**
 * Static seasonal constellation visibility table.
 *
 * Best-evening-view month-ranges from standard star-atlas conventions
 * (Norton's, Sky & Telescope's "When to See" tables). A constellation is
 * listed for a given month when it culminates near local midnight or is
 * comfortably high in the evening sky from mid-latitudes.
 *
 * Latitude tagging:
 *   - "N"  visible primarily from Northern Hemisphere
 *   - "S"  visible primarily from Southern Hemisphere
 *   - "B"  visible from both hemispheres
 */

export type Hemisphere = "N" | "S" | "B";

export interface Constellation {
  name: string;
  abbreviation: string;
  /** 1=Jan ... 12=Dec — months it is well placed in the evening sky. */
  months: number[];
  hemisphere: Hemisphere;
  notable: string;
}

export const CONSTELLATIONS: Constellation[] = [
  { name: "Orion", abbreviation: "Ori", months: [12, 1, 2, 3], hemisphere: "B", notable: "Betelgeuse, Rigel, Orion Nebula" },
  { name: "Taurus", abbreviation: "Tau", months: [11, 12, 1, 2], hemisphere: "B", notable: "Aldebaran, Pleiades, Hyades" },
  { name: "Gemini", abbreviation: "Gem", months: [1, 2, 3], hemisphere: "B", notable: "Castor & Pollux" },
  { name: "Canis Major", abbreviation: "CMa", months: [1, 2, 3], hemisphere: "B", notable: "Sirius (brightest star)" },
  { name: "Leo", abbreviation: "Leo", months: [3, 4, 5], hemisphere: "B", notable: "Regulus, Leo Triplet galaxies" },
  { name: "Ursa Major", abbreviation: "UMa", months: [3, 4, 5, 6], hemisphere: "N", notable: "The Big Dipper, M81/M82" },
  { name: "Virgo", abbreviation: "Vir", months: [4, 5, 6], hemisphere: "B", notable: "Spica, Virgo Cluster" },
  { name: "Boötes", abbreviation: "Boo", months: [5, 6, 7], hemisphere: "N", notable: "Arcturus (4th brightest)" },
  { name: "Scorpius", abbreviation: "Sco", months: [6, 7, 8], hemisphere: "B", notable: "Antares, Butterfly Cluster" },
  { name: "Sagittarius", abbreviation: "Sgr", months: [7, 8, 9], hemisphere: "B", notable: "Galactic center, Lagoon Nebula" },
  { name: "Cygnus", abbreviation: "Cyg", months: [7, 8, 9, 10], hemisphere: "N", notable: "Deneb, Northern Cross, Veil Nebula" },
  { name: "Lyra", abbreviation: "Lyr", months: [7, 8, 9], hemisphere: "N", notable: "Vega, Ring Nebula" },
  { name: "Aquila", abbreviation: "Aql", months: [7, 8, 9], hemisphere: "B", notable: "Altair (Summer Triangle apex)" },
  { name: "Pegasus", abbreviation: "Peg", months: [9, 10, 11], hemisphere: "N", notable: "Great Square, M15" },
  { name: "Andromeda", abbreviation: "And", months: [10, 11, 12], hemisphere: "N", notable: "M31 Andromeda Galaxy" },
  { name: "Cassiopeia", abbreviation: "Cas", months: [10, 11, 12], hemisphere: "N", notable: "W-shape, double cluster nearby" },
  { name: "Perseus", abbreviation: "Per", months: [11, 12, 1], hemisphere: "N", notable: "Algol, Perseid meteors" },
  { name: "Centaurus", abbreviation: "Cen", months: [4, 5, 6], hemisphere: "S", notable: "Alpha Centauri, Omega Centauri" },
  { name: "Crux", abbreviation: "Cru", months: [4, 5, 6], hemisphere: "S", notable: "Southern Cross, Coalsack Nebula" },
  { name: "Carina", abbreviation: "Car", months: [2, 3, 4], hemisphere: "S", notable: "Canopus (2nd brightest), Eta Carinae" },
  { name: "Eridanus", abbreviation: "Eri", months: [12, 1, 2], hemisphere: "B", notable: "Achernar, long winding river" },
  { name: "Aquarius", abbreviation: "Aqr", months: [9, 10, 11], hemisphere: "B", notable: "Helix Nebula, Saturn Nebula" },
];

export function visibleTonight(
  date: Date = new Date(),
  latitude: number,
): Constellation[] {
  const month = date.getMonth() + 1;
  const southern = latitude < 0;
  return CONSTELLATIONS.filter((c) => {
    if (!c.months.includes(month)) return false;
    if (c.hemisphere === "B") return true;
    if (c.hemisphere === "N") return latitude > -25;
    return southern || latitude < 25;
  }).slice(0, 10);
}
