/*
  Small stroke icons used by admin-made CV templates (contact details, section headings).
  Based on the Feather icon set (MIT licence): 24x24 grid, 2px stroke, round caps.
  Every shape is written as an SVG path, so the on-screen preview (<svg>) and the PDF (<Svg>) draw exactly the
  same thing from the same data.
*/

export type IconName =
  | "phone"
  | "mail"
  | "map-pin"
  | "globe"
  | "user"
  | "users"
  | "briefcase"
  | "graduation-cap"
  | "star";

export const ICON_PATHS: Record<IconName, string[]> = {
  phone: [
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  ],
  mail: ["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M22 6l-10 7L2 6"],
  "map-pin": ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M9 10a3 3 0 1 0 6 0a3 3 0 1 0-6 0"],
  globe: [
    "M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0",
    "M2 12h20",
    "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  ],
  user: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0"],
  users: [
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    "M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
    "M23 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  briefcase: ["M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z", "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"],
  "graduation-cap": ["M22 10v6M2 10l10-5 10 5-10 5z", "M6 12v5c3 3 9 3 12 0v-5"],
  star: ["M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26Z"],
};

/** The icon that goes with each kind of contact detail. */
export const CONTACT_ICONS = {
  email: "mail",
  phone: "phone",
  location: "map-pin",
  website: "globe",
} as const satisfies Record<string, IconName>;

/** The icon that goes with each CV section heading. */
export const SECTION_ICONS = {
  contact: "phone",
  summary: "user",
  experience: "briefcase",
  skills: "star",
  education: "graduation-cap",
  languages: "globe",
  references: "users",
} as const satisfies Record<string, IconName>;
