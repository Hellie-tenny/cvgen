import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Canonical } from '../components/Canonical'
import { blogPosts } from '../data/blogPosts'
import { docToEntry, staticToEntry, type ArticleDoc, type BlogEntry } from '@/utils/articles'

export default function Blog() {
  // Built-in posts show immediately; articles posted from the admin screen are added once they load.
  const [posted, setPosted] = useState<BlogEntry[]>([])
  const [category, setCategory] = useState('All')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'articles'), where('status', '==', 'published')))
        if (!cancelled) setPosted(snap.docs.map((d) => docToEntry(d.id, d.data() as ArticleDoc)))
      } catch (err) {
        console.error('Error loading articles:', err)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const entries = [...blogPosts.map(staticToEntry), ...posted].sort((a, b) => b.date.getTime() - a.date.getTime())
  const categories = ['All', ...Array.from(new Set(entries.map((e) => e.category)))]
  const visible = category === 'All' ? entries : entries.filter((e) => e.category === category)

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <Helmet>
        <title>Career Advice, CV Tips & Interview Prep — Etiquette Blog</title>
        <meta
          name="description"
          content="Practical, no-fluff guides for job seekers: writing a CV that gets interviews, cover letters, and preparing for the interview itself."
        />
      </Helmet>
      <Canonical path="/blog" />

      <div className="py-12">
        <h1 className="text-4xl font-bold mb-4">The Blog</h1>
        <p className="text-muted-foreground max-w-xl">
          Practical guides on CVs, cover letters and interviews — no fluff, just what recruiters and hiring managers
          look for.
        </p>
      </div>

      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                category === c
                  ? 'bg-red-500 text-white'
                  : 'bg-red-500/10 text-muted-foreground hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col divide-y divide-red-500/10">
        {visible.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="py-8 flex flex-col gap-2 hover:bg-red-500/5 -mx-4 px-4 rounded-lg transition-colors"
          >
            <span className="text-xs text-muted-foreground">
              <span className="text-red-500 font-medium">{post.category}</span> ·{' '}
              {post.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ·{' '}
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
