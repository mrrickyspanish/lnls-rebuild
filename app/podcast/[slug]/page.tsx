import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} | LNLS Podcast`,
    description: `Listen to episode ${slug} of Late Night Lake Show`,
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-950 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Episode: {slug}</h1>
        <p className="text-slate-400">Content coming soon from Sanity CMS</p>
      </div>
    </div>
  );
}
