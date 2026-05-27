/**
 * Pure-SVG moon visualisation.
 *
 * Approach: render a bright disk, then occlude the dark portion by
 * compositing the disk with a "shadow" circle that slides across it.
 * The shadow circle is the same radius as the moon and is offset along x
 * by a function of the phase fraction:
 *   - new (f=0):     offset = 0          → shadow exactly covers the disk
 *   - first qtr:     offset = r          → shadow covers left half
 *   - full (f=0.5):  offset = 2r         → shadow fully off-disk to right
 *   - last qtr:      offset = -r         → shadow covers right half
 *
 * To get a smooth crescent → gibbous shape we parametrize the offset as
 *   offset = r * (1 - cos(2π·f))  for the waxing half (f < 0.5),  shadow on left
 *   offset = -r * (1 - cos(2π·f)) for the waning half,            shadow on right
 *
 * which yields the correct terminator curvature because the visible
 * intersection between two equal-radius circles is a lens-shaped region
 * bounded by two circular arcs — exactly what real lunar terminators look like.
 */

interface Props {
  /** 0..1 phase fraction (0 = new, 0.5 = full). */
  fraction: number;
  size?: number;
  className?: string;
}

export function MoonGlyph({ fraction, size = 240, className }: Props) {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const f = ((fraction % 1) + 1) % 1;
  const waxing = f < 0.5;

  // Magnitude of shadow offset: 0 at new (f=0), 2r at full (f=0.5), 0 at next new.
  const mag = r * (1 - Math.cos(2 * Math.PI * f));
  const shadowCx = cx + (waxing ? -mag : mag);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Moon phase"
    >
      <defs>
        <radialGradient id="moonBright" cx="42%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#fdfdfd" />
          <stop offset="65%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <radialGradient id="moonShadowGrad" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0b1226" />
        </radialGradient>
        <clipPath id="moonClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Bright disk */}
      <circle cx={cx} cy={cy} r={r} fill="url(#moonBright)" />

      {/* Crater texture */}
      <g clipPath="url(#moonClip)" opacity={0.16}>
        <circle cx={cx - r * 0.32} cy={cy - r * 0.22} r={r * 0.12} fill="#475569" />
        <circle cx={cx + r * 0.26} cy={cy + r * 0.3} r={r * 0.09} fill="#475569" />
        <circle cx={cx + r * 0.08} cy={cy - r * 0.46} r={r * 0.06} fill="#475569" />
        <circle cx={cx - r * 0.46} cy={cy + r * 0.36} r={r * 0.07} fill="#475569" />
        <circle cx={cx + r * 0.42} cy={cy - r * 0.05} r={r * 0.05} fill="#475569" />
      </g>

      {/* Shadow disk, clipped to moon disk. As shadowCx slides, the
          intersection of the two equal-radius circles produces the
          characteristic crescent/gibbous terminator shape. */}
      <g clipPath="url(#moonClip)">
        <circle cx={shadowCx} cy={cy} r={r} fill="url(#moonShadowGrad)" />
      </g>

      {/* Limb highlight */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={1}
      />
    </svg>
  );
}
