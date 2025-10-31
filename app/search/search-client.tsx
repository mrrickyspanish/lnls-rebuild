// app/search/search-client.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function SearchClient() {
  const params = useSearchParams();
  const q = useMemo(() => params.get("q")?.trim() ?? "", [params]);

  // TODO: replace with your real search call (Sanity/Algolia/etc.)
  // For now, just show the query the user typed
  return (
    <div className="space-y-4">
      <form action="/search" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search LNLS…"
          className="input flex-1"
          aria-label="Search"
        />
        <button className="btn-primary" type="submit">Search</button>
      </form>

      {q ? (
        <div>
          <p className="text-slate-muted mb-2">Results for “{q}”</p>
          {/* render results here */}
          <div className="text-slate-muted">No index wired yet.</div>
        </div>
      ) : (
        <p className="text-slate-muted">Type a query and hit Enter.</p>
      )}
    </div>
  );
}
