import Link from 'next/link'
import { fetchAllArticles } from '@/lib/supabase/articles'
import ArticleRowActions from '@/components/admin/ArticleRowActions'

export const revalidate = 0 // Always fresh for admin

type AdminArticle = Awaited<ReturnType<typeof fetchAllArticles>>[number]

function shortDate(value?: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return ''
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export default async function AdminDashboard() {
  const articles = await fetchAllArticles()
  const publishedArticles = articles.filter((article) => article.published)
  const draftArticles = articles.filter((article) => !article.published)

  // View counts were taken off the public article page; this is where they live.
  const totalViews = publishedArticles.reduce((sum, article) => sum + (article.views ?? 0), 0)
  const totalLikes = publishedArticles.reduce((sum, article) => sum + (article.likes ?? 0), 0)
  const mostRead = publishedArticles.reduce<AdminArticle | null>(
    (best, article) => ((article.views ?? 0) > (best?.views ?? 0) ? article : best),
    null
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">Articles</h1>
        <Link
          href="/admin/submit"
          className="inline-flex items-center min-h-[44px] bg-red-600 hover:bg-red-700 text-white font-bold px-4 rounded transition-colors"
        >
          + New Article
        </Link>
      </div>

      <section aria-label="Totals" className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Total views" value={totalViews.toLocaleString()} />
        <Stat label="Total likes" value={totalLikes.toLocaleString()} />
        <div className="col-span-2 sm:col-span-1 bg-neutral-900 rounded-lg p-4 sm:p-5">
          <p className="text-sm uppercase tracking-wide text-neutral-400">Most read</p>
          {mostRead ? (
            <>
              <Link href={`/news/${mostRead.slug}`} target="_blank" className="-mb-3 mt-0 block py-3 font-semibold leading-snug hover:text-white text-neutral-100">
                {mostRead.title}
              </Link>
              <p className="mt-1 text-sm text-neutral-400">{(mostRead.views ?? 0).toLocaleString()} views</p>
            </>
          ) : (
            <p className="mt-2 text-neutral-400">No views counted yet.</p>
          )}
        </div>
      </section>
      <p className="mt-2 text-sm text-neutral-500">Totals cover published articles.</p>

      <ArticleList title="Published" articles={publishedArticles} emptyLabel="No published articles yet." />
      <ArticleList title="Drafts" articles={draftArticles} emptyLabel="No drafts. Send to Draft keeps a story off the site while you work on it." />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-900 rounded-lg p-4 sm:p-5">
      <p className="text-sm uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-1 sm:mt-2 text-3xl sm:text-4xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

interface ArticleListProps {
  title: string
  articles: AdminArticle[]
  emptyLabel: string
}

/**
 * Phones get one card per article with everything visible and thumb-sized
 * actions; from 768px up the same data is a table. The table alone was
 * unusable on a phone: everything after Date (views, likes, Edit and the
 * row actions) was cut off past the right edge.
 */
function ArticleList({ title, articles, emptyLabel }: ArticleListProps) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-sm text-neutral-400">{articles.length} {articles.length === 1 ? 'article' : 'articles'}</span>
      </div>

      {articles.length === 0 && (
        <p className="bg-neutral-900 rounded-lg px-5 py-10 text-center text-neutral-400">{emptyLabel}</p>
      )}

      {/* Phones and small tablets */}
      {articles.length > 0 && (
        <ul className="md:hidden space-y-3">
          {articles.map((article) => (
            <li key={article.id} className="bg-neutral-900 rounded-lg p-4">
              <Link href={`/admin/submit/${article.slug}`} className="-my-2.5 block py-2.5 text-lg font-semibold leading-snug hover:text-white">
                {article.title}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-400">
                <StatusPill published={article.published} />
                <span>{shortDate(article.published_at || article.created_at)}</span>
                <span className="tabular-nums">{(article.views ?? 0).toLocaleString()} views</span>
                <span className="tabular-nums">{(article.likes ?? 0).toLocaleString()} likes</span>
              </div>
              {/* Drafts have no public page (it 404s), so only published
                  stories get a View link; the editor previews a draft. */}
              <div className={`mt-4 grid gap-2 ${article.published ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <Link
                  href={`/admin/submit/${article.slug}`}
                  className="inline-flex items-center justify-center min-h-[44px] rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Edit
                </Link>
                {article.published && (
                  <Link
                    href={`/news/${article.slug}`}
                    target="_blank"
                    className="inline-flex items-center justify-center min-h-[44px] rounded border border-neutral-700 text-neutral-200 hover:border-neutral-500"
                  >
                    View live
                  </Link>
                )}
              </div>
              <div className="mt-2">
                <ArticleRowActions
                  slug={article.slug}
                  published={article.published}
                  lastNewsletterSentAt={article.last_newsletter_sent_at}
                  align="start"
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Tablets and desktop */}
      {articles.length > 0 && (
        <div className="hidden md:block bg-neutral-900 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-800 text-neutral-400 uppercase text-sm">
              <tr>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">Views</th>
                <th className="px-5 py-4 text-right">Likes</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-neutral-800/50 transition-colors align-top">
                  <td className="px-5 py-4 font-medium min-w-[220px]">
                    <Link href={`/admin/submit/${article.slug}`} className="hover:text-white">{article.title}</Link>
                    <div className="text-sm text-neutral-500 mt-1">/{article.slug}</div>
                  </td>
                  <td className="px-5 py-4"><StatusPill published={article.published} /></td>
                  <td className="px-5 py-4 text-neutral-400 whitespace-nowrap">{shortDate(article.published_at || article.created_at)}</td>
                  <td className="px-5 py-4 text-right tabular-nums">{(article.views ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-right tabular-nums">{(article.likes ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-4 text-sm">
                        {article.published && (
                          <Link href={`/news/${article.slug}`} className="text-neutral-400 hover:text-white" target="_blank">
                            View
                          </Link>
                        )}
                        <Link href={`/admin/submit/${article.slug}`} className="text-red-500 hover:text-red-400 font-medium">
                          Edit →
                        </Link>
                      </div>
                      <ArticleRowActions
                        slug={article.slug}
                        published={article.published}
                        lastNewsletterSentAt={article.last_newsletter_sent_at}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
      published ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
    }`}>
      {published ? 'Published' : 'Draft'}
    </span>
  )
}
