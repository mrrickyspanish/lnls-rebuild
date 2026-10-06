import ContentTile from '@/components/home/ContentTile';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type RelatedRowProps = {
  articles: any[];
  title: string;
};

export default function RelatedRow({ articles, title }: RelatedRowProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-4 mb-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
        {/* Row Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display uppercase text-3xl md:text-4xl leading-none text-white">
            {title}
          </h2>
          <Link
            href="/news"
            className="flex items-center gap-1 text-white/80 hover:text-[var(--neon-orange)] transition-colors group"
          >
            <span className="text-[15px] font-semibold">View all</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Scrollable Row */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
          {articles.map((article) => (
            <div key={article.id} className="flex-shrink-0 w-[300px] snap-start">
              <ContentTile
                id={article.id}
                title={article.title}
                image_url={article.image_url}
                content_type={article.content_type}
                source={article.source}
                source_url={article.source_url}
                published_at={article.published_at}
                excerpt={article.excerpt}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}