import Link from 'next/link'
import { fetchAllArticles } from '@/lib/supabase/articles'
import ArticleRowActions from '@/components/admin/ArticleRowActions'

export const revalidate = 0 // Always fresh for admin

export default async function AdminDashboard() {
  const articles = await fetchAllArticles()
  const publishedArticles = articles.filter((article) => article.published)
  const draftArticles = articles.filter((article) => !article.published)

  // View counts were taken off the public article page; this is where they live.
  const totalViews = publishedArticles.reduce((sum, article) => sum + (article.views ?? 0), 0)
  const totalLikes = publishedArticles.reduce((sum, article) => sum + (article.likes ?? 0), 0)
  const mostRead = publishedArticles.reduce<(typeof publishedArticles)[number] | null>(
    (best, article) => ((article.views ?? 0) > (best?.views ?? 0) ? article : best),
    null
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-netflix">Admin Dashboard</h1>
        <Link 
          href="/admin/submit" 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          + New Article
        </Link>
      </div>

      <section aria-label="Totals" className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total views" value={totalViews.toLocaleString()} note="Published articles" />
        <Stat label="Total likes" value={totalLikes.toLocaleString()} note="Published articles" />
        <div className="bg-neutral-900 rounded-lg p-5">
          <p className="text-sm uppercase tracking-wide text-neutral-400">Most read</p>
          {mostRead ? (
            <>
              <Link href={`/news/${mostRead.slug}`} target="_blank" className="mt-2 block font-semibold leading-snug hover:text-white text-neutral-100">
                {mostRead.title}
              </Link>
              <p className="mt-1 text-sm text-neutral-400">{(mostRead.views ?? 0).toLocaleString()} views</p>
            </>
          ) : (
            <p className="mt-2 text-neutral-400">No views counted yet.</p>
          )}
        </div>
      </section>

      <AdminTable title="Published" articles={publishedArticles} emptyLabel="No published articles yet." />
      <AdminTable title="Drafts" articles={draftArticles} emptyLabel="No drafts yet. Use Send to Draft to keep work in progress." />
    </div>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="bg-neutral-900 rounded-lg p-5">
      <p className="text-sm uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-2 text-4xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{note}</p>
    </div>
  )
}

interface AdminTableProps {
  title: string
  articles: Awaited<ReturnType<typeof fetchAllArticles>>
  emptyLabel: string
}

function AdminTable({ title, articles, emptyLabel }: AdminTableProps) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold font-netflix">{title}</h2>
        <span className="text-sm text-neutral-400">{articles.length} {articles.length === 1 ? 'article' : 'articles'}</span>
      </div>
      <div className="bg-neutral-900 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-800 text-neutral-400 uppercase text-sm">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Views</th>
              <th className="px-6 py-4 text-right">Likes</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-4 font-medium">
                  {article.title}
                  <div className="text-xs text-neutral-500 mt-1">/{article.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    article.published 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-400">
                  {new Date(article.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right tabular-nums">{(article.views ?? 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-right tabular-nums">{(article.likes ?? 0).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-4 text-sm">
                      <Link 
                        href={`/news/${article.slug}`}
                        className="text-neutral-400 hover:text-white"
                        target="_blank"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/admin/submit/${article.slug}`}
                        className="text-red-500 hover:text-red-400 font-medium"
                      >
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
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                  {emptyLabel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
