import { useMemo } from "react";

export type ShareButtonsProps = {
  url: string;
  title: string;
};

export const ShareButtons = ({ url, title }: ShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = useMemo(
    () => [
      {
        name: "X",
        href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
      },
      {
        name: "Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
      },
      {
        name: "LinkedIn",
        href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`
      }
    ],
    [encodedTitle, encodedUrl]
  );

  return (
    <div className="flex gap-3">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-neonPurple/60 px-4 py-1 text-xs uppercase tracking-wide text-neonPurple transition hover:bg-neonPurple hover:text-slateBase"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
};
