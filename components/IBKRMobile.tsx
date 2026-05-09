"use client";
import { CurvePoint, formatCurrency, formatPct } from "@/lib/algo";
import { EquityChart } from "./EquityChart";

interface Props {
  curve: CurvePoint[];
  duration: string;
  showPositions: boolean;
  positions?: Position[];
  gainColor?: string;
  lossColor?: string;
  view?: "performance" | "value";
  bigFontStack?: string;
}

const DURATION_LABEL: Record<string, string> = {
  "1W": "过去1周",
  MTD: "本月迄今",
  "1M": "过去1个月",
  "3M": "过去3个月",
  "6M": "过去6个月",
  YTD: "本年迄今",
  "1Y": "过去1年",
  "3Y": "过去3年",
  "5Y": "过去5年",
  ALL: "自始以来",
};

export interface Position {
  symbol: string;
  qty: number;
  marketValue: number;
  pnl: number;
  pnlPct: number;
}

const PHONE_W = 390;
// Original reference image: 1179 × 2556. Crops: top 0-340, bottom 1280-2556.
const SCALE = PHONE_W / 1179;
const TOP_H = Math.round(340 * SCALE); // ~113
const BOT_H = Math.round((2556 - 1280) * SCALE); // ~422
const PHONE_H = Math.round(2556 * SCALE); // ~845

export function IBKRMobile({
  curve,
  duration,
  showPositions,
  positions = [],
  gainColor = "#e02020",
  lossColor = "#089981",
  view = "performance",
  bigFontStack = "'PingFang SC', -apple-system, sans-serif",
}: Props) {
  const periodLabel = DURATION_LABEL[duration] ?? "自始以来";
  const start = curve[0]?.value ?? 0;
  const last = curve[curve.length - 1]?.value ?? 0;
  const totalPct = start === 0 ? 0 : last / start - 1;
  const positive = totalPct >= 0;
  const color = positive ? gainColor : lossColor;

  return (
    <div
      className="bg-white text-black overflow-hidden relative shadow-2xl select-none"
      style={{
        width: PHONE_W,
        minHeight: PHONE_H,
        borderRadius: 44,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'SF Pro Display', sans-serif",
      }}
    >
      <img
        src="/ibkr-top.png"
        alt=""
        width={PHONE_W}
        height={TOP_H}
        draggable={false}
        style={{ display: "block", width: PHONE_W, height: TOP_H }}
      />

      <div
        className="flex flex-col"
        style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5" style={{ fontSize: 21 }}>
            <span
              className={view === "value" ? "text-black" : "text-zinc-400"}
              style={{ fontWeight: view === "value" ? 500 : 400 }}
            >
              价值
            </span>
            <span className="text-zinc-300" style={{ fontSize: 19 }}>
              |
            </span>
            <span
              className={view === "performance" ? "text-black" : "text-zinc-400"}
              style={{ fontWeight: view === "performance" ? 500 : 400 }}
            >
              业绩
            </span>
          </div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.5" stroke="#9a9a9a" strokeWidth="1.4" />
            <path d="M12 10.5v6.5" stroke="#9a9a9a" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="7.5" r="0.9" fill="#9a9a9a" />
          </svg>
        </div>

        {view === "performance" ? (
          <>
            <div
              className="tabular leading-none"
              style={{
                color,
                fontSize: 38,
                fontWeight: 400,
                marginTop: 10,
                letterSpacing: "-0.5px",
                fontFamily: bigFontStack,
              }}
            >
              {formatPct(totalPct, { sign: true })}
            </div>
            <div className="text-zinc-500" style={{ fontSize: 13, marginTop: 8 }}>
              总回报 {periodLabel}
            </div>
          </>
        ) : (
          <>
            <div
              className="tabular leading-none"
              style={{
                fontSize: 38,
                fontWeight: 400,
                marginTop: 10,
                letterSpacing: "-0.5px",
                fontFamily: bigFontStack,
              }}
            >
              {formatCurrency(last)}
            </div>
            <div className="text-zinc-500" style={{ fontSize: 13, marginTop: 8 }}>
              <span className="tabular" style={{ color }}>
                {formatCurrency(last - start, { sign: true })} ({formatPct(totalPct, { sign: true })})
              </span>{" "}
              {periodLabel}
            </div>
          </>
        )}

        <div style={{ marginTop: 6, marginLeft: -8 }}>
          <EquityChart
            curve={curve}
            positive={positive}
            gainColor={gainColor}
            lossColor={lossColor}
            width={PHONE_W - 24}
            height={170}
            axisMode={view === "value" ? "value" : "pct"}
          />
        </div>
      </div>

      <img
        src="/ibkr-bottom.png"
        alt=""
        width={PHONE_W}
        height={BOT_H}
        draggable={false}
        style={{ display: "block", width: PHONE_W, height: BOT_H, marginTop: -4 }}
      />

      {showPositions && positions.length > 0 && (
        <div
          className="absolute right-3 top-3 bg-white/95 rounded-xl shadow-lg p-3 backdrop-blur"
          style={{ width: 160, fontSize: 11 }}
        >
          <div className="text-zinc-500 uppercase tracking-wide pb-1.5 text-[10px] font-medium">
            持仓
          </div>
          {positions.slice(0, 4).map((p) => (
            <div key={p.symbol} className="flex items-center justify-between py-0.5">
              <span className="font-semibold">{p.symbol}</span>
              <span
                className="tabular font-medium"
                style={{ color: p.pnl >= 0 ? gainColor : lossColor }}
              >
                {formatPct(p.pnlPct, { sign: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
