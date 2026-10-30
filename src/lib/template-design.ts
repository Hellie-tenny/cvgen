/*
  Admin-made CV templates
  -----------------------
  A custom template is not code: it is a saved set of design choices (this file) that one shared renderer
  draws, both on screen (custom-cv-preview.tsx) and in the PDF (custom-cv-pdf.tsx).

  Units: every size is in PDF points on an A4 page (595 x 842). The on-screen preview multiplies by PT to
  match the 650px-wide preview, so the two always have the same proportions.
*/

export type FontKind = "sans-serif" | "serif" | "mono";

export interface TemplateColors {
  /** Name accents, section titles, company names, skill fills, header band, filled sidebar */
  primary: string;
  /** Secondary text: dates, contact details, skill levels */
  secondary: string;
  /** Light tint: timeline lines, section underlines, tag backgrounds */
  accent: string;
  background: string;
  /** Main body text */
  foreground: string;
  /** Soft fill: tinted sidebar, subtle panels */
  muted: string;
  /** Hairlines and skill-bar tracks */
  border: string;
}

export interface TemplateTypography {
  headingFont: FontKind;
  bodyFont: FontKind;
  nameSize: number;
  headingSize: number;
  bodySize: number;
  headingBold: boolean;
}

export interface TemplateSpacing {
  padding: number;
  sectionGap: number;
  itemGap: number;
}

export const COLUMNS = ["single", "sidebar-left", "sidebar-right"] as const;
export const SIDEBAR_STYLES = ["tinted", "filled"] as const;
export const HEADER_STYLES = ["plain", "band"] as const;
export const ALIGNMENTS = ["left", "center"] as const;
export const SECTION_TITLE_STYLES = ["plain", "uppercase", "underline"] as const;
export const SKILL_STYLES = ["bar", "tag", "inline"] as const;
export const EXPERIENCE_STYLES = ["timeline", "standard", "compact"] as const;
export const FONT_KINDS = ["sans-serif", "serif", "mono"] as const;

export interface TemplateLayout {
  columns: (typeof COLUMNS)[number];
  /** Sidebar layouts only */
  sidebarStyle: (typeof SIDEBAR_STYLES)[number];
  /** Single-column layouts only; sidebar layouts put the name at the top of the main column */
  headerStyle: (typeof HEADER_STYLES)[number];
  headerAlignment: (typeof ALIGNMENTS)[number];
  sectionTitleStyle: (typeof SECTION_TITLE_STYLES)[number];
  /** Line under the header (plain header only) */
  showDividers: boolean;
  skillStyle: (typeof SKILL_STYLES)[number];
  experienceStyle: (typeof EXPERIENCE_STYLES)[number];
}

export interface TemplateDesign {
  colors: TemplateColors;
  typography: TemplateTypography;
  spacing: TemplateSpacing;
  layout: TemplateLayout;
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
  nameSize: [16, 40],
  headingSize: [8, 18],
  bodySize: [8, 12],
  padding: [20, 60],
  sectionGap: [8, 32],
  itemGap: [4, 20],
} as const;

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
  },
  typography: {
    headingFont: "sans-serif",
    bodyFont: "sans-serif",
    nameSize: 24,
    headingSize: 10,
    bodySize: 10,
    headingBold: true,
  },
  spacing: { padding: 40, sectionGap: 16, itemGap: 10 },
  layout: {
    columns: "single",
    sidebarStyle: "tinted",
    headerStyle: "plain",
    headerAlignment: "left",
    sectionTitleStyle: "uppercase",
    showDividers: true,
    skillStyle: "bar",
    experienceStyle: "timeline",
  },
};

const withDesign = (patch: {
  colors?: Partial<TemplateColors>;
  typography?: Partial<TemplateTypography>;
  spacing?: Partial<TemplateSpacing>;
  layout?: Partial<TemplateLayout>;
}): TemplateDesign => ({
  colors: { ...DEFAULT_DESIGN.colors, ...patch.colors },
  typography: { ...DEFAULT_DESIGN.typography, ...patch.typography },
  spacing: { ...DEFAULT_DESIGN.spacing, ...patch.spacing },
  layout: { ...DEFAULT_DESIGN.layout, ...patch.layout },
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
      layout: { sectionTitleStyle: "underline", headerAlignment: "center", experienceStyle: "standard", skillStyle: "inline" },
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
];

// ── Validation: anything read from the database goes through here ───────────────────────────────────────────
const isHex = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(v as string) ? (v as T) : fallback;
const num = (v: unknown, [min, max]: readonly [number, number], fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

/**
 * Turns whatever is stored into a safe, complete design: unknown or invalid values fall back to the defaults,
 * numbers are clamped, colours must be #rrggbb. This means a broken or tampered template can never crash the
 * builder or put arbitrary text into a style.
 */
export function normalizeDesign(raw: unknown): TemplateDesign {
  const r = obj(raw);
  const c = obj(r.colors);
  const t = obj(r.typography);
  const s = obj(r.spacing);
  const l = obj(r.layout);
  const d = DEFAULT_DESIGN;

  const color = (key: keyof TemplateColors) => (isHex(c[key]) ? (c[key] as string).toLowerCase() : d.colors[key]);

  return {
    colors: {
      primary: color("primary"),
      secondary: color("secondary"),
      accent: color("accent"),
      background: color("background"),
      foreground: color("foreground"),
      muted: color("muted"),
      border: color("border"),
    },
    typography: {
      headingFont: pick(t.headingFont, FONT_KINDS, d.typography.headingFont),
      bodyFont: pick(t.bodyFont, FONT_KINDS, d.typography.bodyFont),
      nameSize: num(t.nameSize, LIMITS.nameSize, d.typography.nameSize),
      headingSize: num(t.headingSize, LIMITS.headingSize, d.typography.headingSize),
      bodySize: num(t.bodySize, LIMITS.bodySize, d.typography.bodySize),
      headingBold: typeof t.headingBold === "boolean" ? t.headingBold : d.typography.headingBold,
    },
    spacing: {
      padding: num(s.padding, LIMITS.padding, d.spacing.padding),
      sectionGap: num(s.sectionGap, LIMITS.sectionGap, d.spacing.sectionGap),
      itemGap: num(s.itemGap, LIMITS.itemGap, d.spacing.itemGap),
    },
    layout: {
      columns: pick(l.columns, COLUMNS, d.layout.columns),
      sidebarStyle: pick(l.sidebarStyle, SIDEBAR_STYLES, d.layout.sidebarStyle),
      headerStyle: pick(l.headerStyle, HEADER_STYLES, d.layout.headerStyle),
      headerAlignment: pick(l.headerAlignment, ALIGNMENTS, d.layout.headerAlignment),
      sectionTitleStyle: pick(l.sectionTitleStyle, SECTION_TITLE_STYLES, d.layout.sectionTitleStyle),
      showDividers: typeof l.showDividers === "boolean" ? l.showDividers : d.layout.showDividers,
      skillStyle: pick(l.skillStyle, SKILL_STYLES, d.layout.skillStyle),
      experienceStyle: pick(l.experienceStyle, EXPERIENCE_STYLES, d.layout.experienceStyle),
    },
  };
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
export const SIDEBAR_WIDTH_PT = 190;

// ── Resolved colours per region of the page ─────────────────────────────────────────────────────────────────
export interface RegionColors {
  bg: string;
  text: string;
  muted: string;
  title: string;
  rule: string;
  track: string;
  fill: string;
  tagBg: string;
  tagText: string;
}

export interface ResolvedTheme {
  main: RegionColors;
  sidebar: RegionColors;
  band: { bg: string; text: string; muted: string };
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
          track: mix(c.primary, onPrimary, 0.25),
          fill: onPrimary,
          tagBg: mix(c.primary, onPrimary, 0.2),
          tagText: onPrimary,
        }
      : {
          bg: c.muted,
          text: c.foreground,
          muted: c.secondary,
          title: c.primary,
          rule: c.border,
          track: mix(c.muted, c.foreground, 0.15),
          fill: c.primary,
          tagBg: c.background,
          tagText: c.primary,
        };

  return { main, sidebar, band: { bg: c.primary, text: onPrimary, muted: mix(onPrimary, c.primary, 0.25) } };
}
