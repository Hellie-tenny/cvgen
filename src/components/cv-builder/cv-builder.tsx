import { useState } from "react";
import { initialCVData } from "@/lib/cv-types";
import type { CVData, TemplateId } from "@/lib/cv-types";
import { PersonalForm } from "./personal-form";
import { ExperienceForm } from "./experience-form";
import { SkillsForm } from "./skills-form";
import { CVPreview } from "./cv-preview";
import { PDFDownloadButton } from "./pdf-download-button";
import { TemplateSelector } from "./template-selector";
import { User, Briefcase, Sparkles, ChevronLeft, ChevronRight, FileText, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "personal" | "experience" | "skills" | "template";

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "personal", label: "Personal", icon: <User className="h-4 w-4" /> },
  { id: "experience", label: "Experience", icon: <Briefcase className="h-4 w-4" /> },
  { id: "skills", label: "Skills", icon: <Sparkles className="h-4 w-4" /> },
  { id: "template", label: "Template", icon: <Palette className="h-4 w-4" /> },
];

export function CVBuilder() {
  const [cvData, setCVData] = useState<CVData>(initialCVData);
  const [currentStep, setCurrentStep] = useState<Step>("personal");
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);

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
            data={cvData.personal}
            onChange={(personal) => setCVData({ ...cvData, personal })}
          />
        );
      case "experience":
        return (
          <ExperienceForm
            data={cvData.experiences}
            onChange={(experiences) => setCVData({ ...cvData, experiences })}
          />
        );
      case "skills":
        return (
          <SkillsForm
            data={cvData.skills}
            onChange={(skills) => setCVData({ ...cvData, skills })}
          />
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
              selected={cvData.template}
              onChange={(template: TemplateId) => setCVData({ ...cvData, template })}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Panel - Form */}
      <div
        className={cn(
          "w-full lg:w-[480px] bg-sidebar flex flex-col",
          showPreviewMobile && "hidden lg:flex"
        )}
      >
        {/* Header */}
        <header className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sidebar-primary rounded-lg">
              <FileText className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">
                CV Builder
              </h1>
              <p className="text-sm text-sidebar-muted">
                Create your professional resume
              </p>
            </div>
          </div>
        </header>

        {/* Step Navigation */}
        <nav className="px-6 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  currentStep === step.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{index + 1}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderStepContent()}</div>

        {/* Footer Navigation */}
        <footer className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
              className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </button>

            {/* Mobile Preview Toggle */}
            <button
              onClick={() => setShowPreviewMobile(true)}
              className="lg:hidden border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            >
              Preview
            </button>

            {currentStepIndex < STEPS.length - 1 ? (
              <button
                onClick={goToNextStep}
                className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <PDFDownloadButton
                data={cvData}
                className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              />
            )}
          </div>
        </footer>
      </div>

      {/* Right Panel - Preview */}
      <div
        className={cn(
          "flex-1 bg-muted p-6 lg:p-8 overflow-y-auto",
          !showPreviewMobile && "hidden lg:block"
        )}
      >
        {/* Mobile Back Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowPreviewMobile(false)}
            className="border-border"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Form
          </button>
        </div>

        {/* Preview Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
            <p className="text-sm text-muted-foreground">
              See how your CV looks in real-time
            </p>
          </div>
          <PDFDownloadButton data={cvData} />
        </div>

        {/* CV Preview */}
        <div className="max-w-[650px] mx-auto">
          <CVPreview data={cvData} />
        </div>
      </div>
    </div>
  );
}
