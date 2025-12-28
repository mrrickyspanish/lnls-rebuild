// lib/supabase/modals.ts
import { createSupabaseAnonClient } from './client';

export type ModalData = {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  articleSlug: string;
  badgeText: string;
  showOnPaths: string[];
  dismissOption: 'session' | 'permanent';
  delayMs: number;
};

export async function fetchActiveModalConfig(): Promise<ModalData | null> {
  const supabase = createSupabaseAnonClient();

  const { data: config } = await supabase
    .from('featured_modal_config')
    .select('*')
    .eq('enabled', true)
    .or(`expires_on.is.null,expires_on.gte.${new Date().toISOString().split('T')[0]}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!config) return null;

  if (config.use_featured_article) {
    const { data: article } = await supabase
      .from('articles')
      .select('title, excerpt, slug')
      .eq('featured', true)
      .eq('published', true)
      .limit(1)
      .maybeSingle();

    if (article) {
      return {
        title: config.custom_title || article.title,
        subtitle: config.custom_subtitle || '',
        description: config.custom_description || article.excerpt || '',
        ctaText: config.custom_cta_text || 'Read the feature',
        articleSlug: article.slug,
        badgeText: config.badge_text || 'FEATURED',
        showOnPaths: config.show_on_paths || ['/'],
        dismissOption: config.dismiss_option || 'session',
        delayMs: config.delay_ms || 1200,
      };
    }
  }

  if (config.custom_article_slug) {
    return {
      title: config.custom_title || '',
      subtitle: config.custom_subtitle || '',
      description: config.custom_description || '',
      ctaText: config.custom_cta_text || 'Read the feature',
      articleSlug: config.custom_article_slug,
      badgeText: config.badge_text || 'FEATURED',
      showOnPaths: config.show_on_paths || ['/'],
      dismissOption: config.dismiss_option || 'session',
      delayMs: config.delay_ms || 1200,
    };
  }

  return null;
}
