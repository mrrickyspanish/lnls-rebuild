import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LNLS Studio",
  description: "Editorial workspace for Late Night Lake Show"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
