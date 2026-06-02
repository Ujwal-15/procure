"use client";

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  dark?: boolean;
  centerLabel?: string;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, endDeg: number) {
  const o1 = polarToXY(cx, cy, outerR, startDeg);
  const o2 = polarToXY(cx, cy, outerR, endDeg);
  const i2 = polarToXY(cx, cy, innerR, endDeg);
  const i1 = polarToXY(cx, cy, innerR, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i1.x} ${i1.y}`,
    "Z",
  ].join(" ");
}

export default function DonutChart({ data, size = 160, dark = false, centerLabel }: DonutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.31;
  const gapDeg = 3;

  const total = data.reduce((s, d) => s + d.value, 0);
  let cursor = 0;

  const slices = data.map(d => {
    const sweep = (d.value / total) * (360 - gapDeg * data.length);
    const start = cursor;
    cursor += sweep + gapDeg;
    return { ...d, start, end: start + sweep };
  });

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((s, i) => (
            <path key={i} d={arcPath(cx, cy, outerR, innerR, s.start, s.end)} fill={s.color} />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: dark ? "rgba(255,255,255,0.4)" : "var(--text-3)" }}>
            Total
          </p>
          <p className="text-[14px] font-bold leading-tight" style={{ color: dark ? "#fff" : "var(--text-1)" }}>
            {centerLabel}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2.5">
        {data.map(d => {
          const pct = Math.round((d.value / total) * 100);
          return (
            <div key={d.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[11.5px] truncate" style={{ color: dark ? "rgba(255,255,255,0.6)" : "var(--text-2)" }}>
                  {d.label}
                </span>
              </div>
              <span className="text-[11.5px] font-semibold shrink-0" style={{ color: dark ? "rgba(255,255,255,0.9)" : "var(--text-1)" }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
