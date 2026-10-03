// Pulls a "Requirements / Qualifications" section out of a job's free-text description,
// so the listing page can highlight it. Purely a display helper: nothing is saved, and if no
// such section is found the description is shown exactly as before.

export type RequirementBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export interface ParsedDescription {
  /** Description text with the requirements section removed (nothing else is changed). */
  rest: string;
  requirements: RequirementBlock[];
}

const QUALIFIER = "(?:key|minimum|essential|required|job|academic|desired|preferred|professional|entry|basic)";
const NOUN = "(?:requirements?|qualifications?|criteria)";
const EXTRA = "(?:requirements?|qualifications?|experience|skills|competenc(?:y|ies)|education)";

// Headings that mark the START of the requirements section.
const REQUIREMENTS_HEADING = new RegExp(
  [
    `^(?:${QUALIFIER}\\s+)?${NOUN}(?:\\s*(?:and|&|/|,)\\s*${EXTRA})?$`,
    `^(?:education|skills|experience|academic)\\s*(?:and|&|/)\\s*(?:experience|skills|qualifications?|competenc(?:y|ies)|requirements?)$`,
    `^person specification$`,
    `^who you are$`,
    `^what (?:we are|we're|we’re) looking for$`,
    `^ideal candidate$`,
  ].join("|"),
  "i"
);

// Common headings that END the section (what usually follows requirements).
const OTHER_HEADING =
  /^(?:key |main |job |primary )?(?:responsibilit(?:y|ies)|duties(?: (?:and|&) responsibilities)?|about(?: us| the (?:company|role|job|position|organi[sz]ation))?|(?:job|role|position) (?:summary|description|purpose|overview)|overview|summary|how to apply|applications?(?: (?:procedure|process|instructions|deadline))?|to apply|method of application|benefits|what we offer|we offer|salary(?: range)?|remuneration|closing date|deadline|reporting (?:to|line)|location|terms(?: of employment)?|notes?|important(?: notice)?|disclaimer|equal opportunity)$/i;

const BULLET = /^\s*(?:[-–•·*●▪◦]|\d+[.)]|[a-z][.)])\s+/i;

// Strips markdown/numbering decoration so "**3. Requirements:**" reads as "Requirements:".
const clean = (line: string) =>
  line
    .trim()
    .replace(/[*_]+/g, "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();

function matchRequirementsHeading(line: string): { inline: string } | null {
  const text = clean(line);
  if (!text) return null;

  const colon = text.indexOf(":");
  if (colon === -1) return REQUIREMENTS_HEADING.test(text) ? { inline: "" } : null;

  const head = text.slice(0, colon).trim();
  if (head.length <= 50 && REQUIREMENTS_HEADING.test(head)) {
    // "Requirements: Degree in accounting" — the content sits on the same line.
    const inline = line.slice(line.indexOf(":") + 1).replace(/^[*_\s]+/, "").trim();
    return { inline };
  }
  return null;
}

function isSectionBreak(line: string, sawBullet: boolean): boolean {
  if (BULLET.test(line)) return false;
  const text = clean(line);
  if (!text || text.length > 60) return false;

  const colon = text.indexOf(":");
  const head = (colon === -1 ? text : text.slice(0, colon)).trim();
  const bare = text.replace(/[:.\-–]+$/, "").trim();

  if (OTHER_HEADING.test(head) || OTHER_HEADING.test(bare)) return true;
  if (/^#{1,6}\s/.test(line.trim()) || /^\*\*.+\*\*:?$/.test(line.trim())) return true;
  // ALL-CAPS line, e.g. "WHAT WE OFFER"
  if (bare.replace(/[^A-Za-z]/g, "").length >= 5 && bare === bare.toUpperCase()) return true;
  // A line ending in ":" is a new heading only once the list has started;
  // before that it's just an intro like "Candidates must have:".
  if (sawBullet && text.endsWith(":")) return true;
  return false;
}

export function extractRequirements(description: string): ParsedDescription | null {
  const lines = description.replace(/\r\n?/g, "\n").split("\n");

  let start = -1;
  let inline = "";
  for (let i = 0; i < lines.length; i++) {
    const m = matchRequirementsHeading(lines[i]);
    if (m) {
      start = i;
      inline = m.inline;
      break;
    }
  }
  if (start === -1) return null;

  const body: string[] = [];
  if (inline) body.push(inline);
  let sawBullet = inline !== "" && BULLET.test(inline);
  let end = lines.length;

  // "Requirements: Degree in accounting" on one line, with no list after it: that line is the whole section.
  const nextLine = lines.slice(start + 1).find((l) => l.trim() !== "");
  const inlineOnly = inline !== "" && !BULLET.test(inline) && (nextLine === undefined || !BULLET.test(nextLine));
  if (inlineOnly) end = start + 1;

  for (let i = start + 1; !inlineOnly && i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === "") {
      const next = lines.slice(i + 1).find((l) => l.trim() !== "");
      // A blank line ends the section, unless the list simply carries on after it.
      if (body.length > 0 && (next === undefined || !BULLET.test(next))) {
        end = i;
        break;
      }
      continue;
    }

    if (isSectionBreak(line, sawBullet)) {
      end = i;
      break;
    }
    if (BULLET.test(line)) sawBullet = true;
    body.push(line.trim());
  }

  if (body.length === 0) return null;

  // Group into paragraphs and bullet lists.
  const blocks: RequirementBlock[] = [];
  for (const line of body) {
    if (BULLET.test(line)) {
      const item = line.replace(BULLET, "").trim();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ul") last.items.push(item);
      else blocks.push({ type: "ul", items: [item] });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }

  const before = lines.slice(0, start).join("\n").trim();
  const after = lines.slice(end).join("\n").trim();
  return { rest: [before, after].filter(Boolean).join("\n\n"), requirements: blocks };
}

/** Whole calendar days from today until the closing date (0 = closes today). */
export function daysUntil(date: Date, now = new Date()): number {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((day - today) / 86_400_000);
}

// ─────────────────────────────────────────────────────────────────────────────
// "How to apply" text and postal address — read straight from the listing's own
// words (nothing is paraphrased), so the form can be filled in with exactly what
// the listing says.
// ─────────────────────────────────────────────────────────────────────────────

const APPLY_HEADING =
  /^(?:how to apply|how to submit(?: your)? applications?|to apply|methods? of application|mode of application|application (?:procedure|process|instructions|method|details)|applications?|submission of applications?|apply(?: now)?)$/i;

// Headings that end an "apply" section (not including closing date: that belongs with applying).
const APPLY_END_HEADING =
  /^(?:key |main |job )?(?:responsibilit(?:y|ies)|duties(?: (?:and|&) responsibilities)?|about(?: us| the (?:company|role|job|position|organi[sz]ation))?|(?:job|role|position) (?:summary|description|purpose|overview)|overview|summary|benefits|what we offer|we offer|salary(?: range)?|remuneration|reporting (?:to|line)|location|terms(?: of employment)?|disclaimer|equal opportunity)$/i;

// Page furniture that sometimes follows a pasted listing.
const BOILERPLATE =
  /\b(?:share (?:this|on|via)|follow us|subscribe|newsletter|cookies?|privacy policy|all rights reserved|related jobs|similar jobs|back to jobs)\b|©/i;

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PO_BOX =
  /\b(?:P\.?\s?O\.?\s?Box|Post\s?Office\s?Box|Private\s?Bag|P\/?\s?Bag|Post\s?Bag)\s*(?:No\.?\s*)?[A-Z]?\s?-?\s?\d+[A-Za-z]?\b/i;

function isApplyBreak(line: string): boolean {
  const t = clean(line);
  if (!t) return false;
  if (BOILERPLATE.test(t)) return true;
  if (BULLET.test(line) || t.length > 60) return false;

  const colon = t.indexOf(":");
  const head = (colon === -1 ? t : t.slice(0, colon)).trim();
  const bare = t.replace(/[:.\-–]+$/, "").trim();

  if (APPLY_END_HEADING.test(head) || APPLY_END_HEADING.test(bare)) return true;
  if (REQUIREMENTS_HEADING.test(head) || REQUIREMENTS_HEADING.test(bare)) return true;
  if (/^#{1,6}\s/.test(line.trim())) return true;
  // Short ALL-CAPS line, e.g. "WHAT WE OFFER" (but not a long shouted sentence)
  const letters = bare.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 5 && bare === bare.toUpperCase() && bare.split(/\s+/).length <= 4 && !APPLY_HEADING.test(bare)) {
    return true;
  }
  return false;
}

/**
 * Finds where the listing says how to apply and returns that text word-for-word
 * (line breaks kept). Returns null if the listing doesn't say.
 */
export function extractApplyInstructions(text: string): string | null {
  const normalized = text.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");

  // 1) A heading such as "How to apply" / "Method of application"
  for (let i = 0; i < lines.length; i++) {
    const t = clean(lines[i]);
    if (!t) continue;

    let isHeading = false;
    let inline = "";
    const colon = t.indexOf(":");
    if (colon === -1) {
      isHeading = APPLY_HEADING.test(t);
    } else {
      const head = t.slice(0, colon).trim();
      if (head.length <= 50 && APPLY_HEADING.test(head)) {
        isHeading = true;
        inline = lines[i].slice(lines[i].indexOf(":") + 1).replace(/^[*_\s]+/, "").trim();
      }
    }
    if (!isHeading) continue;

    const body: string[] = inline ? [inline] : [];
    let count = body.length;
    for (let j = i + 1; j < lines.length && count < 25; j++) {
      const line = lines[j];
      if (line.trim() === "") {
        if (body.length > 0 && body[body.length - 1] !== "") body.push("");
        continue;
      }
      if (isApplyBreak(line)) break;
      body.push(line.trim());
      count++;
    }
    while (body.length > 0 && body[body.length - 1] === "") body.pop();
    if (body.length > 0) return body.join("\n");
  }

  // 2) No heading: find the paragraph that talks about sending an application somewhere.
  const VERB = /\b(?:apply|applications?|send|submit|forward|addressed?|deliver)\b/i;
  const CHANNEL = new RegExp(
    `${EMAIL.source}|${PO_BOX.source}|https?:\\/\\/|www\\.|\\b(?:online|hand[- ]deliver|in person|walk[- ]in|whatsapp|portal)\\b`,
    "i"
  );
  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (let k = 0; k < paragraphs.length; k++) {
    const para = paragraphs[k];
    if (para.length > 800 || !VERB.test(para) || !CHANNEL.test(para)) continue;
    // "...send your CV to:" then the address in the next block
    const full = /:\s*$/.test(para) && paragraphs[k + 1] ? `${para}\n\n${paragraphs[k + 1]}` : para;
    return full
      .split("\n")
      .map((l) => l.trim())
      .join("\n");
  }
  return null;
}

/** Splits an address into display lines. Keeps lines as written; a one-line address is split at commas. */
export function formatAddressLines(raw: string): string[] {
  const text = (raw || "").replace(/\r\n?/g, "\n").trim();
  if (!text) return [];
  const parts = text.includes("\n") ? text.split("\n") : text.split(/\s*[,;]\s*/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

const SENTENCE_END = /[.!?]$/;
const ABBREVIATION_END = /\b(?:ltd|limited|inc|plc|co|corp|dr|mr|mrs|ms|prof)\.$/i;

const APPLY_CONTEXT = /\b(?:apply|applications?|send|submit|forward|addressed|deliver|postal address|mail)\b/i;

function addressFrom(text: string, requireContext = false): string | null {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");

  for (let idx = 0; idx < lines.length; idx++) {
    if (!PO_BOX.test(lines[idx])) continue;

    // When searching the whole listing (not just the "how to apply" part), only trust a P.O. Box that
    // sits next to application wording, so a company's own office address isn't mistaken for it.
    if (requireContext && !lines.slice(Math.max(0, idx - 3), idx + 1).some((l) => APPLY_CONTEXT.test(l))) continue;

    const line = lines[idx].trim();
    const own = line
      .replace(/^[*_\-•\s]+/, "")
      .replace(/^(?:postal address|address|post|mail|attention|attn)\s*:\s*/i, "")
      .trim();

    const m = PO_BOX.exec(line);
    if (!m) continue;
    const beforeText = line.slice(0, m.index);
    const afterText = line.slice(m.index + m[0].length);

    // Where the address itself starts: after the last lead-in like "sent to", "addressed to" or ":".
    const LEAD =
      /(?:addressed to|sent to|send to|send them to|submitted to|submit to|forward(?:ed)? to|deliver(?:ed)? to|posted to|mailed to|apply to|following address|\bat\b|\bto\b|:)\s*:?\s*/gi;
    let headStart = 0;
    let lm: RegExpExecArray | null;
    while ((lm = LEAD.exec(beforeText))) headStart = lm.index + lm[0].length;

    // Inline: the address is part of a sentence, e.g.
    // "Applications should be addressed to The Director, ABC Ltd, P.O. Box 55, Blantyre, Malawi, to reach us by..."
    if (headStart > 0) {
      const head = beforeText
        .slice(headStart)
        .split(/\s*,\s*/)
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(-3);

      const STOP = /\s+(?:by|before|not later|no later|on or before|to reach|so as|so that|closing|deadline|on|or|and)\b|[.;(]/i;
      const sm = STOP.exec(afterText);
      const tail = (sm ? afterText.slice(0, sm.index) : afterText)
        .split(/\s*,\s*/)
        .map((p) => p.trim())
        .filter((p) => p && p.length <= 40)
        .slice(0, 3);

      // "Address: P.O. Box 5" with the town on the next line
      const next = tail.length === 0 ? followingLines(lines, idx) : [];
      return [...head, m[0].trim(), ...tail, ...next].join("\n");
    }

    // Block: the address sits on its own lines.
    const before: string[] = [];
    for (let j = idx - 1; j >= 0 && before.length < 3; j--) {
      const l = lines[j].trim();
      if (
        !l ||
        l.endsWith(":") ||
        (SENTENCE_END.test(l) && !ABBREVIATION_END.test(l)) ||
        l.includes("@") ||
        l.length > 60 ||
        l.split(/\s+/).length > 8 ||
        BULLET.test(l) ||
        /\b(?:apply|applications?|send|submit|forward|e-?mail|addressed|deliver)\b/i.test(l)
      ) {
        break;
      }
      before.unshift(l);
    }

    const ownParts = own.split(/\s*,\s*/).filter(Boolean);
    return [...before, ...ownParts, ...followingLines(lines, idx)].join("\n");
  }
  return null;
}

// Up to two short lines straight after the P.O. Box line, such as "Lilongwe" or "Malawi".
function followingLines(lines: string[], idx: number): string[] {
  const after: string[] = [];
  for (let k = idx + 1; k < lines.length && after.length < 2; k++) {
    const l = lines[k].trim();
    if (
      !l ||
      l.length > 40 ||
      l.includes("@") ||
      /[.!?:]$/.test(l) ||
      BULLET.test(l) ||
      l.split(/\s+/).length > 4 ||
      /\b(?:closing|deadline|date|apply|applications?|email|send|by|before)\b/i.test(l)
    ) {
      break;
    }
    after.push(l);
  }
  return after;
}

/**
 * Looks for a postal address (P.O. Box / Private Bag) in the listing and returns it as
 * separate lines. If the listing has a "how to apply" part (`applyText`), only that part is searched.
 */
export function extractPostalAddress(text: string, applyText?: string | null): string | null {
  if (applyText) return addressFrom(applyText);
  return addressFrom(text, true);
}
