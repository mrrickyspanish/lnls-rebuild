import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Daily Dribble | Court. Code. Culture.',
  description: 'The Daily Dribble delivers premium basketball news, podcasts, and culture. Court. Code. Culture.',
  openGraph: {
    title: 'The Daily Dribble',
    description: 'Premium basketball news, podcasts, and culture.',
    url: 'https://lnls.media',
    siteName: 'The Daily Dribble',
    images: [
      {
        url: 'https://lnls.media/uploads/articles/dribbles_og_2024.png',
        width: 1200,
        height: 630,
        alt: 'The Daily Dribble',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dailydribble',
    title: 'The Daily Dribble',
    description: 'Premium basketball news, podcasts, and culture.',
    images: ['https://lnls.media/uploads/articles/dribbles_og_2024.png'],
  },
};

export default function Head() {
  return null;
}
