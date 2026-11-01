/*
  Admin-made CV templates
  -----------------------
  A custom template is not code: it is a saved set of design choices (this file) that one shared renderer
  draws, both on screen (custom-cv-preview.tsx) and in the PDF (custom-cv-pdf.tsx).

  Units: every size is in PDF points on an A4 page (595 x 842). The on-screen preview multiplies by PT to
  match the 650px-wide preview, so the two always have the same proportions.
*/

// ── Option lists ────────────────────────────────────────────────────────────────────────────────────────────
export const FONT_KINDS = ["sans-serif", "serif", "mono"] as const;
export const COLUMNS = ["single", "sidebar-left", "sidebar-right"] as const;
export const SIDEBAR_STYLES = ["tinted", "filled", "plain"] as const;
export const SIDEBAR_WIDTHS = ["narrow", "standard", "wide"] as const;
export const HEADER_POSITIONS = ["main", "full"] as const;
export const HEADER_STYLES = ["plain", "band", "tint"] as const;
export const HEADER_LAYOUTS = ["stacked", "split"] as const;
export const ALIGNMENTS = ["left", "center", "right"] as const;
export const NAME_CASES = ["normal", "uppercase"] as const;
export const NAME_STYLES = ["normal", "two-tone"] as const;
export const TRACKINGS = ["normal", "wide", "wider"] as const;
export const SECTION_TRACKINGS = ["auto", "normal", "wide", "wider"] as const;
export const TITLE_STYLES = ["primary", "muted", "plain"] as const;
export const HEADER_RULES = ["none", "short"] as const;
export const CONTACT_STYLES = ["inline", "bar"] as const;
export const ACCENT_BARS = ["none", "left", "top", "corner"] as const;
export const SECTION_TITLE_STYLES = ["plain", "uppercase"] as const;
export const TITLE_RULES = ["none", "underline", "line-after", "boxed"] as const;
export const TITLE_MARKERS = ["none", "bar", "dot", "icon"] as const;
export const SKILL_STYLES = ["bar", "tag", "inline", "dots", "list"] as const;
export const EXPERIENCE_STYLES = ["timeline", "standard", "compact"] as const;
export const EXPERIENCE_ORDERS = ["position-first", "company-first", "dates-first"] as const;
export const DATES_POSITIONS = ["right", "below"] as const;
export const TIMELINE_MARKERS = ["none", "square", "dot"] as const;
export const EDUCATION_STYLES = ["stacked", "dated", "year-right"] as const;
export const REFERENCE_LAYOUTS = ["stacked", "two-column"] as const;
export const PHOTO_SHAPES = ["circle", "rounded", "square"] as const;
export const PHOTO_POSITIONS = ["header", "overlap", "sidebar"] as const;
export const SECTION_KEYS = ["contact", "summary", "experience", "skills", "education", "languages", "references"] as const;
export const COLUMN_NAMES = ["main", "sidebar", "header"] as const;

export type FontKind = (typeof FONT_KINDS)[number];
export type SectionKey = (typeof SECTION_KEYS)[number];

// ── Shape of a design ───────────────────────────────────────────────────────────────────────────────────────
export interface TemplateColors {
  /** Name accents, section titles, company names, skill fills, header band, filled sidebar, contact bar */
  primary: string;
  /** Secondary text: dates, contact details, skill levels */
  secondary: string;
  /** Light tint: timeline lines, section underlines, tag backgrounds */
  accent: string;
  background: string;
  /** Main body text */
  foreground: string;
  /** Soft fill: tinted sidebar, tinted header */
  muted: string;
  /** Hairlines, dividers and skill-bar tracks */
  border: string;
  /** Timeline lines and their markers (defaults to the accent tint) */
  line: string;
}

export interface TemplateTypography {
  headingFont: FontKind;
  bodyFont: FontKind;
  nameSize: number;
  headingSize: number;
  bodySize: number;
  /** Section titles (and the name, unless nameBold says otherwise) are bold */
  headingBold: boolean;
  nameBold: boolean;
  /** Size of the job title under the name */
  titleSize: number;
  titleBold: boolean;
  /** Line height of paragraphs (summary, job descriptions) */
  lineHeight: number;
}

export interface TemplateSpacing {
  padding: number;
  sectionGap: number;
  itemGap: number;
}

export interface TemplateLayout {
  columns: (typeof COLUMNS)[number];
  // Sidebar
  sidebarStyle: (typeof SIDEBAR_STYLES)[number];
  sidebarWidth: (typeof SIDEBAR_WIDTHS)[number];
  /** Thin vertical line between the columns */
  columnDivider: boolean;
  // Header
  /** Sidebar layouts: "full" puts the header across the whole page with the sidebar starting beneath it */
  headerPosition: (typeof HEADER_POSITIONS)[number];
  /** Height of a full-width header, in points */
  headerHeight: number;
  headerStyle: (typeof HEADER_STYLES)[number];
  /** "split" puts the name on the left and the contact details on the right */
  headerLayout: (typeof HEADER_LAYOUTS)[number];
  headerAlignment: (typeof ALIGNMENTS)[number];
  /** Full-width header: line the name up with the main column instead of the page edge */
  headerAlignToMain: boolean;
  nameCase: (typeof NAME_CASES)[number];
  /** "two-tone": the first word light, the rest bold */
  nameStyle: (typeof NAME_STYLES)[number];
  nameTracking: (typeof TRACKINGS)[number];
  jobTitleCase: (typeof NAME_CASES)[number];
  jobTitleTracking: (typeof TRACKINGS)[number];
  /** Colour of the job title under the name */
  titleStyle: (typeof TITLE_STYLES)[number];
  headerRule: (typeof HEADER_RULES)[number];
  /** "bar": contact details in a coloured strip across the header */
  contactStyle: (typeof CONTACT_STYLES)[number];
  contactIcons: boolean;
  /** Line under the header (plain header only) */
  showDividers: boolean;
  /** A coloured strip along the top or left edge of every page, or a corner bracket */
  accentBar: (typeof ACCENT_BARS)[number];
  // Section headings
  sectionTitleStyle: (typeof SECTION_TITLE_STYLES)[number];
  titleRule: (typeof TITLE_RULES)[number];
  sectionTitleTracking: (typeof SECTION_TRACKINGS)[number];
  titleMarker: (typeof TITLE_MARKERS)[number];
  // Entries
  skillStyle: (typeof SKILL_STYLES)[number];
  experienceStyle: (typeof EXPERIENCE_STYLES)[number];
  experienceOrder: (typeof EXPERIENCE_ORDERS)[number];
  /** Used by "position first" entries: dates right of the title, or on their own line */
  datesPosition: (typeof DATES_POSITIONS)[number];
  timelineMarker: (typeof TIMELINE_MARKERS)[number];
  bulletDescriptions: boolean;
  educationStyle: (typeof EDUCATION_STYLES)[number];
  referenceLayout: (typeof REFERENCE_LAYOUTS)[number];
}

export interface TemplatePhoto {
  show: boolean;
  shape: (typeof PHOTO_SHAPES)[number];
  /** Diameter or side, in points */
  size: number;
  /** "overlap" straddles the bottom edge of a full-width header, over the sidebar */
  position: (typeof PHOTO_POSITIONS)[number];
  border: boolean;
}

/** One section of the CV and how this template treats it. The order of the list is the order on the page. */
export interface SectionSetting {
  key: SectionKey;
  /** The heading shown on the CV, e.g. "Profile" instead of "About" */
  title: string;
  visible: boolean;
  /** Sidebar layouts: which column the section sits in. Contact can also go in the header. */
  column: (typeof COLUMN_NAMES)[number];
}

export interface TemplateDesign {
  colors: TemplateColors;
  typography: TemplateTypography;
  spacing: TemplateSpacing;
  layout: TemplateLayout;
  photo: TemplatePhoto;
  sections: SectionSetting[];
}

/** A template as stored in Firestore (collection "cvTemplates") and as the builder receives it. */
export interface PublishedTemplate {
  id: string;
  name: string;
  description: string;
  design: TemplateDesign;
  /** Seconds since epoch, only used for ordering */
  createdAtSeconds: number;
}

// ── Limits (the admin form and the validator both use these) ────────────────────────────────────────────────
export const LIMITS = {
  nameSize: [16, 44],
  titleSize: [8, 22],
  headingSize: [8, 18],
  bodySize: [8, 12],
  padding: [20, 60],
  sectionGap: [8, 32],
  itemGap: [4, 20],
  lineHeight: [1.2, 1.8],
  headerHeight: [90, 260],
  photoSize: [50, 150],
  sectionTitle: 30,
} as const;

// ── Sections ───────────────────────────────────────────────────────────────────────────────────────────────
export const DEFAULT_SECTION_TITLES: Record<SectionKey, string> = {
  contact: "Contact",
  summary: "About",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
  languages: "Languages",
  references: "References",
};

/** Sidebar layouts keep contact, skills, education and languages aside by default; single column ignores this. */
const DEFAULT_COLUMNS: Record<SectionKey, SectionSetting["column"]> = {
  contact: "sidebar",
  summary: "main",
  experience: "main",
  skills: "sidebar",
  education: "sidebar",
  languages: "sidebar",
  references: "main",
};

type SectionSpec = [SectionKey, SectionSetting["column"], { title?: string; visible?: boolean }?];

/** Builds a section list from [key, column, options] entries; sections not listed are added at the end. */
function sectionsFrom(spec: SectionSpec[]): SectionSetting[] {
  const list = spec.map(([key, column, options]) => ({
    key,
    column,
    title: options?.title ?? DEFAULT_SECTION_TITLES[key],
    visible: options?.visible ?? true,
  }));
  for (const key of SECTION_KEYS) {
    if (!list.some((section) => section.key === key)) {
      list.push({ key, column: DEFAULT_COLUMNS[key], title: DEFAULT_SECTION_TITLES[key], visible: true });
    }
  }
  return list;
}

function defaultSections(): SectionSetting[] {
  return sectionsFrom(SECTION_KEYS.map((key) => [key, DEFAULT_COLUMNS[key]] as SectionSpec));
}

// ── Defaults and presets ───────────────────────────────────────────────────────────────────────────────────
export const DEFAULT_DESIGN: TemplateDesign = {
  colors: {
    primary: "#2563eb",
    secondary: "#666666",
    accent: "#dbeafe",
    background: "#ffffff",
    foreground: "#1a1a1a",
    muted: "#f3f4f6",
    border: "#e5e5e5",
    line: "#dbeafe",
  },
  typography: {
    headingFont: "sans-serif",
    bodyFont: "sans-serif",
    nameSize: 24,
    headingSize: 10,
    bodySize: 10,
    headingBold: true,
    nameBold: true,
    titleSize: 14,
    titleBold: true,
    lineHeight: 1.45,
  },
  spacing: { padding: 40, sectionGap: 16, itemGap: 10 },
  layout: {
    columns: "single",
    sidebarStyle: "tinted",
    sidebarWidth: "standard",
    columnDivider: false,
    headerPosition: "main",
    headerHeight: 150,
    headerStyle: "plain",
    headerLayout: "stacked",
    headerAlignment: "left",
    headerAlignToMain: false,
    nameCase: "normal",
    nameStyle: "normal",
    nameTracking: "normal",
    jobTitleCase: "normal",
    jobTitleTracking: "normal",
    titleStyle: "primary",
    headerRule: "none",
    contactStyle: "inline",
    contactIcons: false,
    showDividers: true,
    accentBar: "none",
    sectionTitleStyle: "uppercase",
    titleRule: "none",
    sectionTitleTracking: "auto",
    titleMarker: "none",
    skillStyle: "bar",
    experienceStyle: "timeline",
    experienceOrder: "position-first",
    datesPosition: "right",
    timelineMarker: "none",
    bulletDescriptions: false,
    educationStyle: "stacked",
    referenceLayout: "stacked",
  },
  photo: { show: false, shape: "circle", size: 90, position: "header", border: true },
  sections: defaultSections(),
};

const withDesign = (patch: {
  colors?: Partial<TemplateColors>;
  typography?: Partial<TemplateTypography>;
  spacing?: Partial<TemplateSpacing>;
  layout?: Partial<TemplateLayout>;
  photo?: Partial<TemplatePhoto>;
  sections?: SectionSetting[];
  /** Rename sections, e.g. { summary: "Profile" } */
  titles?: Partial<Record<SectionKey, string>>;
}): TemplateDesign => ({
  colors: { ...DEFAULT_DESIGN.colors, ...patch.colors },
  typography: { ...DEFAULT_DESIGN.typography, ...patch.typography },
  spacing: { ...DEFAULT_DESIGN.spacing, ...patch.spacing },
  layout: { ...DEFAULT_DESIGN.layout, ...patch.layout },
  photo: { ...DEFAULT_DESIGN.photo, ...patch.photo },
  sections: (patch.sections ?? defaultSections()).map((section) => ({
    ...section,
    title: patch.titles?.[section.key] ?? section.title,
  })),
});

/** Starting points offered when an admin creates a template. */
export const DESIGN_PRESETS: { id: string; label: string; design: TemplateDesign }[] = [
  { id: "clean", label: "Clean (single column)", design: withDesign({}) },
  {
    id: "serif",
    label: "Classic serif",
    design: withDesign({
      colors: { primary: "#7c2d12", accent: "#fde7d3", secondary: "#57534e" },
      typography: { headingFont: "serif", bodyFont: "serif", nameSize: 26, headingSize: 12 },
      layout: { titleRule: "underline", headerAlignment: "center", experienceStyle: "standard", skillStyle: "inline", sectionTitleStyle: "plain" },
    }),
  },
  {
    id: "banner",
    label: "Banner header",
    design: withDesign({
      colors: { primary: "#0f766e", accent: "#ccfbf1" },
      layout: { headerStyle: "band", sectionTitleStyle: "plain", skillStyle: "tag", experienceStyle: "standard" },
    }),
  },
  {
    id: "sidebar-tinted",
    label: "Sidebar (soft)",
    design: withDesign({
      colors: { primary: "#4338ca", accent: "#e0e7ff", muted: "#eef2ff" },
      layout: { columns: "sidebar-left", sidebarStyle: "tinted", skillStyle: "bar", sectionTitleStyle: "uppercase" },
    }),
  },
  {
    id: "sidebar-filled",
    label: "Sidebar (bold colour)",
    design: withDesign({
      colors: { primary: "#1e293b", accent: "#e2e8f0", muted: "#f1f5f9" },
      layout: { columns: "sidebar-left", sidebarStyle: "filled", skillStyle: "tag", experienceStyle: "compact" },
    }),
  },
  {
    id: "split",
    label: "Modern split header",
    design: withDesign({
      colors: { primary: "#c2410c", accent: "#ffedd5", secondary: "#6b7280" },
      typography: { nameSize: 26 },
      layout: {
        headerLayout: "split",
        nameCase: "uppercase",
        titleStyle: "muted",
        accentBar: "top",
        titleMarker: "bar",
        sectionTitleStyle: "plain",
        skillStyle: "dots",
        experienceStyle: "standard",
        bulletDescriptions: true,
        showDividers: false,
      },
      titles: { summary: "Profile", experience: "Work history" },
    }),
  },
  {
    id: "sidebar-right-teal",
    label: "Sidebar right (wide, dots)",
    design: withDesign({
      colors: { primary: "#134e4a", accent: "#ccfbf1", muted: "#f0fdfa" },
      layout: {
        columns: "sidebar-right",
        sidebarStyle: "filled",
        sidebarWidth: "wide",
        skillStyle: "dots",
        titleMarker: "dot",
        accentBar: "left",
        bulletDescriptions: true,
        experienceStyle: "timeline",
        datesPosition: "below",
      },
      titles: { summary: "Profile", skills: "Strengths" },
    }),
  },
  {
    // Right-aligned two-tone name, corner bracket, grey contact bar, timeline with square markers
    id: "grey-bar",
    label: "Grey: corner bracket + contact bar",
    design: withDesign({
      colors: { primary: "#6b6b6b", secondary: "#6b6b6b", accent: "#9a9a9a", foreground: "#333333", muted: "#f2f2f2", border: "#b5b5b5", line: "#8a8a8a" },
      typography: { nameSize: 30, titleSize: 15, titleBold: false, nameBold: false, lineHeight: 1.4 },
      spacing: { padding: 28, sectionGap: 18, itemGap: 12 },
      layout: {
        columns: "sidebar-right",
        sidebarStyle: "tinted",
        headerPosition: "full",
        headerHeight: 215,
        headerAlignment: "right",
        nameCase: "uppercase",
        nameStyle: "two-tone",
        nameTracking: "wide",
        titleStyle: "muted",
        headerRule: "short",
        contactStyle: "bar",
        contactIcons: true,
        accentBar: "corner",
        sectionTitleStyle: "uppercase",
        titleRule: "line-after",
        sectionTitleTracking: "normal",
        skillStyle: "list",
        experienceStyle: "timeline",
        experienceOrder: "dates-first",
        timelineMarker: "square",
        bulletDescriptions: true,
        educationStyle: "dated",
        referenceLayout: "two-column",
      },
      sections: sectionsFrom([
        ["summary", "main", { title: "Profile Info" }],
        ["experience", "main"],
        ["references", "main", { title: "Reference" }],
        ["education", "sidebar"],
        ["skills", "sidebar"],
        ["languages", "sidebar"],
        ["contact", "header"],
      ]),
    }),
  },
  {
    // Tinted header with name left and contact column right, boxed wide-spaced headings, white sidebar with divider
    id: "soft-split",
    label: "Soft grey: split header + divider",
    design: withDesign({
      colors: { primary: "#5a5a62", secondary: "#6e6e75", accent: "#dcdcdc", foreground: "#4d4d55", muted: "#f7f7f7", border: "#e3e3e3", line: "#6b6b72" },
      typography: { nameSize: 34, nameBold: false, titleSize: 10, titleBold: false, lineHeight: 1.5 },
      spacing: { padding: 36, sectionGap: 16, itemGap: 12 },
      layout: {
        columns: "sidebar-right",
        sidebarStyle: "plain",
        sidebarWidth: "wide",
        columnDivider: true,
        headerPosition: "full",
        headerHeight: 180,
        headerStyle: "tint",
        headerLayout: "split",
        nameCase: "uppercase",
        nameTracking: "wide",
        jobTitleCase: "uppercase",
        jobTitleTracking: "wider",
        titleStyle: "muted",
        contactIcons: true,
        sectionTitleStyle: "uppercase",
        titleRule: "boxed",
        sectionTitleTracking: "wider",
        skillStyle: "list",
        experienceStyle: "timeline",
        experienceOrder: "dates-first",
        timelineMarker: "square",
        bulletDescriptions: true,
        educationStyle: "dated",
      },
      sections: sectionsFrom([
        ["summary", "main", { title: "Profile" }],
        ["experience", "main", { title: "Work Experience" }],
        ["education", "sidebar"],
        ["skills", "sidebar"],
        ["languages", "sidebar"],
        ["references", "sidebar"],
        ["contact", "header"],
      ]),
    }),
  },
  {
    // Navy banner, photo overlapping the sidebar, icon headings, timeline with circle nodes
    id: "navy-photo",
    label: "Navy: banner + photo + icons",
    design: withDesign({
      colors: { primary: "#2f3a4f", secondary: "#4a5568", accent: "#2f3a4f", foreground: "#2f3a4f", muted: "#e6e6e6", border: "#2f3a4f", line: "#2f3a4f" },
      typography: { nameSize: 30, headingSize: 11, titleSize: 15, titleBold: false, lineHeight: 1.4 },
      spacing: { padding: 30, sectionGap: 16, itemGap: 12 },
      layout: {
        columns: "sidebar-left",
        sidebarStyle: "tinted",
        headerPosition: "full",
        headerHeight: 140,
        headerStyle: "band",
        headerAlignToMain: true,
        nameCase: "uppercase",
        jobTitleCase: "uppercase",
        titleStyle: "plain",
        contactIcons: true,
        sectionTitleStyle: "uppercase",
        titleRule: "underline",
        sectionTitleTracking: "wide",
        titleMarker: "icon",
        skillStyle: "list",
        experienceStyle: "timeline",
        experienceOrder: "company-first",
        timelineMarker: "dot",
        bulletDescriptions: true,
        educationStyle: "year-right",
      },
      photo: { show: true, shape: "circle", size: 138, position: "overlap", border: true },
      sections: sectionsFrom([
        ["summary", "main", { title: "Profile" }],
        ["experience", "main", { title: "Work Experience" }],
        ["education", "main"],
        ["contact", "sidebar"],
        ["skills", "sidebar"],
        ["languages", "sidebar"],
        ["references", "sidebar", { title: "Reference" }],
      ]),
    }),
  },
];

// ── Validation: anything read from the database goes through here ───────────────────────────────────────────
const isHex = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(v as string) ? (v as T) : fallback;
const num = (v: unknown, [min, max]: readonly [number, number], fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

/**
 * Turns whatever is stored into a safe, complete design: unknown or invalid values fall back to the defaults,
 * numbers are clamped, colours must be #rrggbb. A broken or tampered template can never crash the builder or put
 * arbitrary text into a style. Templates saved before an option existed simply get that option's default.
 */
export function normalizeDesign(raw: unknown): TemplateDesign {
  const r = obj(raw);
  const c = obj(r.colors);
  const t = obj(r.typography);
  const s = obj(r.spacing);
  const l = obj(r.layout);
  const p = obj(r.photo);
  const d = DEFAULT_DESIGN;
  const dl = d.layout;
  const rawSections = Array.isArray(r.sections) ? r.sections : [];

  const color = (key: keyof TemplateColors) => (isHex(c[key]) ? (c[key] as string).toLowerCase() : d.colors[key]);

  // Older templates used an "underlined" heading style; it is now a heading rule.
  let sectionTitleStyle = pick(l.sectionTitleStyle, ["plain", "uppercase", "underline"] as const, dl.sectionTitleStyle);
  let titleRule = pick(l.titleRule, TITLE_RULES, dl.titleRule);
  if (sectionTitleStyle === "underline") {
    sectionTitleStyle = "plain";
    if (titleRule === "none") titleRule = "underline";
  }

  const headingBold = bool(t.headingBold, d.typography.headingBold);

  return {
    colors: {
      primary: color("primary"),
      secondary: color("secondary"),
      accent: color("accent"),
      background: color("background"),
      foreground: color("foreground"),
      muted: color("muted"),
      border: color("border"),
      // Templates saved before this colour existed drew the timeline in the accent tint
      line: isHex(c.line) ? (c.line as string).toLowerCase() : color("accent"),
    },
    typography: {
      headingFont: pick(t.headingFont, FONT_KINDS, d.typography.headingFont),
      bodyFont: pick(t.bodyFont, FONT_KINDS, d.typography.bodyFont),
      nameSize: num(t.nameSize, LIMITS.nameSize, d.typography.nameSize),
      headingSize: num(t.headingSize, LIMITS.headingSize, d.typography.headingSize),
      bodySize: num(t.bodySize, LIMITS.bodySize, d.typography.bodySize),
      headingBold,
      // Templates saved before this option existed keep the name as bold as the headings were
      nameBold: bool(t.nameBold, headingBold),
      // Templates saved before this existed sized the title from the body text, as it was then
      titleSize: num(t.titleSize, LIMITS.titleSize, Math.round(num(t.bodySize, LIMITS.bodySize, d.typography.bodySize) * 1.4)),
      titleBold: bool(t.titleBold, true),
      lineHeight: num(t.lineHeight, LIMITS.lineHeight, d.typography.lineHeight),
    },
    spacing: {
      padding: num(s.padding, LIMITS.padding, d.spacing.padding),
      sectionGap: num(s.sectionGap, LIMITS.sectionGap, d.spacing.sectionGap),
      itemGap: num(s.itemGap, LIMITS.itemGap, d.spacing.itemGap),
    },
    layout: {
      columns: pick(l.columns, COLUMNS, dl.columns),
      sidebarStyle: pick(l.sidebarStyle, SIDEBAR_STYLES, dl.sidebarStyle),
      sidebarWidth: pick(l.sidebarWidth, SIDEBAR_WIDTHS, dl.sidebarWidth),
      columnDivider: bool(l.columnDivider, dl.columnDivider),
      headerPosition: pick(l.headerPosition, HEADER_POSITIONS, dl.headerPosition),
      headerHeight: num(l.headerHeight, LIMITS.headerHeight, dl.headerHeight),
      headerStyle: pick(l.headerStyle, HEADER_STYLES, dl.headerStyle),
      headerLayout: pick(l.headerLayout, HEADER_LAYOUTS, dl.headerLayout),
      headerAlignment: pick(l.headerAlignment, ALIGNMENTS, dl.headerAlignment),
      headerAlignToMain: bool(l.headerAlignToMain, dl.headerAlignToMain),
      nameCase: pick(l.nameCase, NAME_CASES, dl.nameCase),
      nameStyle: pick(l.nameStyle, NAME_STYLES, dl.nameStyle),
      nameTracking: pick(l.nameTracking, TRACKINGS, dl.nameTracking),
      jobTitleCase: pick(l.jobTitleCase, NAME_CASES, dl.jobTitleCase),
      jobTitleTracking: pick(l.jobTitleTracking, TRACKINGS, dl.jobTitleTracking),
      titleStyle: pick(l.titleStyle, TITLE_STYLES, dl.titleStyle),
      headerRule: pick(l.headerRule, HEADER_RULES, dl.headerRule),
      contactStyle: pick(l.contactStyle, CONTACT_STYLES, dl.contactStyle),
      contactIcons: bool(l.contactIcons, dl.contactIcons),
      showDividers: bool(l.showDividers, dl.showDividers),
      accentBar: pick(l.accentBar, ACCENT_BARS, dl.accentBar),
      sectionTitleStyle,
      titleRule,
      sectionTitleTracking: pick(l.sectionTitleTracking, SECTION_TRACKINGS, dl.sectionTitleTracking),
      titleMarker: pick(l.titleMarker, TITLE_MARKERS, dl.titleMarker),
      skillStyle: pick(l.skillStyle, SKILL_STYLES, dl.skillStyle),
      experienceStyle: pick(l.experienceStyle, EXPERIENCE_STYLES, dl.experienceStyle),
      experienceOrder: pick(l.experienceOrder, EXPERIENCE_ORDERS, dl.experienceOrder),
      datesPosition: pick(l.datesPosition, DATES_POSITIONS, dl.datesPosition),
      timelineMarker: pick(l.timelineMarker, TIMELINE_MARKERS, dl.timelineMarker),
      bulletDescriptions: bool(l.bulletDescriptions, dl.bulletDescriptions),
      educationStyle: pick(l.educationStyle, EDUCATION_STYLES, dl.educationStyle),
      referenceLayout: pick(l.referenceLayout, REFERENCE_LAYOUTS, dl.referenceLayout),
    },
    photo: {
      show: bool(p.show, d.photo.show),
      shape: pick(p.shape, PHOTO_SHAPES, d.photo.shape),
      size: num(p.size, LIMITS.photoSize, d.photo.size),
      position: pick(p.position, PHOTO_POSITIONS, d.photo.position),
      border: bool(p.border, d.photo.border),
    },
    sections: normalizeSections(rawSections),
  };
}

/**
 * Keeps the stored order, drops unknown or repeated entries, cleans titles, and adds back any section that is
 * missing, so a template always has exactly one entry for each section. Only contact can sit in the header.
 */
function normalizeSections(raw: unknown[]): SectionSetting[] {
  const seen = new Set<SectionKey>();
  const result: SectionSetting[] = [];

  for (const item of raw) {
    const entry = obj(item);
    if (!(SECTION_KEYS as readonly string[]).includes(entry.key as string)) continue;
    const key = entry.key as SectionKey;
    if (seen.has(key)) continue;
    seen.add(key);

    // Titles are plain text: control characters removed, trimmed, limited in length.
    const cleaned =
      typeof entry.title === "string"
        ? entry.title.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, LIMITS.sectionTitle)
        : "";
    const allowed = key === "contact" ? COLUMN_NAMES : (["main", "sidebar"] as const);
    result.push({
      key,
      title: cleaned || DEFAULT_SECTION_TITLES[key],
      visible: bool(entry.visible, true),
      column: pick(entry.column, allowed, DEFAULT_COLUMNS[key]),
    });
  }

  for (const key of SECTION_KEYS) {
    if (!seen.has(key)) {
      result.push({ key, title: DEFAULT_SECTION_TITLES[key], visible: true, column: DEFAULT_COLUMNS[key] });
    }
  }
  return result;
}

// ── Colour helpers ──────────────────────────────────────────────────────────────────────────────────────────
const toRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const toHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/** Blend two colours: t = 0 gives a, t = 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1 (none) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** White or near-black, whichever reads better on the given background. */
export function readableOn(bg: string): string {
  return contrastRatio("#ffffff", bg) >= contrastRatio("#111111", bg) ? "#ffffff" : "#111111";
}

// ── Fonts ───────────────────────────────────────────────────────────────────────────────────────────────────
// The PDF can only use fonts it has built in, which is why the choice is limited to three families.
export const CSS_FONTS: Record<FontKind, string> = {
  "sans-serif": 'Helvetica, Arial, "Liberation Sans", sans-serif',
  serif: '"Times New Roman", Times, "Liberation Serif", serif',
  mono: '"Courier New", Courier, "Liberation Mono", monospace',
};

export const PDF_FONTS: Record<FontKind, { regular: string; bold: string }> = {
  "sans-serif": { regular: "Helvetica", bold: "Helvetica-Bold" },
  serif: { regular: "Times-Roman", bold: "Times-Bold" },
  mono: { regular: "Courier", bold: "Courier-Bold" },
};

// ── Page geometry shared by preview and PDF ─────────────────────────────────────────────────────────────────
export const A4_WIDTH_PT = 595.28;
/** Preview is drawn 650px wide, so one PDF point is this many preview pixels. */
export const PT = 650 / A4_WIDTH_PT;

const SIDEBAR_WIDTHS_PT: Record<(typeof SIDEBAR_WIDTHS)[number], number> = { narrow: 160, standard: 190, wide: 225 };
export const sidebarWidthPt = (layout: TemplateLayout) => SIDEBAR_WIDTHS_PT[layout.sidebarWidth];

/** Letter-spacing as a fraction of the font size. */
export const TRACKING_EM: Record<(typeof TRACKINGS)[number], number> = { normal: 0, wide: 0.1, wider: 0.3 };

// ── Resolved colours per region of the page ─────────────────────────────────────────────────────────────────
export interface RegionColors {
  bg: string;
  text: string;
  muted: string;
  title: string;
  rule: string;
  /** Timeline line and markers */
  line: string;
  track: string;
  fill: string;
  tagBg: string;
  tagText: string;
}

export interface ResolvedTheme {
  main: RegionColors;
  sidebar: RegionColors;
  /** Colours inside a header: band (primary), tint (soft fill) or plain (the page) */
  header: { bg: string; text: string; muted: string; rule: string; barBg: string; barText: string };
}

/** Works out the colours for each part of the page once, so the preview and the PDF can't disagree. */
export function resolveTheme(design: TemplateDesign): ResolvedTheme {
  const c = design.colors;
  const onPrimary = readableOn(c.primary);

  const main: RegionColors = {
    bg: c.background,
    text: c.foreground,
    muted: c.secondary,
    title: c.primary,
    rule: c.accent,
    line: c.line,
    track: c.border,
    fill: c.primary,
    tagBg: c.accent,
    tagText: c.primary,
  };

  const sidebar: RegionColors =
    design.layout.sidebarStyle === "filled"
      ? {
          bg: c.primary,
          text: onPrimary,
          muted: mix(onPrimary, c.primary, 0.25),
          title: onPrimary,
          rule: mix(onPrimary, c.primary, 0.6),
          line: mix(onPrimary, c.primary, 0.6),
          track: mix(c.primary, onPrimary, 0.25),
          fill: onPrimary,
          tagBg: mix(c.primary, onPrimary, 0.2),
          tagText: onPrimary,
        }
      : design.layout.sidebarStyle === "plain"
        ? { ...main, rule: c.border }
        : {
            bg: c.muted,
            text: c.foreground,
            muted: c.secondary,
            title: c.primary,
            rule: c.border,
            line: c.line,
            track: mix(c.muted, c.foreground, 0.15),
            fill: c.primary,
            tagBg: c.background,
            tagText: c.primary,
          };

  const style = design.layout.headerStyle;
  const bg = style === "band" ? c.primary : style === "tint" ? c.muted : c.background;
  const text = style === "band" ? onPrimary : c.foreground;
  const muted = style === "band" ? mix(onPrimary, c.primary, 0.25) : c.secondary;
  const rule = style === "band" ? mix(onPrimary, c.primary, 0.4) : mix(c.secondary, c.background, 0.35);
  // The contact bar is the primary colour; inside a band header it is lightened slightly so it still shows
  const barBg = style === "band" ? mix(c.primary, onPrimary, 0.15) : c.primary;
  const barText = onPrimary;

  return { main, sidebar, header: { bg, text, muted, rule, barBg, barText } };
}
