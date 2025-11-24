import Link from 'next/link'
import { fetchAllArticles } from '@/lib/supabase/articles'
import ArticleRowActions from '@/components/admin/ArticleRowActions'

export const revalidate = 0 // Always fresh for admin

export default async function AdminDashboard() {
  const articles = await fetchAllArticles()

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

      <div className="bg-neutral-900 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-800 text-neutral-400 uppercase text-sm">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
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
                    <ArticleRowActions slug={article.slug} published={article.published} />
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                  No articles found. Start writing!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
