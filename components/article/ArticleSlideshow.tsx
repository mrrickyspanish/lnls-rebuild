// components/article/ArticleSlideshow.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = {
  image_url: string;
  caption: string;
  description?: string;
};

type SlideshowData = {
  title: string;
  slides: Slide[];
};

export default function ArticleSlideshow({ data }: { data: SlideshowData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % data.slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + data.slides.length) % data.slides.length);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Trigger Card - Shows in article */}
      <div 
        onClick={() => setIsOpen(true)}
        className="my-12 cursor-pointer group"
      >
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
          <img
            src={data.slides[0].image_url}
            alt={data.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-8">
            <div className="flex items-center gap-2 text-[#FF6B35] text-sm font-bold mb-2">
              <span>📸</span>
              <span>{data.slides.length} PHOTOS</span>
            </div>
            
            <h3 className="text-white text-3xl font-bold mb-4">
              {data.title}
            </h3>
            
            <button className="flex items-center gap-2 text-white font-bold bg-[#FF6B35] hover:bg-[#FF6B35]/90 px-6 py-3 rounded-lg transition-colors w-fit">
              <span>VIEW SLIDESHOW</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 z-50 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Counter */}
          <div className="absolute top-6 left-6 z-50 text-white font-bold">
            {currentSlide + 1} / {data.slides.length}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white transition-colors"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          {/* Slide Content */}
          <div className="w-full h-full flex flex-col items-center justify-center px-20 py-20">
            {/* Image */}
            <div className="relative w-full max-w-5xl aspect-[16/9] mb-8">
              <img
                src={data.slides[currentSlide].image_url}
                alt={data.slides[currentSlide].caption}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Caption */}
            <div className="max-w-3xl text-center">
              <h3 className="text-white text-2xl font-bold mb-2">
                {data.slides[currentSlide].caption}
              </h3>
              {data.slides[currentSlide].description && (
                <p className="text-white/70 text-lg">
                  {data.slides[currentSlide].description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
