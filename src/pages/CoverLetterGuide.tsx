import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Canonical } from "../components/Canonical";
import ToolGuide from "../components/ToolGuide";

// Explains the cover letter generator. The generator itself lives at /cover-letter and stays a clean tool page.
// This is a content page, so it can carry ads; /cover-letter must never.
export default function CoverLetterGuide() {
  return (
    <div>
      <Helmet>
        <title>How the Free AI Cover Letter Generator Works — Etiquette</title>
        <meta
          name="description"
          content="How to write a tailored cover letter with the free Etiquette AI generator: choose your CV, add the job, add your notes, then edit and download. No sign-up needed."
        />
      </Helmet>
      <Canonical path="/cover-letter-guide" />

      <ToolGuide
        heading="Write a cover letter that fits the job"
        intro="A good cover letter shows an employer why you're right for this particular role. The Etiquette cover letter generator drafts one from your CV and the job description, which you then edit and make your own."
        cta={{ to: "/cover-letter", label: "Open the cover letter generator" }}
        stepsHeading="How it works"
        steps={[
          { title: "Choose your CV", text: "Use the CV you built in Etiquette CV, or upload your own." },
          {
            title: "Add the job",
            text: "Paste the job description, upload a photo of the advert, or start from a listing on our jobs page so the details are filled in for you.",
          },
          {
            title: "Add your notes",
            text: "Tell the AI anything it should mention or leave out, such as a relevant project or why you want the job.",
          },
          {
            title: "Edit and download",
            text: "Review the draft, change anything that doesn't sound like you, and download it as a PDF or Word document.",
          },
        ]}
        faqs={[
          { q: "Is the cover letter generator free?", a: "Yes. It's free to use and doesn't need an account." },
          {
            q: "Should I send the letter exactly as it's generated?",
            a: "No. Read it carefully, correct anything that isn't accurate, and add your own voice before you send it. Employers read a lot of letters and notice generic ones.",
          },
          {
            q: "How long should a cover letter be?",
            a: "Usually three short paragraphs on one page: why this job, why you, and a polite close.",
          },
          {
            q: "Can I use it for jobs I find on Etiquette?",
            a: "Yes. Open any listing on the jobs page and choose “Apply with a cover letter” to start with the job details already filled in.",
          },
        ]}
      >
        <h2 className="text-2xl font-semibold mb-4">Make the draft yours</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          An AI draft is a starting point. Check every fact against your CV, swap generic phrases for specific
          examples from your own experience, and keep it to one page. It also helps to avoid the{" "}
          <Link to="/blog/common-cv-mistakes" className="text-brand hover:underline">
            common mistakes that get applications rejected
          </Link>
          .
        </p>
        <p className="text-muted-foreground leading-relaxed mb-10">
          Don't have a CV yet? Create one with the{" "}
          <Link to="/builder" className="text-brand hover:underline">
            free CV builder
          </Link>
          , then look for a role in the latest{" "}
          <Link to="/jobs" className="text-brand hover:underline">
            job listings
          </Link>
          .
        </p>
      </ToolGuide>
    </div>
  );
}
