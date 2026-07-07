import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { blogPosts } from '../data/blogPosts'

export default function Blog() {
  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <Helmet>
        <title>CV Writing Tips & Guides — Etiquette CV Blog</title>
        <meta
          name="description"
          content="Practical, no-fluff guides on writing a CV that gets interviews: structure, common mistakes, and CV vs resume differences explained."
        />
      </Helmet>

      <div className="py-12">
        <p className="text-xs uppercase tracking-widest text-red-400 font-medium mb-2">CV tips</p>
        <h1 className="text-4xl font-bold mb-4">The Blog</h1>
        <p className="text-muted-foreground max-w-xl">
          Practical guides on writing a CV that actually gets read — no fluff, just what recruiters look for.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-red-500/10">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="py-8 flex flex-col gap-2 hover:bg-red-500/5 -mx-4 px-4 rounded-lg transition-colors"
          >
            <span className="text-xs text-muted-foreground">
              {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ·{' '}
              {post.readTime}
            </span>
            <h2 className="text-2xl font-semibold">{post.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{post.description}</p>
            <span className="text-sm text-red-500 mt-2">Read article →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
