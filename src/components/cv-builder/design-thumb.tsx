import { resolveTheme, type TemplateDesign } from "@/lib/template-design";
import { cn } from "@/lib/utils";

/** A tiny page drawn from a template's design, so people can tell templates apart at a glance. */
export function DesignThumb({ design, className }: { design: TemplateDesign; className?: string }) {
  const theme = resolveTheme(design);
  const { colors: c, layout: l } = design;
  const sidebar = l.columns !== "single";
  const left = l.columns === "sidebar-left";
  const band = !sidebar && l.headerStyle === "band";

  // The content area, leaving room for a sidebar or a banner
  const content = {
    left: sidebar && left ? "40%" : "10%",
    right: sidebar && !left ? "40%" : "10%",
    top: band ? "30%" : "10%",
  };

  const line = (width: string, color: string, height = "3%") => (
    <div style={{ width, height, background: color, borderRadius: 1, marginBottom: "5%" }} />
  );

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-[3px] border", className ?? "w-10")}
      style={{ aspectRatio: "210 / 297", background: c.background, borderColor: c.border }}
      aria-hidden="true"
    >
      {sidebar && (
        <div
          className="absolute inset-y-0"
          style={{ [left ? "left" : "right"]: 0, width: "32%", background: theme.sidebar.bg }}
        >
          <div style={{ padding: "18% 14% 0" }}>
            {line("80%", theme.sidebar.title)}
            {line("60%", theme.sidebar.muted)}
            {line("70%", theme.sidebar.muted)}
          </div>
        </div>
      )}
      {band && <div className="absolute inset-x-0 top-0" style={{ height: "22%", background: theme.band.bg }} />}

      <div className="absolute" style={{ ...content, bottom: 0 }}>
        {line("55%", c.primary, "5%")}
        {line("35%", c.secondary)}
        <div style={{ height: "6%" }} />
        {line("90%", c.foreground)}
        {line("80%", c.foreground)}
        {line("85%", c.foreground)}
        <div style={{ height: "4%" }} />
        {line("40%", c.primary)}
        {line("90%", c.foreground)}
        {line("70%", c.foreground)}
      </div>
    </div>
  );
}
