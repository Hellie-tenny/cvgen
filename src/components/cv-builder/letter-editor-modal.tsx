import { X } from "lucide-react";
import { LetterDownloadMenu } from "./letter-download-menu";

interface LetterEditorModalProps {
  letter: string;
  onChange: (value: string) => void;
  fullName: string;
  onClose: () => void;
}

export function LetterEditorModal({ letter, onChange, fullName, onClose }: LetterEditorModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-2xl max-h-[90vh] bg-sidebar border border-sidebar-border rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border shrink-0">
          <h3 className="font-semibold text-sidebar-foreground">Edit your letter</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex-1">
          {/* Paper-style letter preview — intentionally light regardless of site theme, like a real page */}
          <div className="bg-white text-black rounded-lg shadow-sm p-8">
            <textarea
              value={letter}
              onChange={(e) => onChange(e.target.value)}
              rows={24}
              className="w-full bg-transparent text-black placeholder:text-gray-400 focus:outline-none resize-none font-serif text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-4 border-t border-sidebar-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
          >
            Done
          </button>
          <div className="flex-1">
            <LetterDownloadMenu letterText={letter} fullName={fullName} variant="solid" />
          </div>
        </div>
      </div>
    </div>
  );
}
