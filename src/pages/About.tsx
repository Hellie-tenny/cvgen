import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Canonical } from '../components/Canonical'

export default function About() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Helmet>
        <title>About Etiquette — Free CV Builder, Cover Letters and Jobs in Malawi</title>
        <meta
          name="description"
          content="Etiquette is a free job-seeking platform built in Malawi: a CV builder, an AI cover letter writer, a job board and practical career advice."
        />
      </Helmet>
      <Canonical path="/about" />

      <div className="py-12">
        <h1 className="text-4xl font-bold mb-4">About Etiquette</h1>
        <p className="text-muted-foreground">
          Etiquette is a free job-seeking platform built in Malawi. It puts the tools a job seeker needs in one
          place, so you can go from a blank page to a finished application without paying for software or
          creating an account.
        </p>
      </div>

      <div className="flex flex-col gap-10 pb-12">
        <section>
          <h2 className="text-2xl font-semibold mb-3">What you can do here</h2>
          <ul className="flex flex-col gap-3 text-muted-foreground leading-relaxed">
            <li>
              <Link to="/builder" className="text-red-500 hover:underline font-medium">CV Builder</Link> — fill in
              your details, pick a template and download a professionally formatted CV as a PDF or Word file. Your
              CV is kept in your own browser.
            </li>
            <li>
              <Link to="/cover-letter" className="text-red-500 hover:underline font-medium">Cover Letter Writer</Link>{' '}
              — give it your CV and the job you are applying for, and an AI draft is written for you to edit and
              download. You always have the final say on what gets sent.
            </li>
            <li>
              <Link to="/jobs" className="text-red-500 hover:underline font-medium">Jobs</Link> — a job board where
              employers can post vacancies for free. Each listing shows the closing date, requirements and how to
              apply.
            </li>
            <li>
              <Link to="/blog" className="text-red-500 hover:underline font-medium">Blog</Link> — practical guides on
              CVs, cover letters and interviews.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">How job listings are handled</h2>
          <p className="text-muted-foreground leading-relaxed">
            Employers submit vacancies through the <Link to="/post-job" className="text-red-500 hover:underline">Post a job</Link>{' '}
            page. Every listing is reviewed before it goes live, and listings stop appearing once their closing
            date has passed. Etiquette does not take part in hiring and does not charge job seekers or employers to
            use the board. Applications go directly to the employer using the details on the listing.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Be careful with any job offer that asks you to pay money to apply. If you see a listing that looks
            wrong, <Link to="/contact" className="text-red-500 hover:underline">let us know</Link> and we will look
            into it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Who is behind it</h2>
          <p className="text-muted-foreground leading-relaxed">
            Etiquette is built and maintained by Rocket Web, a small technology company based in Lilongwe, Malawi.
            It is an independent project, and the articles on the blog are written and published by us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Get in touch</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions, feedback or a problem with a listing? Visit the{' '}
            <Link to="/contact" className="text-red-500 hover:underline">contact page</Link>. To understand how your
            information is handled, read our <Link to="/privacy" className="text-red-500 hover:underline">privacy policy</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}
