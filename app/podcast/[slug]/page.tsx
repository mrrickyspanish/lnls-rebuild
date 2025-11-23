import { Metadata } from 'next';

interface EpisodePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} | TDD Podcast`,
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-950 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Episode: {slug}</h1>
        <p className="text-slate-400">Content coming soon</p>
      </div>
    </div>
  );
}
