"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "articles" | "episodes">("all");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      performSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // TODO: wire real search API
      setResults([]);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const filteredResults = results.filter((result) => {
    if (activeTab === "all") return true;
    return result.type === activeTab.slice(0, -1);
  });

  return (
    <>
      {/* Header + form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, episodes, topics..."
            className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results header */}
      {query && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-slate-400">
            {loading ? "Searching..." : `${filteredResults.length} results found`}
          </p>
        </div>
      )}

      {/* Tabs */}
      {query && results.length > 0 && (
        <div className="flex gap-2 mb-8 border-b border-slate-800">
          {(["all", "articles", "episodes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === tab ? "text-purple-400" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "all" ? "All Results" : tab[0].toUpperCase() + tab.slice(1)}
              {tab !== "all" && (
                <span className="ml-2 text-xs text-slate-500">
                  ({results.filter((r) => r.type === tab.slice(0, -1)).length})
                </span>
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingState />
      ) : filteredResults.length > 0 ? (
        <div className="space-y-6">
          {filteredResults.map((result) => (
            <SearchResultCard key={result.id} result={result} />
          ))}
        </div>
      ) : query ? (
        <EmptyState query={query} />
      ) : (
        <InitialState />
      )}
    </>
  );
}

function SearchResultCard({ result }: { result: any }) {
  const isArticle = result.type === "article";
  const href = isArticle ? `/news/${result.slug}` : `/podcast/${result.slug}`;
  return (
    <Link
      href={href}
      className="block bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors group"
    >
      <div className="flex items-start gap-4">
        {result.image && (
          <div className="flex-shrink-0 w-32 h-32 bg-slate-800 rounded-lg overflow-hidden">
            <img
              src={result.image}
              alt={result.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${
                isArticle ? "bg-purple-500/20 text-purple-400" : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {isArticle ? "Article" : "Episode"}
            </span>
            {result.category && <span className="text-slate-500 text-sm">in {result.category}</span>}
          </div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
            {result.title}
          </h2>
          {result.excerpt && <p className="text-slate-400 mb-3 line-clamp-2">{result.excerpt}</p>}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {result.author && <span>By {result.author}</span>}
            {result.publishedAt && (
              <>
                <span>•</span>
                <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
              </>
            )}
            {result.readTime && (
              <>
                <span>•</span>
                <span>{result.readTime} min read</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-32 h-32 bg-slate-800 rounded-lg"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-800 rounded w-20"></div>
              <div className="h-6 bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        We couldn't find anything matching "{query}". Try different keywords or check out our latest content.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/news" className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors">
          Browse Articles
        </Link>
        <Link href="/podcast" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors">
          Browse Episodes
        </Link>
      </div>
    </div>
  );
}

function InitialState() {
  const popularSearches = ["LeBron James", "Anthony Davis", "Trade Rumors", "Playoff Analysis", "Lakers News", "NBA Draft"];
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-white mb-3">Search LNLS Content</h3>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">Find articles, episodes, and analysis across all Lakers and NBA coverage.</p>
      <div className="max-w-2xl mx-auto">
        <h4 className="text-sm font-semibold text-slate-400 mb-3">Popular Searches</h4>
        <div className="flex flex-wrap gap-2 justify-center">
          {popularSearches.map((s) => (
            <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-sm">
              {s}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
