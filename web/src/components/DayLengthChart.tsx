import { useEffect, useMemo, useRef } from "react";
import { dayLengthForYear } from "../lib/sun";
import type { Location } from "../lib/location";

interface Props {
  location: Location;
  year: number;
}

export function DayLengthChart({ location, year }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const data = useMemo(
    () => dayLengthForYear(year, location.latitude, location.longitude),
    [year, location],
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
    drawChart(ctx, w, h, data, location.latitude, year);
  }, [data, location.latitude, year]);

  // Pull min/max for the legend.
  const min = data.length ? Math.min(...data) : 0;
  const max = data.length ? Math.max(...data) : 0;

  return (
    <section className="card p-6">
      <header className="flex items-baseline justify-between mb-1">
        <h3 className="text-xl font-bold">Day length · {year}</h3>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          {location.label}
        </span>
      </header>
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Hours of daylight throughout the year. Range {min.toFixed(1)} h →{" "}
        {max.toFixed(1)} h.
      </p>
      <div className="relative h-56">
        <canvas ref={ref} className="absolute inset-0 w-full h-full" />
      </div>
    </section>
  );
}

function drawChart(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: number[],
  latitude: number,
  year: number,
) {
  ctx.clearRect(0, 0, w, h);
  if (data.length < 2) return;

  const padL = 36;
  const padR = 16;
  const padT = 8;
  const padB = 24;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  // Clamp y-axis to interesting range for the given latitude.
  const yMin = 0;
  const yMax = 24;

  // Axes / gridlines.
  const muted = getCssVar("--muted") || "#94a3b8";
  const line = getCssVar("--line") || "#1e293b";
  const accent = getCssVar("--accent") || "#818cf8";

  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  ctx.font = "11px Manrope, system-ui, sans-serif";
  ctx.fillStyle = muted;
  ctx.textBaseline = "middle";

  for (let hr = 0; hr <= 24; hr += 6) {
    const y = padT + innerH - ((hr - yMin) / (yMax - yMin)) * innerH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + innerW, y);
    ctx.stroke();
    ctx.fillText(`${hr}h`, 4, y);
  }

  // Month tick labels.
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  for (let m = 0; m < 12; m++) {
    const dayOfYear = monthStartDayOfYear(m, data.length === 366);
    const x = padL + (dayOfYear / (data.length - 1)) * innerW;
    ctx.fillText(months[m] ?? "", x, padT + innerH + 6);
  }
  ctx.textAlign = "start";

  // Equinox / solstice markers.
  const solsticeDays = data.length === 366 ? [80, 172, 265, 355] : [79, 171, 264, 354];
  ctx.strokeStyle = line;
  ctx.setLineDash([3, 3]);
  for (const d of solsticeDays) {
    const x = padL + (d / (data.length - 1)) * innerW;
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + innerH);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Area fill under curve.
  const grad = ctx.createLinearGradient(0, padT, 0, padT + innerH);
  grad.addColorStop(0, accent + "55");
  grad.addColorStop(1, accent + "00");

  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = padL + (i / (data.length - 1)) * innerW;
    const v = data[i] ?? 0;
    const y = padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(padL + innerW, padT + innerH);
  ctx.lineTo(padL, padT + innerH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Curve stroke.
  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = padL + (i / (data.length - 1)) * innerW;
    const v = data[i] ?? 0;
    const y = padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Today marker (only if we're charting the current year).
  const yearStart = new Date(year, 0, 1);
  const today = Math.floor((Date.now() - yearStart.getTime()) / 86_400_000);
  if (year === new Date().getFullYear() && today >= 0 && today < data.length) {
    const x = padL + (today / (data.length - 1)) * innerW;
    const v = data[today] ?? 0;
    const y = padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Latitude badge (top-right).
  ctx.fillStyle = muted;
  ctx.textAlign = "right";
  ctx.fillText(`lat ${latitude.toFixed(2)}°`, padL + innerW, padT + 4);
}

function monthStartDayOfYear(monthZeroBased: number, leap: boolean): number {
  const lens = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let d = 0;
  for (let i = 0; i < monthZeroBased; i++) d += lens[i] ?? 0;
  return d;
}

function getCssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
