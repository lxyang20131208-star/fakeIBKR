"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controls, State, BIG_FONTS } from "@/components/Controls";
import { IBKRMobile, Position } from "@/components/IBKRMobile";
import { QQQPoint, durationToWindow, generateCurve } from "@/lib/algo";

const DEFAULT_STATE: State = {
  startCapital: 100000,
  targetReturnPct: 1000,
  duration: "ALL",
  showPositions: false,
  noiseSigma: 0.0025,
  seed: 42,
  view: "performance",
  gainConvention: "rh",
  bigFont: "pingfang",
};

const DEFAULT_POSITIONS: Position[] = [
  { symbol: "NVDA", qty: 1240, marketValue: 980000, pnl: 312000, pnlPct: 0.46 },
  { symbol: "TSLA", qty: 820, marketValue: 740000, pnl: 198000, pnlPct: 0.36 },
  { symbol: "PLTR", qty: 4500, marketValue: 410000, pnl: 142000, pnlPct: 0.53 },
  { symbol: "MSTR", qty: 320, marketValue: 280000, pnl: 89000, pnlPct: 0.47 },
];

export default function Page() {
  const [qqq, setQqq] = useState<QQQPoint[] | null>(null);
  const [state, setStateRaw] = useState<State>(DEFAULT_STATE);
  const [exporting, setExporting] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const setState = (patch: Partial<State>) => setStateRaw((s) => ({ ...s, ...patch }));

  useEffect(() => {
    fetch("/qqq.json")
      .then((r) => r.json())
      .then((d: QQQPoint[]) => setQqq(d))
      .catch(() => setQqq([]));
  }, []);

  const curve = useMemo(() => {
    if (!qqq || qqq.length === 0) return [];
    const window = durationToWindow(qqq, state.duration);
    return generateCurve({
      window,
      startCapital: state.startCapital,
      targetReturnPct: state.targetReturnPct,
      noiseSigma: state.noiseSigma,
      seed: state.seed,
    });
  }, [qqq, state.duration, state.startCapital, state.targetReturnPct, state.noiseSigma, state.seed]);

  const gainColor = state.gainConvention === "rh" ? "#e02020" : "#089981";
  const lossColor = state.gainConvention === "rh" ? "#089981" : "#e02020";

  const onExport = async () => {
    if (!stageRef.current) return;
    setExporting(true);
    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(stageRef.current, {
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      if (!blob) throw new Error("toBlob returned null");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ibkr-${state.targetReturnPct}pct-${state.duration}.png`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
      alert("Export failed: " + (e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row gap-12 p-6 lg:p-12">
      <div className="flex-shrink-0">
        <Controls state={state} setState={setState} onExport={onExport} exporting={exporting} />
      </div>

      <div className="flex-1 flex items-start justify-center">
        <div ref={stageRef} className="p-6">
          {qqq === null ? (
            <div className="w-[390px] h-[844px] bg-white rounded-[44px] flex items-center justify-center text-zinc-500">
              Loading QQQ…
            </div>
          ) : (
            <IBKRMobile
              curve={curve}
              duration={state.duration}
              showPositions={state.showPositions}
              positions={DEFAULT_POSITIONS}
              gainColor={gainColor}
              lossColor={lossColor}
              view={state.view}
              bigFontStack={
                BIG_FONTS.find((f) => f.key === state.bigFont)?.stack ??
                "'PingFang SC', sans-serif"
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}
