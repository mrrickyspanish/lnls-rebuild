"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Example slides data (replace with dynamic data as needed)
const slides = [
  {
    image: '/uploads/articles/dribbles_article_kwame_christmas.png',
    category: 'Purple & Gold',
    title: 'Christmas Delivered.',
    subhead: 'Kwame Christmas and LeBron headline a holiday masterpiece — instant reaction and breakdown.',
    cta: 'Read Now',
    href: '#',
  },
  {
    image: '/uploads/articles/lebron-james-the-daily-dribble.jpeg',
    category: 'The Culture',
    title: 'The King in Gotham',
    subhead: 'LeBron James takes over New York — courtside moments and tunnel fits.',
    cta: 'See the List',
    href: '#',
  },
  {
    image: '/uploads/articles/underrecruited_tb.jpg',
    category: 'Tech & Innovation',
    title: 'Underrecruited: The Data Story',
    subhead: 'How analytics and AI are changing the recruiting game.',
    cta: 'Dive In',
    href: '#',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = React.useState(0);
  const slideCount = slides.length;

  // Auto-advance
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slideCount);
    }, 8000);
    return () => clearTimeout(timer);
  }, [current, slideCount]);

  return (
    <section className="relative h-[100vh] min-h-[600px] overflow-hidden">
      {slides.map((slide, idx) => (
        <motion.div
          key={slide.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: idx === current ? 1 : 0 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 w-full h-full ${idx === current ? 'z-10' : 'z-0 pointer-events-none'}`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={idx === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          <div className="relative z-20 max-w-[1400px] mx-auto px-8 pt-32 flex flex-col h-full justify-center">
            <span className="category-tag inline-block bg-purple-900/90 text-yellow-400 px-4 py-2 text-sm font-semibold uppercase rounded mb-6">
              {slide.category}
            </span>
            <h1 className="hero-title font-playfair text-white text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              {slide.title}
            </h1>
            <p className="hero-subhead text-lg md:text-2xl max-w-xl opacity-90 leading-relaxed mb-8">
              {slide.subhead}
            </p>
            <a href={slide.href} className="cta-button inline-block bg-yellow-400 text-black px-8 py-4 font-bold uppercase tracking-wide rounded transition hover:bg-white hover:-translate-y-1">
              {slide.cta}
            </a>
          </div>
        </motion.div>
      ))}
      {/* Navigation Arrows */}
      <button
        aria-label="Previous Slide"
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white text-3xl"
        onClick={() => setCurrent((current - 1 + slideCount) % slideCount)}
      >
        &#8592;
      </button>
      <button
        aria-label="Next Slide"
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white text-3xl"
        onClick={() => setCurrent((current + 1) % slideCount)}
      >
        &#8594;
      </button>
    </section>
  );
}
