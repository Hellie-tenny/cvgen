import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import hero2 from '../assets/hero2.png'
import { blogPosts } from '../data/blogPosts'
import { Canonical } from '../components/Canonical'

const TOOLS = [
  {
    to: '/builder',
    title: 'Etiquette CV',
    text: 'Build a clean, professional CV with multiple templates and instant PDF download.',
    cta: 'Build your CV',
  },
  {
    to: '/cover-letter',
    title: 'AI Cover Letter',
    text: 'Paste a job listing — or a photo of one — and get a tailored cover letter in seconds.',
    cta: 'Write a letter',
  },
  {
    to: '/jobs',
    title: 'Job Listings',
    text: 'Browse open roles and apply with a letter tailored to that specific job in one click.',
    cta: 'Browse jobs',
  },
]

const FAQS = [
  {
    q: 'Is Etiquette free?',
    a: 'Yes — the CV builder, the AI cover letter writer, and browsing job listings are all completely free, with no hidden fees or sign-up required.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account or email required for the CV builder, cover letter writer, or browsing jobs. Just open a tool and start.',
  },
  {
    q: 'Will my CV data be saved or sent anywhere?',
    a: 'Your CV data is saved locally in your browser using localStorage. Nothing is sent to a server — your information stays completely private.',
  },
  {
    q: 'Can I download my CV as a PDF?',
    a: "Yes. Once you've filled in your details in Etiquette CV, you can download a professionally formatted PDF ready to send to employers.",
  },
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <Helmet>
        <title>Etiquette — Build Your CV, Write Cover Letters, Find Jobs</title>
        <meta
          name="description"
          content="Everything you need to land your next job: a free CV builder with Etiquette CV, an AI cover letter writer, and a job board — all free, no sign-up required."
        />
      </Helmet>
      <Canonical path="/" />

      {/* ── Hero: one headline, one main action ── */}
      <section className="flex flex-col md:flex-row items-center justify-between py-8 md:py-20 gap-8">
        <div className="flex flex-col items-start justify-center max-w-lg">
          <h1 className="anim-rise text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Everything you need to <span className="text-brand">land the job</span>
          </h1>
          <p className="anim-rise mt-4 text-base text-muted-foreground leading-relaxed" style={{ "--delay": "90ms" } as CSSProperties}>
            Build a professional CV, write a tailored cover letter with AI, and find open roles — free, no account
            needed.
          </p>

          <div className="anim-rise flex flex-wrap items-center gap-x-6 gap-y-3 mt-8" style={{ "--delay": "180ms" } as CSSProperties}>
            <Link
              to="/builder"
              className="inline-flex items-center justify-center bg-brand hover:bg-brand-hover active:scale-95 transition-all text-white font-medium px-6 py-3 rounded-lg shadow-lg shadow-brand/20 whitespace-nowrap"
            >
              Build a CV
            </Link>
            <Link to="/jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              or browse open jobs
            </Link>
          </div>
        </div>

        <div className="anim-rise flex justify-center" style={{ "--delay": "120ms" } as CSSProperties}>
          <img src={hero2} alt="" className="w-full max-w-[260px] sm:max-w-sm md:max-w-md object-contain drop-shadow-2xl" />
        </div>
      </section>

      {/* ── The three tools ── */}
      <section className="py-12 border-t">
        <h2 className="text-2xl font-semibold mb-8">One place, everything you need</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="border rounded-xl p-6 flex flex-col gap-2 hover:border-brand/50 transition-colors"
            >
              <span className="text-lg font-semibold">{tool.title}</span>
              <p className="text-sm text-muted-foreground leading-relaxed">{tool.text}</p>
              <span className="text-sm text-brand mt-auto pt-3">{tool.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── From the blog ── */}
      <section className="py-12 border-t">
        <div className="flex items-baseline justify-between gap-4 mb-8">
          <h2 className="text-2xl font-semibold">From the blog</h2>
          <Link to="/blog" className="text-sm text-brand hover:underline whitespace-nowrap">
            All articles →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {blogPosts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="border rounded-xl p-6 flex flex-col gap-2 hover:border-brand/50 transition-colors"
            >
              <span className="text-lg font-semibold leading-snug">{post.title}</span>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.description}</p>
              <span className="text-xs text-muted-foreground mt-auto pt-2">{post.readTime}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FAQ: collapsed by default, so it stays out of the way ── */}
      <section className="py-12 border-t">
        <h2 className="text-2xl font-semibold mb-6">Frequently asked questions</h2>
        <div className="flex flex-col divide-y max-w-2xl">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-4">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
