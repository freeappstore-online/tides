import { useEffect, useMemo, useRef } from "react";
import { tideCurve, upcomingTideEvents } from "../lib/tides";
import { formatTime } from "../lib/format";
import type { Location } from "../lib/location";

interface Props {
  now: Date;
  location: Location;
}

export function TideChart({ now, location }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  const curve = useMemo(
    () => tideCurve(addHours(now, -6), location.longitude, 36, 144),
    [now, location.longitude],
  );
  const events = useMemo(
    () => upcomingTideEvents(now, location.longitude, 24).slice(0, 4),
    [now, location.longitude],
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawTide(ctx, w, h, curve, now);
  }, [curve, now]);

  return (
    <section className="card p-6">
      <header className="flex items-baseline justify-between mb-1">
        <h3 className="text-xl font-bold">Tides</h3>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          {location.label}
        </span>
      </header>
      <div className="relative h-44 mt-2">
        <canvas ref={ref} className="absolute inset-0 w-full h-full" />
      </div>
      <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {events.map((e, i) => (
          <li
            key={i}
            className="p-3 rounded-lg"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
            }}
          >
            <div
              className="text-xs uppercase tracking-wider"
              style={{ color: e.type === "high" ? "var(--accent)" : "var(--muted)" }}
            >
              {e.type === "high" ? "High tide" : "Low tide"}
            </div>
            <div className="font-semibold">{formatTime(e.time)}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              ~ {e.height.toFixed(2)} m
            </div>
          </li>
        ))}
      </ul>
      <p
        className="mt-4 text-xs italic"
        style={{ color: "var(--muted)" }}
      >
        Approximate — synthesised from lunar position only. For planning use,
        not navigation or safety. Real tides depend on coastline geometry,
        bathymetry, and weather.
      </p>
    </section>
  );
}

function addHours(d: Date, hours: number): Date {
  return new Date(d.getTime() + hours * 3600_000);
}

function drawTide(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  curve: { time: Date; height: number }[],
  now: Date,
) {
  ctx.clearRect(0, 0, w, h);
  if (curve.length < 2) return;

  const padL = 8;
  const padR = 8;
  const padT = 8;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const heights = curve.map((p) => p.height);
  const yMin = Math.min(...heights) - 0.1;
  const yMax = Math.max(...heights) + 0.1;
  const xMin = curve[0]!.time.getTime();
  const xMax = curve[curve.length - 1]!.time.getTime();

  const accent = getCssVar("--accent") || "#818cf8";
  const muted = getCssVar("--muted") || "#94a3b8";
  const line = getCssVar("--line") || "#1e293b";

  // Zero line.
  const zeroY = padT + innerH - ((0 - yMin) / (yMax - yMin)) * innerH;
  ctx.strokeStyle = line;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(padL, zeroY);
  ctx.lineTo(padL + innerW, zeroY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Area gradient.
  const grad = ctx.createLinearGradient(0, padT, 0, padT + innerH);
  grad.addColorStop(0, accent + "55");
  grad.addColorStop(1, accent + "00");

  const xFor = (t: number) => padL + ((t - xMin) / (xMax - xMin)) * innerW;
  const yFor = (v: number) => padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  ctx.beginPath();
  for (let i = 0; i < curve.length; i++) {
    const p = curve[i];
    if (!p) continue;
    const x = xFor(p.time.getTime());
    const y = yFor(p.height);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(padL + innerW, padT + innerH);
  ctx.lineTo(padL, padT + innerH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  for (let i = 0; i < curve.length; i++) {
    const p = curve[i];
    if (!p) continue;
    const x = xFor(p.time.getTime());
    const y = yFor(p.height);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Now marker.
  const nowX = xFor(now.getTime());
  if (nowX >= padL && nowX <= padL + innerW) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(nowX, padT);
    ctx.lineTo(nowX, padT + innerH);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = "10px Manrope, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("now", nowX, padT + innerH + 12);
  }

  // Hour labels every 6 hours.
  ctx.fillStyle = muted;
  ctx.font = "10px Manrope, system-ui, sans-serif";
  ctx.textAlign = "center";
  for (let h6 = 6; h6 < 30; h6 += 6) {
    const t = curve[0]!.time.getTime() + h6 * 3600_000;
    if (t > xMax) break;
    const x = xFor(t);
    const d = new Date(t);
    ctx.fillText(
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      x,
      padT + innerH + 12,
    );
  }
}

function getCssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
