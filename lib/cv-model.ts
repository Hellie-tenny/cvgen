import type { CVData, Education, Language } from "@/lib/cv-types";
import {
  sidebarWidthPt,
  type SectionKey,
  type SectionSetting,
  type TemplateDesign,
  type TemplatePhoto,
} from "@/lib/template-design";

export type { SectionKey };

/*
  The content of a CV, worked out once, plus the page geometry that depends on it.
  Both the on-screen preview and the PDF for admin-made templates draw from this, so the text, the placeholders,
  the date format, the skill levels and the position of the header, photo and sidebar can never differ between them.
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

export type ContactKind = "email" | "phone" | "location" | "website";

export interface CVModel {
  name: string;
  title: string | null;
  contact: { kind: ContactKind; text: string }[];
  /** A picture the PDF can embed (JPEG or PNG data URL), or null */
  photo: string | null;
  summary: string | null;
  experiences: { id: string; position: string; company: string; dates: string; description: string }[];
  skills: { id: string; name: string; level: string; percent: number }[];
  educations: { id: string; institution: string; qualification: string; year: string }[];
  languages: { id: string; name: string; level: string }[];
  references: { id: string; name: string; position: string; organization: string; phone: string }[];
  /** Which sections have real content (empty ones show a short placeholder) */
  has: { experience: boolean; skills: boolean; education: boolean; languages: boolean; references: boolean };
}

export const PLACEHOLDERS = {
  experience: "Add your work experience.",
  skills: "Add skills to highlight your expertise.",
  education: "Add your education.",
};

// The PDF can embed JPEG and PNG only; the builder always saves JPEG.
const IMAGE_DATA_URL = /^data:image\/(png|jpe?g);base64,[A-Za-z0-9+/=]+$/;

export function buildCVModel(data: CVData): CVModel {
  const { personal, experiences, skills, references } = data;
  const educations = ((data as { educations?: Education[] }).educations ?? []) as Education[];
  const languages = ((data as { languages?: Language[] }).languages ?? []) as Language[];
  const hasPersonalInfo = Boolean(personal.fullName || personal.email || personal.title);

  const contact: CVModel["contact"] = [];
  if (personal.email || !hasPersonalInfo) contact.push({ kind: "email", text: personal.email || "email@example.com" });
  if (personal.phone || !hasPersonalInfo) contact.push({ kind: "phone", text: personal.phone || "+1 (555) 000-0000" });
  if (personal.location || !hasPersonalInfo) contact.push({ kind: "location", text: personal.location || "City, Country" });
  if (personal.website) contact.push({ kind: "website", text: personal.website });

  return {
    name: personal.fullName || "Your Name",
    title: personal.title || !hasPersonalInfo ? personal.title || "Professional Title" : null,
    contact,
    photo: typeof personal.photo === "string" && IMAGE_DATA_URL.test(personal.photo) ? personal.photo : null,
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
    languages: languages
      .filter((language) => language.name.trim())
      .map((language) => ({ id: language.id, name: language.name, level: language.level })),
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
      languages: languages.some((language) => language.name.trim()),
      references: references.length > 0,
    },
  };
}

/** Splits a job description into its non-empty lines (used for bullets). */
export const descriptionLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

/** Number of filled dots (out of 5) for a skill level. */
export const skillDots = (percent: number) => Math.max(1, Math.min(5, Math.round(percent / 20)));

/** "Jonathan Patterson" becomes the light first word and the bold rest. A single word is all bold. */
export function splitName(name: string): { first: string; rest: string } {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return { first: "", rest: name };
  return { first: words[0], rest: words.slice(1).join(" ") };
}

/**
 * Which sections go where, from the template's own section list (order, visibility, column).
 * Single column: every visible section runs down the page, and contact details sit in the header.
 * Sidebar layouts: each section goes in the column it is assigned to; contact can also sit in the header.
 */
export function planSections(design: TemplateDesign): {
  side: "left" | "right" | null;
  sidebar: SectionSetting[];
  main: SectionSetting[];
  /** Show the contact details in the header */
  contactInHeader: boolean;
} {
  const visible = design.sections.filter((section) => section.visible);
  const contact = visible.find((section) => section.key === "contact");

  if (design.layout.columns === "single") {
    return {
      side: null,
      sidebar: [],
      main: visible.filter((section) => section.key !== "contact"),
      contactInHeader: Boolean(contact),
    };
  }

  const inHeader = contact?.column === "header";
  return {
    side: design.layout.columns === "sidebar-left" ? "left" : "right",
    sidebar: visible.filter((section) => section.column === "sidebar"),
    main: visible.filter((section) => section.column === "main"),
    contactInHeader: Boolean(inHeader),
  };
}

// ── Geometry ────────────────────────────────────────────────────────────────────────────────────────────────
export interface Geometry {
  side: "left" | "right" | null;
  /** A full-width header across the page, with the sidebar starting beneath it */
  full: boolean;
  sidebarPt: number;
  /** Horizontal padding inside the sidebar */
  sidebarPad: number;
  /** Space between the sidebar edge and the main column's text */
  mainGap: number;
  headerHeight: number;
  /** Left and right padding of the header's content */
  headerPadLeft: number;
  headerPadRight: number;
  /** Split header next to a right sidebar: width of the contact block, lined up with the sidebar's content */
  contactWidth: number | null;
  /** Where the photo goes, after fallbacks (null: no photo) */
  photo: (TemplatePhoto & { position: "header" | "overlap" | "sidebar" }) | null;
  /** Page 1: distance from the page top to where the sidebar content starts */
  sidebarContentTop: number;
  /** Page 1: space between a full-width header and the main column's first section */
  mainTopGap: number;
}

export function computeGeometry(design: TemplateDesign, hasPhoto: boolean): Geometry {
  const { layout: l, spacing: sp, photo } = design;
  const plan = planSections(design);
  const side = plan.side;
  const pad = sp.padding;
  const sidebarPt = sidebarWidthPt(l);
  const sidebarPad = Math.round(pad * 0.7);
  const mainGap = pad * 0.8;
  const full = side !== null && l.headerPosition === "full";

  // A photo position that doesn't fit the layout falls back to one that does.
  let position: TemplatePhoto["position"] | null = null;
  if (photo.show && hasPhoto) {
    position = photo.position;
    if (position === "overlap" && !full) position = side ? "sidebar" : "header";
    if (position === "sidebar" && !side) position = "header";
  }

  let headerPadLeft = pad;
  let headerPadRight = pad;
  if (full && l.headerAlignToMain) {
    if (side === "left") headerPadLeft = sidebarPt + mainGap;
    else headerPadRight = sidebarPt + mainGap;
  }

  let contactWidth: number | null = null;
  if (full && side === "right" && !l.headerAlignToMain && l.headerLayout === "split" && l.contactStyle === "inline" && plan.contactInHeader) {
    headerPadRight = sidebarPad;
    contactWidth = sidebarPt - 2 * sidebarPad;
  }

  const overlapClearance = position === "overlap" ? photo.size / 2 + 14 : 0;
  return {
    side,
    full,
    sidebarPt,
    sidebarPad,
    mainGap,
    headerHeight: l.headerHeight,
    headerPadLeft,
    headerPadRight,
    contactWidth,
    photo: position ? { ...photo, position } : null,
    sidebarContentTop: full ? l.headerHeight + Math.max(pad * 0.6, overlapClearance) : pad,
    mainTopGap: pad * 0.6,
  };
}
