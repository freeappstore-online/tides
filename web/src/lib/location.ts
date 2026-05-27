/** Location persistence and geolocation helpers. */

const STORAGE_KEY = "tides.location.v1";

export interface Location {
  latitude: number;
  longitude: number;
  label: string;
}

export const DEFAULT_LOCATION: Location = {
  // Sydney — a sensible default for a tide-aware audience.
  latitude: -33.8688,
  longitude: 151.2093,
  label: "Sydney, Australia",
};

export function loadLocation(): Location {
  if (typeof localStorage === "undefined") return DEFAULT_LOCATION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LOCATION;
    const parsed = JSON.parse(raw) as Partial<Location>;
    if (
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number" &&
      typeof parsed.label === "string"
    ) {
      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        label: parsed.label,
      };
    }
  } catch {
    // fall through
  }
  return DEFAULT_LOCATION;
}

export function saveLocation(loc: Location): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {
    // ignore
  }
}

export function requestGeolocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: `${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`,
        });
      },
      (err) => reject(new Error(err.message || "Geolocation request failed.")),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  });
}
