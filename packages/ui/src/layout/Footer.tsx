import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-slateBase/40 bg-charcoal/80 text-sm text-offWhite/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="font-headline text-lg uppercase tracking-[0.3em] text-offWhite">
          LNLS
        </p>
        <p>&copy; {new Date().getFullYear()} Late Night Lake Show. All rights reserved.</p>
        <nav className="flex gap-4">
          <Link href="/contact" className="hover:text-neonPurple">
            Contact
          </Link>
          <Link href="/advertise" className="hover:text-neonPurple">
            Advertise
          </Link>
          <Link href="/about" className="hover:text-neonPurple">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
};
