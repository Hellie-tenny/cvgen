import type { CVData, Education } from "@/lib/cv-types";
import type { TemplateLayout } from "@/lib/template-design";

/*
  The content of a CV, worked out once.
  Both the on-screen preview and the PDF for admin-made templates draw from this, so the text, the placeholders,
  the date format and the skill levels can never differ between them.
*/

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString + "-01");
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export const skillPercent = (level: string) => {
  switch (level) {
    case "Beginner":
      return 25;
    case "Intermediate":
      return 50;
    case "Advanced":
      return 75;
    case "Expert":
      return 100;
    default:
      return 50;
  }
};

export type SectionKey = "contact" | "summary" | "experience" | "skills" | "education" | "references";

export interface CVModel {
  name: string;
  title: string | null;
  contact: string[];
  summary: string | null;
  experiences: { id: string; position: string; company: string; dates: string; description: string }[];
  skills: { id: string; name: string; level: string; percent: number }[];
  educations: { id: string; institution: string; qualification: string; year: string }[];
  references: { id: string; name: string; position: string; organization: string; phone: string }[];
  /** Which sections have real content (empty ones show a short placeholder) */
  has: { experience: boolean; skills: boolean; education: boolean; references: boolean };
}

export const PLACEHOLDERS = {
  experience: "Add your work experience.",
  skills: "Add skills to highlight your expertise.",
  education: "Add your education.",
};

export function buildCVModel(data: CVData): CVModel {
  const { personal, experiences, skills, references } = data;
  const educations = ((data as { educations?: Education[] }).educations ?? []) as Education[];
  const hasPersonalInfo = Boolean(personal.fullName || personal.email || personal.title);

  const contact: string[] = [];
  if (personal.email || !hasPersonalInfo) contact.push(personal.email || "email@example.com");
  if (personal.phone || !hasPersonalInfo) contact.push(personal.phone || "+1 (555) 000-0000");
  if (personal.location || !hasPersonalInfo) contact.push(personal.location || "City, Country");

  return {
    name: personal.fullName || "Your Name",
    title: personal.title || !hasPersonalInfo ? personal.title || "Professional Title" : null,
    contact,
    summary:
      personal.summary || !hasPersonalInfo
        ? personal.summary || "A brief overview of your professional background."
        : null,
    experiences: experiences.map((exp) => ({
      id: exp.id,
      position: exp.position || "Position Title",
      company: exp.company || "Company Name",
      dates: `${formatDate(exp.startDate) || "Start"} — ${exp.current ? "Present" : formatDate(exp.endDate) || "End"}`,
      description: exp.description || "",
    })),
    skills: skills.map((skill) => ({
      id: skill.id,
      name: skill.name || "Skill",
      level: skill.level,
      percent: skillPercent(skill.level),
    })),
    educations: educations.map((edu) => ({
      id: edu.id,
      institution: edu.institution || "Institution",
      qualification: edu.qualification || "",
      year: edu.year || "Year",
    })),
    references: references.map((ref) => ({
      id: ref.id,
      name: ref.name || "Reference Name",
      position: ref.position || "Position",
      organization: ref.organization || "Organization",
      phone: ref.phone || "Phone",
    })),
    has: {
      experience: experiences.length > 0,
      skills: skills.length > 0,
      education: educations.length > 0,
      references: references.length > 0,
    },
  };
}

/** Which sections go where. Single column keeps the usual order; sidebar layouts move the short items aside. */
export function planSections(layout: TemplateLayout): {
  side: "left" | "right" | null;
  sidebar: SectionKey[];
  main: SectionKey[];
} {
  if (layout.columns === "single") {
    return { side: null, sidebar: [], main: ["summary", "experience", "skills", "education", "references"] };
  }
  return {
    side: layout.columns === "sidebar-left" ? "left" : "right",
    sidebar: ["contact", "skills", "education"],
    main: ["summary", "experience", "references"],
  };
}
