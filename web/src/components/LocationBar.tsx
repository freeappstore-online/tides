import { useState } from "react";
import {
  DEFAULT_LOCATION,
  requestGeolocation,
  saveLocation,
  type Location,
} from "../lib/location";

interface Props {
  location: Location;
  onChange: (loc: Location) => void;
}

export function LocationBar({ location, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [lat, setLat] = useState(String(location.latitude));
  const [lng, setLng] = useState(String(location.longitude));
  const [label, setLabel] = useState(location.label);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function commit() {
    const la = parseFloat(lat);
    const ln = parseFloat(lng);
    if (!isFinite(la) || la < -90 || la > 90) {
      setError("Latitude must be between -90 and 90.");
      return;
    }
    if (!isFinite(ln) || ln < -180 || ln > 180) {
      setError("Longitude must be between -180 and 180.");
      return;
    }
    const next: Location = {
      latitude: la,
      longitude: ln,
      label: label.trim() || `${la.toFixed(2)}°, ${ln.toFixed(2)}°`,
    };
    saveLocation(next);
    onChange(next);
    setEditing(false);
    setError(null);
  }

  async function useDevice() {
    setBusy(true);
    setError(null);
    try {
      const loc = await requestGeolocation();
      saveLocation(loc);
      onChange(loc);
      setLat(String(loc.latitude));
      setLng(String(loc.longitude));
      setLabel(loc.label);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not get location.");
    } finally {
      setBusy(false);
    }
  }

  function useDefault() {
    onChange(DEFAULT_LOCATION);
    saveLocation(DEFAULT_LOCATION);
    setLat(String(DEFAULT_LOCATION.latitude));
    setLng(String(DEFAULT_LOCATION.longitude));
    setLabel(DEFAULT_LOCATION.label);
    setEditing(false);
    setError(null);
  }

  if (!editing) {
    return (
      <div
        className="card-glass flex items-center gap-3 px-4 py-2.5"
      >
        <svg
          viewBox="0 0 24 24"
          width={18}
          height={18}
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: "var(--accent)" }}
        >
          <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{location.label}</div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            {location.latitude.toFixed(3)}°, {location.longitude.toFixed(3)}°
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="grid sm:grid-cols-3 gap-2">
        <input
          aria-label="Label"
          placeholder="Label (e.g. Sydney)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm sm:col-span-3"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line-strong)",
            color: "var(--ink)",
          }}
        />
        <input
          aria-label="Latitude"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line-strong)",
            color: "var(--ink)",
          }}
        />
        <input
          aria-label="Longitude"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line-strong)",
            color: "var(--ink)",
          }}
        />
        <button
          type="button"
          onClick={commit}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--accent)", color: "white" }}
        >
          Save
        </button>
      </div>
      {error && (
        <div className="text-xs" style={{ color: "var(--error)" }}>
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useDevice}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Locating…" : "Use my location"}
        </button>
        <button
          type="button"
          onClick={useDefault}
          className="px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
          }}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium ml-auto"
          style={{
            background: "transparent",
            color: "var(--muted)",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
