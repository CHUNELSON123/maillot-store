"use client";

import { useEffect, useState } from "react";

export function ClientErrorTest() {
  const [error, setError] = useState("");

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(
        event.error?.stack ||
          event.message ||
          "Unknown JavaScript error",
      );
    };

    const handleUnhandledRejection = (
      event: PromiseRejectionEvent,
    ) => {
      const reason = event.reason;

      setError(
        reason instanceof Error
          ? reason.stack || reason.message
          : String(reason),
      );
    };

    window.addEventListener("error", handleError);
    window.addEventListener(
      "unhandledrejection",
      handleUnhandledRejection,
    );

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  if (!error) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-h-64 overflow-auto bg-red-100 p-4 text-xs text-red-900">
      <strong>JavaScript Error:</strong>
      <pre className="mt-2 whitespace-pre-wrap">
        {error}
      </pre>
    </div>
  );
}