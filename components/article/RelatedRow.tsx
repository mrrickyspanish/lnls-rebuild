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
    <section className="mt-12 mb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
        {/* Row Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white font-netflix">
            {title}
          </h2>
          <Link
            href="/news"
            className="flex items-center gap-1 text-white/70 hover:text-white transition-colors group"
          >
            <span className="text-sm font-medium">View All</span>
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