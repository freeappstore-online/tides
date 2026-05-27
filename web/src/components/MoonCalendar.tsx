import { useMemo, useState } from "react";
import { moonPhase } from "../lib/moon";
import { MoonGlyph } from "./MoonGlyph";
import { formatLongDate, formatPercent } from "../lib/format";

interface Props {
  initialMonth?: Date;
}

export function MoonCalendar({ initialMonth }: Props) {
  const [cursor, setCursor] = useState<Date>(
    () =>
      initialMonth ??
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selected, setSelected] = useState<Date | null>(null);

  const days = useMemo(() => buildMonthGrid(cursor), [cursor]);

  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="card p-6">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Moon calendar</h3>
        <div className="flex items-center gap-2">
          <NavButton onClick={() => setCursor(shiftMonth(cursor, -1))} label="‹" ariaLabel="Previous month" />
          <div className="min-w-[10ch] text-center font-medium">{monthLabel}</div>
          <NavButton onClick={() => setCursor(shiftMonth(cursor, 1))} label="›" ariaLabel="Next month" />
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-wider mb-2"
           style={{ color: "var(--muted)" }}>
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <DayCell
            key={i}
            day={d}
            inMonth={d.getMonth() === cursor.getMonth()}
            isSelected={selected?.toDateString() === d.toDateString()}
            onClick={() => setSelected(d)}
          />
        ))}
      </div>

      {selected && (
        <SelectedDay date={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

function NavButton({
  onClick,
  label,
  ariaLabel,
}: {
  onClick: () => void;
  label: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-9 h-9 rounded-lg font-bold text-lg transition"
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        color: "var(--ink)",
      }}
    >
      {label}
    </button>
  );
}

function DayCell({
  day,
  inMonth,
  isSelected,
  onClick,
}: {
  day: Date;
  inMonth: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const phase = moonPhase(day);
  const isToday = day.toDateString() === new Date().toDateString();
  return (
    <button
      type="button"
      onClick={onClick}
      className="aspect-square rounded-lg flex flex-col items-center justify-center gap-1 p-1 transition"
      style={{
        background: isSelected ? "var(--accent)" : "transparent",
        color: isSelected ? "white" : inMonth ? "var(--ink)" : "var(--muted)",
        border: isToday ? "1px solid var(--accent)" : "1px solid transparent",
        opacity: inMonth ? 1 : 0.4,
      }}
    >
      <div className="text-xs font-medium">{day.getDate()}</div>
      <div className="w-6 h-6">
        <MoonGlyph fraction={phase.fraction} size={24} />
      </div>
    </button>
  );
}

function SelectedDay({ date, onClose }: { date: Date; onClose: () => void }) {
  const phase = moonPhase(date);
  return (
    <div className="mt-6 p-4 rounded-xl flex items-center gap-4 animate-in"
         style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
      <div className="flex-shrink-0">
        <MoonGlyph fraction={phase.fraction} size={64} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          {formatLongDate(date)}
        </div>
        <div className="font-semibold">{phase.name}</div>
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          {formatPercent(phase.illumination)} illuminated · {phase.ageDays.toFixed(1)} d old
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="px-3 py-1 rounded-lg text-sm"
        style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
      >
        Close
      </button>
    </div>
  );
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function shiftMonth(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function buildMonthGrid(monthStart: Date): Date[] {
  const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const startWeekday = first.getDay();
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startWeekday);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}
