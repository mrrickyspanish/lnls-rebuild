import Image from 'next/image';
import Link from 'next/link';

type Author = {
  name: string;
  avatar?: string;
  bio?: string;
  twitter?: string;
};

type AuthorCardProps = {
  author: Author;
};

export default function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 border-t border-white/10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-4">
          {author.avatar && (
            <Image
              src={author.avatar}
              alt={author.name}
              width={64}
              height={64}
              className="rounded-full flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <p className="font-bold text-lg mb-1">{author.name}</p>
            {author.twitter && (
              <p className="text-sm text-white/60 mb-3">
                <Link
                  href={`https://twitter.com/${author.twitter}`}
                  target="_blank"
                  className="hover:text-[var(--netflix-red)] transition-colors"
                >
                  @{author.twitter}
                </Link>
              </p>
            )}
            {author.bio && (
              <p className="text-white/80 leading-relaxed">{author.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}