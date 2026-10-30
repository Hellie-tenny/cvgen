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

export interface Education {
  id: string;
  institution: string;
  year: string;
  qualification: string;
}

/** The four templates that ship with the app. Admin-made templates have database ids instead. */
export type BuiltInTemplateId = "modern" | "classic" | "minimal" | "bold";

/** A built-in id, or the id of an admin-made template (see lib/template-design.ts). */
export type TemplateId = string;

export const BUILT_IN_TEMPLATE_IDS: BuiltInTemplateId[] = ["modern", "classic", "minimal", "bold"];

export const isBuiltInTemplate = (id: string): id is BuiltInTemplateId =>
  (BUILT_IN_TEMPLATE_IDS as string[]).includes(id);

export const TEMPLATES: { id: BuiltInTemplateId; name: string; description: string }[] = [
  { id: "modern", name: "Modern", description: "Clean layout with modern accents" },
  { id: "classic", name: "Classic", description: "Traditional structure and typography" },
  { id: "minimal", name: "Minimal", description: "Simple and content-first" },
  { id: "bold", name: "Bold", description: "High-contrast header with strong color" },
];

export interface CVData {
  personal: PersonalInfo;
  experiences: Experience[];
  skills: Skill[];
  references: Reference[];
  educations: Education[];
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
  educations: [],
  template: "modern",
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
  educations: [
    {
      id: "1",
      institution: "University of Example",
      year: "2018",
      qualification: "BSc Computer Science",
    },
  ],
};
