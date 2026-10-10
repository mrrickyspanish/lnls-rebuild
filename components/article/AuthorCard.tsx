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
  /** Where the name links: the About page, for the site's own writer. */
  href?: string;
};

export default function AuthorCard({ author, href }: AuthorCardProps) {
  if (!author.name) return null;
  // Some saved handles include the @ and some do not. Normalize so the card
  // never shows @@name or links to x.com/@name.
  const handle = author.twitter?.replace(/^@/, '');

  return (
    <aside className="tdd-author" aria-label="About the author">
      {author.avatar && (
        <Image src={author.avatar} alt="" width={64} height={64} className="tdd-author-avatar" />
      )}
      <div>
        <p className="tdd-author-label">Written by</p>
        <p className="tdd-author-name">
          {href ? <Link href={href}>{author.name}</Link> : author.name}
        </p>
        {handle && (
          <Link
            href={`https://x.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tdd-author-handle"
          >
            @{handle}
          </Link>
        )}
        {author.bio && <p className="tdd-author-bio">{author.bio}</p>}
        {href && <Link href={href} className="tdd-author-more">More about me</Link>}
      </div>
    </aside>
  );
}
