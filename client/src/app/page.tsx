"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/api/api-client";

export default function Home() {
  const [result, setResult] = useState("Testing API...");
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient("/reports/dashboard")
      .then((data) => {
        setResult(JSON.stringify(data, null, 2));
      })
      .catch((err) => {
        setError(err.message);
        setResult("");
      });
  }, []);

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-2xl font-bold">
        API Connection Test
      </h1>

      {result && (
        <pre className="mt-6 rounded-lg bg-gray-100 p-6">
          {result}
        </pre>
      )}

      {error && (
        <p className="mt-6 text-red-600">
          API Error: {error}
        </p>
      )}
    </main>
  );
}
