// Builds Google's JobPosting structured data (JSON-LD) for a job detail page, so approved
// listings are eligible for Google's job search results.
import type { Timestamp } from "firebase/firestore";

// The platform is Malawi-based, so listings are marked as being in Malawi.
// If you ever list jobs elsewhere, this should become a field on the posting form.
const DEFAULT_COUNTRY = "MW";

const EMPLOYMENT_TYPES: Record<string, string> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contract: "CONTRACTOR",
  Internship: "INTERN",
};

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Plain-text description -> the simple HTML Google expects (<p>, <br>, <ul>, <li>).
export function descriptionToHtml(text: string): string {
  const blocks = text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const out: string[] = [];
      let list: string[] = [];
      let para: string[] = [];
      const flushList = () => {
        if (list.length) out.push(`<ul>${list.map((i) => `<li>${i}</li>`).join("")}</ul>`);
        list = [];
      };
      const flushPara = () => {
        if (para.length) out.push(`<p>${para.join("<br>")}</p>`);
        para = [];
      };

      for (const raw of block.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        const bullet = line.match(/^(?:[-–•·*●▪◦]|\d+[.)])\s+(.*)$/);
        if (bullet) {
          flushPara();
          list.push(escapeHtml(bullet[1]));
        } else {
          flushList();
          para.push(escapeHtml(line));
        }
      }
      flushList();
      flushPara();
      return out.join("");
    })
    .join("");
}

export interface JobPostingInput {
  id: string;
  jobTitle: string;
  companyName: string;
  description: string;
  location: string;
  employmentType: string;
  contactEmail: string;
  contactAddress: string;
  createdAt: Timestamp | null;
  closingDate: Timestamp | null;
}

export function buildJobPostingJsonLd(job: JobPostingInput) {
  // datePosted is required by Google; without it there's nothing valid to publish.
  if (!job.createdAt) return null;

  const locality = job.location.split(",")[0].trim();
  const usableLocality = locality && !/remote|work from home|nationwide|countrywide/i.test(locality) ? locality : "";

  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.jobTitle,
    description: descriptionToHtml(job.description),
    identifier: { "@type": "PropertyValue", name: job.companyName, value: job.id },
    datePosted: job.createdAt.toDate().toISOString(),
    validThrough: job.closingDate ? job.closingDate.toDate().toISOString() : undefined,
    employmentType: EMPLOYMENT_TYPES[job.employmentType],
    hiringOrganization: { "@type": "Organization", name: job.companyName },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: usableLocality || undefined,
        addressCountry: DEFAULT_COUNTRY,
      },
    },
    // The listing itself says how to apply (email and/or postal address).
    directApply: Boolean(job.contactEmail || job.contactAddress),
  };
}
