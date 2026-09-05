"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with real error reporting (e.g. Sentry) once monitoring is wired up.
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-zinc-500">Please try again.</p>
      <button
        onClick={reset}
        className="rounded-md border border-zinc-300 px-4 py-2"
      >
        Try again
      </button>
    </main>
  );
}
