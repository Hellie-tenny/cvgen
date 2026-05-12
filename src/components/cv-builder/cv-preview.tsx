import type { CVData, Experience, Skill, TemplateId } from "@/lib/cv-types";
import { Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface CVPreviewProps {
  data: CVData;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString + "-01");
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const getSkillWidth = (level: string) => {
  switch (level) {
    case "Beginner":
      return "25%";
    case "Intermediate":
      return "50%";
    case "Advanced":
      return "75%";
    case "Expert":
      return "100%";
    default:
      return "50%";
  }
};

// Template configurations
const templateStyles: Record<TemplateId, {
  accent: string;
  accentText: string;
  headerBg: string;
  headerText: string;
  sectionTitle: string;
  skillBar: string;
  timelineDot: string;
  timelineLine: string;
}> = {
  modern: {
    accent: "text-blue-600",
    accentText: "text-blue-600",
    headerBg: "bg-white",
    headerText: "text-gray-900",
    sectionTitle: "text-gray-500",
    skillBar: "bg-blue-600",
    timelineDot: "bg-blue-600",
    timelineLine: "border-blue-200",
  },
  classic: {
    accent: "text-amber-700",
    accentText: "text-amber-700",
    headerBg: "bg-white",
    headerText: "text-gray-900",
    sectionTitle: "text-amber-700",
    skillBar: "bg-amber-600",
    timelineDot: "bg-amber-600",
    timelineLine: "border-amber-200",
  },
  minimal: {
    accent: "text-gray-700",
    accentText: "text-gray-600",
    headerBg: "bg-white",
    headerText: "text-gray-900",
    sectionTitle: "text-gray-400",
    skillBar: "bg-gray-500",
    timelineDot: "bg-gray-400",
    timelineLine: "border-gray-200",
  },
  bold: {
    accent: "text-rose-600",
    accentText: "text-rose-600",
    headerBg: "bg-rose-600",
    headerText: "text-white",
    sectionTitle: "text-rose-600",
    skillBar: "bg-rose-500",
    timelineDot: "bg-rose-500",
    timelineLine: "border-rose-200",
  },
};

export function CVPreview({ data }: CVPreviewProps) {
  const { personal, experiences, skills, template } = data;
  const styles = templateStyles[template];
  const hasPersonalInfo = personal.fullName || personal.email || personal.title;
  const hasExperiences = experiences.length > 0;
  const hasSkills = skills.length > 0;

  // Bold template has a different header layout
  if (template === "bold") {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div
          className="w-full"
          style={{ aspectRatio: "210 / 297", maxHeight: "calc(100vh - 120px)", overflow: "auto" }}
        >
          {/* Bold Header */}
          <header className={cn("px-8 py-10", styles.headerBg)}>
            <h1 className={cn("text-3xl font-bold mb-1", styles.headerText)}>
              {personal.fullName || "Your Name"}
            </h1>
            <p className={cn("text-lg font-medium mb-4 opacity-90", styles.headerText)}>
              {personal.title || "Professional Title"}
            </p>
            <div className={cn("flex flex-wrap gap-4 text-sm opacity-80", styles.headerText)}>
              {(personal.email || !hasPersonalInfo) && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {personal.email || "email@example.com"}
                </span>
              )}
              {(personal.phone || !hasPersonalInfo) && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {personal.phone || "+1 (555) 000-0000"}
                </span>
              )}
              {(personal.location || !hasPersonalInfo) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {personal.location || "City, Country"}
                </span>
              )}
            </div>
          </header>

          <div className="p-8">
            {/* Summary */}
            {(personal.summary || !hasPersonalInfo) && (
              <section className="mb-6">
                <h2 className={cn("text-sm font-bold uppercase tracking-wider mb-3", styles.sectionTitle)}>
                  About
                </h2>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {personal.summary || "A brief overview of your professional background."}
                </p>
              </section>
            )}

            {/* Experience */}
            <section className="mb-6">
              <h2 className={cn("text-sm font-bold uppercase tracking-wider mb-3", styles.sectionTitle)}>
                Experience
              </h2>
              {hasExperiences ? (
                <div className="space-y-4">
                  {experiences.map((exp: Experience) => (
                    <div key={exp.id} className={cn("relative pl-4 border-l-2", styles.timelineLine)}>
                      <div className={cn("absolute -left-1.25top-1 w-2 h-2 rounded-full", styles.timelineDot)} />
                      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{exp.position || "Position Title"}</h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(exp.startDate) || "Start"} — {exp.current ? "Present" : formatDate(exp.endDate) || "End"}
                        </span>
                      </div>
                      <p className={cn("text-sm font-medium mb-2", styles.accentText)}>{exp.company || "Company Name"}</p>
                      {exp.description && <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic pl-4 border-l-2 border-gray-200">
                  Add your work experience to showcase your professional journey.
                </p>
              )}
            </section>

            {/* Skills */}
            <section>
              <h2 className={cn("text-sm font-bold uppercase tracking-wider mb-3", styles.sectionTitle)}>
                Skills
              </h2>
              {hasSkills ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: Skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 text-sm font-medium rounded-full"
                    >
                      {skill.name || "Skill"}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Add skills to highlight your expertise.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Classic template has serif fonts and traditional styling
  if (template === "classic") {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div
          className="w-full p-8 md:p-10"
          style={{ aspectRatio: "210 / 297", maxHeight: "calc(100vh - 120px)", overflow: "auto" }}
        >
          {/* Classic Header - Centered */}
          <header className="text-center border-b-2 border-amber-200 pb-6 mb-6">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">
              {personal.fullName || "Your Name"}
            </h1>
            <p className={cn("text-lg font-serif mb-4", styles.accent)}>
              {personal.title || "Professional Title"}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              {(personal.email || !hasPersonalInfo) && (
                <span>{personal.email || "email@example.com"}</span>
              )}
              {(personal.phone || !hasPersonalInfo) && (
                <span>{personal.phone || "+1 (555) 000-0000"}</span>
              )}
              {(personal.location || !hasPersonalInfo) && (
                <span>{personal.location || "City, Country"}</span>
              )}
            </div>
          </header>

          {/* Summary */}
          {(personal.summary || !hasPersonalInfo) && (
            <section className="mb-6">
              <h2 className={cn("text-base font-serif font-bold border-b border-amber-200 pb-1 mb-3", styles.sectionTitle)}>
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {personal.summary || "A brief overview of your professional background."}
              </p>
            </section>
          )}

          {/* Experience */}
          <section className="mb-6">
            <h2 className={cn("text-base font-serif font-bold border-b border-amber-200 pb-1 mb-3", styles.sectionTitle)}>
              Professional Experience
            </h2>
            {hasExperiences ? (
              <div className="space-y-4">
              {experiences.map((exp: Experience) => (
                  <div key={exp.id}>
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-1">
                      <h3 className="font-serif font-bold text-gray-900">{exp.position || "Position Title"}</h3>
                      <span className="text-xs text-gray-500 italic">
                        {formatDate(exp.startDate) || "Start"} — {exp.current ? "Present" : formatDate(exp.endDate) || "End"}
                      </span>
                    </div>
                    <p className={cn("text-sm font-medium italic mb-2", styles.accent)}>{exp.company || "Company Name"}</p>
                    {exp.description && <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Add your work experience.</p>
            )}
          </section>

          {/* Skills */}
          <section>
            <h2 className={cn("text-base font-serif font-bold border-b border-amber-200 pb-1 mb-3", styles.sectionTitle)}>
              Skills & Expertise
            </h2>
            {hasSkills ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                {skills.map((skill: Skill) => (
                  <div key={skill.id} className="flex items-center gap-2 text-sm">
                    <span className="text-amber-600">•</span>
                    <span className="text-gray-700">{skill.name || "Skill"}</span>
                    <span className="text-gray-400 text-xs">({skill.level})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Add skills to highlight your expertise.</p>
            )}
          </section>
        </div>
      </div>
    );
  }

  // Minimal template - ultra clean
  if (template === "minimal") {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div
          className="w-full p-8 md:p-12"
          style={{ aspectRatio: "210 / 297", maxHeight: "calc(100vh - 120px)", overflow: "auto" }}
        >
          {/* Minimal Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-light text-gray-900 mb-1 tracking-wide">
              {personal.fullName || "Your Name"}
            </h1>
            <p className="text-base text-gray-500 font-light mb-4">
              {personal.title || "Professional Title"}
            </p>
            <div className="flex flex-wrap gap-6 text-xs text-gray-400 uppercase tracking-wider">
              {(personal.email || !hasPersonalInfo) && <span>{personal.email || "email@example.com"}</span>}
              {(personal.phone || !hasPersonalInfo) && <span>{personal.phone || "+1 (555) 000-0000"}</span>}
              {(personal.location || !hasPersonalInfo) && <span>{personal.location || "City, Country"}</span>}
            </div>
          </header>

          <div className="h-px bg-gray-200 mb-8" />

          {/* Summary */}
          {(personal.summary || !hasPersonalInfo) && (
            <section className="mb-8">
              <p className="text-gray-600 leading-relaxed text-sm font-light">
                {personal.summary || "A brief overview of your professional background."}
              </p>
            </section>
          )}

          {/* Experience */}
          <section className="mb-8">
            <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
              Experience
            </h2>
            {hasExperiences ? (
              <div className="space-y-5">
                {experiences.map((exp: Experience) => (
                  <div key={exp.id}>
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{exp.position || "Position Title"}</h3>
                      <span className="text-xs text-gray-400">
                        {formatDate(exp.startDate) || "Start"} — {exp.current ? "Present" : formatDate(exp.endDate) || "End"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{exp.company || "Company Name"}</p>
                    {exp.description && <p className="text-sm text-gray-500 leading-relaxed font-light">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300 font-light">Add your work experience.</p>
            )}
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
              Skills
            </h2>
            {hasSkills ? (
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {skills.map((skill: Skill) => (
                  <span key={skill.id} className="text-sm text-gray-600 font-light">
                    {skill.name || "Skill"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300 font-light">Add skills to highlight your expertise.</p>
            )}
          </section>
        </div>
      </div>
    );
  }

  // Modern template (default)
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div
        className="w-full p-8 md:p-10"
        style={{ aspectRatio: "210 / 297", maxHeight: "calc(100vh - 120px)", overflow: "auto" }}
      >
        {/* Header */}
        <header className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {personal.fullName || "Your Name"}
          </h1>
          {(personal.title || !hasPersonalInfo) && (
            <p className={cn("text-lg font-medium mb-4", styles.accent)}>
              {personal.title || "Professional Title"}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {(personal.email || !hasPersonalInfo) && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {personal.email || "email@example.com"}
              </span>
            )}
            {(personal.phone || !hasPersonalInfo) && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {personal.phone || "+1 (555) 000-0000"}
              </span>
            )}
            {(personal.location || !hasPersonalInfo) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {personal.location || "City, Country"}
              </span>
            )}
          </div>
        </header>

        {/* Summary */}
        {(personal.summary || !hasPersonalInfo) && (
          <section className="mb-6">
            <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-3", styles.sectionTitle)}>
              About
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              {personal.summary || "A brief overview of your professional background, key skills, and career objectives."}
            </p>
          </section>
        )}

        {/* Experience */}
        <section className="mb-6">
          <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-3", styles.sectionTitle)}>
            Experience
          </h2>
          {hasExperiences ? (
            <div className="space-y-4">
              {experiences.map((exp: Experience) => (
                <div key={exp.id} className={cn("relative pl-4 border-l-2", styles.timelineLine)}>
                  <div className={cn("absolute -left-1.25 top-1 w-2 h-2 rounded-full", styles.timelineDot)} />
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{exp.position || "Position Title"}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(exp.startDate) || "Start"} — {exp.current ? "Present" : formatDate(exp.endDate) || "End"}
                    </span>
                  </div>
                  <p className={cn("text-sm font-medium mb-2", styles.accentText)}>{exp.company || "Company Name"}</p>
                  {exp.description && <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="pl-4 border-l-2 border-gray-200">
              <p className="text-sm text-gray-400 italic">Add your work experience to showcase your professional journey.</p>
            </div>
          )}
        </section>

        {/* Skills */}
        <section>
          <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-3", styles.sectionTitle)}>
            Skills
          </h2>
          {hasSkills ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skills.map((skill: Skill) => (
                <div key={skill.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-900 font-medium">{skill.name || "Skill Name"}</span>
                    <span className="text-gray-500 text-xs">{skill.level}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", styles.skillBar)}
                      style={{ width: getSkillWidth(skill.level) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Add skills to highlight your expertise and capabilities.</p>
          )}
        </section>
      </div>
    </div>
  );
}
