/**
 * Decorative star field — deterministic per-mount so the layout is stable
 * across renders.
 */
import { useMemo } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  delay: number;
}

export function StarField({ count = 60, className }: { count?: number; className?: string }) {
  const stars = useMemo<Star[]>(() => {
    const rng = mulberry32(0x5eed);
    return Array.from({ length: count }, () => ({
      x: rng() * 100,
      y: rng() * 100,
      r: 0.4 + rng() * 1.2,
      delay: rng() * 3,
    }));
  }, [count]);

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r * 0.15}
          fill="white"
          opacity={0.6}
          style={{
            animation: `twinkle ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </svg>
  );
}

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
