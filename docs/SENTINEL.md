# MOTHER Sentinel — crash reporting (Analytics)

Analytics is a **statically exported** app (`next.config` → `output: 'export'`), so
it has **no server runtime** and cannot hold the Sentinel ingest token or run a
same-origin `/api/sentinel/report` relay like the server apps (Creator / Studio
/ Playout / website).

Instead, the branded error boundaries (`app/error.tsx`, `app/global-error.tsx`)
report render crashes **from the browser** to a configurable public collector:

```
Analytics (browser)  ──app.crash──►  NEXT_PUBLIC_SENTINEL_REPORT_URL
  error boundaries                (a sibling app's POST /api/sentinel/report)
                                         │ holds SENTINEL_INGEST_TOKEN server-side
                                         ▼
                                   MOTHER Sentinel gateway → command centre
```

- **Token-safe.** The ingest token is **never** in this static bundle. It lives
  only on the collector's server, which forwards to the Sentinel gateway.
- **Inert until configured.** With `NEXT_PUBLIC_SENTINEL_REPORT_URL` unset,
  `reportClientCrash` is a no-op — nothing is sent.
- **Origin.** The payload includes `app: "intuitv-analytics"` and the crash `url`,
  so crashes are attributable to Analytics even though they ingest via a sibling
  collector.

Point `NEXT_PUBLIC_SENTINEL_REPORT_URL` at any deployed sibling relay, e.g.
`https://intuitv.app/api/sentinel/report`.
