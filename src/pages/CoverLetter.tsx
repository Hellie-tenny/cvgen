import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { initialCVData } from "@/lib/cv-types";
import type { CVData } from "@/lib/cv-types";
import { db } from "@/firebase/config";
import { useLocalStorage } from "../hooks/use-local-storage";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Canonical } from "../components/Canonical";
import ToolInfo from "../components/ToolInfo";
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
        Indexable: this is what people find when they search for a cover letter generator.
        Pages opened with ?jobId=… are personalised copies of the same page, so those stay out of search.
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
            {prefilledJob
              ? `Writing a letter for ${prefilledJob.jobTitle} at ${prefilledJob.companyName} — your job details are already filled in below.`
              : "Paste a job description, use the CV you've built in Etiquette CV or upload your own, and get a tailored, three-paragraph cover letter draft in seconds — free, with no account needed."}
          </p>
        </div>

        {loadingJob ? (
          <p className="text-sm text-muted-foreground">Loading job details...</p>
        ) : (
          <CoverLetterGenerator data={normalizedCVData} prefilledJob={prefilledJob} />
        )}
      </div>

      <ToolInfo
        heading="Write a cover letter that fits the job"
        intro="A good cover letter shows an employer why you're right for this particular role. The Etiquette cover letter generator drafts one from your CV and the job description, which you then edit and make your own."
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
          <Link to="/blog/common-cv-mistakes" className="text-red-500 hover:underline">
            common mistakes that get applications rejected
          </Link>
          .
        </p>
        <p className="text-muted-foreground leading-relaxed mb-10">
          Don't have a CV yet? Create one with the{" "}
          <Link to="/builder" className="text-red-500 hover:underline">
            free CV builder
          </Link>
          , then look for a role in the latest{" "}
          <Link to="/jobs" className="text-red-500 hover:underline">
            job listings
          </Link>
          .
        </p>
      </ToolInfo>

      <Footer />
    </div>
  );
}
