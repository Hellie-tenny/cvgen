import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import hero2 from '../assets/hero2.png'
import { blogPosts } from '../data/blogPosts'

export default function Home() {
  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Etiquette CV — Free CV Builder, No Sign-Up</title>
        <meta
          name="description"
          content="Build a clean, professional CV in minutes with Etiquette CV. Free, no sign-up, instant PDF download. Your data stays in your browser."
        />
      </Helmet>

      {/* ── Hero ── */}
      <div className="flex flex-col-reverse md:flex-row justify-between px-4 py-12 md:py-20 gap-8">
        <div className="flex flex-col items-start justify-center max-w-lg">
          <span className="text-xs uppercase tracking-widest text-red-400 font-medium mb-4">
            Free · No sign-up · Instant PDF
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Build a CV that <span className="text-red-500">stands out</span>
          </h1>
          <span className="block mt-4 text-base text-muted-foreground leading-relaxed">
            Create a clean, professional CV in minutes and stand out from the crowd.
          </span>

          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Link
              to="/builder"
              className="bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white font-medium px-7 py-3 rounded-lg cursor-pointer shadow-lg shadow-red-500/20"
            >
              Get Started →
            </Link>
            <Link
              to="/cover-letter"
              className="border border-red-500/30 hover:bg-red-500/10 active:scale-95 transition-all text-foreground font-medium px-7 py-3 rounded-lg cursor-pointer"
            >
              Try the AI Cover Letter Writer
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

      {/* ── How It Works ── */}
      <section className="py-16 px-4 border-t border-red-500/10">
        <p className="text-xs uppercase tracking-widest text-red-400 font-medium mb-2">Simple process</p>
        <h2 className="text-3xl font-semibold mb-10">How it works</h2>

        <div className="flex justify-between gap-4 flex-col sm:flex-row">
          <div className="bg-red-500/10 border border-red-500/20 w-full sm:w-1/4 rounded-xl p-8 flex flex-col gap-3 min-h-[260px] hover:bg-red-500/15 transition-colors">
            <span className="text-5xl font-bold text-red-400/60">01</span>
            <span className="text-lg font-semibold">Fill in your details</span>
            <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
              Add your experience, education, and skills. Your progress saves automatically.
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 w-full sm:w-1/4 rounded-xl p-8 flex flex-col gap-3 min-h-[260px] hover:bg-red-500/15 transition-colors">
            <span className="text-5xl font-bold text-red-400/60">02</span>
            <span className="text-lg font-semibold">Choose a template</span>
            <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
              Browse our collection of professional templates and pick the one that fits your style.
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 w-full sm:w-1/4 rounded-xl p-8 flex flex-col gap-3 min-h-[260px] hover:bg-red-500/15 transition-colors">
            <span className="text-5xl font-bold text-red-400/60">03</span>
            <span className="text-lg font-semibold">Preview your resume</span>
            <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
              See a live preview of your resume as you build it, with instant formatting applied.
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 w-full sm:w-1/4 rounded-xl p-8 flex flex-col gap-3 min-h-[260px] hover:bg-red-500/15 transition-colors">
            <span className="text-5xl font-bold text-red-400/60">04</span>
            <span className="text-lg font-semibold">Download & share</span>
            <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
              Download your CV in PDF format and share with recruiters.
            </p>
          </div>
        </div>
      </section>

      {/* ── Everything You Need ── */}
      <section className="py-16 px-4 border-t border-red-500/10">
        <p className="text-xs uppercase tracking-widest text-red-400 font-medium mb-2">Why us</p>
        <h2 className="text-3xl font-semibold mb-10">Everything you need</h2>
        <div className="flex flex-wrap gap-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors cursor-default">
            <span className="text-red-400">✓</span> Free CV builder
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
            <span className="text-red-400">✓</span> Data stays in your browser
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors cursor-default">
            <span className="text-red-400">✓</span> Works on mobile
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors cursor-default">
            <span className="text-red-400">✓</span> Instant preview
          </div>
        </div>
      </section>

      {/* ── From the blog ── */}
      <section className="py-16 px-4 border-t border-red-500/10">
        <p className="text-xs uppercase tracking-widest text-red-400 font-medium mb-2">CV tips</p>
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
        <p className="text-xs uppercase tracking-widest text-red-400 font-medium mb-2">Got questions?</p>
        <h2 className="text-3xl font-semibold mb-10">Frequently asked questions</h2>
        <div className="flex flex-col divide-y divide-red-500/10 max-w-2xl">
          <div className="py-5">
            <h3 className="font-medium text-base mb-2">Is this CV builder free?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yes, completely free with no hidden fees or sign-up required. You can create, edit, and download your
              CV at no cost.
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
              Yes. Once you've filled in your details, you can download a professionally formatted PDF ready to send
              to employers.
            </p>
          </div>

          <div className="py-5">
            <h3 className="font-medium text-base mb-2">Do I need to create an account?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No account or email required. Open the builder and start creating your CV immediately.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
