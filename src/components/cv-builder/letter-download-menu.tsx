import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2, ChevronDown } from "lucide-react";
import { CoverLetterPDFDocument } from "./cover-letter-pdf-document";
import { downloadLetterAsDocx } from "@/utils/generate-docx";
import type { LetterParts } from "@/utils/letter-format";

interface LetterDownloadMenuProps {
  parts: LetterParts;
  variant?: "solid" | "outline";
}

export function LetterDownloadMenu({ parts, variant = "outline" }: LetterDownloadMenuProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState<"pdf" | "docx" | null>(null);

  const fileBaseName = (parts.fullName || "Cover_Letter").trim().replace(/\s+/g, "_");

  const handlePdf = async () => {
    setGenerating("pdf");
    setOpen(false);
    try {
      const blob = await pdf(<CoverLetterPDFDocument parts={parts} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileBaseName}_Cover_Letter.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating letter PDF:", err);
    } finally {
      setGenerating(null);
    }
  };

  const handleDocx = async () => {
    setGenerating("docx");
    setOpen(false);
    try {
      await downloadLetterAsDocx(parts, `${fileBaseName}_Cover_Letter.docx`);
    } catch (err) {
      console.error("Error generating letter DOCX:", err);
    } finally {
      setGenerating(null);
    }
  };

  const buttonClass =
    variant === "solid"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : "border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={generating !== null}
        className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${buttonClass}`}
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing {generating === "pdf" ? "PDF" : "Word doc"}...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download
            <ChevronDown className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 right-0 w-36 bg-sidebar border border-sidebar-border rounded-lg shadow-lg overflow-hidden">
            <button
              type="button"
              onClick={handlePdf}
              className="w-full text-left px-4 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              .pdf
            </button>
            <button
              type="button"
              onClick={handleDocx}
              className="w-full text-left px-4 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              .docx
            </button>
          </div>
        </>
      )}
    </div>
  );
}
