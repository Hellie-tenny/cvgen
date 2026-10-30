import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { initialCVData } from "@/lib/cv-types";
import type { CVData } from "@/lib/cv-types";
import { db } from "@/firebase/config";
import { useLocalStorage } from "../hooks/use-local-storage";
import { Canonical } from "../components/Canonical";
import { CoverLetterGenerator, type PrefilledJob } from "../components/cv-builder/cover-letter-generator";

export default function CoverLetter() {
  const [cvData] = useLocalStorage<CVData>("cv-builder-data", initialCVData);
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [prefilledJob, setPrefilledJob] = useState<PrefilledJob | null>(null);
  const [loadingJob, setLoadingJob] = useState(!!jobId);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const snap = await getDoc(doc(db, "jobListings", jobId));
        if (snap.exists() && snap.data().status === "approved") {
          const listing = snap.data();
          setPrefilledJob({
            jobTitle: listing.jobTitle || "",
            companyName: listing.companyName || "",
            jobDescription: listing.description || "",
            applyMethod: "email",
            applyInstructions: listing.howToApplyNotes || "",
            applyContact: listing.contactEmail || "",
          });
        }
      } catch (err) {
        console.error("Error loading job listing:", err);
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
  }, [jobId]);

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
        This page is the tool. The explanation lives at /cover-letter-guide, which is where ads belong; never
        place ad units here. Pages opened with ?jobId=… are personalised copies, so those stay out of search.
      */}
      <Helmet>
        <title>Free AI Cover Letter Generator — Etiquette</title>
        <meta
          name="description"
          content="Generate a tailored, professional cover letter free with AI. Paste a job description, use your CV or upload your own, and get a draft in seconds. No sign-up required."
        />
        {jobId && <meta name="robots" content="noindex, follow" />}
      </Helmet>
      <Canonical path="/cover-letter" />


      <div className="max-w-2xl mx-auto p-4 py-10">
        <Link
          to="/builder"
          className="inline-flex items-center gap-1 text-sm text-brand hover:underline mb-6"
        >
          ← Back to CV Builder
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
            AI Cover Letter Generator
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {prefilledJob
              ? `Writing a letter for ${prefilledJob.jobTitle} at ${prefilledJob.companyName} — your job details are already filled in below.`
              : "Paste a job description, use the CV you've built in Etiquette CV or upload your own, and get a tailored, three-paragraph cover letter draft in seconds — free, with no account needed."}{" "}
            <Link to="/cover-letter-guide" className="text-brand hover:underline whitespace-nowrap">
              How it works
            </Link>
          </p>
        </div>

        {loadingJob ? (
          <p className="text-sm text-muted-foreground">Loading job details...</p>
        ) : (
          <CoverLetterGenerator data={normalizedCVData} prefilledJob={prefilledJob} />
        )}
      </div>
    </div>
  );
}
