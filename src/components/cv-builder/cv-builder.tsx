import { useState } from "react";
import type { ReactNode } from "react";
import { initialCVData } from "@/lib/cv-types";
import type { CVData, TemplateId } from "@/lib/cv-types";
import { PersonalForm } from "./personal-form";
import { ExperienceForm } from "./experience-form";
import { EducationForm } from "./education-form";
import { SkillsForm } from "./skills-form";
import { ReferencesForm } from "./references-form";
import { CVPreview } from "./cv-preview";
import { PreviewFrame } from "./scaled-preview";
import { PDFDownloadButton } from "./pdf-download-button";
import { TemplateSelector } from "./template-selector";
import { User, Briefcase, GraduationCap, Sparkles, ChevronLeft, ChevronRight, CircleHelp, FileText, Palette, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "../../hooks/use-local-storage";

type Step = "personal" | "experience" | "education" | "skills" | "references" | "template";

const STEPS: { id: Step; label: string; icon: ReactNode }[] = [
  { id: "personal", label: "Personal", icon: <User className="h-4 w-4" /> },
  { id: "experience", label: "Experience", icon: <Briefcase className="h-4 w-4" /> },
  { id: "education", label: "Education", icon: <GraduationCap className="h-4 w-4" /> },
  { id: "skills", label: "Skills", icon: <Sparkles className="h-4 w-4" /> },
  { id: "references", label: "References", icon: <Users className="h-4 w-4" /> },
  { id: "template", label: "Template", icon: <Palette className="h-4 w-4" /> },
];

export function CVBuilder() {
  const [cvData, setCVData] = useLocalStorage<CVData>("cv-builder-data", initialCVData);
  const [currentStep, setCurrentStep] = useLocalStorage<Step>("cv-builder-step", "personal");
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);

  const showPreview = (show: boolean) => {
    setShowPreviewMobile(show);
    window.scrollTo({ top: 0 });
  };

  const normalizedCVData: CVData = {
    ...initialCVData,
    ...cvData,
    personal: {
      ...initialCVData.personal,
      ...cvData.personal,
    },
    experiences: cvData.experiences ?? initialCVData.experiences,
    educations: (cvData as any).educations ?? initialCVData.educations,
    skills: cvData.skills ?? initialCVData.skills,
    references: cvData.references ?? initialCVData.references,
    template: cvData.template ?? initialCVData.template,
  };

  const clearData = () => {
    if (window.confirm("Are you sure you want to clear all your CV data? This action cannot be undone.")) {
      setCVData(initialCVData);
      setCurrentStep("personal");
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "personal":
        return (
          <PersonalForm
            data={normalizedCVData.personal}
            onChange={(personal) => setCVData({ ...cvData, personal })}
          />
        );
      case "experience":
        return (
          <ExperienceForm
            data={normalizedCVData.experiences}
            onChange={(experiences) => setCVData({ ...cvData, experiences })}
          />
        );
      case "education":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-sidebar-foreground mb-1">Education</h3>
              <p className="text-sm text-sidebar-muted mb-4">Add your educational background</p>
            </div>
            <EducationForm
              data={normalizedCVData.educations}
              onChange={(educations) => setCVData({ ...cvData, educations })}
            />
          </div>
        );
      case "skills":
        return (
          <SkillsForm
            data={normalizedCVData.skills}
            onChange={(skills) => setCVData({ ...cvData, skills })}
          />
        );
      case "references":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-sidebar-foreground mb-1">
                Professional References
              </h3>
              <p className="text-sm text-sidebar-muted mb-4">
                Add people who can vouch for your work experience
              </p>
            </div>
            <ReferencesForm
              data={normalizedCVData.references}
              onChange={(references) => setCVData({ ...cvData, references })}
            />
          </div>
        );
      case "template":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-sidebar-foreground mb-1">
                Choose a Template
              </h3>
              <p className="text-sm text-sidebar-muted mb-4">
                Select a design that best represents your style
              </p>
            </div>
            <TemplateSelector
              selected={normalizedCVData.template}
              onChange={(template: TemplateId) => setCVData({ ...cvData, template })}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-4.5rem)]">
      {/* Left Panel - Form */}
      <div
        className={cn(
          "anim-fade w-full lg:w-[480px] min-h-[calc(100dvh-7.5rem)] md:min-h-[calc(100dvh-4rem)] lg:min-h-0 bg-sidebar flex flex-col",
          showPreviewMobile && "hidden lg:flex"
        )}
      >
        {/* Title */}
        <header className="px-4 py-3 border-b border-sidebar-border flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-sidebar-foreground">CV Builder</h1>
          <Link
            to="/cv-builder-guide"
            className="ml-auto p-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            title="How the CV builder works"
            aria-label="How the CV builder works"
          >
            <CircleHelp className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={clearData}
            className="shrink-0 p-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            title="Clear all CV data"
            aria-label="Clear all CV data"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </header>

        {/* Step navigation: icons for every step, label only for the current one, so it never needs scrolling */}
        <nav className="px-4 pt-3 pb-2 border-b border-sidebar-border" aria-label="CV sections">
          <p className="text-xs text-sidebar-foreground/60 mb-2">
            Step {currentStepIndex + 1} of {STEPS.length}
          </p>
          <ol className="flex items-center gap-1">
            {STEPS.map((step) => {
              const active = currentStep === step.id;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    aria-label={step.label}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-2 text-sm font-medium rounded-md transition-colors",
                      active
                        ? "bg-brand/10 text-brand"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    {step.icon}
                    {active && <span>{step.label}</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Form Content */}
        {/* Keyed by step, so each section eases in when you move between them */}
        <div key={currentStep} className="anim-step flex-1 min-h-0 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer navigation: one row, pinned to the bottom of the screen */}
        <footer className="above-tabbar sticky bottom-0 z-10 bg-sidebar p-3 border-t border-sidebar-border">
          <div className="flex items-center justify-between gap-2 w-full">
            <button
              type="button"
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 px-4 py-2 border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent disabled:opacity-30 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={() => showPreview(true)}
              className="lg:hidden flex items-center gap-1 px-3 py-2 border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            >
              <FileText className="h-4 w-4" />
              Preview
            </button>

            {currentStepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="flex items-center gap-1 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 rounded-md transition-colors font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              // On desktop the download button already sits above the preview, so only show it here on mobile.
              <div className="lg:hidden">
                <PDFDownloadButton
                  data={normalizedCVData}
                  className="flex items-center gap-1 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 rounded-md transition-colors font-medium"
                />
              </div>
            )}
          </div>
        </footer>
      </div>

      {/* Right Panel - Preview */}
      <div
        className={cn(
          "anim-fade flex-1 bg-muted lg:p-8 lg:overflow-y-auto",
          showPreviewMobile ? "flex flex-col min-h-[calc(100dvh-7.5rem)] md:min-h-[calc(100dvh-4rem)] lg:block lg:min-h-0" : "hidden lg:block"
        )}
      >
        <div className="flex-1 p-4 lg:p-0">
          <div className="mb-4 hidden lg:flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
              <p className="text-sm text-muted-foreground">See how your CV looks in real-time</p>
            </div>
            <PDFDownloadButton data={normalizedCVData} />
          </div>

          {/* Phones show the whole A4 page scaled to fit; desktop shows it at normal size */}
          <PreviewFrame>
            <CVPreview data={normalizedCVData} />
          </PreviewFrame>
        </div>

        {/* Phones: Edit and Download pinned to the bottom, where the form's Back / Next bar was */}
        <div className="above-tabbar bar-surface lg:hidden sticky bottom-0 z-10 flex items-center gap-2 p-3">
          <button
            type="button"
            onClick={() => showPreview(false)}
            className="flex items-center gap-1 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Edit
          </button>
          <PDFDownloadButton data={normalizedCVData} className="flex-1 h-10" />
        </div>
      </div>
    </div>
  );
}
