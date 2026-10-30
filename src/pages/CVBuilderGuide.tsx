import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Canonical } from '../components/Canonical'
import ToolGuide from '../components/ToolGuide'

// Explains the CV builder. The builder itself lives at /builder and stays a clean tool page.
// This is a content page, so it can carry ads; /builder must never.
export default function CVBuilderGuide() {
  return (
    <div>
      <Helmet>
        <title>How the Free CV Builder Works — Etiquette CV</title>
        <meta
          name="description"
          content="A simple guide to the free Etiquette CV builder: what to add, how templates work, where your data is stored and how to download your CV as a PDF. No sign-up needed."
        />
      </Helmet>
      <Canonical path="/cv-builder-guide" />

      <ToolGuide
        heading="A free CV builder that works on your phone"
        intro="Etiquette CV helps you put together a clean, professional CV without design skills or a sign-up. Fill in your details, pick a template, check the live preview and download a PDF that's ready to send to employers."
        cta={{ to: '/builder', label: 'Open the CV builder' }}
        stepsHeading="How it works"
        steps={[
          {
            title: 'Add your details',
            text: "Fill in your personal details, work experience, education, skills and references — whatever is relevant to the job you're applying for.",
          },
          {
            title: 'Choose a template',
            text: 'Pick the layout that suits the role. Simple, single-column layouts are the safest choice for online applications.',
          },
          {
            title: 'Check the preview',
            text: 'Review the live preview as you go, on your computer or your phone, and fix anything that looks off.',
          },
          {
            title: 'Download your PDF',
            text: 'Download your CV as a PDF and send it to the employer or attach it to your application.',
          },
        ]}
        faqs={[
          {
            q: 'Do I need to create an account?',
            a: 'No. You can build and download your CV without signing up.',
          },
          {
            q: 'Where is my CV stored?',
            a: "While you work, your details are saved in your own browser, so you can come back to them later on the same device. Use the bin icon at the top of the form to clear everything when you're finished, especially on a shared computer.",
          },
          {
            q: 'Can I use it on my phone?',
            a: 'Yes. The builder is designed for small screens, and you can switch to the preview at any time.',
          },
          {
            q: 'What format do I get?',
            a: 'A PDF, which keeps your layout exactly as you designed it on any device.',
          },
          {
            q: 'How long should my CV be?',
            a: 'For most jobs, one to two pages focused on the experience that is relevant to the role. Our guide to writing a CV that gets interviews explains what to include.',
          },
        ]}
      >
        <h2 className="text-2xl font-semibold mb-4">Before you send it</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          A few minutes of checking makes a real difference. Read{' '}
          <Link to="/blog/how-to-write-a-cv-that-gets-interviews" className="text-brand hover:underline">
            how to write a CV that gets interviews
          </Link>{' '}
          and run through the{' '}
          <Link to="/blog/common-cv-mistakes" className="text-brand hover:underline">
            common CV mistakes
          </Link>{' '}
          before you apply. Not sure about the terminology? Here is the{' '}
          <Link to="/blog/cv-vs-resume-difference" className="text-brand hover:underline">
            difference between a CV and a resume
          </Link>
          .
        </p>
        <p className="text-muted-foreground leading-relaxed mb-10">
          Once your CV is ready, write a matching letter with the{' '}
          <Link to="/cover-letter" className="text-brand hover:underline">
            AI cover letter generator
          </Link>{' '}
          or look through the latest{' '}
          <Link to="/jobs" className="text-brand hover:underline">
            job listings
          </Link>
          .
        </p>
      </ToolGuide>
    </div>
  )
}
