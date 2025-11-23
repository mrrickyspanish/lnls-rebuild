"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  heroImage: string;
  imageCredit?: string | null;
  author: { name: string };
  publishedAt: string;
  readTime: number;
  topic: string;
};

type ArticleHeroProps = {
  currentArticle: Article;
  nextArticle: Article | null;
  previewArticle: Article | null;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
}

type ArticleCardProps = {
  article: Article;
  isHero: boolean;
  isClickable: boolean;
};

function ArticleCard({ article, isHero, isClickable }: ArticleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderCard = () => (
    isHero ? (
      <div className="p-1">
        <div className={`relative h-[450px] rounded-lg overflow-hidden bg-[var(--netflix-bg)] shadow-2xl ring-2 ring-white/80 ${
          isHero ? '' : 'opacity-60 hover:opacity-100'
        } transition-opacity cursor-${isClickable ? 'pointer' : 'default'}`}>
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            {article.heroImage ? (
              <>
                <Image
                  src={article.heroImage}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={isHero}
                />
                {article.imageCredit && isHero && (
                  <div className="absolute bottom-3 right-3 z-20">
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                      <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">
                        Photo: {article.imageCredit}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <BookOpen className={`text-white/10 ${isHero ? 'w-32 h-32' : 'w-24 h-24'}`} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>

          {isClickable && !isHero && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <ChevronRight className="w-8 h-8 text-black" />
              </div>
            </motion.div>
          )}

          <div className={`absolute bottom-0 left-0 right-0 ${isHero ? 'p-6' : 'p-4'} space-y-${isHero ? '2' : '1'}`}>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <span>By {article.author.name}</span>
              <span>•</span>
              <span>{formatDate(article.publishedAt)}</span>
              <span>•</span>
              <span>{article.readTime} min</span>
            </div>
            <h3 className={`font-bold text-white leading-tight font-netflix line-clamp-2 ${
              isHero ? 'text-xl md:text-2xl' : 'text-sm md:text-base'
            }`}>
              {article.title}
            </h3>
            {isHero && article.excerpt && (
              <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div
        onMouseEnter={() => isClickable && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative h-[450px] rounded-lg overflow-hidden bg-[var(--netflix-bg)] shadow-2xl ${
          isHero ? '' : 'opacity-60 hover:opacity-100'
        } transition-opacity cursor-${isClickable ? 'pointer' : 'default'}`}
      >
        {article.heroImage ? (
          <Image
            src={article.heroImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={isHero}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <BookOpen className={`text-white/10 ${isHero ? 'w-32 h-32' : 'w-24 h-24'}`} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        {isClickable && !isHero && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <ChevronRight className="w-8 h-8 text-black" />
            </div>
          </motion.div>
        )}
        <div className={`absolute bottom-0 left-0 right-0 ${isHero ? 'p-6' : 'p-4'} space-y-${isHero ? '2' : '1'}`}>
          <div className="flex items-center gap-2 text-xs text-white/80">
            <span>By {article.author.name}</span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span>{article.readTime} min</span>
          </div>
          <h3 className={`font-bold text-white leading-tight font-netflix line-clamp-2 ${
            isHero ? 'text-xl md:text-2xl' : 'text-sm md:text-base'
          }`}>
            {article.title}
          </h3>
          {isHero && article.excerpt && (
            <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>
      </div>
    )
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        width: isHero ? 720 : 300,
        scale: isHero ? 1 : 0.98,
      }}
      transition={{ 
        layout: { 
          duration: 0.7,
          ease: [0.23, 1, 0.32, 1] 
        },
        opacity: { 
          duration: 0.4,
          ease: "easeOut"
        }
      }}
      className="flex-shrink-0 snap-start"
      style={{ 
        zIndex: isHero ? 10 : isClickable ? 5 : 1 
      }}
    >
      {isClickable ? (
        <Link href={`/news/${article.slug}`} className="block">
          {renderCard()}
        </Link>
      ) : (
        renderCard()
      )}
    </motion.div>
  );
}

export default function ArticleHero({ currentArticle, nextArticle, previewArticle }: ArticleHeroProps) {
  return (
    <section className="mb-12 pt-[68px]">
      <div className="max-w-[1920px] mx-auto px-4 md:px-0">
        {/* Desktop: 3 Cards */}
        <div className="hidden md:flex gap-3">
          <ArticleCard
            article={currentArticle}
            isHero={true}
            isClickable={false}
          />
          {nextArticle && (
            <ArticleCard
              article={nextArticle}
              isHero={false}
              isClickable={true}
            />
          )}
          {previewArticle && (
            <ArticleCard
              article={previewArticle}
              isHero={false}
              isClickable={false}
            />
          )}
        </div>

        {/* Mobile: Hero + Next Button */}
        <div className="md:hidden px-2">
          <ArticleCard
            article={currentArticle}
            isHero={true}
            isClickable={false}
          />
          
          {nextArticle && (
            <Link
              href={`/news/${nextArticle.slug}`}
              className="mt-4 flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors mx-2"
            >
              <div className="flex-1">
                <p className="text-xs text-white/60 mb-1">Up Next</p>
                <p className="text-white font-semibold line-clamp-2">{nextArticle.title}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0 ml-2" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}