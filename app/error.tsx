"use client";

// Route-segment error boundary. Catches uncaught render errors so a component
// crash shows a branded fallback instead of white-screening, and reports the
// crash to MOTHER Sentinel (via the same-origin server relay).

import { useEffect } from "react";
import { reportClientCrash } from "@/lib/sentinel/report-client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientCrash(error, "route");
  }, [error]);

  return (
    <div
      role="alert"
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        background: "#171819",
        color: "#FFFFFF",
        padding: "24px",
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
            fontFamily: "var(--font-anton), Impact, sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            fontSize: 28,
            margin: "0 0 8px",
          }}
        >
          Something broke
        </h1>
        <p style={{ color: "#A9AAAD", fontSize: 14, margin: "0 0 20px" }}>
          This view hit an unexpected error. It has been reported — you can try
          again.
          {error?.digest ? (
            <>
              {" "}
              <span style={{ color: "#74767A" }}>Ref {error.digest}</span>
            </>
          ) : null}
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
          Try again
        </button>
      </div>
    </div>
  );
}
