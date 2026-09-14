import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import hero2 from '../assets/hero2.png'
import { blogPosts } from '../data/blogPosts'

export default function Home() {
  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Etiquette — Build Your CV, Write Cover Letters, Find Jobs</title>
        <meta
          name="description"
          content="Everything you need to land your next job: a free CV builder with Etiquette CV, an AI cover letter writer, and a job board — all free, no sign-up required."
        />
      </Helmet>

      {/* ── Hero ── */}
      <div className="flex flex-col-reverse md:flex-row justify-between px-4 py-12 md:py-20 gap-8">
        <div className="flex flex-col items-start justify-center max-w-lg">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Everything you need to <span className="text-red-500">land the job</span>
          </h1>
          <span className="block mt-4 text-base text-muted-foreground leading-relaxed">
            Build a professional CV, write a tailored cover letter with AI, and find open roles — free, no account
            needed.
          </span>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-8 w-full">
            <Link
              to="/builder"
              className="flex-1 inline-flex items-center justify-center text-center bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white font-medium px-6 py-3 rounded-lg cursor-pointer shadow-lg shadow-red-500/20 whitespace-nowrap"
            >
              Build a CV →
            </Link>
            <Link
              to="/cover-letter"
              className="flex-1 inline-flex items-center justify-center text-center border border-red-500/30 hover:bg-red-500/10 active:scale-95 transition-all text-foreground font-medium px-6 py-3 rounded-lg cursor-pointer whitespace-nowrap"
            >
              AI Cover Letter
            </Link>
            <Link
              to="/jobs"
              className="flex-1 inline-flex items-center justify-center text-center border border-red-500/30 hover:bg-red-500/10 active:scale-95 transition-all text-foreground font-medium px-6 py-3 rounded-lg cursor-pointer whitespace-nowrap"
            >
              Browse Jobs
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src={hero2}
            alt="hero"
            className="w-full max-w-sm md:max-w-md object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* ── What Etiquette offers ── */}
      <section className="py-16 px-4 border-t border-red-500/10">
        <h2 className="text-3xl font-semibold mb-10">One place, everything you need</h2>

        <div className="flex justify-between gap-4 flex-col sm:flex-row">
          <Link
            to="/builder"
            className="bg-red-500/10 border border-red-500/20 w-full sm:w-1/3 rounded-xl p-8 flex flex-col gap-3 min-h-[220px] hover:bg-red-500/15 transition-colors"
          >
            <span className="text-lg font-semibold">Etiquette CV</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Build a clean, professional CV with multiple templates and instant PDF download.
            </p>
            <span className="text-sm text-red-500 mt-auto">Build your CV →</span>
          </Link>

          <Link
            to="/cover-letter"
            className="bg-red-500/10 border border-red-500/20 w-full sm:w-1/3 rounded-xl p-8 flex flex-col gap-3 min-h-[220px] hover:bg-red-500/15 transition-colors"
          >
            <span className="text-lg font-semibold">AI Cover Letter</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Paste a job listing — or a photo of one — and get a tailored cover letter in seconds.
            </p>
            <span className="text-sm text-red-500 mt-auto">Write a letter →</span>
          </Link>

          <Link
            to="/jobs"
            className="bg-red-500/10 border border-red-500/20 w-full sm:w-1/3 rounded-xl p-8 flex flex-col gap-3 min-h-[220px] hover:bg-red-500/15 transition-colors"
          >
            <span className="text-lg font-semibold">Job Listings</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Browse open roles and apply with a letter tailored to that specific job in one click.
            </p>
            <span className="text-sm text-red-500 mt-auto">Browse jobs →</span>
          </Link>
        </div>
      </section>

      {/* ── Everything You Need ── */}
      <section className="py-16 px-4 border-t border-red-500/10">
        <h2 className="text-3xl font-semibold mb-10">Why Etiquette</h2>
        <div className="flex flex-wrap gap-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors cursor-default">
            <span className="text-red-400">✓</span> Free CV builder
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors cursor-default">
            <span className="text-red-400">✓</span> AI cover letter writer
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors cursor-default">
            <span className="text-red-400">✓</span> Job listings
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors cursor-default">
            <span className="text-red-400">✓</span> No account required
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors cursor-default">
            <span className="text-red-400">✓</span> PDF download
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors cursor-default">
            <span className="text-red-400">✓</span> Multiple templates
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors cursor-default">
            <span className="text-red-400">✓</span> Works on mobile
          </div>
        </div>
      </section>

      {/* ── From the blog ── */}
      <section className="py-16 px-4 border-t border-red-500/10">
        <h2 className="text-3xl font-semibold mb-10">From the blog</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col gap-2 hover:bg-red-500/15 transition-colors"
            >
              <span className="text-lg font-semibold leading-snug">{post.title}</span>
              <p className="text-sm text-muted-foreground leading-relaxed">{post.description}</p>
              <span className="text-xs text-red-400 mt-auto pt-2">{post.readTime} →</span>
            </Link>
          ))}
        </div>
        <Link to="/blog" className="inline-block mt-6 text-sm text-red-500 hover:underline">
          View all articles →
        </Link>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 border-t border-red-500/10">
        <h2 className="text-3xl font-semibold mb-10">Frequently asked questions</h2>
        <div className="flex flex-col divide-y divide-red-500/10 max-w-2xl">
          <div className="py-5">
            <h3 className="font-medium text-base mb-2">Is Etiquette free?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yes — the CV builder, the AI cover letter writer, and browsing job listings are all completely free,
              with no hidden fees or sign-up required.
            </p>
          </div>

          <div className="py-5">
            <h3 className="font-medium text-base mb-2">Will my CV data be saved or sent anywhere?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your CV data is saved locally in your browser using localStorage. Nothing is sent to a server — your
              information stays completely private.
            </p>
          </div>

          <div className="py-5">
            <h3 className="font-medium text-base mb-2">Can I download my CV as a PDF?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yes. Once you've filled in your details in Etiquette CV, you can download a professionally formatted
              PDF ready to send to employers.
            </p>
          </div>

          <div className="py-5">
            <h3 className="font-medium text-base mb-2">Do I need to create an account?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No account or email required for the CV builder, cover letter writer, or browsing jobs. Just open a
              tool and start.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
