import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import type { LetterParts } from "./letter-format";

export async function downloadLetterAsDocx(parts: LetterParts, fileName: string): Promise<void> {
  const children: Paragraph[] = [];

  // Sender block, right-aligned — includes the date, on the same side
  const senderLines = [parts.fullName, ...parts.addressLines];
  if (parts.email) senderLines.push(`Email: ${parts.email}`);
  if (parts.phone) senderLines.push(`Phone: ${parts.phone}`);

  for (const line of senderLines.filter(Boolean)) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: line, size: 20 })],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: parts.dateLine, size: 20 })],
      spacing: { after: 240 },
    })
  );

  if (parts.recipientLines.length) {
    for (const line of parts.recipientLines) {
      children.push(new Paragraph({ text: line }));
    }
    children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
  }

  children.push(new Paragraph({ text: parts.salutation, spacing: { after: 240 } }));

  if (parts.subjectLine) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parts.subjectLine, bold: true })],
        spacing: { after: 240 },
      })
    );
  }

  for (const para of parts.bodyParagraphs) {
    children.push(new Paragraph({ text: para, spacing: { after: 200 } }));
  }

  children.push(new Paragraph({ text: parts.closing, spacing: { after: 400 } }));
  children.push(new Paragraph({ text: parts.fullName }));

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
