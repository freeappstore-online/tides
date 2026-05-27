import { useMemo, useState } from "react";
import { moonPhase, lunarDistanceKm } from "../lib/moon";
import { MoonGlyph } from "./MoonGlyph";
import { formatPercent, formatKm, formatLongDate } from "../lib/format";

export function PhaseCalculator() {
  const [value, setValue] = useState<string>(() => toInputDate(new Date()));
  const date = useMemo(() => {
    const d = new Date(value + "T12:00:00");
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);
  const phase = moonPhase(date);
  const dist = lunarDistanceKm(date);

  return (
    <section className="card p-6">
      <h3 className="text-xl font-bold mb-1">Phase calculator</h3>
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Pick any date — past or future — to see the moon's phase.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="px-3 py-2 rounded-lg font-medium"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line-strong)",
            color: "var(--ink)",
          }}
          aria-label="Date to calculate moon phase"
        />
        <div className="flex gap-2 flex-wrap">
          {QUICK.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => setValue(toInputDate(q.shift()))}
              className="px-3 py-2 rounded-lg text-sm font-medium transition"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
        <MoonGlyph fraction={phase.fraction} size={140} />
        <div>
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            {formatLongDate(date)}
          </div>
          <div className="text-2xl font-bold mt-1">{phase.name}</div>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <dt style={{ color: "var(--muted)" }}>Illumination</dt>
            <dd className="font-medium">{formatPercent(phase.illumination)}</dd>
            <dt style={{ color: "var(--muted)" }}>Age</dt>
            <dd className="font-medium">{phase.ageDays.toFixed(2)} days</dd>
            <dt style={{ color: "var(--muted)" }}>Trend</dt>
            <dd className="font-medium">{phase.waxing ? "Waxing" : "Waning"}</dd>
            <dt style={{ color: "var(--muted)" }}>Distance</dt>
            <dd className="font-medium">{formatKm(dist)}</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}

const QUICK = [
  { label: "Today", shift: () => new Date() },
  { label: "+1 week", shift: () => addDays(new Date(), 7) },
  { label: "+1 month", shift: () => addDays(new Date(), 30) },
  { label: "+1 year", shift: () => addDays(new Date(), 365) },
];

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toInputDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
