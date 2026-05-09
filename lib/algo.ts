export type QQQPoint = [string, number];
export type CurvePoint = { date: string; value: number };

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxMuller(rng: () => number) {
  const u = Math.max(rng(), 1e-12);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function sliceWindow(qqq: QQQPoint[], startISO: string, endISO: string): QQQPoint[] {
  const s = qqq.findIndex((p) => p[0] >= startISO);
  let e = qqq.findIndex((p) => p[0] > endISO);
  if (e === -1) e = qqq.length;
  return qqq.slice(s === -1 ? 0 : s, e);
}

export function durationToWindow(qqq: QQQPoint[], duration: string): QQQPoint[] {
  if (qqq.length === 0) return [];
  const last = qqq[qqq.length - 1][0];
  const lastDate = new Date(last);
  const startDate = new Date(lastDate);
  switch (duration) {
    case "1W": startDate.setDate(startDate.getDate() - 7); break;
    case "MTD": startDate.setDate(1); break;
    case "1M": startDate.setMonth(startDate.getMonth() - 1); break;
    case "3M": startDate.setMonth(startDate.getMonth() - 3); break;
    case "6M": startDate.setMonth(startDate.getMonth() - 6); break;
    case "YTD": startDate.setMonth(0); startDate.setDate(1); break;
    case "1Y": startDate.setFullYear(startDate.getFullYear() - 1); break;
    case "3Y": startDate.setFullYear(startDate.getFullYear() - 3); break;
    case "5Y": startDate.setFullYear(startDate.getFullYear() - 5); break;
    case "ALL": return qqq.slice();
    default: startDate.setFullYear(startDate.getFullYear() - 1);
  }
  return sliceWindow(qqq, startDate.toISOString().slice(0, 10), last);
}

export function niceCeil(n: number): number {
  if (n === 0) return 0;
  const sign = Math.sign(n);
  const abs = Math.abs(n);
  const mag = Math.pow(10, Math.floor(Math.log10(abs)));
  const norm = abs / mag;
  let nice;
  if (norm < 1.5) nice = 1.5;
  else if (norm < 2) nice = 2;
  else if (norm < 3) nice = 3;
  else if (norm < 5) nice = 5;
  else if (norm < 7.5) nice = 7.5;
  else nice = 10;
  return sign * nice * mag;
}

export function generateCurve(opts: {
  window: QQQPoint[];
  startCapital: number;
  targetReturnPct: number;
  noiseSigma?: number;
  seed?: number;
}): CurvePoint[] {
  const { window, startCapital, targetReturnPct, noiseSigma = 0.0025, seed = 42 } = opts;
  if (window.length < 2) {
    return window.map((p) => ({ date: p[0], value: startCapital }));
  }

  const closes = window.map((p) => p[1]);
  const logReturns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    logReturns.push(Math.log(closes[i] / closes[i - 1]));
  }

  const baselineSum = logReturns.reduce((a, b) => a + b, 0);
  const targetLog = Math.log(1 + targetReturnPct / 100);
  const k = Math.abs(baselineSum) > 1e-9 ? targetLog / baselineSum : targetLog / logReturns.length;

  const rng = mulberry32(seed);
  const rawNoise = logReturns.map(() => boxMuller(rng) * noiseSigma);
  const noiseMean = rawNoise.reduce((a, b) => a + b, 0) / rawNoise.length;
  const noise = rawNoise.map((n) => n - noiseMean);

  const scaled = logReturns.map((r, i) =>
    Math.abs(baselineSum) > 1e-9 ? k * r + noise[i] : k + noise[i]
  );

  const out: CurvePoint[] = [{ date: window[0][0], value: startCapital }];
  let cum = 0;
  for (let i = 0; i < scaled.length; i++) {
    cum += scaled[i];
    out.push({ date: window[i + 1][0], value: startCapital * Math.exp(cum) });
  }
  return out;
}

export function dailyChange(curve: CurvePoint[]): { abs: number; pct: number } {
  if (curve.length < 2) return { abs: 0, pct: 0 };
  const last = curve[curve.length - 1].value;
  const prev = curve[curve.length - 2].value;
  return { abs: last - prev, pct: (last - prev) / prev };
}

export function formatCurrency(n: number, opts: { compact?: boolean; sign?: boolean } = {}): string {
  const sign = opts.sign && n > 0 ? "+" : n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (opts.compact && abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (opts.compact && abs >= 10_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPct(n: number, opts: { sign?: boolean } = {}): string {
  const sign = opts.sign && n > 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(2)}%`;
}
