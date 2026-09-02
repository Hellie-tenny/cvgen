import { useRef, useState } from "react";
import type { CVData } from "@/lib/cv-types";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Upload,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractTextFromFile, ExtractionError } from "@/utils/extract-text";

// Set this to your deployed Worker URL.
const WORKER_URL = "https://etiquette-cv-letter.hellie.workers.dev";

type Mode = "app" | "upload";
type Step = "source" | "job" | "notes" | "result";

const STEP_ORDER: Step[] = ["source", "job", "notes", "result"];
const STEP_LABELS: Record<Step, string> = {
  source: "Your CV",
  job: "Job details",
  notes: "Notes",
  result: "Your letter",
};

interface CoverLetterGeneratorProps {
  data: CVData;
}

function buildProfileTextFromAppData(data: CVData): string {
  const lines: string[] = [];
  if (data.personal.summary) lines.push(data.personal.summary);

  if (data.experiences?.length) {
    for (const exp of data.experiences) {
      const period = exp.current ? `${exp.startDate} - present` : `${exp.startDate} - ${exp.endDate}`;
      lines.push(`${exp.position} at ${exp.company} (${period}): ${exp.description}`);
    }
  }

  if (data.skills?.length) {
    const skillNames = data.skills.map((s) => s.name).filter(Boolean).join(", ");
    if (skillNames) lines.push(`Skills: ${skillNames}`);
  }

  return lines.join("\n");
}

function hasUsableAppData(data: CVData): boolean {
  return data.personal.fullName.trim() !== "" && buildProfileTextFromAppData(data).trim() !== "";
}

export function CoverLetterGenerator({ data }: CoverLetterGeneratorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appDataAvailable = hasUsableAppData(data);

  const [step, setStep] = useState<Step>("source");
  const [mode, setMode] = useState<Mode>(appDataAvailable ? "app" : "upload");

  // Shared fields
  const [fullName, setFullName] = useState(data.personal.fullName || "");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState(data.personal.title || "");
  const [jobDescription, setJobDescription] = useState("");
  const [notes, setNotes] = useState("");

  // Upload-mode state
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedText, setUploadedText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");

  // Result state
  const [letter, setLetter] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const appProfileText = buildProfileTextFromAppData(data);
  const profileText = mode === "app" ? appProfileText : uploadedText;

  const sourceValid = fullName.trim() !== "" && profileText.trim() !== "" && !extracting;
  const jobValid = jobTitle.trim() !== "" && jobDescription.trim() !== "";

  const stepIndex = STEP_ORDER.indexOf(step);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === "app") {
      setFullName(data.personal.fullName || "");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractError("");
    setExtracting(true);
    setUploadedFileName(file.name);
    setUploadedText("");

    try {
      const text = await extractTextFromFile(file);
      setUploadedText(text);
    } catch (err) {
      setExtractError(err instanceof ExtractionError ? err.message : "Couldn't read that file. Please try another.");
      setUploadedFileName("");
    } finally {
      setExtracting(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName("");
    setUploadedText("");
    setExtractError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const goNext = () => {
    if (step === "source" && sourceValid) setStep("job");
    else if (step === "job" && jobValid) setStep("notes");
  };

  const goBack = () => {
    if (step === "job") setStep("source");
    else if (step === "notes") setStep("job");
    else if (step === "result") setStep("notes");
  };

  const handleGenerate = async () => {
    setStep("result");
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          jobTitle,
          companyName,
          profileText,
          jobDescription,
          notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setLetter(result.letter);
      setStatus("idle");
    } catch {
      setErrorMessage("Couldn't reach the AI service. Check your connection and try again.");
      setStatus("error");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartOver = () => {
    setStep("source");
    setLetter("");
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {STEP_ORDER.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? "bg-red-500" : "bg-sidebar-border"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-sidebar-muted -mt-4">
        Step {stepIndex + 1} of {STEP_ORDER.length} · {STEP_LABELS[step]}
      </p>

      {/* ── Step 1: CV source ── */}
      {step === "source" && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-sidebar-foreground mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-red-500" />
              Where's your CV coming from?
            </h3>
            <p className="text-sm text-sidebar-muted">
              We'll pull your details from here to write the letter.
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-sidebar-accent/50 border border-sidebar-border rounded-lg">
            <button
              type="button"
              onClick={() => handleModeChange("app")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                mode === "app" ? "bg-red-500 text-white" : "text-sidebar-muted hover:text-sidebar-foreground"
              }`}
            >
              Use my Etiquette CV
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("upload")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                mode === "upload" ? "bg-red-500 text-white" : "text-sidebar-muted hover:text-sidebar-foreground"
              }`}
            >
              Upload a document
            </button>
          </div>

          {mode === "app" && !appDataAvailable && (
            <div className="flex items-start gap-2 p-3 bg-sidebar-accent/50 border border-sidebar-border rounded-lg text-sm text-sidebar-muted">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                We didn't find a saved CV in your browser. Build one in the CV Builder, or switch to "Upload a document" above.
              </span>
            </div>
          )}

          {mode === "app" && appDataAvailable && (
            <div className="flex items-start gap-2 p-3 bg-sidebar-accent/50 border border-sidebar-border rounded-lg text-sm text-sidebar-muted">
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
              <span>
                Using your saved CV — {data.personal.fullName}, {data.experiences.length} experience
                {data.experiences.length === 1 ? "" : "s"}, {data.skills.length} skill{data.skills.length === 1 ? "" : "s"}.
              </span>
            </div>
          )}

          {mode === "upload" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-sidebar-foreground">Your CV (PDF or Word)</label>

              {!uploadedFileName && !extracting && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed border-sidebar-border rounded-lg text-sidebar-muted hover:border-red-500/50 hover:text-sidebar-foreground transition-colors"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Click to upload a .pdf or .docx file</span>
                  <span className="text-xs">Your file stays in your browser — only the text is used</span>
                </button>
              )}

              {extracting && (
                <div className="flex items-center gap-2 py-4 text-sm text-sidebar-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reading {uploadedFileName}...
                </div>
              )}

              {uploadedFileName && !extracting && uploadedText && (
                <div className="flex items-center justify-between p-3 bg-sidebar-accent border border-sidebar-border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-sidebar-foreground min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-red-500" />
                    <span className="truncate">{uploadedFileName}</span>
                  </div>
                  <button type="button" onClick={handleRemoveFile} className="text-sidebar-muted hover:text-sidebar-foreground shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {extractError && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{extractError}</span>
                </div>
              )}

              <label className="text-sm font-medium text-sidebar-foreground block pt-2">Your full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Hellings Banda"
                className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Job details ── */}
      {step === "job" && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-sidebar-foreground mb-1">Tell us about the role</h3>
            <p className="text-sm text-sidebar-muted">Paste the job details and we'll tailor the letter to it.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-sidebar-foreground">Job title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. IT Officer"
              className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-sidebar-foreground">Company name (optional)</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Old Mutual Malawi"
              className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-sidebar-foreground">Job description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description, or the entire job listing page if that's easier — we'll figure out the relevant parts."
              rows={8}
              className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary resize-none"
            />
          </div>
        </div>
      )}

      {/* ── Step 3: Notes ── */}
      {step === "notes" && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-sidebar-foreground mb-1">Anything specific in mind?</h3>
            <p className="text-sm text-sidebar-muted">
              Optional — tone, length, things to mention. Leave it blank if not.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-sidebar-foreground">Notes for the AI (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Keep it more formal, mention that I'm open to relocating, keep it under 150 words..."
              rows={5}
              className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary resize-none"
            />
          </div>

          <Button
            onClick={handleGenerate}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate cover letter
          </Button>
          <p className="text-xs text-sidebar-muted text-center -mt-3">
            Letters are written by Google's Gemini AI based on the details you gave.
          </p>
        </div>
      )}

      {/* ── Step 4: Result ── */}
      {step === "result" && (
        <div className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-12 text-sidebar-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Writing your letter...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === "idle" && letter && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sidebar-foreground">Your draft</h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-sm text-sidebar-muted hover:text-sidebar-foreground transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                rows={14}
                className="w-full px-4 py-3 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-primary resize-none font-serif text-sm leading-relaxed"
              />
              <p className="text-xs text-sidebar-muted">
                This is a starting draft — always review it before sending, and edit anything that doesn't sound like you.
              </p>
            </>
          )}

          <button
            type="button"
            onClick={handleStartOver}
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm text-sidebar-muted hover:text-sidebar-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Start over
          </button>
        </div>
      )}

      {/* ── Step navigation ── */}
      {step !== "result" && (
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={goBack}
            disabled={step === "source"}
            className="flex items-center gap-1 px-4 py-2 border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent disabled:opacity-30 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {step !== "notes" && (
            <button
              type="button"
              onClick={goNext}
              disabled={(step === "source" && !sourceValid) || (step === "job" && !jobValid)}
              className="flex items-center gap-1 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors font-medium"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
