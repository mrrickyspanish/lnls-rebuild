import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getYouTubeVideoBySlug, incrementVideoViews } from "@/lib/supabase/videos";
import VideoModal from "@/components/video/VideoModal";
import type { YouTubeVideoRow } from "@/types/supabase";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const video: YouTubeVideoRow | null = await getYouTubeVideoBySlug(slug);
  if (!video) return { title: "Video not found" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://lnls.media";
  const url = `${siteUrl.replace(/\/$/, "")}/videos/${slug}`;
  const image = video.thumbnail_url || "https://lnls.media/uploads/articles/dribbles_og_2024.png";
  return {
    title: video.title,
    description: video.description || "LNLS video",
    openGraph: {
      title: video.title,
      description: video.description || "LNLS video",
      url,
      type: "video.other",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description: video.description || "LNLS video",
      images: [image],
    },
  };
}

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video: YouTubeVideoRow | null = await getYouTubeVideoBySlug(slug);
  if (!video) return notFound();
  // Increment view count (fire and forget)
  incrementVideoViews(slug).catch(err =>
    console.error('Failed to track video view:', err)
  );

  // Handler for closing the modal (for now, just go back)
  const handleClose = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <main className="min-h-screen bg-[var(--netflix-bg)] pb-8 pt-[140px] md:pt-[180px]">
      <VideoModal videoId={video.video_id} onClose={handleClose} />
      {/* Add more video details and related videos here if needed */}
    </main>
  );
}
