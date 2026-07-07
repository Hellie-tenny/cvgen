import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { blogPosts } from '../data/blogPosts'

export default function BlogPost() {
  const { slug } = useParams()
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto py-20 text-center">
        <Helmet>
          <title>Article not found — Etiquette CV Blog</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h1 className="text-3xl font-bold mb-4">Article not found</h1>
        <p className="text-muted-foreground mb-8">This article may have been moved or removed.</p>
        <Link to="/blog" className="text-red-500 hover:underline">
          ← Back to the blog
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <Helmet>
        <title>{post.title} — Etiquette CV Blog</title>
        <meta name="description" content={post.description} />
      </Helmet>

      <article className="py-12">
        <Link to="/blog" className="text-sm text-red-500 hover:underline">
          ← Back to the blog
        </Link>

        <p className="text-xs text-muted-foreground mt-6">
          {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ·{' '}
          {post.readTime}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-8 leading-tight">{post.title}</h1>

        <div className="flex flex-col gap-5">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-base leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-red-500/10">
          <Link
            to="/builder"
            className="inline-block bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white font-medium px-6 py-3 rounded-lg"
          >
            Build your CV now →
          </Link>
        </div>
      </article>
    </div>
  )
}
