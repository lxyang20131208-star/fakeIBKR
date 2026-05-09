"use client";

const DURATIONS = [
  { key: "1W", label: "1周" },
  { key: "MTD", label: "本月迄今" },
  { key: "1M", label: "1个月" },
  { key: "3M", label: "3个月" },
  { key: "YTD", label: "本年迄今" },
  { key: "1Y", label: "1年" },
  { key: "3Y", label: "3年" },
  { key: "5Y", label: "5年" },
  { key: "ALL", label: "全部" },
] as const;

const PRESETS = [10, 50, 200, 500, 1000, 2500, 10000];

export interface State {
  startCapital: number;
  targetReturnPct: number;
  duration: string;
  showPositions: boolean;
  noiseSigma: number;
  seed: number;
  view: "performance" | "value";
  gainConvention: "rh" | "ch"; // rh = red gain (Chinese) / ch = green gain (Western)
  bigFont: string;
}

export const BIG_FONTS = [
  { key: "pingfang", label: "PingFang SC", stack: "'PingFang SC', -apple-system, sans-serif" },
  { key: "din-alt", label: "DIN Alternate", stack: "'DIN Alternate', 'PingFang SC', sans-serif" },
  { key: "din-cond", label: "DIN Condensed", stack: "'DIN Condensed', 'DIN Alternate', sans-serif" },
  { key: "helvetica", label: "Helvetica Neue", stack: "'Helvetica Neue', Helvetica, sans-serif" },
  { key: "sf-pro", label: "SF Pro Display", stack: "-apple-system, BlinkMacSystemFont, sans-serif" },
  { key: "avenir", label: "Avenir Next", stack: "'Avenir Next', Avenir, sans-serif" },
];

export function Controls({
  state,
  setState,
  onExport,
  exporting,
}: {
  state: State;
  setState: (patch: Partial<State>) => void;
  onExport: () => void;
  exporting: boolean;
}) {
  return (
    <div className="w-full max-w-sm space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Fake IBKR</h1>
        <p className="text-sm text-zinc-400 mt-1">
          QQQ 形状缩放 · 生成 IBKR Mobile 截图
        </p>
      </div>

      <Field label="起始资金">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">$</span>
          <input
            type="number"
            value={state.startCapital}
            onChange={(e) => setState({ startCapital: Math.max(0, +e.target.value) })}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white tabular focus:outline-none focus:border-ibkr-orange"
          />
        </div>
      </Field>

      <Field label={`目标收益: ${state.targetReturnPct.toLocaleString()}%`}>
        <input
          type="range"
          min={-50}
          max={10000}
          step={10}
          value={state.targetReturnPct}
          onChange={(e) => setState({ targetReturnPct: +e.target.value })}
          className="w-full accent-ibkr-orange"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setState({ targetReturnPct: p })}
              className={`px-2.5 py-1 text-xs rounded-md tabular ${
                state.targetReturnPct === p
                  ? "bg-ibkr-orange text-black font-medium"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
        <input
          type="number"
          value={state.targetReturnPct}
          onChange={(e) => setState({ targetReturnPct: +e.target.value })}
          className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white tabular focus:outline-none focus:border-ibkr-orange"
        />
      </Field>

      <Field label="时间范围">
        <div className="grid grid-cols-3 gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d.key}
              onClick={() => setState({ duration: d.key })}
              className={`py-1.5 text-xs rounded-md ${
                state.duration === d.key
                  ? "bg-ibkr-orange text-black font-medium"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="显示模式">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setState({ view: "performance" })}
            className={`py-1.5 text-xs rounded-md ${
              state.view === "performance"
                ? "bg-ibkr-orange text-black font-medium"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            业绩 (%)
          </button>
          <button
            onClick={() => setState({ view: "value" })}
            className={`py-1.5 text-xs rounded-md ${
              state.view === "value"
                ? "bg-ibkr-orange text-black font-medium"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            价值 ($)
          </button>
        </div>
      </Field>

      <Field label="数字字体">
        <div className="grid grid-cols-2 gap-1.5">
          {BIG_FONTS.map((f) => (
            <button
              key={f.key}
              onClick={() => setState({ bigFont: f.key })}
              className={`py-1.5 text-xs rounded-md ${
                state.bigFont === f.key
                  ? "bg-ibkr-orange text-black font-medium"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
              }`}
              style={{ fontFamily: f.stack }}
            >
              +20.87% · {f.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="涨跌颜色">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setState({ gainConvention: "rh" })}
            className={`py-1.5 text-xs rounded-md ${
              state.gainConvention === "rh"
                ? "bg-ibkr-orange text-black font-medium"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            红涨绿跌
          </button>
          <button
            onClick={() => setState({ gainConvention: "ch" })}
            className={`py-1.5 text-xs rounded-md ${
              state.gainConvention === "ch"
                ? "bg-ibkr-orange text-black font-medium"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            绿涨红跌
          </button>
        </div>
      </Field>

      <Field label={`波动幅度: ${(state.noiseSigma * 100).toFixed(2)}%`}>
        <input
          type="range"
          min={0}
          max={0.01}
          step={0.0005}
          value={state.noiseSigma}
          onChange={(e) => setState({ noiseSigma: +e.target.value })}
          className="w-full accent-ibkr-orange"
        />
      </Field>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={state.showPositions}
            onChange={(e) => setState({ showPositions: e.target.checked })}
            className="accent-ibkr-orange"
          />
          显示持仓
        </label>
        <button
          onClick={() => setState({ seed: Math.floor(Math.random() * 1e6) })}
          className="text-xs text-zinc-400 hover:text-white"
        >
          重摇曲线
        </button>
      </div>

      <button
        onClick={onExport}
        disabled={exporting}
        className="w-full bg-ibkr-orange text-black font-semibold py-3 rounded-md hover:opacity-90 disabled:opacity-50 transition"
      >
        {exporting ? "导出中…" : "下载 PNG"}
      </button>

      <p className="text-[11px] text-zinc-600 leading-relaxed">
        仅供 meme / UI demo 使用。请勿用于误导他人——伪造券商截图曾被用于诈骗，这不是这个工具的用途。
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-zinc-400 uppercase tracking-wide mb-2">{label}</div>
      {children}
    </div>
  );
}
