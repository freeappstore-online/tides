import { useMemo, type ReactNode } from "react";
import { sunTimes } from "../lib/sun";
import { moonTimes } from "../lib/moonrise";
import { formatTime, formatHours } from "../lib/format";
import type { Location } from "../lib/location";

export function RiseSet({ now, location }: { now: Date; location: Location }) {
  const sun = useMemo(
    () => sunTimes(now, location.latitude, location.longitude),
    [now, location],
  );
  const moon = useMemo(
    () => moonTimes(now, location.latitude, location.longitude),
    [now, location],
  );

  return (
    <section className="card p-6">
      <h3 className="text-xl font-bold mb-1">Rise &amp; set times</h3>
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        For {location.label}
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Panel title="Sun" icon="☀">
          <Row label="Sunrise" value={formatTime(sun.sunrise)} />
          <Row label="Solar noon" value={formatTime(sun.solarNoon)} />
          <Row label="Sunset" value={formatTime(sun.sunset)} />
          <Row
            label="Day length"
            value={
              sun.dayLengthMinutes === 0
                ? "Polar night"
                : sun.dayLengthMinutes >= 1440
                  ? "Polar day"
                  : formatHours(sun.dayLengthMinutes)
            }
          />
        </Panel>

        <Panel title="Moon" icon="🌙">
          {moon.alwaysUp ? (
            <Row label="Status" value="Above horizon all day" />
          ) : moon.alwaysDown ? (
            <Row label="Status" value="Below horizon all day" />
          ) : (
            <>
              <Row label="Moonrise" value={formatTime(moon.moonrise)} />
              <Row label="Moonset" value={formatTime(moon.moonset)} />
            </>
          )}
        </Panel>
      </div>
    </section>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>
        <h4 className="font-semibold">{title}</h4>
      </div>
      <dl className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={{ color: "var(--muted)" }}>{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </>
  );
}
