import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Canonical } from '../components/Canonical'

const CONTACT_EMAIL = 'rockettechco@gmail.com'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <div className="flex flex-col gap-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Helmet>
        <title>Privacy Policy — Etiquette</title>
        <meta
          name="description"
          content="How Etiquette handles your information: what stays in your browser, what is sent to the AI service, and what is published when an employer posts a job."
        />
      </Helmet>
      <Canonical path="/privacy" />

      <div className="py-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: 5 October 2026</p>
        <p className="text-muted-foreground mt-4">
          This policy explains what information Etiquette (ettiquette-cv.web.app) handles, why, and the choices you
          have. We have tried to keep it plain and specific to what the site actually does.
        </p>
      </div>

      <div className="flex flex-col gap-10 pb-12">
        <Section title="No accounts">
          <p>
            Etiquette has no sign-up or login for visitors. You can use the CV builder, the cover letter writer and
            the job board without giving us your name or email. The only login on the site is a private one used by
            our own administrator to review job listings and publish articles.
          </p>
        </Section>

        <Section title="The CV builder: stays in your browser">
          <p>
            Everything you type into the CV builder is saved in your own browser using local storage, so you can come
            back to it later. It is not sent to us or saved on our servers. Generating your PDF or Word file also
            happens in your browser.
          </p>
          <p>
            Because it lives in your browser, it is removed if you clear your browser data, and anyone else who uses
            the same browser profile could see it. Avoid building a CV on a shared computer, or clear your browser
            data afterwards.
          </p>
        </Section>

        <Section title="The cover letter writer: sent to an AI service">
          <p>
            The cover letter writer works differently from the CV builder. To write a letter, the text you provide is
            sent over the internet to our server-side service, which passes it to Google's Gemini AI to generate the
            result. This can include your name, the job title and company, the text of your CV or profile, the job
            description, and any notes you add.
          </p>
          <p>
            If you upload a CV file, its text is read in your browser first and then sent in the same way so that
            your contact details can be detected and the letter can be written. The same applies to the job listing
            text or photo you give the tool or the Post a job page for automatic extraction. Do not include
            information you are not comfortable sharing with an AI service. Google handles this content under its
            own terms and privacy policy.
          </p>
          <p>
            Etiquette does not save the text you send for letter writing in its own database. The cover letter tool
            also keeps your uploaded CV details in your browser's local storage so you don't have to re-enter them.
          </p>
        </Section>

        <Section title="Job listings: what becomes public">
          <p>
            When an employer or recruiter posts a job, we store the details they submit in our database (Google
            Firebase Firestore): company name, contact name, contact email, postal address, job title, location,
            employment type, description, how-to-apply notes and closing date.
          </p>
          <p>
            Once a listing is approved, the job details, the how-to-apply notes, and the contact email and postal
            address become publicly visible on the listing page, because job seekers need them to apply. Please only
            enter contact details that you are happy to publish. The contact name is stored for our own use and is
            not shown on the listing. If you choose to be notified by email, we may use your contact email to tell
            you when your listing is approved or removed.
          </p>
          <p>
            Listings stop appearing after their closing date and are removed from our database automatically after
            that. To have a listing corrected or removed sooner, email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-500 hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="Information stored in your browser">
          <p>
            Etiquette uses your browser's local storage, not tracking cookies of its own, to remember: your CV
            builder data and the step you were on, your uploaded CV details for the cover letter writer, a draft of a
            job posting you have not yet submitted, and your light or dark theme choice. You can delete all of this
            at any time by clearing your site data in your browser settings.
          </p>
        </Section>

        <Section title="Services we use">
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <span className="font-medium text-foreground">Google Firebase</span> hosts the site and stores job
              listings and blog articles. Like any web host, it may process technical information such as your IP
              address when you visit.
            </li>
            <li>
              <span className="font-medium text-foreground">Cloudflare Workers</span> runs the service that connects
              the site to the AI model, so that our AI access key is never exposed in your browser.
            </li>
            <li>
              <span className="font-medium text-foreground">Google Gemini</span> generates cover letters and reads
              job listings for the extraction feature.
            </li>
          </ul>
          <p>We do not sell your personal information.</p>
        </Section>

        <Section title="Advertising">
          <p>
            Etiquette is free to use, and we may show advertisements on some content pages in the future to cover the
            costs of running it. If we do, advertising partners such as Google AdSense may use cookies or similar
            technologies to show ads based on your visits to this and other websites. Google's use of advertising
            cookies lets it and its partners serve ads based on your visit to our site and other sites on the
            internet. You can opt out of personalised advertising at{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:underline"
            >
              google.com/settings/ads
            </a>
            . We will update this policy when advertising is switched on.
          </p>
        </Section>

        <Section title="Analytics">
          <p>
            We do not currently use an analytics or user-tracking service on the site. If that changes, we will
            update this policy.
          </p>
        </Section>

        <Section title="Children">
          <p>
            Etiquette is intended for job seekers and employers and is not directed at children under 13. We do not
            knowingly collect personal information from children.
          </p>
        </Section>

        <Section title="Your choices and requests">
          <p>
            You can ask us to correct or delete information you submitted to us, such as a job listing, by emailing{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-500 hover:underline">{CONTACT_EMAIL}</a>. For
            listings, please write from the email address used on the listing so we can confirm it is yours. Data
            kept in your own browser can be removed by you at any time by clearing your site data.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we change how the site handles information, we will update this page and the date at the top.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-500 hover:underline">{CONTACT_EMAIL}</a> or visit
            the <Link to="/contact" className="text-red-500 hover:underline">contact page</Link>.
          </p>
        </Section>
      </div>
    </div>
  )
}
