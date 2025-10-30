import type { ReactNode } from "react";
import clsx from "clsx";

export type ProseProps = {
  children: ReactNode;
  className?: string;
};

export const Prose = ({ children, className }: ProseProps) => {
  return (
    <div
      className={clsx(
        "prose prose-invert max-w-none",
        "prose-headings:font-headline prose-headings:text-offWhite",
        "prose-p:text-offWhite/90 prose-strong:text-offWhite",
        "prose-a:text-neonPurple prose-a:no-underline hover:prose-a:underline",
        "prose-blockquote:border-l-4 prose-blockquote:border-neonPurple/60 prose-blockquote:bg-charcoal/60",
        "prose-li:text-offWhite/80",
        className
      )}
    >
      {children}
    </div>
  );
};
