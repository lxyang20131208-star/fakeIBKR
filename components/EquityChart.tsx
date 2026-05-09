"use client";
import { CurvePoint, niceCeil } from "@/lib/algo";

function formatAxisValue(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function EquityChart({
  curve,
  width = 358,
  height = 220,
  positive = true,
  gainColor = "#e02020",
  lossColor = "#089981",
  showAxis = true,
  axisMode = "pct",
}: {
  curve: CurvePoint[];
  width?: number;
  height?: number;
  positive?: boolean;
  gainColor?: string;
  lossColor?: string;
  showAxis?: boolean;
  axisMode?: "pct" | "value";
}) {
  if (curve.length < 2) return <svg width={width} height={height} />;

  const start = curve[0].value;
  const series =
    axisMode === "pct"
      ? curve.map((p) => (p.value / start - 1) * 100)
      : curve.map((p) => p.value);
  const rawMax = Math.max(...series, axisMode === "pct" ? 0 : start);
  const rawMin = Math.min(...series, axisMode === "pct" ? 0 : start);
  const niceMax =
    axisMode === "pct"
      ? niceCeil(Math.max(rawMax, Math.abs(rawMin) * 0.4) * 1.1)
      : niceCeil(rawMax * 1.05);
  const niceMin =
    axisMode === "pct"
      ? rawMin < 0
        ? -niceCeil(Math.abs(rawMin) * 1.2)
        : -niceCeil(niceMax * 0.4)
      : Math.min(0, niceCeil(rawMin * 0.95));
  const range = niceMax - niceMin || 1;

  const axisW = showAxis ? 56 : 0;
  const chartW = width - axisW;
  const padTop = 8;
  const padBottom = 8;
  const innerH = height - padTop - padBottom;

  const xAt = (i: number) => (i / (curve.length - 1)) * chartW;
  const yAt = (v: number) => padTop + (1 - (v - niceMin) / range) * innerH;

  const line = series
    .map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)},${yAt(v).toFixed(2)}`)
    .join(" ");
  const baseline = axisMode === "pct" ? 0 : start;
  const baselineY = yAt(baseline);
  const fill = `${line} L${chartW.toFixed(2)},${baselineY.toFixed(2)} L0,${baselineY.toFixed(2)} Z`;

  const color = positive ? gainColor : lossColor;
  const fillId = `eq-fill-${positive ? "p" : "n"}`;

  // Generate 4-5 grid ticks
  const niceStep = niceCeil(range / 4);
  const ticks: number[] = [];
  let t = Math.ceil(niceMin / niceStep) * niceStep;
  while (t <= niceMax + 1e-6) {
    ticks.push(Math.round(t * 100) / 100);
    t += niceStep;
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {showAxis &&
        ticks.map((tk, i) => {
          const isBaseline = Math.abs(tk - baseline) < 1e-6;
          const label =
            axisMode === "pct"
              ? `${tk > 0 ? "+" : ""}${tk.toFixed(2)}%`
              : formatAxisValue(tk);
          return (
            <g key={i}>
              {isBaseline && (
                <line
                  x1={0}
                  y1={yAt(tk)}
                  x2={chartW}
                  y2={yAt(tk)}
                  stroke="#9a9a9a"
                  strokeWidth={1}
                  strokeDasharray="1.5 3"
                />
              )}
              <text
                x={chartW + 6}
                y={yAt(tk) + 3.5}
                fontSize="10.5"
                fill="#9a9a9a"
                fontFamily="-apple-system, sans-serif"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {label}
              </text>
            </g>
          );
        })}
      <path d={fill} fill={`url(#${fillId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
