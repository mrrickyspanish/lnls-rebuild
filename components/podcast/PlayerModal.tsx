"use client";
import { useState } from "react";

export default function PlayerModal({
  url,
  trigger,
}: {
  url: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // Map Apple Podcasts page → embeddable URL
  const toAppleEmbed = (href: string) =>
    href.includes("podcasts.apple.com")
      ? href.replace("https://podcasts.apple.com", "https://embed.podcasts.apple.com")
      : href;

  // You can add Spreaker/Spotify mapping here if you prefer their embeds.
  const toEmbed = (href: string) => toAppleEmbed(href);

  const onOpen: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation(); // prevent parent <Link> navigation
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs md:text-sm bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20"
      >
        {trigger}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={toEmbed(url)}
              className="w-full h-full"
              allow="autoplay; encrypted-media;"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </>
  );
}
