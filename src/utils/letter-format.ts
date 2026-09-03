export interface LetterParts {
  fullName: string;
  addressLines: string[];
  email: string;
  phone: string;
  dateLine: string;
  recipientLines: string[];
  subjectLine: string;
  salutation: string;
  bodyParagraphs: string[];
  closing: string;
}

interface PersonalContact {
  email?: string;
  phone?: string;
  location?: string;
}

export function buildLetterParts(
  bodyText: string,
  fullName: string,
  personal: PersonalContact | undefined,
  jobTitle: string,
  companyName: string
): LetterParts {
  const addressLines = (personal?.location || "")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  const dateLine = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const recipientLines: string[] = [];
  if (companyName.trim()) {
    recipientLines.push("The Hiring Manager");
    recipientLines.push(companyName.trim());
  }

  const subjectLine = jobTitle.trim()
    ? `RE: APPLICATION FOR THE POSITION OF ${jobTitle.trim().toUpperCase()}`
    : "";

  const bodyParagraphs = bodyText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    fullName,
    addressLines,
    email: personal?.email || "",
    phone: personal?.phone || "",
    dateLine,
    recipientLines,
    subjectLine,
    salutation: "Dear Hiring Manager,",
    bodyParagraphs,
    closing: "Yours sincerely,",
  };
}

// Full plain-text version — used for the Copy button and as a DOCX fallback.
export function composeLetterText(parts: LetterParts): string {
  const lines: string[] = [];

  if (parts.fullName) lines.push(parts.fullName);
  for (const line of parts.addressLines) lines.push(line);
  if (parts.email) lines.push(`Email: ${parts.email}`);
  if (parts.phone) lines.push(`Phone: ${parts.phone}`);
  lines.push(parts.dateLine);
  lines.push("");

  if (parts.recipientLines.length) {
    for (const line of parts.recipientLines) lines.push(line);
    lines.push("");
  }

  lines.push(parts.salutation);
  lines.push("");

  if (parts.subjectLine) {
    lines.push(parts.subjectLine);
    lines.push("");
  }

  for (const para of parts.bodyParagraphs) {
    lines.push(para);
    lines.push("");
  }

  lines.push(parts.closing);
  lines.push("");
  lines.push("");
  lines.push(parts.fullName);

  return lines.join("\n");
}
