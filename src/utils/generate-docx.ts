import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { splitLetterIntoParagraphs } from "./letter-format";

export async function downloadLetterAsDocx(letterText: string, fileName: string): Promise<void> {
  const blocks = splitLetterIntoParagraphs(letterText);

  const children = blocks.map((block, i) => {
    const isSenderBlock = i === 0;
    const isSubjectLine = /^RE:/i.test(block);

    // Each block may itself contain multiple lines (e.g. the sender's
    // address block) — preserve those as line breaks within one paragraph.
    const blockLines = block.split("\n");
    const runs: TextRun[] = [];
    blockLines.forEach((line, j) => {
      if (j > 0) runs.push(new TextRun({ break: 1 }));
      runs.push(new TextRun({ text: line, bold: isSubjectLine }));
    });

    return new Paragraph({
      alignment: isSenderBlock ? AlignmentType.RIGHT : AlignmentType.LEFT,
      children: runs,
      spacing: { after: 200 },
    });
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
