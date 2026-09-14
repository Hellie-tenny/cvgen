import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { db } from "@/firebase/config";
import Header from "../components/Header";
import Footer from "../components/Footer";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export default function PostJob() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState(EMPLOYMENT_TYPES[0]);
  const [description, setDescription] = useState("");
  const [howToApplyNotes, setHowToApplyNotes] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isValid =
    companyName.trim() !== "" &&
    contactEmail.trim() !== "" &&
    jobTitle.trim() !== "" &&
    description.trim().length >= 30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      await addDoc(collection(db, "jobListings"), {
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        jobTitle: jobTitle.trim(),
        location: location.trim(),
        employmentType,
        description: description.trim(),
        howToApplyNotes: howToApplyNotes.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setStatus("success");
    } catch (err) {
      console.error("Error submitting job listing:", err);
      setErrorMessage("Something went wrong submitting your listing. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div>
        <Helmet>
          <title>Listing submitted — Etiquette</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Header />
        <div className="max-w-xl mx-auto p-4 py-24 text-center">
          <CheckCircle2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Listing submitted</h1>
          <p className="text-muted-foreground mb-8">
            Thanks — we'll review your listing and publish it once approved. This usually doesn't take long.
          </p>
          <Link to="/" className="text-red-500 hover:underline">
            Back to home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Post a Job — Etiquette</title>
        <meta
          name="description"
          content="Post a job listing for free and reach candidates using Etiquette's AI cover letter tool."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Header />

      <div className="max-w-xl mx-auto p-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
        <p className="text-muted-foreground mb-8">
          Submit your listing below. We review every listing before it goes live — you'll see it published shortly
          after approval.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your name (optional)</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contact email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              placeholder="Where applications and approval notices will go"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                placeholder="e.g. Accounts Officer"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location (optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lilongwe"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Employment type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={8}
              placeholder="Responsibilities, requirements, qualifications..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">How should candidates apply? (optional)</label>
            <textarea
              value={howToApplyNotes}
              onChange={(e) => setHowToApplyNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Email your CV and cover letter, or apply through a specific link — leave blank and we'll direct candidates to your contact email above."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {status === "error" && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || status === "submitting"}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for review"
            )}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
