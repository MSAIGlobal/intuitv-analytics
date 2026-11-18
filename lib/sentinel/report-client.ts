"use client";

// Browser-side crash relay for the statically-exported Analytics app
// (next.config `output: 'export'`). There is no server runtime here, so a
// render crash is reported directly to a configurable public collector — the
// MOTHER Sentinel server relay hosted by a sibling app (e.g. the website or
// Creator `POST /api/sentinel/report`), set via NEXT_PUBLIC_SENTINEL_REPORT_URL.
//
// The ingest token is NEVER in this bundle — it lives only on the collector's
// server, which forwards to the Sentinel gateway. Inert (no-op) until the URL
// is configured. Best-effort and silent: reporting a crash must never throw.

const COLLECTOR = (process.env.NEXT_PUBLIC_SENTINEL_REPORT_URL || "").trim();
const APP = "intuitv-analytics";

export function reportClientCrash(
  error: (Error & { digest?: string }) | undefined,
  kind: "route" | "global",
): void {
  try {
    if (!COLLECTOR) return;
    const body = JSON.stringify({
      // `app` identifies the origin for collectors that record it; the current
      // relay also captures `url`, which carries the Watch domain regardless.
      app: APP,
      source: APP,
      kind,
      message: error?.message || "Unknown error",
      stack: error?.stack || "",
      digest: error?.digest || "",
      url: typeof location !== "undefined" ? location.href : "",
      ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
    });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      // Simple no-cors beacon — works cross-origin, fire-and-forget.
      navigator.sendBeacon(COLLECTOR, new Blob([body], { type: "application/json" }));
    } else {
      void fetch(COLLECTOR, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
        mode: "no-cors",
      }).catch(() => {});
    }
  } catch {
    /* never throw from a crash reporter */
  }
}
