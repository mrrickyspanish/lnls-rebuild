export const metadata = {
  title: 'Contact | Late Night Lake Show',
  description: 'Get in touch with the LNLS team.',
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-[30px] md:pt-[180px] pb-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 font-netflix">
        Contact Us
      </h1>
      <div className="space-y-6 text-white/80">
        <p>Have a story tip, feedback, or just want to say hey?</p>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Email</h2>
          <a
            href="mailto:contact@latenight.com"
            className="text-[var(--netflix-red)] hover:underline"
          >
            contact@latenight.com
          </a>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Social Media</h2>
          <p className="text-sm text-white/60 mb-3">
            DM us on any platform:
          </p>
          <ul className="space-y-2 text-sm">
            <li>Twitter: <a href="https://twitter.com/lnlssports" className="text-[var(--netflix-red)] hover:underline">@lnlssports</a></li>
            <li>Instagram: <a href="https://instagram.com/lnlssports" className="text-[var(--netflix-red)] hover:underline">@lnlssports</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
