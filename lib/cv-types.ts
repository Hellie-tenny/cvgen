export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface Reference {
  id: string;
  name: string;
  organization: string;
  position: string;
  phone: string;
}

export type TemplateId = "modern" | "classic" | "minimal" | "bold";

export const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  { id: "modern", name: "Modern", description: "Clean layout with modern accents" },
  { id: "classic", name: "Classic", description: "Traditional structure and typography" },
  { id: "minimal", name: "Minimal", description: "Simple and content-first" },
  { id: "bold", name: "Bold", description: "High-contrast header with strong color" },
];

// Template design system types
export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

export interface TemplateTypography {
  headingFont: "sans-serif" | "serif" | "mono";
  bodyFont: "sans-serif" | "serif" | "mono";
  nameSize: number;
  headingSize: number;
  bodySize: number;
  headingWeight: "400" | "500" | "600" | "700" | "800";
  bodyWeight: "300" | "400" | "500";
}

export interface TemplateSpacing {
  sectionGap: number;
  itemGap: number;
  padding: number;
}

export interface TemplateLayout {
  headerAlignment: "left" | "center" | "right";
  showDividers: boolean;
  showIcons: boolean;
  skillStyle: "bar" | "tag" | "inline";
  experienceStyle: "timeline" | "standard" | "compact";
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string | null;
  colors: TemplateColors;
  typography: TemplateTypography;
  spacing: TemplateSpacing;
  layout: TemplateLayout;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CVData {
  personal: PersonalInfo;
  experiences: Experience[];
  skills: Skill[];
  references: Reference[];
  template: TemplateId;
}

export const initialCVData: CVData = {
  personal: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    summary: "",
  },
  experiences: [],
  skills: [],
  references: [],
  template: "modern",
};

export const defaultTemplateConfig: Omit<TemplateConfig, "id" | "created_at" | "updated_at"> = {
  name: "New Template",
  description: "A custom template",
  colors: {
    primary: "#2563eb",
    secondary: "#64748b",
    accent: "#0ea5e9",
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
    border: "#e2e8f0",
  },
  typography: {
    headingFont: "sans-serif",
    bodyFont: "sans-serif",
    nameSize: 28,
    headingSize: 16,
    bodySize: 12,
    headingWeight: "600",
    bodyWeight: "400",
  },
  spacing: {
    sectionGap: 24,
    itemGap: 16,
    padding: 40,
  },
  layout: {
    headerAlignment: "left",
    showDividers: true,
    showIcons: true,
    skillStyle: "bar",
    experienceStyle: "timeline",
  },
  is_default: false,
};

// Sample CV data for previewing templates
export const sampleCVData: Omit<CVData, "template"> = {
  personal: {
    fullName: "Alex Johnson",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    title: "Senior Software Engineer",
    summary: "Passionate software engineer with 8+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud architecture.",
  },
  experiences: [
    {
      id: "1",
      company: "Tech Corp",
      position: "Senior Software Engineer",
      startDate: "2021-01",
      endDate: "",
      current: true,
      description: "Leading frontend development for enterprise SaaS platform. Mentoring junior developers and establishing best practices.",
    },
    {
      id: "2",
      company: "StartupXYZ",
      position: "Software Engineer",
      startDate: "2018-06",
      endDate: "2020-12",
      current: false,
      description: "Built core product features using React and Node.js. Improved application performance by 40%.",
    },
  ],
  skills: [
    { id: "1", name: "React", level: "Expert" },
    { id: "2", name: "TypeScript", level: "Advanced" },
    { id: "3", name: "Node.js", level: "Advanced" },
    { id: "4", name: "PostgreSQL", level: "Intermediate" },
  ],
  references: [
    {
      id: "1",
      name: "Jane Smith",
      organization: "Tech Corp",
      position: "CTO",
      phone: "+1 (555) 234-5678",
    },
    {
      id: "2",
      name: "John Doe",
      organization: "StartupXYZ",
      position: "VP Engineering",
      phone: "+1 (555) 345-6789",
    },
  ],
};
