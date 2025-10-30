import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-slateBase text-offWhite">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
};
