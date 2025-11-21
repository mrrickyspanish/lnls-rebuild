"use client";

import { Share2, Twitter, Facebook, Link2 } from 'lucide-react';
import { useState } from 'react';

type ShareBarProps = {
  url: string;
  title: string;
};

export default function ShareBar({ url, title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

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
    <div className="fixed bottom-24 right-6 md:right-12 flex flex-col gap-3 z-40">
      <button
        onClick={shareToTwitter}
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-[#1da1f2] transition-colors group"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-5 h-5 text-white" />
      </button>

      <button
        onClick={shareToFacebook}
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-[#4267B2] transition-colors group"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-5 h-5 text-white" />
      </button>

      <button
        onClick={handleCopyLink}
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors relative group"
        aria-label="Copy link"
      >
        <Link2 className="w-5 h-5 text-white" />
        {copied && (
          <span className="absolute -left-20 bg-white text-black text-xs px-2 py-1 rounded whitespace-nowrap">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
}