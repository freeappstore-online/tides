import { useMemo } from "react";
import { visibleTonight } from "../data/constellations";
import type { Location } from "../lib/location";

export function Constellations({ now, location }: { now: Date; location: Location }) {
  const list = useMemo(
    () => visibleTonight(now, location.latitude),
    [now, location.latitude],
  );

  return (
    <section className="card p-6">
      <h3 className="text-xl font-bold mb-1">Tonight's sky</h3>
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Best-placed constellations for evening viewing from latitude{" "}
        {location.latitude.toFixed(1)}° this month.
      </p>
      {list.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          No headline constellations are well placed from this latitude this month.
        </p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {list.map((c) => (
            <li
              key={c.abbreviation}
              className="p-3 rounded-lg flex items-start gap-3"
              style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  background: "var(--accent)",
                  color: "white",
                }}
              >
                {c.abbreviation}
              </div>
              <div className="min-w-0">
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {c.notable}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
