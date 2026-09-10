interface PersonalContact {
  email?: string;
  phone?: string;
  location?: string;
}

// Builds the initial full letter text — sender block + date (same side),
// recipient, salutation, RE line, AI-generated body, closing, signature.
// This becomes the single editable seed text; nothing downstream treats
// these as separate fields again, so edits to any part (including the
// address or closing) are simply part of the text from here on.
export function buildInitialLetterText(
  bodyText: string,
  fullName: string,
  personal: PersonalContact | undefined,
  jobTitle: string,
  companyName: string
): string {
  const addressLines = (personal?.location || "")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  const dateLine = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lines: string[] = [];

  if (fullName) lines.push(fullName);
  for (const line of addressLines) lines.push(line);
  if (personal?.email) lines.push(`Email: ${personal.email}`);
  if (personal?.phone) lines.push(`Phone: ${personal.phone}`);
  lines.push(dateLine);
  lines.push("");

  if (companyName.trim()) {
    lines.push("The Hiring Manager");
    lines.push(companyName.trim());
    lines.push("");
  }

  lines.push("Dear Hiring Manager,");
  lines.push("");

  if (jobTitle.trim()) {
    lines.push(`RE: APPLICATION FOR THE POSITION OF ${jobTitle.trim().toUpperCase()}`);
    lines.push("");
  }

  const bodyParagraphs = bodyText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const para of bodyParagraphs) {
    lines.push(para);
    lines.push("");
  }

  lines.push("Yours sincerely,");
  lines.push("");
  lines.push("");
  lines.push(fullName);

  return lines.join("\n");
}

// Splits any letter text (edited or not) into paragraph blocks on blank lines.
export function splitLetterIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
