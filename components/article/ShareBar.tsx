"use client";

import { Twitter, Facebook, Link2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import LikeButton from './LikeButton';

type ShareBarProps = {
  url: string;
  title: string;
  slug: string;
  initialLikes: number;
};

/**
 * One bar, two layouts (see .tdd-share in globals.css): a row above the text
 * on phones and tablets, and a sticky rail in the margin beside the text
 * column on desktop. The old bar was position: fixed at every width, so on a
 * phone it floated over the article text and on desktop over the hero.
 */
export default function ShareBar({ url, title, slug, initialLikes }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [covered, setCovered] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // On desktop the rail is sticky in the margin, and a full-width image is
  // wide enough to pass behind it. Hide the rail while one does.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      if (getComputedStyle(bar).position !== 'sticky') {
        setCovered(false);
        return;
      }
      const rail = bar.getBoundingClientRect();
      const images = document.querySelectorAll('.tdd-figure[data-size="full"] img');
      setCovered(
        Array.from(images).some((img) => {
          const box = img.getBoundingClientRect();
          return box.top < rail.bottom && box.bottom > rail.top && box.left < rail.right && box.right > rail.left;
        })
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank');
  };

  return (
    <div ref={barRef} className={`tdd-share${covered ? ' is-covered' : ''}`} aria-label="Like and share">
      <LikeButton slug={slug} initialLikes={initialLikes} className="tdd-share-btn tdd-share-like" />

      <button onClick={shareToTwitter} className="tdd-share-btn" aria-label="Share on X">
        <Twitter className="w-5 h-5" />
      </button>

      <button onClick={shareToFacebook} className="tdd-share-btn" aria-label="Share on Facebook">
        <Facebook className="w-5 h-5" />
      </button>

      <button onClick={handleCopyLink} className="tdd-share-btn" aria-label="Copy link">
        <Link2 className="w-5 h-5" />
        <span className="tdd-share-copied" role="status">{copied ? 'Link copied' : ''}</span>
      </button>
    </div>
  );
}
