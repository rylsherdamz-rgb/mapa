"use client";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans bg-black min-h-screen flex flex-col items-center justify-center gap-4 p-6 font-mono">
        <div className="text-red-400 text-xs tracking-widest uppercase">Fatal Error</div>
        <h1 className="text-white text-lg font-bold">Application crashed</h1>
        <p className="text-white/30 text-xs max-w-md text-center">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-xs tracking-wider rounded hover:bg-white/10 transition-all"
        >
          Reload
        </button>
      </body>
    </html>
  );
}
