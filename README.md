# IntuiTV — Analytics

The IntuiTV analytics dashboard: real-time viewership, engagement, platform and
geographic insight across the estate (viewer, creator and studio), plus GPU /
system health. Built for operators and creators to see how content performs.

## Stack

- **Next.js 14** (App Router) · **React 18** · **TypeScript**
- **Recharts** for charts · **lucide-react** for icons · **axios** for the API client
- **Tailwind CSS** — the "BUILT DIFFERENT" brand palette (neon lime on ink)

## Data source

All panels read from the platform analytics API via
`lib/analyticsClient.ts` (axios), base URL `NEXT_PUBLIC_API_URL`
(default `https://api.intuitv.app`). A `Bearer` token from
`localStorage.auth_token` is attached when present.

| Concern | Endpoint (relative to API base) |
|---|---|
| KPIs (views, unique viewers, watch hours, avg session, live now) | `/api/analytics/overview` |
| Viewership time-series | `/api/analytics/timeseries` |
| Channel rankings | `/api/analytics/channels` |
| Platform / device breakdown | `/api/analytics/platforms` |
| Geographic breakdown (+ states) | `/api/analytics/geo`, `/api/analytics/geo/states` |
| Viewer behaviour | `/api/analytics/behavior` |
| Creator analytics | `/api/analytics/creators` |
| Studio analytics | `/api/analytics/studios` |
| Support tickets | `/api/support/tickets` |

Timeframes: **24h / 7d / 30d / 90d**. Real-time panels poll on a short
interval. When the API is unreachable, panels render their empty/zero states
rather than fabricated numbers.

## Components

`KPIStrip`, `TimeSeriesCharts`, `RealTimeMetrics`, `EngagementCharts`,
`ChannelRankings`, `ContentPerformance`, `PlatformDeviceBreakdown`,
`GeographicAnalytics`, `ViewerBehavior`, `CreatorStudioAnalytics`,
`GlobalFilters`, `SupportTicketModal`.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm run type-check   # tsc --noEmit
npm run lint
```

### Environment

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.intuitv.app` | Analytics + metrics API base |

## Deploy

Deployed via the MSAI Cloud Portal redeploy webhook
(`.github/workflows/redeploy-via-msai.yml`) → Netlify. The analytics API it
reads from is served by the platform backend, not this repo.
