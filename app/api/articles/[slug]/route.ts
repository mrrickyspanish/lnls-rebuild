import { NextResponse } from 'next/server';
import { getClient } from '@/lib/sanity/client';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Sample data for testing (will be replaced by real Sanity data)
    if (params.slug === 'sample-lakers-article') {
      const currentArticle = {
        _id: 'sample-id',
        title: 'Lakers Complete Historic Trade for Championship Push',
        slug: 'sample-lakers-article',
        excerpt: 'In a blockbuster move that shocked the NBA world, the Lakers have acquired two All-Star players to bolster their championship aspirations this season.',
        heroImage: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/1966.png&w=350&h=254',
        body: [
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'In a move that will reshape the Western Conference playoff picture, the Los Angeles Lakers have completed a stunning trade package that brings two proven All-Star players to the purple and gold.'
              }
            ]
          }
        ],
        author: {
          name: 'LNLS Sports Staff',
          bio: 'Covering the Lakers with passion and insight since day one.',
          twitter: 'lnlssports'
        },
        publishedAt: new Date().toISOString(),
        readTime: 4,
        topic: 'Lakers',
        videoUrl: undefined
      };

      const nextArticle = {
        slug: 'lebron-milestone',
        title: 'LeBron James Reaches Historic Milestone in Lakers Victory',
        excerpt: 'The King continues to make history in his 22nd season.',
        heroImage: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/1966.png&w=350&h=254',
        author: { name: 'LNLS Sports Staff' },
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        readTime: 3,
        topic: 'Lakers'
      };

      const previewArticle = {
        slug: 'lakers-warriors-recap',
        title: 'Lakers vs Warriors: Game Recap and Analysis',
        excerpt: 'Thrilling overtime victory showcases team chemistry.',
        heroImage: 'https://a.espncdn.com/combiner/i?img=/photo/2024/1109/r1397285_1296x729_16-9.jpg&w=350&h=254',
        author: { name: 'LNLS Sports Staff' },
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        readTime: 5,
        topic: 'Lakers'
      };

      const moreRelated = [
        {
          id: 'related-1',
          title: 'Anthony Davis Injury Update',
          image_url: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3012.png&w=350&h=254',
          content_type: 'article',
          source: 'LNLS',
          source_url: '/news/ad-injury-update',
          published_at: new Date(Date.now() - 259200000).toISOString(),
          excerpt: 'Latest updates on the superstar\'s recovery timeline.'
        }
      ];

      return NextResponse.json({
        article: currentArticle,
        nextArticle,
        previewArticle,
        moreRelated
      });
    }

    // Real Sanity implementation
    const sanity = getClient();
    
    // Get current article
    const article = await sanity.fetch(
      `*[_type == "article" && slug.current == $slug][0]{
        _id,
        title,
        "slug": slug.current,
        excerpt,
        "heroImage": heroImage.asset->url,
        body,
        "author": author->{
          name,
          "avatar": avatar.asset->url,
          bio,
          twitter
        },
        publishedAt,
        readTime,
        topic,
        videoUrl
      }`,
      { slug: params.slug }
    );

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Get articles in same topic, chronologically AFTER current article
    const queue = await sanity.fetch(
      `*[_type == "article" && topic == $topic && publishedAt < $publishedAt] | order(publishedAt desc)[0...10]{
        _id,
        title,
        "slug": slug.current,
        excerpt,
        "heroImage": heroImage.asset->url,
        publishedAt,
        readTime,
        topic,
        "author": author->{name}
      }`,
      { 
        topic: article.topic,
        publishedAt: article.publishedAt
      }
    );

    // Get additional related articles for the bottom row
    const moreRelated = queue.slice(2).map((item: any, index: number) => ({
      id: `related-${index}`,
      title: item.title,
      image_url: item.heroImage,
      content_type: 'article',
      source: 'LNLS',
      source_url: `/news/${item.slug}`,
      published_at: item.publishedAt,
      excerpt: item.excerpt
    }));

    return NextResponse.json({
      article,
      nextArticle: queue[0] || null,      // Card 2 (clickable)
      previewArticle: queue[1] || null,   // Card 3 (preview)
      moreRelated                         // Additional related
    });
  } catch (error) {
    console.error('Article fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}