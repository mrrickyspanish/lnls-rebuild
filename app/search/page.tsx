import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "./search-client";

export const metadata: Metadata = {
  title: "Search",
  description: "Search LNLS articles, videos, and podcasts.",
};

// this page depends on client router state
export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <section className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* The input lives in the client component below */}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<p className="text-slate-400">Loading search…</p>}>
          <SearchClient />
        </Suspense>
      </div>
    </div>
  );
}
