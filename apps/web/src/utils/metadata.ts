import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://latenightlakeshow.com";

export const buildMetadata = (overrides: Metadata): Metadata => ({
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    url: baseUrl,
    siteName: "Late Night Lake Show",
    ...overrides.openGraph
  },
  twitter: {
    card: "summary_large_image",
    creator: "@LateNightLS",
    ...overrides.twitter
  },
  ...overrides
});
