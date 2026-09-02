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
        Kept noindex for now, holding off on indexing until the /builder
        AdSense review has cleared and the site's had a few weeks of normal
        standing.
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
            AI Cover Letter Generator
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Paste a job description, use the CV you've built in Etiquette CV or upload your own, and get a tailored,
            three-paragraph cover letter draft in seconds — free, with no account needed.
          </p>
        </div>

        <CoverLetterGenerator data={normalizedCVData} />
      </div>

      <Footer />
    </div>
  );
}
