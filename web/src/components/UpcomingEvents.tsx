import { useMemo } from "react";
import {
  nextNewMoon,
  nextFullMoon,
  nextSupermoon,
  nextBlueMoon,
} from "../lib/moon";
import { formatLongDate, formatRelativeDays } from "../lib/format";

export function UpcomingEvents({ now }: { now: Date }) {
  const events = useMemo(() => {
    const next: { label: string; date: Date | null; note?: string }[] = [
      { label: "Next New Moon", date: nextNewMoon(now) },
      { label: "Next Full Moon", date: nextFullMoon(now) },
      {
        label: "Next Supermoon",
        date: nextSupermoon(now),
        note: "Full moon near perigee (≈ < 362,000 km)",
      },
      {
        label: "Next Blue Moon",
        date: nextBlueMoon(now),
        note: "Second full moon in a calendar month",
      },
    ];
    return next;
  }, [now]);

  return (
    <section className="card p-6">
      <h3 className="text-xl font-bold mb-4">Upcoming events</h3>
      <ul className="grid sm:grid-cols-2 gap-3">
        {events.map((e) => (
          <li
            key={e.label}
            className="p-4 rounded-xl"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              {e.label}
            </div>
            {e.date ? (
              <>
                <div className="mt-1 font-semibold">{formatLongDate(e.date)}</div>
                <div className="text-sm" style={{ color: "var(--muted)" }}>
                  {formatRelativeDays(e.date, now)}
                </div>
              </>
            ) : (
              <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                None in the foreseeable horizon
              </div>
            )}
            {e.note && (
              <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                {e.note}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
