import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { CheckCircle2, AlertCircle, Loader2, Upload, X, Sparkles } from "lucide-react";
import { db } from "@/firebase/config";
import { useLocalStorage } from "../hooks/use-local-storage";
import Header from "../components/Header";
import Footer from "../components/Footer";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const WORKER_URL = "https://etiquette-cv-letter.hellie.workers.dev";

interface PostJobDraft {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactAddress: string;
  jobTitle: string;
  location: string;
  employmentType: string;
  description: string;
  howToApplyNotes: string;
  closingDate: string;
}

const emptyDraft: PostJobDraft = {
  companyName: "",
  contactName: "",
  contactEmail: "",
  contactAddress: "",
  jobTitle: "",
  location: "",
  employmentType: EMPLOYMENT_TYPES[0],
  description: "",
  howToApplyNotes: "",
  closingDate: "",
};

export default function PostJob() {
  // Persisted across refreshes so an accidental reload doesn't lose progress.
  // Merged with emptyDraft on every read — a draft saved before a new field
  // (like contactAddress) existed would otherwise come back missing it,
  // and crash anything that calls .trim() on that field.
  const [storedDraft, setDraft] = useLocalStorage<Partial<PostJobDraft>>("post-job-draft", emptyDraft);
  const draft: PostJobDraft = { ...emptyDraft, ...storedDraft };
  const update = (patch: Partial<PostJobDraft>) => setDraft((prev) => ({ ...emptyDraft, ...prev, ...patch }));

  const [descriptionMode, setDescriptionMode] = useState<"text" | "image">("text");
  const jobImageInputRef = useRef<HTMLInputElement>(null);
  const [jobImagePreview, setJobImagePreview] = useState("");
  const [jobImageBase64, setJobImageBase64] = useState("");
  const [jobImageMimeType, setJobImageMimeType] = useState("");
  const [jobImageFileName, setJobImageFileName] = useState("");
  const [isDraggingJobImage, setIsDraggingJobImage] = useState(false);
  const [extractingImage, setExtractingImage] = useState(false);
  const [extractImageError, setExtractImageError] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const missingFields: string[] = [];
  if (draft.companyName.trim() === "") missingFields.push("Company name");
  if (draft.contactEmail.trim() === "" && draft.contactAddress.trim() === "") {
    missingFields.push("Contact email or postal address (at least one)");
  }
  if (draft.jobTitle.trim() === "") missingFields.push("Job title");
  if (draft.description.trim().length < 30) {
    missingFields.push(
      draft.description.trim().length === 0
        ? "Job description"
        : `Job description (needs 30+ characters, currently ${draft.description.trim().length})`
    );
  }
  if (draft.closingDate.trim() === "") missingFields.push("Closing date");

  const isValid = missingFields.length === 0;

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  const processJobImage = (file: File) => {
    setExtractImageError("");

    if (!file.type.startsWith("image/")) {
      setExtractImageError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setExtractImageError("That image is too large. Please upload something under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setJobImagePreview(result);
      setJobImageBase64(result.split(",")[1] || "");
      setJobImageMimeType(file.type);
      setJobImageFileName(file.name);
    };
    reader.onerror = () => setExtractImageError("Couldn't read that image. Please try another.");
    reader.readAsDataURL(file);
  };

  const handleJobImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processJobImage(file);
  };

  const handleJobImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingJobImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processJobImage(file);
  };

  const handleRemoveJobImage = () => {
    setJobImagePreview("");
    setJobImageBase64("");
    setJobImageMimeType("");
    setJobImageFileName("");
    setExtractImageError("");
    if (jobImageInputRef.current) jobImageInputRef.current.value = "";
  };

  const handleExtractFromImage = async () => {
    setExtractingImage(true);
    setExtractImageError("");

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extract",
          jobImage: { data: jobImageBase64, mimeType: jobImageMimeType },
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setExtractImageError(result.error || "Couldn't read that image clearly. Try a clearer photo, or type it out instead.");
        return;
      }

      update({
        description: result.extractedText || draft.description,
        jobTitle: result.jobTitle || draft.jobTitle,
        companyName: result.companyName || draft.companyName,
        howToApplyNotes: result.applyInstructions || draft.howToApplyNotes,
        contactEmail: result.applyMethod === "email" && result.applyContact ? result.applyContact : draft.contactEmail,
      });
      setDescriptionMode("text");
      handleRemoveJobImage();
    } catch {
      setExtractImageError("Couldn't reach the AI service. Try again, or type the description out instead.");
    } finally {
      setExtractingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      await addDoc(collection(db, "jobListings"), {
        companyName: draft.companyName.trim(),
        contactName: draft.contactName.trim(),
        contactEmail: draft.contactEmail.trim(),
        contactAddress: draft.contactAddress.trim(),
        jobTitle: draft.jobTitle.trim(),
        location: draft.location.trim(),
        employmentType: draft.employmentType,
        description: draft.description.trim(),
        howToApplyNotes: draft.howToApplyNotes.trim(),
        closingDate: Timestamp.fromDate(new Date(draft.closingDate)),
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setDraft(emptyDraft);
      setStatus("success");
    } catch (err) {
      console.error("Error submitting job listing:", err);
      setErrorMessage("Something went wrong submitting your listing. Please try again.");
      setStatus("error");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

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
          {/* ── Job description first: type it out, or upload a photo/flyer.
               Uploading lets extraction auto-fill the fields below, so this
               comes before anything that extraction could fill in. ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Job description</label>
              <div className="flex gap-1 p-1 bg-background border border-border rounded-lg">
                <button
                  type="button"
                  onClick={() => setDescriptionMode("text")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    descriptionMode === "text" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Type it out
                </button>
                <button
                  type="button"
                  onClick={() => setDescriptionMode("image")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    descriptionMode === "image" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload a photo
                </button>
              </div>
            </div>

            {descriptionMode === "text" && (
              <textarea
                value={draft.description}
                onChange={(e) => update({ description: e.target.value })}
                required
                rows={8}
                placeholder="Responsibilities, requirements, qualifications..."
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            )}

            {descriptionMode === "image" && (
              <div className="space-y-3">
                {!jobImagePreview && (
                  <button
                    type="button"
                    onClick={() => jobImageInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingJobImage(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingJobImage(false);
                    }}
                    onDrop={handleJobImageDrop}
                    className={`w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed rounded-lg transition-colors ${
                      isDraggingJobImage
                        ? "border-red-500 bg-red-500/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-red-500/50 hover:text-foreground"
                    }`}
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">
                      {isDraggingJobImage ? "Drop the image here" : "Click or drag a photo of the vacancy here"}
                    </span>
                    <span className="text-xs">JPG or PNG, under 5MB</span>
                  </button>
                )}

                {jobImagePreview && (
                  <div className="relative border border-border rounded-lg overflow-hidden">
                    <img src={jobImagePreview} alt={jobImageFileName} className="w-full max-h-64 object-contain bg-black/20" />
                    <button
                      type="button"
                      onClick={handleRemoveJobImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={jobImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleJobImageSelect}
                  className="hidden"
                />

                {extractImageError && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{extractImageError}</span>
                  </div>
                )}

                {jobImagePreview && (
                  <button
                    type="button"
                    onClick={handleExtractFromImage}
                    disabled={extractingImage}
                    className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                  >
                    {extractingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Reading the image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Extract details from this image
                      </>
                    )}
                  </button>
                )}

                {draft.description && (
                  <div className="p-3 bg-background border border-border rounded-lg text-sm text-muted-foreground max-h-32 overflow-y-auto">
                    <span className="font-medium text-foreground">Extracted so far: </span>
                    {draft.description}
                  </div>
                )}

                {!jobImagePreview && draft.description && (
                  <p className="text-xs text-muted-foreground">
                    Already have a description from a previous upload? It's saved below — switch to "Type it out" to
                    view or edit it.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company name</label>
              <input
                type="text"
                value={draft.companyName}
                onChange={(e) => update({ companyName: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your name (optional)</label>
              <input
                type="text"
                value={draft.contactName}
                onChange={(e) => update({ contactName: e.target.value })}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contact email (optional if you provide an address below)</label>
            <input
              type="email"
              value={draft.contactEmail}
              onChange={(e) => update({ contactEmail: e.target.value })}
              placeholder="Where applications and approval notices will go"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Postal address / P.O. Box (if you don't have an email)</label>
            <input
              type="text"
              value={draft.contactAddress}
              onChange={(e) => update({ contactAddress: e.target.value })}
              placeholder="e.g. P.O. Box 410, Lilongwe"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-muted-foreground">
              At least one of email or postal address is required, so candidates and we have a way to reach you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job title</label>
              <input
                type="text"
                value={draft.jobTitle}
                onChange={(e) => update({ jobTitle: e.target.value })}
                required
                placeholder="e.g. Accounts Officer"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location (optional)</label>
              <input
                type="text"
                value={draft.location}
                onChange={(e) => update({ location: e.target.value })}
                placeholder="e.g. Lilongwe"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employment type</label>
              <select
                value={draft.employmentType}
                onChange={(e) => update({ employmentType: e.target.value })}
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
              <label className="text-sm font-medium">Closing date</label>
              <input
                type="date"
                value={draft.closingDate}
                onChange={(e) => update({ closingDate: e.target.value })}
                required
                min={todayStr}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-muted-foreground">Listing is automatically taken down after this date.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">How should candidates apply? (optional)</label>
            <textarea
              value={draft.howToApplyNotes}
              onChange={(e) => update({ howToApplyNotes: e.target.value })}
              rows={3}
              placeholder="e.g. Email your CV and cover letter, or apply through a specific link — leave blank and we'll direct candidates to your contact details above."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {status === "error" && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isValid && missingFields.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-background border border-border rounded-lg text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground">Still needed before you can submit:</span>
                <ul className="list-disc list-inside mt-1">
                  {missingFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
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
