import { useMemo } from "react";
import { moonPhase, lunarDistanceKm } from "../lib/moon";
import { formatKm, formatPercent } from "../lib/format";
import { MoonGlyph } from "./MoonGlyph";
import { StarField } from "./StarField";

export function MoonToday({ now }: { now: Date }) {
  const phase = useMemo(() => moonPhase(now), [now]);
  const dist = useMemo(() => lunarDistanceKm(now), [now]);

  return (
    <section className="card-glass relative overflow-hidden p-6 md:p-8">
      <StarField className="pointer-events-none absolute inset-0 w-full h-full opacity-50" />
      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex-shrink-0">
          <MoonGlyph fraction={phase.fraction} size={220} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm uppercase tracking-[0.18em]"
            style={{ color: "var(--muted)" }}
          >
            Tonight
          </p>
          <h2 className="mt-1 text-3xl md:text-4xl font-bold">{phase.name}</h2>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Stat label="Illumination" value={formatPercent(phase.illumination)} />
            <Stat label="Age" value={`${phase.ageDays.toFixed(1)} d`} />
            <Stat label="Distance" value={formatKm(dist)} />
            <Stat label="Trend" value={phase.waxing ? "Waxing" : "Waning"} />
            <Stat label="Phase angle" value={`${(phase.fraction * 360).toFixed(0)}°`} />
            <Stat label="Days to next" value={daysToNext(phase.fraction)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function daysToNext(fraction: number): string {
  // Days until next quarter milestone (new / FQ / full / LQ).
  const targets = [0, 0.25, 0.5, 0.75, 1];
  let nextDelta = 1;
  for (const t of targets) {
    const d = t - fraction;
    if (d > 0 && d < nextDelta) nextDelta = d;
  }
  return `${(nextDelta * 29.53).toFixed(1)} d`;
}
