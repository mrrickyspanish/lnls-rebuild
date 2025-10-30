import "./globals.css";

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Layout } from "@lnls/ui";
import { buildMetadata } from "../src/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Late Night Lake Show",
  description: "Phase-1 rebuild with AI-powered newsroom, podcasts, and game day coverage.",
  openGraph: {
    title: "Late Night Lake Show",
    description: "Phase-1 rebuild with AI-powered newsroom, podcasts, and game day coverage."
  }
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-slateBase">
      <body className="min-h-screen bg-slateBase text-offWhite">
        <Layout>
          {children}
          <Analytics />
        </Layout>
      </body>
    </html>
  );
}
