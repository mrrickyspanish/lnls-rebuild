import { notFound } from 'next/navigation'
import ArticleForm from '@/components/admin/ArticleForm'
import { fetchArticleForEdit } from '@/lib/supabase/articles'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function EditArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await fetchArticleForEdit(slug)

  if (!article) {
    notFound()
  }

  return <ArticleForm initialData={article} mode="edit" />
}
