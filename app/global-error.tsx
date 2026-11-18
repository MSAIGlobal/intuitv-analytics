"use client";

// Root error boundary. Catches errors thrown in the root layout itself, where
// `error.tsx` cannot help — so it must render its own <html>/<body>. Reports
// the crash to MOTHER Sentinel via the same-origin relay.

import { useEffect } from "react";
import { reportClientCrash } from "@/lib/sentinel/report-client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientCrash(error, "global");
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#171819",
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <div
            aria-hidden
            style={{
              width: 44,
              height: 44,
              margin: "0 auto 16px",
              borderRadius: 10,
              background: "#DFFF00",
            }}
          />
          <h1
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              fontSize: 28,
              margin: "0 0 8px",
            }}
          >
            Something broke
          </h1>
          <p style={{ color: "#A9AAAD", fontSize: 14, margin: "0 0 20px" }}>
            IntuiTV hit an unexpected error. It has been reported — you can
            reload.
            {error?.digest ? <> Ref {error.digest}</> : null}
          </p>
          <button
            onClick={reset}
            style={{
              background: "#DFFF00",
              color: "#171819",
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
