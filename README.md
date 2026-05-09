# fakeIBKR

> Fake-it-till-you-make-it for investment influencers.

Generate IBKR Mobile-style portfolio screenshots with a custom return number. Curve shape is scaled from real QQQ daily history, so it inherits actual market drawdowns instead of looking synthetic — only the magnitude is yours.

For memes, UI demos, and "what if I had perfect timing" thought experiments. **Not for misleading anyone.**

---

## What it does

- Pick a starting capital, a target return %, and a time window (1W → ALL)
- The chart curve takes QQQ's daily log returns over that window and scales each by a constant `k` so the cumulative product hits your target — drawdowns and volatility shape stay intact
- Top of the phone (status bar + InteractiveBrokers header) and bottom (period tabs + action pills + AI news + bottom nav) come straight from a real IBKR Mobile screenshot, so they're pixel-perfect
- Middle (价值/业绩 toggle, big number, subtitle, equity curve) is dynamic React + SVG
- Two display modes: **业绩** (% return) and **价值** ($ NetLiq), with the chart's y-axis switching between % and dollar amounts
- Period subtitle is dynamic — "总回报 过去1周", "总回报 本月迄今", "总回报 自始以来", etc.
- Color convention switches between 红涨绿跌 (Chinese) and 绿涨红跌 (Western)
- One click PNG export at 3× retina

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- QQQ daily closes baked from Yahoo Finance chart API into `public/qqq.json` (~16 years, ~4100 points)
- `html-to-image` for PNG export
- Pure-SVG chart, no recharts

## Local dev

```bash
git clone https://github.com/<your-user>/fakeIBKR.git
cd fakeIBKR
npm install
npm run dev
# open http://localhost:3010
```

## Refresh QQQ data

```bash
NOW=$(date +%s)
curl -s "https://query1.finance.yahoo.com/v8/finance/chart/QQQ?period1=1262304000&period2=$NOW&interval=1d" \
  -A "Mozilla/5.0" -o /tmp/qqq.json
node -e "
  const d = JSON.parse(require('fs').readFileSync('/tmp/qqq.json','utf8')).chart.result[0];
  const closes = d.indicators.adjclose ? d.indicators.adjclose[0].adjclose : d.indicators.quote[0].close;
  const out = d.timestamp.map((t,i) => closes[i] == null ? null :
    [new Date(t*1000).toISOString().slice(0,10), Math.round(closes[i]*100)/100]
  ).filter(Boolean);
  require('fs').writeFileSync('public/qqq.json', JSON.stringify(out));
  console.log('points:', out.length);
"
```

## Deploy

Vercel — zero config. `vercel deploy` from project root.

## How the algorithm works

In log-return space:

```
target_log     = log(1 + targetReturn / 100)
qqq_log[i]     = log(close[i] / close[i-1])
k              = target_log / sum(qqq_log)
scaled_log[i]  = k * qqq_log[i] + N(0, σ)        # σ small, mean-recentered
equity[i]      = startCapital * exp(cumsum(scaled_log[..i]))
```

Result: same regimes (2022 drawdown, 2024 rally, etc.) just steeper or shallower.

## Disclaimer

This is a parody / UI demo tool. Brokerage screenshots have been used in fraud (pump-and-dump, "guru" subscription scams, romance scams, fake "proof of funds"), and that's not what this is for. Don't use generated images to:

- Make real investment claims
- Solicit money based on fabricated track records
- Mislead lenders, partners, or platforms
- Create fake "proof of funds"

Not affiliated with, endorsed by, or connected to Interactive Brokers Group, Inc. "Interactive Brokers" and the IBKR logo are trademarks of their respective owners. The reference UI elements are used here for satire/parody under fair use principles, in the same vein as FakeMRR (Stripe), Flex Stripe, etc.

## License

MIT — see [LICENSE](./LICENSE).
