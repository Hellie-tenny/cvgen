// All extraction happens entirely in the browser — the raw file is never
// sent anywhere. Only the extracted plain text is later sent to the Worker.

import * as pdfjsLib from "pdfjs-dist";
// Vite-specific: bundles the pdf.js worker as a separate asset and gives us its URL.
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const MIN_EXTRACTED_LENGTH = 50; // below this, assume extraction failed / scanned doc

export class ExtractionError extends Error {}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    text += pageText + "\n";
  }

  return text.trim();
}

async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ExtractionError("That file is too large. Please upload something under 8MB.");
  }

  const name = file.name.toLowerCase();
  let text: string;

  if (name.endsWith(".pdf")) {
    text = await extractTextFromPdf(file);
  } else if (name.endsWith(".docx")) {
    text = await extractTextFromDocx(file);
  } else {
    throw new ExtractionError("Unsupported file type. Please upload a PDF or Word (.docx) file.");
  }

  if (text.length < MIN_EXTRACTED_LENGTH) {
    throw new ExtractionError(
      "We couldn't read readable text from this file — it might be a scanned image rather than real text. Try a text-based PDF or a Word (.docx) file instead."
    );
  }

  return text;
}
