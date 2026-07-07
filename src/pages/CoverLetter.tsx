import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { initialCVData } from "@/lib/cv-types";
import type { CVData } from "@/lib/cv-types";
import { useLocalStorage } from "../hooks/use-local-storage";
import Header from "../components/Header";
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

  const hasExistingCV =
    normalizedCVData.personal.fullName.trim() !== "" &&
    normalizedCVData.experiences.length > 0;

  return (
    <div>
      {/*
        This is a tool page, not a content page — same category as /builder.
        Never place ad units here.
      */}
      <Helmet>
        <title>AI Cover Letter Writer — Etiquette CV</title>
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

        {!hasExistingCV && (
          <div className="mb-6 p-4 bg-sidebar-accent/50 border border-sidebar-border rounded-lg text-sm text-sidebar-muted">
            This tool currently generates your letter from a CV built in Etiquette CV. We didn't find one saved in
            your browser yet —{" "}
            <Link to="/builder" className="text-red-500 hover:underline">
              build your CV first
            </Link>
            , then come back here. (Uploading your own CV file instead is coming soon.)
          </div>
        )}

        <CoverLetterGenerator data={normalizedCVData} />
      </div>
    </div>
  );
}
