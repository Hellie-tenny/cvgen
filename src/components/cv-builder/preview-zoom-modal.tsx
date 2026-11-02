import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Maximize2, Minus, Plus } from "lucide-react";

// The width the CV is designed at (same as scaled-preview.tsx).
const PAPER_WIDTH = 650;
const ZOOMS = [0.75, 1, 1.25, 1.5, 2, 3];

/**
 * Full-screen, scrollable view of a CV preview at a readable size.
 * Opens at 100% (the real design width); the bar lets you zoom in or out. Scroll to move around.
 */
export function PreviewZoomModal({
  open,
  onClose,
  title = "Preview",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [zoom, setZoom] = useState(1);
  const paperRef = useRef<HTMLDivElement>(null);
  const [paperHeight, setPaperHeight] = useState(0);

  // Start at 100% each time it opens.
  useEffect(() => {
    if (open) setZoom(1);
  }, [open]);

  // Keep the page behind from scrolling, and let Escape / + / - work.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomBy(1);
      if (e.key === "-") zoomBy(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  // The scaled page needs an outer box of the scaled size, so scrolling reaches its edges.
  useLayoutEffect(() => {
    if (!open) return;
    const paper = paperRef.current;
    if (!paper) return;
    const update = () => setPaperHeight(paper.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(paper);
    return () => observer.disconnect();
  }, [open]);

  const zoomBy = (direction: 1 | -1) =>
    setZoom((current) => {
      const index = ZOOMS.reduce((best, z, i) => (Math.abs(z - current) < Math.abs(ZOOMS[best] - current) ? i : best), 0);
      return ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, index + direction))];
    });

  if (!open) return null;

  const atMin = zoom <= ZOOMS[0];
  const atMax = zoom >= ZOOMS[ZOOMS.length - 1];
  const iconButton =
    "inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-transparent";

  // Rendered on <body> so no page header, tab bar or animated parent can sit on top of it or trap it.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ backgroundColor: "#3f3f46" }}
    >
      {/* Solid top bar */}
      <div
        className="flex items-center gap-1 px-2 pb-2"
        style={{ backgroundColor: "#18181b", paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.5rem)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white hover:bg-white/15"
          aria-label="Back to editor"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to editor
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" className={iconButton} onClick={() => zoomBy(-1)} disabled={atMin} aria-label="Zoom out">
            <Minus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="h-10 min-w-14 rounded-md px-2 text-sm tabular-nums text-white hover:bg-white/15"
            aria-label="Reset zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" className={iconButton} onClick={() => zoomBy(1)} disabled={atMax} aria-label="Zoom in">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Scrollable page */}
      <div className="flex-1 overflow-auto" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="p-4" style={{ width: "max-content", minWidth: "100%" }}>
          <div
            className="mx-auto rounded-sm shadow-2xl"
            style={{ width: PAPER_WIDTH * zoom, height: paperHeight * zoom }}
          >
            <div
              ref={paperRef}
              className="cv-scaled"
              style={{ width: PAPER_WIDTH, transform: `scale(${zoom})`, transformOrigin: "top left" }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Small "View full size" button to sit under a preview. */
export function ViewFullSizeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
    >
      <Maximize2 className="h-4 w-4" />
      View full size
    </button>
  );
}
