"use client";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(60%_120%_at_50%_-10%,rgba(255,255,255,0.1),rgba(0,0,0,0)_60%)] p-6 sm:p-10 mb-8">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Late Night Lake Show</p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold leading-tight">
          A modern hub for Lakers, NBA, tech & entertainment.
        </h1>
        <p className="mt-3 text-white/70">
          Clean. Fast. On-brand. Mixed-content feed with real-time ingest.
        </p>
      </div>
    </section>
  );
}
