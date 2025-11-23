
export function isOwnedContent(item: any): boolean {
  // STRICT RULE: Content is ONLY owned if it matches specific criteria.
  // Default is FALSE (External) to prevent leaks.

  const ownedSources = ['TDD', 'LNLS', 'The Daily Dunk', 'TDD Podcast', 'TDD YouTube', 'Spreaker', '19 Media Group'];
  
  // 1. Check explicit source name
  if (item.source && ownedSources.includes(item.source)) {
    return true;
  }

  // 2. Check content types that are inherently owned (if source is missing)
  // Note: We must be careful here. If we import external podcasts/videos later, this needs updating.
  // Currently, all 'podcast' and 'video' items come from our internal RSS/YouTube feeds.
  if (item.content_type === 'podcast' || item.content_type === 'video') {
    return true;
  }

  // 3. Check for internal URL patterns
  if (item.source_url && (
    item.source_url.startsWith('/') || 
    item.source_url.includes('lnls.media')
  )) {
    return true;
  }

  // Default to External for everything else (RSS feeds, etc.)
  return false;
}

export function filterOwnedContent(items: any[]): any[] {
  return items.filter(isOwnedContent);
}

export function filterExternalContent(items: any[]): any[] {
  return items.filter(item => !isOwnedContent(item));
}
