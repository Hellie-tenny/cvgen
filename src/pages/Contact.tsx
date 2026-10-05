import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Mail } from 'lucide-react'
import { Canonical } from '../components/Canonical'

const CONTACT_EMAIL = 'rockettechco@gmail.com'

export default function Contact() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Helmet>
        <title>Contact Etiquette</title>
        <meta
          name="description"
          content="Contact the Etiquette team with questions, feedback, job listing problems or requests to remove a listing."
        />
      </Helmet>
      <Canonical path="/contact" />

      <div className="py-12">
        <h1 className="text-4xl font-bold mb-4">Contact us</h1>
        <p className="text-muted-foreground">
          We read every message. Email us and we will reply as soon as we can.
        </p>
      </div>

      <div className="flex flex-col gap-10 pb-12">
        <section className="rounded-lg border border-red-500/20 bg-red-500/5 p-5 flex items-center gap-4">
          <Mail className="h-6 w-6 text-red-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Email</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-lg font-medium text-red-500 hover:underline break-all">
              {CONTACT_EMAIL}
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">What to write to us about</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2 text-muted-foreground leading-relaxed">
            <li>Questions or feedback about the CV builder, cover letter writer or job board.</li>
            <li>
              A job listing that looks wrong, expired or suspicious. Please include the link to the listing.
            </li>
            <li>
              Employers who want a listing corrected or removed. Please write from the email address used when the
              listing was posted.
            </li>
            <li>
              Privacy requests, such as asking us to delete information you submitted. See our{' '}
              <Link to="/privacy" className="text-red-500 hover:underline">privacy policy</Link>.
            </li>
            <li>Advertising, partnership or press enquiries.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Want to post a job?</h2>
          <p className="text-muted-foreground leading-relaxed">
            You don't need to email us. Use the <Link to="/post-job" className="text-red-500 hover:underline">Post a job</Link>{' '}
            page and we will review your listing before it goes live.
          </p>
        </section>
      </div>
    </div>
  )
}
