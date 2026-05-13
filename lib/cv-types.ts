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
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+265991234567",
    location: "P.O Box, Lilongwe, Malawi",
    title: "Sales Representative",
    summary: "Hardworking sales rep who always bring the numbers",
  },
  experiences: [
    {
      id: "1",
      company: "Example Company",
      position: "Sale Representative",
      startDate: "2021-01",
      endDate: "",
      current: true,
      description: "Selling xyz products.",
    },
    {
      id: "2",
      company: "XYZ Limited",
      position: "Sales Agent",
      startDate: "2018-06",
      endDate: "2020-12",
      current: false,
      description: "Sold XYZ products.",
    },
  ],
  skills: [
    { id: "1", name: "Sales", level: "Expert" },
    { id: "2", name: "Communication", level: "Advanced" },
    { id: "3", name: "Problem Solving", level: "Advanced" },
    { id: "4", name: "Team Work", level: "Intermediate" },
  ],
  references: [
    {
      id: "1",
      name: "John Monday",
      organization: "XYZ Company",
      position: "CTO",
      phone: "+265991234567",
    },
    {
      id: "2",
      name: "Mary Johnson",
      organization: "ABC Company",
      position: "Manager",
      phone: "+265991234567",
    },
  ],
};
