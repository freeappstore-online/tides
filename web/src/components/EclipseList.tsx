import { useMemo, type ReactNode } from "react";
import { upcomingEclipses } from "../data/eclipses";
import { formatLongDate, formatRelativeDays } from "../lib/format";

export function EclipseList({ now }: { now: Date }) {
  const lunar = useMemo(() => upcomingEclipses(now, "lunar", 5), [now]);
  const solar = useMemo(() => upcomingEclipses(now, "solar", 5), [now]);

  return (
    <section className="card p-6">
      <h3 className="text-xl font-bold mb-4">Upcoming eclipses</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <Column title="Lunar" tint="var(--accent)">
          {lunar.map((e) => (
            <EclipseRow key={e.date} {...e} now={now} />
          ))}
        </Column>
        <Column title="Solar" tint="var(--warning)">
          {solar.map((e) => (
            <EclipseRow key={e.date} {...e} now={now} />
          ))}
        </Column>
      </div>
    </section>
  );
}

function Column({
  title,
  tint,
  children,
}: {
  title: string;
  tint: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm uppercase tracking-wider mb-3" style={{ color: tint }}>
        {title}
      </h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function EclipseRow({
  date,
  subtype,
  visibility,
  now,
}: {
  date: string;
  subtype: string;
  visibility: string;
  now: Date;
}) {
  const d = new Date(date + "T00:00:00Z");
  return (
    <li
      className="p-3 rounded-lg"
      style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-medium">{formatLongDate(d)}</div>
        <div className="text-xs uppercase" style={{ color: "var(--muted)" }}>
          {subtype}
        </div>
      </div>
      <div className="text-xs" style={{ color: "var(--muted)" }}>
        {formatRelativeDays(d, now)} · {visibility}
      </div>
    </li>
  );
}
