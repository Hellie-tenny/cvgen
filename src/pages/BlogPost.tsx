import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { doc, getDoc } from 'firebase/firestore'
import { Loader2 } from 'lucide-react'
import { db } from '@/firebase/config'
import { Canonical } from '../components/Canonical'
import { ArticleBody } from '../components/ArticleBody'
import { blogPosts } from '../data/blogPosts'
import { docToEntry, staticToEntry, type ArticleDoc, type BlogEntry } from '@/utils/articles'
import { SITE_URL, toJsonLd } from '@/utils/site'

export default function BlogPost() {
  const { slug } = useParams()

  // Built-in posts are found instantly; anything else is looked up among the articles posted from admin.
  const builtIn = useMemo(() => {
    const post = blogPosts.find((p) => p.slug === slug)
    return post ? staticToEntry(post) : null
  }, [slug])

  const [remote, setRemote] = useState<{ slug: string; entry: BlogEntry | null } | null>(null)

  useEffect(() => {
    if (!slug || builtIn) return
    let cancelled = false
    const load = async () => {
      let entry: BlogEntry | null = null
      try {
        const snap = await getDoc(doc(db, 'articles', slug))
        const data = snap.exists() ? (snap.data() as ArticleDoc) : null
        // Drafts are never shown here, even to the admin.
        if (data && data.status === 'published') entry = docToEntry(snap.id, data)
      } catch (err) {
        console.error('Error loading article:', err)
      }
      if (!cancelled) setRemote({ slug, entry })
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, builtIn])

  const remoteForThisSlug = remote && remote.slug === slug ? remote : null
  const loading = !builtIn && !remoteForThisSlug
  const post = builtIn ?? remoteForThisSlug?.entry ?? null

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto py-20 text-center">
        <Helmet>
          <title>Article not found — Etiquette Blog</title>
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

  const pageUrl = `${SITE_URL}/blog/${post.slug}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date.toISOString(),
    dateModified: (post.updated ?? post.date).toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    author: { '@type': 'Organization', name: 'Etiquette', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Etiquette', url: SITE_URL },
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <Helmet>
        <title>{post.title} — Etiquette Blog</title>
        <meta name="description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:site_name" content="Etiquette" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{toJsonLd(articleJsonLd)}</script>
      </Helmet>
      <Canonical path={`/blog/${post.slug}`} />

      <article className="py-12">
        <Link to="/blog" className="text-sm text-red-500 hover:underline">
          ← Back to the blog
        </Link>

        <p className="text-xs text-muted-foreground mt-6">
          <span className="text-red-500 font-medium">{post.category}</span> ·{' '}
          {post.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ·{' '}
          {post.readTime}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-8 leading-tight">{post.title}</h1>

        <ArticleBody text={post.body} />

        <div className="mt-12 pt-8 border-t border-red-500/10 flex flex-wrap gap-3">
          <Link
            to="/builder"
            className="inline-block bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white font-medium px-6 py-3 rounded-lg"
          >
            Build your CV now →
          </Link>
          <Link
            to="/jobs"
            className="inline-block border border-red-500/40 hover:bg-red-500/10 active:scale-95 transition-all font-medium px-6 py-3 rounded-lg"
          >
            Browse open jobs
          </Link>
        </div>
      </article>
    </div>
  )
}
