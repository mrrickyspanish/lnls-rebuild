import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Videos | Late Night Lake Show',
  description: 'Watch the latest Lakers and NBA content from LNLS - full episodes, highlights, and analysis.',
};

export default async function VideosPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <section className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              LNLS <span className="text-purple-400">Videos</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Full episodes, game breakdowns, player analysis, and everything Lakers — all in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Videos coming soon</h3>
          <p className="text-slate-400 mb-6">
            YouTube videos will appear here once the API is connected and synced.
          </p>
        </div>
      </section>
    </div>
  );
}
