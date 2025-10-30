import type { ReactNode } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/articles", label: "Articles" },
  { href: "/podcast", label: "Podcast" },
  { href: "/videos", label: "Videos" },
  { href: "/gameday", label: "Game Day" },
  { href: "/about", label: "About" }
];

export const Header = () => {
  return (
    <header className="bg-charcoal/80 backdrop-blur border-b border-slateBase/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-3xl font-headline tracking-wider text-offWhite">
          Late Night Lake Show
        </Link>
        <nav className="hidden gap-6 text-sm uppercase text-offWhite/80 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-neonGold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export type HeaderProps = {
  children?: ReactNode;
};
