import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode, TouchEvent } from "react";
import { initialCVData } from "@/lib/cv-types";
import type { CVData, TemplateId } from "@/lib/cv-types";
import { PersonalForm } from "./personal-form";
import { ExperienceForm } from "./experience-form";
import { SkillsForm } from "./skills-form";
import { ReferencesForm } from "./references-form";
import { CVPreview } from "./cv-preview";
import { PDFDownloadButton } from "./pdf-download-button";
import { TemplateSelector } from "./template-selector";
import { User, Briefcase, Sparkles, ChevronLeft, ChevronRight, ArrowRight, FileText, Palette, RotateCcw, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "../../hooks/use-local-storage";

type Step = "personal" | "experience" | "skills" | "references" | "template";

const STEPS: { id: Step; label: string; icon: ReactNode }[] = [
  { id: "personal", label: "Personal", icon: <User className="h-4 w-4" /> },
  { id: "experience", label: "Experience", icon: <Briefcase className="h-4 w-4" /> },
  { id: "skills", label: "Skills", icon: <Sparkles className="h-4 w-4" /> },
  { id: "references", label: "References", icon: <Users className="h-4 w-4" /> },
  { id: "template", label: "Template", icon: <Palette className="h-4 w-4" /> },
];

export function CVBuilder() {
  const [cvData, setCVData] = useLocalStorage<CVData>("cv-builder-data", initialCVData);
  const [currentStep, setCurrentStep] = useLocalStorage<Step>("cv-builder-step", "personal");
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  const updateNavScroll = () => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 1);
  };

  const handleDragStart = (clientX: number) => {
    const el = navRef.current;
    if (!el) return;
    isDragging.current = true;
    dragStartX.current = clientX;
    dragStartScrollLeft.current = el.scrollLeft;
  };

  const handleDragMove = (clientX: number) => {
    const el = navRef.current;
    if (!el || !isDragging.current) return;
    const delta = clientX - dragStartX.current;
    el.scrollLeft = dragStartScrollLeft.current - delta;
    updateNavScroll();
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    updateNavScroll();
    const handleResize = () => updateNavScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavScroll = () => updateNavScroll();

  const scrollTabsRight = () => {
    const el = navRef.current;
    if (!el) return;
    el.scrollBy({ left: 240, behavior: "smooth" });
  };

  const normalizedCVData: CVData = {
    ...initialCVData,
    ...cvData,
    personal: {
      ...initialCVData.personal,
      ...cvData.personal,
    },
    experiences: cvData.experiences ?? initialCVData.experiences,
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
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Panel - Form */}
      <div
        className={cn(
          "w-full lg:w-[480px] min-h-0 bg-sidebar flex flex-col",
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
        <div className="relative">
          <nav
            ref={navRef}
            onScroll={handleNavScroll}
            onMouseDown={(event: MouseEvent<HTMLDivElement>) => handleDragStart(event.clientX)}
            onMouseMove={(event: MouseEvent<HTMLDivElement>) => handleDragMove(event.clientX)}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onTouchStart={(event: TouchEvent<HTMLDivElement>) => handleDragStart(event.touches[0].clientX)}
            onTouchMove={(event: TouchEvent<HTMLDivElement>) => handleDragMove(event.touches[0].clientX)}
            onTouchEnd={stopDrag}
            className="px-6 py-4 pr-14 border-b border-sidebar-border overflow-x-auto no-scrollbar cursor-grab"
          >
            <div className="flex items-center gap-2 min-w-max">
              {STEPS.map((step, index) => (
                <button
                  type="button"
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

          {canScrollRight && (
            <button
              type="button"
              onClick={scrollTabsRight}
              className="hidden lg:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 bg-transparent text-sidebar-foreground transition hover:bg-sidebar-accent/40"
              aria-label="Scroll tabs right"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Form Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">{renderStepContent()}</div>

        {/* Footer Navigation */}
        <footer className="p-4 border-t border-sidebar-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Clear Data Button - Always visible */}
            <button
              type="button"
              onClick={clearData}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors order-2 sm:order-1"
              title="Clear all CV data"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden xs:inline">Clear Data</span>
            </button>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                type="button"
                onClick={goToPrevStep}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-1 px-3 py-2 border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent disabled:opacity-30 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>

              {/* Mobile Preview Toggle */}
              <button
                type="button"
                onClick={() => setShowPreviewMobile(true)}
                className="lg:hidden flex items-center gap-1 px-3 py-2 border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>

              {currentStepIndex < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="flex items-center gap-1 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 rounded-md transition-colors font-medium"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <PDFDownloadButton
                  data={normalizedCVData}
                  className="flex items-center gap-1 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 rounded-md transition-colors font-medium"
                />
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Right Panel - Preview */}
      <div
        className={cn(
          "flex-1 min-h-0 bg-muted p-6 lg:p-8 overflow-y-auto",
          !showPreviewMobile && "hidden lg:block"
        )}
      >
        {/* Mobile Back Button */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
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
          <PDFDownloadButton data={normalizedCVData} />
        </div>

        {/* CV Preview */}
        <div className="max-w-[650px] mx-auto">
          <CVPreview data={normalizedCVData} />
        </div>
      </div>
    </div>
  );
}
