import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Late Night Lake Show',
  description: 'Learn about LNLS - where Lakers fans stay up talking ball. Our mission, team, and how to get in touch.',
  openGraph: {
    title: 'About LNLS - Late Night Lake Show',
    description: 'Where Lakers fans stay up talking ball',
    type: 'website',
  },
};

const team = [
  {
    name: 'Founder Name',
    role: 'Creator & Host',
    bio: 'Lakers lifer. Been covering the team since [year]. Believes basketball is best discussed after midnight.',
    image: '/team/founder.jpg', // Placeholder
    social: {
      twitter: 'https://twitter.com/username',
      instagram: 'https://instagram.com/username',
    },
  },
  // Add more team members as needed
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Where Lakers Fans Stay Up{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
                Talking Ball
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Late Night Lake Show is a full-scale content house built by and for basketball lifers. 
              We blend culture, creativity, and analytics through the lens of the Los Angeles Lakers and the NBA at large.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-white mb-2">Our Mission</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-amber-400"></div>
            </div>
            <div className="space-y-4 text-lg text-slate-300">
              <p>
                LNLS isn't just another Lakers podcast. We're building a modern media hub that powers:
              </p>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Daily NBA and Lakers news powered by AI and editorial commentary</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Authentic fan storytelling and culture coverage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Multi-format content that travels across every platform</span>
                </li>
              </ul>
              <p>
                Think The Ringer or Bleacher Report energy, but community-owned and driven by the LNLS voice. 
                Equal parts data, banter, and design.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-purple-500/20 rounded-xl p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">5+</div>
              <div className="text-slate-400">Years Covering Lakers</div>
            </div>
            <div className="bg-slate-900 border border-purple-500/20 rounded-xl p-6">
              <div className="text-4xl font-bold text-amber-400 mb-2">200+</div>
              <div className="text-slate-400">Episodes Published</div>
            </div>
            <div className="bg-slate-900 border border-purple-500/20 rounded-xl p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">50K+</div>
              <div className="text-slate-400">Monthly Listeners</div>
            </div>
            <div className="bg-slate-900 border border-purple-500/20 rounded-xl p-6">
              <div className="text-4xl font-bold text-amber-400 mb-2">24/7</div>
              <div className="text-slate-400">Lakers Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Cover */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-2">What We Cover</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-amber-400 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Game Analysis</h3>
              <p className="text-slate-400">
                Deep dives into Lakers games, player performance, and tactical breakdowns that go beyond the box score.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Breaking News</h3>
              <p className="text-slate-400">
                Real-time reactions to trades, injuries, signings, and all the chaos that comes with being a Lakers fan.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Culture & Community</h3>
              <p className="text-slate-400">
                Stories about Lakers fandom, player culture, and what it means to bleed purple and gold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">The Team</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-amber-400 mx-auto"></div>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Basketball lifers, content creators, and Lakers fanatics who live for the game.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.name} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
              <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-purple-400">
                {member.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-1">{member.name}</h3>
              <p className="text-purple-400 text-center text-sm font-semibold mb-4">{member.role}</p>
              <p className="text-slate-400 text-center mb-4">{member.bio}</p>
              <div className="flex justify-center gap-4">
                {member.social.twitter && (
                  <a
                    href={member.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-purple-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                {member.social.instagram && (
                  <a
                    href={member.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-purple-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Advertise */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-2">Get In Touch</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-amber-400 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">General Inquiries</h3>
              <p className="text-slate-400 mb-4">
                Questions, feedback, or just want to talk Lakers?
              </p>
              <a
                href="mailto:hello@lnls.media"
                className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
              >
                Email Us
              </a>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Advertising & Partnerships</h3>
              <p className="text-slate-400 mb-4">
                Interested in sponsoring or collaborating?
              </p>
              <a
                href="mailto:advertise@lnls.media"
                className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                Partner With Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-900/30 to-amber-900/30 border border-purple-500/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay in the Loop
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Get the latest Lakers news, episode drops, and exclusive content delivered to your inbox.
          </p>
          <a
            href="/subscribe"
            className="inline-block px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors text-lg"
          >
            Subscribe to Newsletter
          </a>
        </div>
      </section>
    </div>
  );
}
