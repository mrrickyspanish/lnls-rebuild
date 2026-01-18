"use client";

import { Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LikeButtonProps = {
  slug: string;
  initialLikes: number;
  className?: string;
};

export default function LikeButton({ slug, initialLikes, className = "" }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasCheckedLocalStorage = useRef(false);

  // Check if user has already liked this article
  useEffect(() => {
    if (hasCheckedLocalStorage.current) return;
    hasCheckedLocalStorage.current = true;

    const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '{}');
    if (likedArticles[slug]) {
      setIsLiked(true);
    }
  }, [slug]);

  const handleLike = async () => {
    if (isAnimating) return; // Prevent rapid clicks

    const wasLiked = isLiked;
    const delta = wasLiked ? -1 : 1;

    // Optimistic update
    setIsLiked(!wasLiked);
    setLikes(prev => prev + delta);
    setIsAnimating(true);

    try {
      const response = await fetch(`/api/articles/${slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ like: !wasLiked }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const data = await response.json();

      // Update localStorage
      const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '{}');
      if (!wasLiked) {
        likedArticles[slug] = Date.now();
      } else {
        delete likedArticles[slug];
      }
      localStorage.setItem('likedArticles', JSON.stringify(likedArticles));

      // Update with server count (in case of race conditions)
      if (typeof data.likes === 'number') {
        setLikes(data.likes);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setIsLiked(wasLiked);
      setLikes(prev => prev - delta);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isAnimating}
      className={`group flex items-center gap-2 transition-all ${className}`}
      aria-label={isLiked ? 'Unlike article' : 'Like article'}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <Heart
          className={`w-5 h-5 transition-all ${
            isLiked
              ? 'fill-red-500 text-red-500'
              : 'text-white group-hover:text-red-400'
          }`}
        />
        
        {/* Particle animation on like */}
        <AnimatePresence>
          {isAnimating && !isLiked === false && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-400 rounded-full"
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI) / 3) * 20,
                    y: Math.sin((i * Math.PI) / 3) * 20,
                  }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>
      
      <span className="text-sm font-medium text-white">
        {likes.toLocaleString()}
      </span>
    </button>
  );
}
