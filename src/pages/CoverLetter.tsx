import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { initialCVData } from "@/lib/cv-types";
import type { CVData } from "@/lib/cv-types";
import { useLocalStorage } from "../hooks/use-local-storage";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CoverLetterGenerator } from "../components/cv-builder/cover-letter-generator";

export default function CoverLetter() {
  const [cvData] = useLocalStorage<CVData>("cv-builder-data", initialCVData);

  const normalizedCVData: CVData = {
    ...initialCVData,
    ...cvData,
    personal: {
      ...initialCVData.personal,
      ...cvData.personal,
    },
    experiences: cvData.experiences ?? initialCVData.experiences,
    skills: cvData.skills ?? initialCVData.skills,
  };

  return (
    <div>
      {/*
        Reverted to noindex for now — keeping the FAQ/content as good practice
        regardless, but holding off on indexing until the /builder AdSense
        review has cleared and the site's had a few weeks of normal standing.
      */}
      <Helmet>
        <title>Free AI Cover Letter Generator — Etiquette CV</title>
        <meta
          name="description"
          content="Generate a tailored, professional cover letter free with AI. Paste a job description, use your CV or upload your own, and get a draft in seconds. No sign-up required."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Header />

      <div className="max-w-2xl mx-auto p-4 py-10">
        <Link
          to="/builder"
          className="inline-flex items-center gap-1 text-sm text-red-500 hover:underline mb-6"
        >
          ← Back to CV Builder
        </Link>

        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-red-400 font-medium mb-2 block">
            Free · No sign-up
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
            AI Cover Letter Generator
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Paste a job description, use the CV you've built in Etiquette CV or upload your own, and get a tailored,
            three-paragraph cover letter draft in seconds — free, with no account needed.
          </p>
        </div>

        <CoverLetterGenerator data={normalizedCVData} />

        {/* ── FAQ — real content, and where the AI disclosure lives ── */}
        <section className="mt-16 pt-10 border-t border-sidebar-border">
          <h2 className="text-2xl font-semibold mb-6">Frequently asked questions</h2>
          <div className="flex flex-col divide-y divide-sidebar-border">
            <div className="py-5">
              <h3 className="font-medium text-base mb-2">What AI writes my cover letter?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Letters are generated using Google's Gemini AI model. Your CV details and the job description you
                provide are sent to Gemini to draft the letter — nothing is stored on our servers.
              </p>
            </div>

            <div className="py-5">
              <h3 className="font-medium text-base mb-2">Is this really free?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Yes, completely free with no account or sign-up required.
              </p>
            </div>

            <div className="py-5">
              <h3 className="font-medium text-base mb-2">Do I need a CV built on Etiquette CV to use this?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No. You can either use a CV you've already built in Etiquette CV, or upload your own CV as a PDF or
                Word document — the tool works either way.
              </p>
            </div>

            <div className="py-5">
              <h3 className="font-medium text-base mb-2">Can I edit the generated letter?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Yes — treat it as a first draft. The result is fully editable, and we'd recommend reviewing it before
                sending to make sure it sounds like you.
              </p>
            </div>

            <div className="py-5">
              <h3 className="font-medium text-base mb-2">Can I paste the whole job listing, not just the description?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Yes. You can paste the full job listing page, including navigation text or unrelated content — the
                tool identifies the relevant role details automatically.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
