export const metadata = {
  title: 'Subscribe | Late Night Lake Show',
  description: 'Subscribe to LNLS newsletter and podcast.',
};

export default function SubscribePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 font-netflix">
        Subscribe
      </h1>
      <p className="text-xl text-white/80 mb-8">
        Never miss a story, episode, or hot take.
      </p>

      {/* Newsletter Form */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Newsletter</h2>
        <p className="text-white/60 mb-6">
          Weekly roundup of Lakers news and analysis.
        </p>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--netflix-red)] focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-[var(--netflix-red)] hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Podcast Links */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Podcast</h2>
        <p className="text-white/60 mb-6">
          Listen on your favorite platform:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <a
            href="#"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-center rounded-lg transition-colors"
          >
            Apple Podcasts
          </a>
          <a
            href="#"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-center rounded-lg transition-colors"
          >
            Spotify
          </a>
          <a
            href="#"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-center rounded-lg transition-colors"
          >
            Google Podcasts
          </a>
          <a
            href="#"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-center rounded-lg transition-colors"
          >
            YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
