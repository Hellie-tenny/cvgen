import { useState } from "react";
import type { CVData } from "@/lib/cv-types";
import { Sparkles, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Set this to your deployed Worker URL once you have it.
const WORKER_URL = "https://etiquette-cv-letter.hellie.workers.dev";

interface CoverLetterGeneratorProps {
  data: CVData;
}

function buildExperienceSummary(data: CVData): string {
  if (!data.experiences || data.experiences.length === 0) {
    return data.personal.summary || "";
  }

  const lines = data.experiences.map((exp) => {
    const period = exp.current
      ? `${exp.startDate} - present`
      : `${exp.startDate} - ${exp.endDate}`;
    return `${exp.position} at ${exp.company} (${period}): ${exp.description}`;
  });

  return [data.personal.summary, ...lines].filter(Boolean).join("\n");
}

function buildSkillsList(data: CVData): string {
  if (!data.skills || data.skills.length === 0) return "";
  return data.skills.map((s) => s.name).filter(Boolean).join(", ");
}

export function CoverLetterGenerator({ data }: CoverLetterGeneratorProps) {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState(data.personal.title || "");
  const [jobDescription, setJobDescription] = useState("");
  const [letter, setLetter] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const experienceSummary = buildExperienceSummary(data);
  const skills = buildSkillsList(data);

  const canGenerate =
    data.personal.fullName.trim() !== "" &&
    experienceSummary.trim() !== "" &&
    skills.trim() !== "" &&
    jobTitle.trim() !== "" &&
    jobDescription.trim() !== "";

  const handleGenerate = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.personal.fullName,
          jobTitle,
          companyName,
          skills,
          experienceSummary,
          jobDescription,
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

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-sidebar-foreground mb-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-red-500" />
          AI Cover Letter
        </h3>
        <p className="text-sm text-sidebar-muted mb-4">
          Paste a job description and we'll draft a tailored cover letter using your CV details above.
        </p>
      </div>

      {(!data.personal.fullName || !experienceSummary || !skills) && (
        <div className="flex items-start gap-2 p-3 bg-sidebar-accent/50 border border-sidebar-border rounded-lg text-sm text-sidebar-muted">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Fill in your Personal, Experience, and Skills sections first — the letter is generated from that data.
          </span>
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
        <label className="text-sm font-medium text-sidebar-foreground">Job description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job posting or key requirements here..."
          rows={6}
          className="w-full px-4 py-2.5 bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-sidebar-primary resize-none"
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!canGenerate || status === "loading"}
        className="w-full bg-red-500 hover:bg-red-600 text-white disabled:opacity-40"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate cover letter
          </>
        )}
      </Button>

      {status === "error" && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {letter && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-sidebar-foreground">Your draft</label>
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
        </div>
      )}
    </div>
  );
}
