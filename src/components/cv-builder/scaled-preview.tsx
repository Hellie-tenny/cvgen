import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// The width the CV is designed at. On desktop it renders at this size; on a phone it is shrunk to fit the screen.
const PAPER_WIDTH = 650;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Renders the CV at full paper size, then scales the whole page down to the available width (like a PDF viewer). */
export function ScaledPreview({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const paper = paperRef.current;
    if (!wrap || !paper) return;

    const update = () => {
      if (wrap.clientWidth === 0) return; // panel is hidden right now
      const next = Math.min(1, wrap.clientWidth / PAPER_WIDTH);
      setScale(next);
      setHeight(paper.offsetHeight * next);
    };

    update();
    // Re-measure when the screen rotates or the CV grows as the person types.
    const observer = new ResizeObserver(update);
    observer.observe(wrap);
    observer.observe(paper);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="w-full overflow-hidden rounded-lg shadow-lg" style={{ height }}>
      <div
        ref={paperRef}
        className="cv-scaled"
        style={{ width: PAPER_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}

/** Desktop: the CV at its normal size. Phones and tablets: the whole page, scaled to fit. */
export function PreviewFrame({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  if (isDesktop) return <div className="max-w-[650px] mx-auto">{children}</div>;
  return <ScaledPreview>{children}</ScaledPreview>;
}
