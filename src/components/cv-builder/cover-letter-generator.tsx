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
  Mail,
  Link2,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractTextFromFile, ExtractionError } from "@/utils/extract-text";
import { buildLetterParts, composeLetterText } from "@/utils/letter-format";
import { LetterDownloadMenu } from "./letter-download-menu";
import { LetterEditorModal } from "./letter-editor-modal";

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

function ApplyMethodIcon({ method }: { method: string }) {
  if (method === "email") return <Mail className="h-4 w-4 text-red-500" />;
  if (method === "link") return <Link2 className="h-4 w-4 text-red-500" />;
  if (method === "address") return <MapPin className="h-4 w-4 text-red-500" />;
  return <ClipboardList className="h-4 w-4 text-red-500" />;
}

function ApplyContact({ method, contact }: { method: string; contact: string }) {
  if (!contact) return null;

  if (method === "email") {
    return (
      <a href={`mailto:${contact}`} className="text-red-500 hover:underline break-all">
        {contact}
      </a>
    );
  }

  if (method === "link") {
    const href = /^https?:\/\//i.test(contact) ? contact : `https://${contact}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline break-all">
        {contact}
      </a>
    );
  }

  return <span className="text-sidebar-foreground break-words">{contact}</span>;
}

export function CoverLetterGenerator({ data }: CoverLetterGeneratorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appDataAvailable = hasUsableAppData(data);

  const [step, setStep] = useState<Step>("source");
  const [mode, setMode] = useState<Mode>(appDataAvailable ? "app" : "upload");
  const [jobPhase, setJobPhase] = useState<"paste" | "confirm">("paste");

  // Shared fields
  const [fullName, setFullName] = useState(data.personal.fullName || "");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState(data.personal.title || "");
  const [jobDescription, setJobDescription] = useState("");
  const [notes, setNotes] = useState("");

  // Job extraction state
  const [extractingJob, setExtractingJob] = useState(false);
  const [extractJobError, setExtractJobError] = useState("");
  const [applyMethod, setApplyMethod] = useState("");
  const [applyInstructions, setApplyInstructions] = useState("");
  const [applyContact, setApplyContact] = useState("");

  // Upload-mode state
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedText, setUploadedText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [uploadEmail, setUploadEmail] = useState("");
  const [uploadPhone, setUploadPhone] = useState("");
  const [uploadAddress, setUploadAddress] = useState("");
  const [detectingContact, setDetectingContact] = useState(false);

  // Result state
  const [letter, setLetter] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);

  const appProfileText = buildProfileTextFromAppData(data);
  const profileText = mode === "app" ? appProfileText : uploadedText;

  const personalContact =
    mode === "app"
      ? { email: data.personal.email, phone: data.personal.phone, location: data.personal.location }
      : { email: uploadEmail, phone: uploadPhone, location: uploadAddress };

  const sourceValid = fullName.trim() !== "" && profileText.trim() !== "" && !extracting;
  const pasteValid = jobDescription.trim().length >= 30;
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
      detectContactFromText(text);
    } catch (err) {
      setExtractError(err instanceof ExtractionError ? err.message : "Couldn't read that file. Please try another.");
      setUploadedFileName("");
    } finally {
      setExtracting(false);
    }
  };

  const detectContactFromText = async (text: string) => {
    setDetectingContact(true);
    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extractContact", cvText: text }),
      });
      const result = await response.json();
      if (response.ok) {
        if (result.email) setUploadEmail(result.email);
        if (result.phone) setUploadPhone(result.phone);
        if (result.address) setUploadAddress(result.address);
      }
    } catch {
      // Non-critical — the manual fields are always there as a fallback.
    } finally {
      setDetectingContact(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName("");
    setUploadedText("");
    setExtractError("");
    setUploadEmail("");
    setUploadPhone("");
    setUploadAddress("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const goNext = () => {
    if (step === "source" && sourceValid) setStep("job");
    else if (step === "job" && jobPhase === "confirm" && jobValid) setStep("notes");
  };

  const goBack = () => {
    if (step === "job") {
      if (jobPhase === "confirm") {
        setJobPhase("paste");
        return;
      }
      setStep("source");
    } else if (step === "notes") {
      setStep("job");
    } else if (step === "result") {
      setStep("notes");
    }
  };

  const handleExtractJob = async () => {
    setExtractingJob(true);
    setExtractJobError("");

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extract", jobText: jobDescription }),
      });

      const result = await response.json();

      if (!response.ok) {
        setExtractJobError(result.error || "Couldn't read details from that listing — you can fill them in manually below.");
        setJobPhase("confirm");
        return;
      }

      if (result.jobTitle) setJobTitle(result.jobTitle);
      if (result.companyName) setCompanyName(result.companyName);
      setApplyMethod(result.applyMethod || "");
      setApplyInstructions(result.applyInstructions || "");
      setApplyContact(result.applyContact || "");
      if (!result.jobTitle && !result.companyName) {
        setExtractJobError("Couldn't find a clear job title or company in that text — you can fill them in manually below.");
      }
      setJobPhase("confirm");
    } catch {
      setExtractJobError("Couldn't reach the AI service — you can fill the details in manually below.");
      setJobPhase("confirm");
    } finally {
      setExtractingJob(false);
    }
  };

  const handleSkipExtraction = () => {
    setExtractJobError("");
    setJobPhase("confirm");
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
          action: "generate",
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
    const parts = buildLetterParts(letter, fullName, personalContact, jobTitle, companyName);
    await navigator.clipboard.writeText(composeLetterText(parts));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartOver = () => {
    setStep("source");
    setJobPhase("paste");
    setExtractJobError("");
    setApplyMethod("");
    setApplyInstructions("");
    setApplyContact("");
    setUploadEmail("");
    setUploadPhone("");
    setUploadAddress("");
    setLetter("");
    setStatus("idle");
    setErrorMessage("");
    setShowEditor(false);
    setShowNextSteps(false);
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

              <p className="text-xs text-sidebar-muted pt-2">
                {detectingContact
                  ? "Looking for your address, email, and phone in the CV you uploaded..."
                  : "We'll pull your address, email, and phone from your CV automatically — fill these in yourself if we couldn't find them."}
              </p>

              <label className="text-sm font-medium text-sidebar-foreground block">Address (optional)</label>
              <input
                type="text"
                value={uploadAddress}
                onChange={(e) => setUploadAddress(e.target.value)}
                placeholder="e.g. Bwaila Secondary School, P.O Box 410, Lilongwe"
                className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-sidebar-foreground block">Email (optional)</label>
                  <input
                    type="email"
                    value={uploadEmail}
                    onChange={(e) => setUploadEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-sidebar-foreground block">Phone (optional)</label>
                  <input
                    type="tel"
                    value={uploadPhone}
                    onChange={(e) => setUploadPhone(e.target.value)}
                    placeholder="+265..."
                    className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Job details ── */}
      {step === "job" && jobPhase === "paste" && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-sidebar-foreground mb-1">Paste the job listing</h3>
            <p className="text-sm text-sidebar-muted">
              Paste the job description, or the whole listing page — we'll pull out the job title and company for you.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-sidebar-foreground">Job description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description, or the entire job listing page if that's easier — we'll figure out the relevant parts."
              rows={10}
              className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary resize-none"
            />
          </div>

          <Button
            onClick={handleExtractJob}
            disabled={!pasteValid || extractingJob}
            className="w-full bg-red-500 hover:bg-red-600 text-white disabled:opacity-40"
          >
            {extractingJob ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reading the listing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Extract job details
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={handleSkipExtraction}
            disabled={!pasteValid || extractingJob}
            className="w-full text-center text-sm text-sidebar-muted hover:text-sidebar-foreground disabled:opacity-40 transition-colors"
          >
            Skip — I'll fill in the title and company myself
          </button>
        </div>
      )}

      {step === "job" && jobPhase === "confirm" && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-sidebar-foreground mb-1">Confirm the role</h3>
            <p className="text-sm text-sidebar-muted">
              {extractJobError ? "We couldn't auto-fill everything —" : "Pulled from your paste —"} feel free to edit before continuing.
            </p>
          </div>

          {extractJobError && (
            <div className="flex items-start gap-2 p-3 bg-sidebar-accent/50 border border-sidebar-border rounded-lg text-sm text-sidebar-muted">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{extractJobError}</span>
            </div>
          )}

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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-sidebar-foreground">Job description</label>
              <button
                type="button"
                onClick={() => {
                  setJobPhase("paste");
                  setApplyMethod("");
                  setApplyInstructions("");
                  setApplyContact("");
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Edit pasted text
              </button>
            </div>
            <div className="w-full max-h-32 overflow-y-auto px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-muted text-sm">
              {jobDescription}
            </div>
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

              {(() => {
                const parts = buildLetterParts(letter, fullName, personalContact, jobTitle, companyName);
                return (
                  <div className="border border-sidebar-border rounded-lg overflow-hidden">
                    <div className="p-4 bg-sidebar-accent/50 text-sm space-y-3">
                      <div className="text-right text-sidebar-muted">
                        {parts.fullName && <p className="text-sidebar-foreground font-medium">{parts.fullName}</p>}
                        {parts.addressLines.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                        {parts.email && <p>Email: {parts.email}</p>}
                        {parts.phone && <p>Phone: {parts.phone}</p>}
                        <p className="pt-1">{parts.dateLine}</p>
                      </div>
                      {parts.recipientLines.length > 0 && (
                        <div>
                          {parts.recipientLines.map((line, i) => (
                            <p key={i} className="text-sidebar-foreground">{line}</p>
                          ))}
                        </div>
                      )}
                      <p className="text-sidebar-foreground">{parts.salutation}</p>
                      {parts.subjectLine && (
                        <p className="font-semibold text-sidebar-foreground">{parts.subjectLine}</p>
                      )}
                    </div>

                    <textarea
                      value={letter}
                      onChange={(e) => setLetter(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-3 bg-sidebar-accent border-t border-sidebar-border text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sidebar-primary resize-none font-serif text-sm leading-relaxed"
                    />

                    <div className="p-4 bg-sidebar-accent/50 border-t border-sidebar-border text-sm">
                      <p className="text-sidebar-foreground">{parts.closing}</p>
                      <p className="text-sidebar-foreground mt-6">{parts.fullName}</p>
                    </div>
                  </div>
                );
              })()}

              <p className="text-xs text-sidebar-muted">
                The highlighted area is editable — everything else (letterhead, salutation, closing) is filled in
                automatically from your details.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <LetterDownloadMenu
                  parts={buildLetterParts(letter, fullName, personalContact, jobTitle, companyName)}
                />
                <button
                  type="button"
                  onClick={() => setShowEditor(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Open .doc editor
                </button>
              </div>

              {(applyInstructions || applyContact) && !showNextSteps && (
                <button
                  type="button"
                  onClick={() => setShowNextSteps(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                >
                  <ApplyMethodIcon method={applyMethod} />
                  See what to do next
                </button>
              )}

              {(applyInstructions || applyContact) && showNextSteps && (
                <div className="p-4 bg-sidebar-accent/50 border border-sidebar-border rounded-lg space-y-2">
                  <h4 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
                    <ApplyMethodIcon method={applyMethod} />
                    What to do next
                  </h4>
                  {applyInstructions && (
                    <p className="text-sm text-sidebar-muted leading-relaxed">{applyInstructions}</p>
                  )}
                  {applyContact && (
                    <p className="text-sm">
                      <ApplyContact method={applyMethod} contact={applyContact} />
                    </p>
                  )}
                  <p className="text-xs text-sidebar-muted pt-1">
                    Pulled from the job listing you pasted — double check it before applying.
                  </p>
                </div>
              )}
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
      {step !== "result" && !(step === "job" && jobPhase === "paste") && (
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

      {/* Job step, paste phase, only needs a Back button — the primary action lives above */}
      {step === "job" && jobPhase === "paste" && (
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1 px-4 py-2 border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      )}

      {showEditor && (
        <LetterEditorModal
          letter={letter}
          onChange={setLetter}
          fullName={fullName}
          personal={personalContact}
          jobTitle={jobTitle}
          companyName={companyName}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
