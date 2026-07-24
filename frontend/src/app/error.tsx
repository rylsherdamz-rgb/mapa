"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-black font-mono">
      <div className="text-red-400 text-xs tracking-widest uppercase">System Error</div>
      <h1 className="text-white text-lg font-bold">Something went wrong</h1>
      <p className="text-white/30 text-xs max-w-md text-center">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-xs tracking-wider rounded hover:bg-white/10 transition-all"
      >
        Try Again
      </button>
    </div>
  );
}
